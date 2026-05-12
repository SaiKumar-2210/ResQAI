"use client";

import { useState } from "react";
import type { ImageAnalysisResult } from "@/lib/types/ai";
import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";
import { parseApiError } from "@/lib/utils/api";

export function useImageAnalysis() {
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyzeImage(file: File, language: SupportedLanguage, scenario: DisasterType) {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("language", language);
      formData.append("scenario", scenario);

      const response = await fetch("/api/ai/image-analysis", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error(await parseApiError(response));

      const payload = (await response.json()) as ImageAnalysisResult;
      setResult(payload);
      return payload;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Image analysis failed.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { result, isLoading, error, analyzeImage, setResult };
}
