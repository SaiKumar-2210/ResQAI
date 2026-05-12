import { disasterTypes, emergencyActionSchema, safetyFields } from "./commonSchema";

export const imageAnalysisResponseSchema = {
  type: "object",
  properties: {
    dangerLevel: {
      type: "string",
      enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    },
    confidence: safetyFields.confidence,
    evacuationNeeded: {
      type: "boolean",
      description: "Whether the visible situation suggests evacuation or immediate movement to safer ground."
    },
    disasterType: {
      type: "string",
      enum: disasterTypes
    },
    summary: {
      type: "string",
      description: "Two concise sentences summarizing visible risks and the safest priority."
    },
    visibleHazards: {
      type: "array",
      items: { type: "string" },
      description: "Visible hazards only. Do not invent unseen facts."
    },
    immediateActions: {
      type: "array",
      items: emergencyActionSchema
    },
    avoidActions: {
      type: "array",
      items: { type: "string" }
    },
    emergencyEscalation: safetyFields.emergencyEscalation,
    offlineTip: {
      type: "string",
      description: "One useful low-connectivity fallback tip relevant to the hazard."
    },
    language: {
      type: "string",
      enum: ["english", "telugu", "hindi"]
    }
  },
  required: [
    "dangerLevel",
    "confidence",
    "evacuationNeeded",
    "disasterType",
    "summary",
    "visibleHazards",
    "immediateActions",
    "avoidActions",
    "emergencyEscalation",
    "offlineTip",
    "language"
  ]
} as const;
