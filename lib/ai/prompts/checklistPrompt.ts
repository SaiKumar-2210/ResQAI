import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";

export function buildChecklistPrompt(
  disasterType: DisasterType,
  familySize: number,
  language: SupportedLanguage
) {
  return [
    "Generate a practical emergency preparedness checklist.",
    `Disaster type: ${disasterType}.`,
    `Family size: ${familySize}.`,
    "Return structured JSON only.",
    "Include survival kit, medicines, documents, evacuation preparation, and special notes.",
    "Keep items realistic, compact, and suitable for low-connectivity disaster conditions.",
    "Do not prescribe medication dosages. Recommend keeping prescribed medicines and contacting medical professionals for medical decisions.",
    `Respond in ${language}.`
  ].join("\n");
}
