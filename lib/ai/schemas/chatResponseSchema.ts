import { emergencyActionSchema, safetyFields } from "./commonSchema";

export const chatResponseSchema = {
  type: "object",
  properties: {
    dangerLevel: {
      type: "string",
      enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    },
    confidence: safetyFields.confidence,
    summary: {
      type: "string",
      description: "Short disaster guidance summary in the selected language."
    },
    immediateActions: {
      type: "array",
      items: emergencyActionSchema
    },
    escalationNeeded: {
      type: "boolean"
    },
    emergencyEscalation: safetyFields.emergencyEscalation,
    followUpQuestion: {
      type: "string",
      description: "Ask one practical follow-up question if more context is needed. Otherwise return an empty string."
    },
    language: {
      type: "string",
      enum: ["english", "telugu", "hindi"]
    }
  },
  required: [
    "dangerLevel",
    "confidence",
    "summary",
    "immediateActions",
    "escalationNeeded",
    "emergencyEscalation",
    "followUpQuestion",
    "language"
  ]
} as const;
