import type {
  ChatStructuredResponse,
  GemmaChatInput,
  GemmaChecklistInput,
  GemmaImageInput,
  ImageAnalysisResult,
  ChecklistResult
} from "@/lib/types/ai";
import type { DangerLevel, DisasterType } from "@/lib/types/disaster";
import { trackEvent } from "@/lib/monitoring/analytics";
import { logger } from "@/lib/monitoring/logger";
import { buildChatPrompt, buildFastChatPrompt } from "./prompts/chatPrompt";
import { buildChecklistPrompt } from "./prompts/checklistPrompt";
import { buildImageAnalysisPrompt } from "./prompts/imageAnalysisPrompt";
import { buildChatSystemPrompt, buildSystemPrompt } from "./prompts/systemPrompt";
import { checklistResponseSchema } from "./schemas/checklistSchema";
import { chatResponseSchema } from "./schemas/chatResponseSchema";
import { imageAnalysisResponseSchema } from "./schemas/imageAnalysisSchema";
import {
  chatFallback,
  checklistFallback,
  imageAnalysisFallback
} from "./fallbackResponses";
import { generateGemmaContent, getGemmaConfig, streamGemmaContent } from "./gemmaClient";
import { injectSafetyIntoChat, injectSafetyIntoChecklist, injectSafetyIntoImageAnalysis } from "./safety";
import { extractTextFromGemmaResponse, parseJsonObject } from "./sanitization";

const dangerLevels: DangerLevel[] = ["LOW", "MODERATE", "HIGH", "CRITICAL"];
const disasterTypes: DisasterType[] = [
  "flood",
  "fire",
  "earthquake",
  "cyclone",
  "storm",
  "building-collapse",
  "unknown"
];

function normalizeDangerLevel(value: unknown): DangerLevel {
  return dangerLevels.includes(value as DangerLevel) ? (value as DangerLevel) : "HIGH";
}

function normalizeDisasterType(value: unknown): DisasterType {
  return disasterTypes.includes(value as DisasterType) ? (value as DisasterType) : "unknown";
}

function ensureActions(actions: unknown): ImageAnalysisResult["immediateActions"] {
  if (!Array.isArray(actions)) return [];
  return actions
    .map((action) => {
      const item = action as { label?: unknown; reason?: unknown; urgency?: unknown };
      const urgency: "now" | "soon" | "prepare" =
        item.urgency === "soon" || item.urgency === "prepare" || item.urgency === "now"
          ? item.urgency
          : "now";
      return {
        label: String(item.label ?? "Move to safety"),
        reason: String(item.reason ?? "This reduces immediate risk."),
        urgency
      };
    })
    .slice(0, 5);
}

function ensureStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function coerceImageAnalysis(value: unknown, modelUsed: string): ImageAnalysisResult {
  const raw = value as Partial<ImageAnalysisResult>;
  return injectSafetyIntoImageAnalysis({
    dangerLevel: normalizeDangerLevel(raw.dangerLevel),
    confidence: typeof raw.confidence === "number" ? raw.confidence : 0.6,
    evacuationNeeded: Boolean(raw.evacuationNeeded),
    disasterType: normalizeDisasterType(raw.disasterType),
    summary: String(raw.summary ?? "Potential disaster risk detected."),
    visibleHazards: ensureStringArray(raw.visibleHazards),
    immediateActions: ensureActions(raw.immediateActions),
    avoidActions: ensureStringArray(raw.avoidActions),
    emergencyEscalation: String(raw.emergencyEscalation ?? ""),
    offlineTip: String(raw.offlineTip ?? "Use SMS and battery saver if connectivity drops."),
    language: raw.language ?? "english",
    modelUsed
  });
}

function coerceChat(value: unknown, modelUsed: string): ChatStructuredResponse {
  const raw = value as Partial<ChatStructuredResponse>;
  return injectSafetyIntoChat({
    dangerLevel: normalizeDangerLevel(raw.dangerLevel),
    confidence: typeof raw.confidence === "number" ? raw.confidence : 0.6,
    summary: String(raw.summary ?? "Follow conservative emergency safety guidance."),
    immediateActions: ensureActions(raw.immediateActions),
    escalationNeeded: Boolean(raw.escalationNeeded),
    emergencyEscalation: String(raw.emergencyEscalation ?? ""),
    followUpQuestion: String(raw.followUpQuestion ?? ""),
    language: raw.language ?? "english",
    modelUsed
  });
}

function cleanChatText(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const numberedStepMatches = [...normalized.matchAll(/\n?\s*1\.\s+/g)];
  const lastNumberedAnswer =
    numberedStepMatches.length > 0
      ? normalized.slice(numberedStepMatches[numberedStepMatches.length - 1].index).trim()
      : normalized;

  return lastNumberedAnswer
    .replace(/\*?\s*Self-Correction:[\s\S]*$/i, "")
    .replace(/\*?\s*Constraint Check:[\s\S]*$/i, "")
    .slice(0, 1400)
    .trim();
}

function wrapChatText(
  text: string,
  modelUsed: string,
  input: GemmaChatInput
): ChatStructuredResponse {
  const cleanedText = cleanChatText(text);

  return injectSafetyIntoChat({
    dangerLevel: input.scenario && input.scenario !== "unknown" ? "HIGH" : "MODERATE",
    confidence: 0.72,
    summary: cleanedText,
    immediateActions: [
      {
        label: "Move away from immediate danger",
        reason: "Distance and shelter reduce exposure while conditions are uncertain.",
        urgency: "now"
      },
      {
        label: "Contact local emergency services if risk is imminent",
        reason: "Official responders can give location-specific instructions.",
        urgency: "now"
      },
      {
        label: "Follow official alerts and keep communication available",
        reason: "Disaster conditions can change quickly.",
        urgency: "soon"
      }
    ],
    escalationNeeded: true,
    emergencyEscalation: "",
    followUpQuestion: "",
    language: input.language,
    modelUsed
  });
}

function coerceChecklist(
  value: unknown,
  modelUsed: string,
  input: GemmaChecklistInput
): ChecklistResult {
  const raw = value as Partial<ChecklistResult>;
  return injectSafetyIntoChecklist({
    dangerLevel: normalizeDangerLevel(raw.dangerLevel ?? "MODERATE"),
    confidence: typeof raw.confidence === "number" ? raw.confidence : 0.65,
    disasterType: normalizeDisasterType(raw.disasterType ?? input.disasterType),
    familySize: Number(raw.familySize ?? input.familySize),
    survivalKit: ensureStringArray(raw.survivalKit),
    medicines: ensureStringArray(raw.medicines),
    documents: ensureStringArray(raw.documents),
    evacuationPrep: ensureStringArray(raw.evacuationPrep),
    specialNotes: ensureStringArray(raw.specialNotes),
    emergencyEscalation: String(raw.emergencyEscalation ?? ""),
    language: raw.language ?? input.language,
    modelUsed
  });
}

export async function analyzeDisasterImage(input: GemmaImageInput): Promise<ImageAnalysisResult> {
  const model = getGemmaConfig().model;
  trackEvent("image_analysis_started", { scenario: input.scenario, mimeType: input.mimeType });

  try {
    const response = await generateGemmaContent({
      systemPrompt: buildSystemPrompt(input.language),
      responseSchema: imageAnalysisResponseSchema,
      temperature: 0.15,
      contents: [
        {
          role: "user",
          parts: [
            {
              inline_data: {
                mime_type: input.mimeType,
                data: input.base64Image
              }
            },
            { text: buildImageAnalysisPrompt(input.language, input.scenario) }
          ]
        }
      ]
    });

    const text = extractTextFromGemmaResponse(response.payload);
    const parsed = parseJsonObject<ImageAnalysisResult>(text);
    const result = coerceImageAnalysis(parsed, response.model);

    trackEvent("image_analysis_completed", {
      latencyMs: response.latencyMs,
      dangerLevel: result.dangerLevel,
      confidence: result.confidence
    });

    if (response.latencyMs > 12_000) {
      trackEvent("slow_ai_response", { feature: "image-analysis", latencyMs: response.latencyMs });
    }

    return result;
  } catch (error) {
    logger.error("Image analysis failed, returning fallback", {
      error: error instanceof Error ? error.message : String(error)
    });
    trackEvent("image_analysis_failed", { scenario: input.scenario });
    return imageAnalysisFallback(input.language, input.scenario, model);
  }
}

export async function generateChecklist(input: GemmaChecklistInput): Promise<ChecklistResult> {
  const model = getGemmaConfig().model;

  try {
    const response = await generateGemmaContent({
      systemPrompt: buildSystemPrompt(input.language),
      responseSchema: checklistResponseSchema,
      temperature: 0.25,
      contents: [
        {
          role: "user",
          parts: [{ text: buildChecklistPrompt(input.disasterType, input.familySize, input.language) }]
        }
      ]
    });

    const parsed = parseJsonObject<ChecklistResult>(extractTextFromGemmaResponse(response.payload));
    const result = coerceChecklist(parsed, response.model, input);
    trackEvent("checklist_generated", {
      disasterType: result.disasterType,
      familySize: result.familySize
    });
    return result;
  } catch (error) {
    logger.error("Checklist generation failed, returning fallback", {
      error: error instanceof Error ? error.message : String(error)
    });
    return checklistFallback(input.disasterType, input.familySize, input.language, model);
  }
}

export async function generateChatResponse(input: GemmaChatInput): Promise<ChatStructuredResponse> {
  const model = getGemmaConfig().model;

  try {
    const history =
      input.history?.map((message) => ({
        role: message.role,
        parts: [{ text: message.text }]
      })) ?? [];

    const response = await generateGemmaContent({
      systemPrompt: buildChatSystemPrompt(input.language),
      temperature: 0.15,
      timeoutMs: 35_000,
      maxOutputTokens: 220,
      retries: 2,
      contents: [
        ...history,
        {
          role: "user",
          parts: [{ text: buildFastChatPrompt(input.message, input.language, input.scenario) }]
        }
      ]
    });

    const text = extractTextFromGemmaResponse(response.payload);

    if (!text) {
      throw new Error("Gemma returned an empty chat response.");
    }

    return wrapChatText(text, response.model, input);
  } catch (error) {
    logger.error("Chat response failed, returning fallback", {
      error: error instanceof Error ? error.message : String(error)
    });
    return chatFallback(input.language, model);
  }
}

export async function startChatStream(input: GemmaChatInput) {
  const history =
    input.history?.map((message) => ({
      role: message.role,
      parts: [{ text: message.text }]
    })) ?? [];

  trackEvent("chat_stream_started", { scenario: input.scenario, language: input.language });

  return streamGemmaContent({
    systemPrompt: buildSystemPrompt(input.language),
    responseSchema: chatResponseSchema,
    temperature: 0.25,
    contents: [
      ...history,
      {
        role: "user",
        parts: [{ text: buildChatPrompt(input.message, input.language, input.scenario) }]
      }
    ]
  });
}

export function finalizeStreamedChatResponse(text: string, modelUsed: string) {
  const parsed = parseJsonObject<ChatStructuredResponse>(text);
  return coerceChat(parsed, modelUsed);
}
