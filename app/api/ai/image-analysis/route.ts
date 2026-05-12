import { NextRequest, NextResponse } from "next/server";
import { analyzeDisasterImage } from "@/lib/ai/gemmaService";
import { assertRateLimit } from "@/lib/ai/rateLimit";
import { isAllowedImageMimeType, stripDataUrlPrefix } from "@/lib/ai/sanitization";
import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 7 * 1024 * 1024;

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: NextRequest) {
  try {
    assertRateLimit(`image:${clientKey(request)}`, 10, 60_000);

    const formData = await request.formData();
    const file = formData.get("image");
    const language = (formData.get("language")?.toString() || "english") as SupportedLanguage;
    const scenario = (formData.get("scenario")?.toString() || "unknown") as DisasterType;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload an image file using the image field." }, { status: 400 });
    }

    if (!isAllowedImageMimeType(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image type. Use JPEG, PNG, WEBP, HEIC, or HEIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image is too large for inline analysis. Keep uploads under 7MB for the MVP demo path." },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    const result = await analyzeDisasterImage({
      base64Image: stripDataUrlPrefix(base64Image),
      mimeType: file.type,
      language,
      scenario
    });

    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof Error && error.name === "RateLimitError" ? 429 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image analysis failed." },
      { status }
    );
  }
}
