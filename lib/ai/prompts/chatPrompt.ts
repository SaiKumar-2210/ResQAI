import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";

export function buildChatPrompt(message: string, language: SupportedLanguage, scenario?: DisasterType) {
  const context =
    scenario && scenario !== "unknown"
      ? `Current emergency scenario: ${scenario}.`
      : "Current emergency scenario: unknown.";

  return [
    "Respond as an emergency decision support assistant.",
    context,
    "Return structured JSON only.",
    "Give short, prioritized survival guidance with immediate actions.",
    "Ask at most one follow-up question only if it changes the next safety decision.",
    "Avoid false certainty. Do not invent local facts, rescue availability, road status, or medical diagnosis.",
    `User question: ${message}`,
    `Respond in ${language}.`
  ].join("\n");
}

export function buildFastChatPrompt(message: string, language: SupportedLanguage, scenario?: DisasterType) {
  const context =
    scenario && scenario !== "unknown"
      ? `Emergency scenario: ${scenario}.`
      : "Emergency scenario: unknown.";

  return [
    "Answer the user's emergency question.",
    context,
    "Write exactly 4 numbered steps.",
    "Each step must be one short sentence.",
    "Mention emergency services only if danger, injury, fire, collapse, trapped people, or blocked exits are possible.",
    "Do not include notes, disclaimers, headings, markdown tables, or explanations after the 4 steps.",
    `User question: ${message}`,
    `Language: ${language}.`
  ].join("\n");
}
