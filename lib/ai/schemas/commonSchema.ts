export const dangerLevels = ["LOW", "MODERATE", "HIGH", "CRITICAL"] as const;
export const disasterTypes = [
  "flood",
  "fire",
  "earthquake",
  "cyclone",
  "storm",
  "building-collapse",
  "unknown"
] as const;

export const emergencyActionSchema = {
  type: "object",
  properties: {
    label: {
      type: "string",
      description: "A short action instruction the user can perform."
    },
    reason: {
      type: "string",
      description: "Why this action matters for immediate safety."
    },
    urgency: {
      type: "string",
      enum: ["now", "soon", "prepare"],
      description: "How soon the action should be taken."
    }
  },
  required: ["label", "reason", "urgency"]
} as const;

export const safetyFields = {
  emergencyEscalation: {
    type: "string",
    description:
      "A concise escalation instruction. Must tell users to contact local emergency services if danger is imminent."
  },
  confidence: {
    type: "number",
    minimum: 0,
    maximum: 1,
    description: "Model confidence from 0 to 1 based only on visible evidence and user-provided context."
  }
} as const;
