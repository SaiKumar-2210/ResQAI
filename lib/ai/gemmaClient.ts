import { logger } from "@/lib/monitoring/logger";

export interface GemmaContentPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

export interface GemmaContent {
  role?: "user" | "model";
  parts: GemmaContentPart[];
}

export interface GenerateGemmaInput {
  contents: GemmaContent[];
  systemPrompt: string;
  model?: string;
  responseSchema?: unknown;
  temperature?: number;
  timeoutMs?: number;
  maxOutputTokens?: number;
  retries?: number;
}

export interface GenerateAudioInput {
  text: string;
  voiceName?: string;
  model?: string;
  timeoutMs?: number;
}

const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemma-4-26b-a4b-it";
const DEFAULT_TTS_MODEL = "gemini-3.1-flash-tts-preview";

export function getGemmaConfig() {
  return {
    apiKey: process.env.GEMMA_API_KEY,
    model: process.env.GEMMA_MODEL ?? DEFAULT_MODEL,
    ttsModel: process.env.GEMINI_TTS_MODEL ?? DEFAULT_TTS_MODEL,
    audioModel: process.env.GEMINI_AUDIO_MODEL ?? "gemini-2.5-flash",
    baseUrl: process.env.GEMMA_API_BASE_URL ?? DEFAULT_BASE_URL,
    timeoutMs: Number(process.env.GEMMA_REQUEST_TIMEOUT_MS ?? 25_000)
  };
}

function buildRequestBody(input: GenerateGemmaInput) {
  return {
    systemInstruction: {
      parts: [{ text: input.systemPrompt }]
    },
    contents: input.contents,
    generationConfig: {
      temperature: input.temperature ?? 0.2,
      topP: 0.9,
      maxOutputTokens: input.maxOutputTokens ?? 1400,
      ...(input.responseSchema
        ? {
            responseMimeType: "application/json",
            responseJsonSchema: input.responseSchema
          }
        : {})
    }
  };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(status: number) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function generateGemmaContentOnce(input: GenerateGemmaInput, attempt: number) {
  const config = getGemmaConfig();

  if (!config.apiKey) {
    throw new Error("Missing GEMMA_API_KEY. Add it to your environment before calling Gemma.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? config.timeoutMs);
  const startedAt = performance.now();

  try {
    const response = await fetch(
      `${config.baseUrl}/models/${input.model ?? config.model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": config.apiKey
        },
        body: JSON.stringify(buildRequestBody(input)),
        signal: controller.signal
      }
    );

    const latencyMs = Math.round(performance.now() - startedAt);

    if (!response.ok) {
      const body = await response.text();
      logger.error("Gemma generateContent failed", {
        status: response.status,
        latencyMs,
        attempt,
        body: body.slice(0, 500)
      });
      const error = new Error(`Gemma API failed with status ${response.status}.`);
      error.name = shouldRetry(response.status) ? "RetryableGemmaError" : "GemmaApiError";
      throw error;
    }

    if (latencyMs > 12_000) {
      logger.warn("Gemma response was slow", { latencyMs, model: config.model });
    }

    return {
      payload: await response.json(),
      latencyMs,
      model: input.model ?? config.model
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateGemmaContent(input: GenerateGemmaInput) {
  const retries = input.retries ?? 1;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await generateGemmaContentOnce(input, attempt + 1);
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof Error &&
        (error.name === "RetryableGemmaError" || error.name === "AbortError");

      if (!retryable || attempt >= retries) break;

      await wait(700 * (attempt + 1));
    }
  }

  throw lastError;
}

export async function streamGemmaContent(input: GenerateGemmaInput) {
  const config = getGemmaConfig();

  if (!config.apiKey) {
    throw new Error("Missing GEMMA_API_KEY. Add it to your environment before calling Gemma.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? config.timeoutMs);

  try {
    const response = await fetch(
      `${config.baseUrl}/models/${config.model}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": config.apiKey
        },
        body: JSON.stringify(buildRequestBody(input)),
        signal: controller.signal
      }
    );

    if (!response.ok || !response.body) {
      const body = await response.text();
      throw new Error(`Gemma stream failed with status ${response.status}: ${body.slice(0, 250)}`);
    }

    return {
      stream: response.body,
      model: config.model,
      cleanup: () => clearTimeout(timeout)
    };
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

export async function generateGeminiSpeech(input: GenerateAudioInput) {
  const config = getGemmaConfig();

  if (!config.apiKey) {
    throw new Error("Missing GEMMA_API_KEY. Add it to your environment before calling Gemini TTS.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? 45_000);
  const model = input.model ?? config.ttsModel;

  try {
    const response = await fetch(`${config.baseUrl}/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": config.apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: input.text }]
          }
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: input.voiceName ?? "Kore"
              }
            }
          }
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error("Gemini TTS failed", {
        status: response.status,
        body: body.slice(0, 500)
      });
      throw new Error(`Gemini TTS failed with status ${response.status}.`);
    }

    return {
      payload: await response.json(),
      model
    };
  } finally {
    clearTimeout(timeout);
  }
}
