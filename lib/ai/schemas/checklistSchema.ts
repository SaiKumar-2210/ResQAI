import { disasterTypes, safetyFields } from "./commonSchema";

export const checklistResponseSchema = {
  type: "object",
  properties: {
    dangerLevel: {
      type: "string",
      enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    },
    confidence: safetyFields.confidence,
    disasterType: {
      type: "string",
      enum: disasterTypes
    },
    familySize: {
      type: "integer",
      minimum: 1,
      maximum: 20
    },
    survivalKit: {
      type: "array",
      items: { type: "string" }
    },
    medicines: {
      type: "array",
      items: { type: "string" }
    },
    documents: {
      type: "array",
      items: { type: "string" }
    },
    evacuationPrep: {
      type: "array",
      items: { type: "string" }
    },
    specialNotes: {
      type: "array",
      items: { type: "string" }
    },
    emergencyEscalation: safetyFields.emergencyEscalation,
    language: {
      type: "string",
      enum: ["english", "telugu", "hindi"]
    }
  },
  required: [
    "dangerLevel",
    "confidence",
    "disasterType",
    "familySize",
    "survivalKit",
    "medicines",
    "documents",
    "evacuationPrep",
    "specialNotes",
    "emergencyEscalation",
    "language"
  ]
} as const;
