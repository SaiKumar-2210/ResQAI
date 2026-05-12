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
