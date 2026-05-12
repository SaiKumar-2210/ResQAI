import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";

export function buildImageAnalysisPrompt(language: SupportedLanguage, scenario?: DisasterType) {
  const scenarioLine =
    scenario && scenario !== "unknown"
      ? `The user selected this scenario: ${scenario}. Use it as context but correct it if the image clearly suggests another hazard.`
      : "No scenario was selected. Identify the likely disaster type from visible evidence.";

  return [
    "Analyze this disaster-related image for emergency decision support.",
    scenarioLine,
    "Return structured JSON only.",
    "Assess visible danger level, confidence, evacuation need, hazards, actions to take, actions to avoid, and an offline fallback tip.",
    "Treat uncertainty as a safety issue: if visibility is unclear, lower confidence and recommend safer general steps.",
    "Escalate immediately for signs of active fire, deep/fast water, structural collapse risk, trapped people, blocked exits, electrical hazards, or imminent danger.",
    `Write user-facing text in ${language}.`
  ].join("\n");
}
