import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/ai/audioService";
import { assertRateLimit } from "@/lib/ai/rateLimit";
import type { SupportedLanguage } from "@/lib/types/language";

export const runtime = "nodejs";

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: NextRequest) {
  try {
    assertRateLimit(`tts:${clientKey(request)}`, 12, 60_000);

    const body = (await request.json()) as {
      text?: string;
      language?: SupportedLanguage;
    };

    if (!body.text?.trim()) {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    const audio = await synthesizeSpeech(body.text, body.language ?? "english");

    return new Response(audio, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Speech generation failed." },
      { status: 500 }
    );
  }
}
