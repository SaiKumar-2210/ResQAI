import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/ai/gemmaService";
import { assertRateLimit } from "@/lib/ai/rateLimit";
import { encodeSse } from "@/lib/ai/streaming";
import { trackEvent } from "@/lib/monitoring/analytics";
import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";

export const runtime = "nodejs";

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function streamChatResult(result: Awaited<ReturnType<typeof generateChatResponse>>) {
  const words = result.summary.split(/(\s+)/).filter(Boolean);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encodeSse({ type: "token", token: word }));
        await new Promise((resolve) => setTimeout(resolve, 18));
      }

      controller.enqueue(encodeSse({ type: "done", data: result }));
      controller.close();
    }
  });
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
      trackEvent("chat_stream_started", { scenario: input.scenario, language: input.language });
      const result = await generateChatResponse(input);
      const stream = streamChatResult(result);

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
      throw error;
    }
  } catch (error) {
    const status = error instanceof Error && error.name === "RateLimitError" ? 429 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed." },
      { status }
    );
  }
}
