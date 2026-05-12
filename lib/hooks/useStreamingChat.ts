"use client";

import { useState } from "react";
import type { ChatMessage } from "@/lib/types/chat";
import type { ChatStructuredResponse } from "@/lib/types/ai";
import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";
import { parseApiError } from "@/lib/utils/api";

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useStreamingChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(message: string, language: SupportedLanguage, scenario: DisasterType) {
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: message
    };
    const assistantId = createId();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: ""
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setIsStreaming(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          language,
          scenario,
          stream: true,
          history: messages
            .filter((item) => item.role === "user" || item.role === "assistant")
            .slice(-6)
            .map((item) => ({
              role: item.role === "assistant" ? "model" : "user",
              text: item.content
            }))
        })
      });

      if (!response.ok || !response.body) throw new Error(await parseApiError(response));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const line = event.split("\n").find((entry) => entry.startsWith("data:"));
          if (!line) continue;

          const payload = JSON.parse(line.replace(/^data:\s*/, "")) as {
            type: "token" | "done" | "error";
            token?: string;
            data?: ChatStructuredResponse;
            error?: string;
          };

          if (payload.type === "token" && payload.token) {
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantId
                  ? { ...item, content: `${item.content}${payload.token}` }
                  : item
              )
            );
          }

          if (payload.type === "done" && payload.data) {
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantId
                  ? {
                      ...item,
                      content: payload.data?.summary ?? item.content,
                      structured: payload.data
                    }
                  : item
              )
            );
          }

          if (payload.type === "error") {
            throw new Error(payload.error ?? "Streaming failed.");
          }
        }
      }
    } catch (err) {
      const messageText = err instanceof Error ? err.message : "Chat failed.";
      setError(messageText);
      setMessages((current) =>
        current.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                content:
                  "The AI stream failed. Use conservative emergency steps and contact local emergency services if danger is imminent."
              }
            : item
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }

  return { messages, isStreaming, error, sendMessage, setMessages };
}
