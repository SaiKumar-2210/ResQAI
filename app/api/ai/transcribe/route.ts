import { NextRequest, NextResponse } from "next/server";
import { transcribeEmergencyAudio } from "@/lib/ai/audioService";
import { assertRateLimit } from "@/lib/ai/rateLimit";
import type { SupportedLanguage } from "@/lib/types/language";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: NextRequest) {
  try {
    assertRateLimit(`transcribe:${clientKey(request)}`, 12, 60_000);

    const formData = await request.formData();
    const file = formData.get("audio");
    const language = (formData.get("language")?.toString() || "english") as SupportedLanguage;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload audio using the audio field." }, { status: 400 });
    }

    if (file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "Audio is too large. Keep clips under 8MB." }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await transcribeEmergencyAudio({
      base64Audio: buffer.toString("base64"),
      mimeType: file.type || "audio/webm",
      language
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Audio transcription failed." },
      { status: 500 }
    );
  }
}
