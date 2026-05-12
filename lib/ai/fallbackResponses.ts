import type {
  ChatStructuredResponse,
  ChecklistResult,
  ImageAnalysisResult
} from "@/lib/types/ai";
import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";

const escalation =
  "Contact local emergency services immediately if danger is imminent, people are trapped, exits are blocked, or you see fire, fast water, gas leaks, live wires, or structural damage.";

export function imageAnalysisFallback(
  language: SupportedLanguage,
  disasterType: DisasterType = "unknown",
  modelUsed = "fallback"
): ImageAnalysisResult {
  return {
    dangerLevel: "HIGH",
    confidence: 0.38,
    evacuationNeeded: true,
    disasterType,
    summary:
      "Gemma analysis is unavailable right now. Treat the scene as potentially dangerous and move to a safer location while following official local guidance.",
    visibleHazards: ["Unable to verify image details", "Possible immediate safety risk"],
    immediateActions: [
      {
        label: "Move away from visible danger",
        reason: "Distance reduces exposure while the situation is uncertain.",
        urgency: "now"
      },
      {
        label: "Call local emergency services",
        reason: "Responders can verify hazards and provide location-specific instructions.",
        urgency: "now"
      },
      {
        label: "Avoid floodwater, smoke, damaged walls, and live wires",
        reason: "These are common disaster hazards even when image analysis is unavailable.",
        urgency: "now"
      }
    ],
    avoidActions: ["Do not enter unstable buildings", "Do not drive through floodwater", "Do not touch exposed wires"],
    emergencyEscalation: escalation,
    offlineTip: "Share your location by SMS if data is weak and keep your phone on battery saver.",
    language,
    modelUsed,
    fallbackUsed: true
  };
}

export function chatFallback(language: SupportedLanguage, modelUsed = "fallback"): ChatStructuredResponse {
  return {
    dangerLevel: "HIGH",
    confidence: 0.4,
    summary:
      "The AI service is temporarily unavailable. Use conservative emergency steps and follow official instructions.",
    immediateActions: [
      {
        label: "Move to a safer area",
        reason: "Creating distance from the hazard is usually the first protective step.",
        urgency: "now"
      },
      {
        label: "Contact emergency services",
        reason: "Local responders can provide verified guidance.",
        urgency: "now"
      },
      {
        label: "Check people nearby",
        reason: "Identify injuries, blocked exits, or trapped people without putting yourself at risk.",
        urgency: "soon"
      }
    ],
    escalationNeeded: true,
    emergencyEscalation: escalation,
    followUpQuestion: "",
    language,
    modelUsed,
    fallbackUsed: true
  };
}

export function checklistFallback(
  disasterType: DisasterType,
  familySize: number,
  language: SupportedLanguage,
  modelUsed = "fallback"
): ChecklistResult {
  return {
    dangerLevel: "MODERATE",
    confidence: 0.5,
    disasterType,
    familySize,
    survivalKit: [
      "Drinking water for each person",
      "Ready-to-eat food",
      "Flashlight and spare batteries",
      "Power bank",
      "Whistle",
      "Masks",
      "Basic first-aid kit",
      "Blanket or rain protection"
    ],
    medicines: ["Prescribed medicines", "Basic first-aid supplies", "Oral rehydration salts", "Sanitizer"],
    documents: ["ID cards", "Insurance documents", "Medical records", "Emergency contact list"],
    evacuationPrep: ["Charge phones", "Pack essentials", "Identify nearest safe shelter", "Keep footwear ready"],
    specialNotes: ["Keep supplies dry", "Use SMS when mobile data is weak", "Follow official evacuation alerts"],
    emergencyEscalation: escalation,
    language,
    modelUsed,
    fallbackUsed: true
  };
}
