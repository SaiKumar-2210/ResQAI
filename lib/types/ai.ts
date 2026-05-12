import type { DangerLevel, DisasterType } from "./disaster";
import type { SupportedLanguage } from "./language";

export interface EmergencyAction {
  label: string;
  reason: string;
  urgency: "now" | "soon" | "prepare";
}

export interface ImageAnalysisResult {
  dangerLevel: DangerLevel;
  confidence: number;
  evacuationNeeded: boolean;
  disasterType: DisasterType;
  summary: string;
  visibleHazards: string[];
  immediateActions: EmergencyAction[];
  avoidActions: string[];
  emergencyEscalation: string;
  offlineTip: string;
  language: SupportedLanguage;
  modelUsed: string;
  fallbackUsed?: boolean;
}

export interface ChatStructuredResponse {
  dangerLevel: DangerLevel;
  confidence: number;
  summary: string;
  immediateActions: EmergencyAction[];
  escalationNeeded: boolean;
  emergencyEscalation: string;
  followUpQuestion: string;
  language: SupportedLanguage;
  modelUsed: string;
  fallbackUsed?: boolean;
}

export interface ChecklistResult {
  dangerLevel: DangerLevel;
  confidence: number;
  disasterType: DisasterType;
  familySize: number;
  survivalKit: string[];
  medicines: string[];
  documents: string[];
  evacuationPrep: string[];
  specialNotes: string[];
  emergencyEscalation: string;
  language: SupportedLanguage;
  modelUsed: string;
  fallbackUsed?: boolean;
}

export interface GemmaImageInput {
  base64Image: string;
  mimeType: string;
  language: SupportedLanguage;
  scenario?: DisasterType;
}

export interface GemmaChatInput {
  message: string;
  language: SupportedLanguage;
  scenario?: DisasterType;
  history?: Array<{ role: "user" | "model"; text: string }>;
}

export interface GemmaChecklistInput {
  disasterType: DisasterType;
  familySize: number;
  language: SupportedLanguage;
}
