export function extractTextFromGemmaResponse(payload: unknown): string {
  const data = payload as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

export function parseJsonObject<T>(text: string): T {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const jsonText = fenced ?? trimmed;
  return JSON.parse(jsonText) as T;
}

export function stripDataUrlPrefix(value: string) {
  return value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
}

export function isAllowedImageMimeType(mimeType: string) {
  return ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(mimeType);
}
