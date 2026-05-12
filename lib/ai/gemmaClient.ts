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
  responseSchema?: unknown;
  temperature?: number;
  timeoutMs?: number;
}

const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemma-4-26b-a4b-it";

export function getGemmaConfig() {
  return {
    apiKey: process.env.GEMMA_API_KEY,
    model: process.env.GEMMA_MODEL ?? DEFAULT_MODEL,
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
      maxOutputTokens: 1400,
      ...(input.responseSchema
        ? {
            responseFormat: {
              text: {
                mimeType: "application/json",
                schema: input.responseSchema
              }
            }
          }
        : {})
    }
  };
}

export async function generateGemmaContent(input: GenerateGemmaInput) {
  const config = getGemmaConfig();

  if (!config.apiKey) {
    throw new Error("Missing GEMMA_API_KEY. Add it to your environment before calling Gemma.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? config.timeoutMs);
  const startedAt = performance.now();

  try {
    const response = await fetch(
      `${config.baseUrl}/models/${config.model}:generateContent`,
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
        body: body.slice(0, 500)
      });
      throw new Error(`Gemma API failed with status ${response.status}.`);
    }

    if (latencyMs > 12_000) {
      logger.warn("Gemma response was slow", { latencyMs, model: config.model });
    }

    return {
      payload: await response.json(),
      latencyMs,
      model: config.model
    };
  } finally {
    clearTimeout(timeout);
  }
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
