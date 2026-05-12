import type { ChatStructuredResponse, EmergencyAction } from "./ai";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  structured?: ChatStructuredResponse;
}

export type { EmergencyAction };
