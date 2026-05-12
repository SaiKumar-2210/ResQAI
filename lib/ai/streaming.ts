import { extractTextFromGemmaResponse, parseJsonObject } from "./sanitization";

export interface StreamToken {
  type: "token" | "done" | "error";
  token?: string;
  data?: unknown;
  error?: string;
}

const encoder = new TextEncoder();

export function encodeSse(event: StreamToken) {
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

export function createClientSseStream(
  gemmaStream: ReadableStream<Uint8Array>,
  onComplete: (fullText: string) => unknown
) {
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = gemmaStream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const event of events) {
            const line = event
              .split("\n")
              .find((entry) => entry.startsWith("data:"));

            if (!line) continue;

            const raw = line.replace(/^data:\s*/, "");
            if (!raw || raw === "[DONE]") continue;

            const parsed = JSON.parse(raw);
            const token = extractTextFromGemmaResponse(parsed);

            if (token) {
              fullText += token;
              controller.enqueue(encodeSse({ type: "token", token }));
            }
          }
        }

        const parsed = onComplete(fullText);
        controller.enqueue(encodeSse({ type: "done", data: parsed }));
      } catch (error) {
        controller.enqueue(
          encodeSse({
            type: "error",
            error: error instanceof Error ? error.message : "Streaming failed."
          })
        );
      } finally {
        controller.close();
      }
    }
  });
}

export function parseStructuredStreamResult<T>(text: string): T {
  return parseJsonObject<T>(text);
}
