import { NextRequest, NextResponse } from "next/server";
import {
  finalizeStreamedChatResponse,
  generateChatResponse,
  startChatStream
} from "@/lib/ai/gemmaService";
import { assertRateLimit } from "@/lib/ai/rateLimit";
import { chatFallback } from "@/lib/ai/fallbackResponses";
import { createClientSseStream, encodeSse } from "@/lib/ai/streaming";
import { getGemmaConfig } from "@/lib/ai/gemmaClient";
import { trackEvent } from "@/lib/monitoring/analytics";
import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";

export const runtime = "nodejs";

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: NextRequest) {
  try {
    assertRateLimit(`chat:${clientKey(request)}`, 20, 60_000);

    const body = (await request.json()) as {
      message?: string;
      language?: SupportedLanguage;
      scenario?: DisasterType;
      stream?: boolean;
      history?: Array<{ role: "user" | "model"; text: string }>;
    };

    if (!body.message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const input = {
      message: body.message.trim(),
      language: body.language ?? "english",
      scenario: body.scenario ?? "unknown",
      history: body.history ?? []
    };

    if (!body.stream) {
      const result = await generateChatResponse(input);
      return NextResponse.json(result);
    }

    try {
      const gemma = await startChatStream(input);
      const stream = createClientSseStream(gemma.stream, (fullText) => {
        const result = finalizeStreamedChatResponse(fullText, gemma.model);
        gemma.cleanup();
        return result;
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive"
        }
      });
    } catch (error) {
      trackEvent("chat_stream_failed", {
        error: error instanceof Error ? error.message : String(error)
      });

      const fallback = chatFallback(input.language, getGemmaConfig().model);
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          const text = JSON.stringify(fallback, null, 2);
          controller.enqueue(encodeSse({ type: "token", token: text }));
          controller.enqueue(encodeSse({ type: "done", data: fallback }));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive"
        }
      });
    }
  } catch (error) {
    const status = error instanceof Error && error.name === "RateLimitError" ? 429 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed." },
      { status }
    );
  }
}
