import type { ChatStructuredResponse, ChecklistResult, ImageAnalysisResult } from "@/lib/types/ai";

const DEFAULT_ESCALATION =
  "Contact local emergency services immediately if danger is imminent, people are trapped, exits are blocked, or you see fire, fast water, gas leaks, live wires, or structural collapse risk.";

const DISCLAIMER =
  "ResQAI provides emergency decision support, not a replacement for official responders or local authorities.";

function disclaimerFor(language?: string) {
  if (language === "telugu") {
    return "ResQAI అత్యవసర నిర్ణయ సహాయం మాత్రమే అందిస్తుంది; అధికారిక రక్షకులు లేదా స్థానిక అధికారులకు ప్రత్యామ్నాయం కాదు.";
  }

  if (language === "hindi") {
    return "ResQAI आपातकालीन निर्णय सहायता देता है; यह आधिकारिक बचाव दल या स्थानीय अधिकारियों का विकल्प नहीं है.";
  }

  return DISCLAIMER;
}

function clampConfidence(confidence: unknown) {
  if (typeof confidence !== "number" || Number.isNaN(confidence)) return 0.55;
  return Math.max(0, Math.min(1, confidence));
}

function ensureEscalation(text?: string) {
  if (!text || text.trim().length < 12) return DEFAULT_ESCALATION;
  if (!/emergency|services|112|911|108|authorit/i.test(text)) {
    return `${text.trim()} ${DEFAULT_ESCALATION}`;
  }
  return text.trim();
}

export function confidenceLabel(confidence: number) {
  if (confidence >= 0.75) return "High confidence";
  if (confidence >= 0.45) return "Moderate confidence";
  return "Low confidence";
}

export function injectSafetyIntoImageAnalysis(
  result: ImageAnalysisResult
): ImageAnalysisResult {
  return {
    ...result,
    confidence: clampConfidence(result.confidence),
    summary: `${result.summary} ${disclaimerFor(result.language)}`,
    emergencyEscalation: ensureEscalation(result.emergencyEscalation),
    immediateActions: result.immediateActions.slice(0, 5),
    avoidActions: result.avoidActions.slice(0, 5),
    visibleHazards: result.visibleHazards.slice(0, 6)
  };
}

export function injectSafetyIntoChat(result: ChatStructuredResponse): ChatStructuredResponse {
  return {
    ...result,
    confidence: clampConfidence(result.confidence),
    summary: `${result.summary} ${disclaimerFor(result.language)}`,
    emergencyEscalation: ensureEscalation(result.emergencyEscalation),
    immediateActions: result.immediateActions.slice(0, 5)
  };
}

export function injectSafetyIntoChecklist(result: ChecklistResult): ChecklistResult {
  return {
    ...result,
    confidence: clampConfidence(result.confidence),
    emergencyEscalation: ensureEscalation(result.emergencyEscalation),
    survivalKit: result.survivalKit.slice(0, 12),
    medicines: result.medicines.slice(0, 8),
    documents: result.documents.slice(0, 8),
    evacuationPrep: result.evacuationPrep.slice(0, 10),
    specialNotes: result.specialNotes.slice(0, 8)
  };
}
