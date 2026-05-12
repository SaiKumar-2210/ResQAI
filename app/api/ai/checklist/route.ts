import { NextRequest, NextResponse } from "next/server";
import { generateChecklist } from "@/lib/ai/gemmaService";
import { assertRateLimit } from "@/lib/ai/rateLimit";
import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";

export const runtime = "nodejs";

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: NextRequest) {
  try {
    assertRateLimit(`checklist:${clientKey(request)}`, 16, 60_000);

    const body = (await request.json()) as {
      disasterType?: DisasterType;
      familySize?: number;
      language?: SupportedLanguage;
    };

    const familySize = Math.min(20, Math.max(1, Number(body.familySize ?? 4)));

    const result = await generateChecklist({
      disasterType: body.disasterType ?? "flood",
      familySize,
      language: body.language ?? "english"
    });

    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof Error && error.name === "RateLimitError" ? 429 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checklist generation failed." },
      { status }
    );
  }
}
