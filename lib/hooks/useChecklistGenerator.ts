"use client";

import { useState } from "react";
import type { ChecklistResult } from "@/lib/types/ai";
import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";
import { parseApiError } from "@/lib/utils/api";

export function useChecklistGenerator() {
  const [result, setResult] = useState<ChecklistResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(disasterType: DisasterType, familySize: number, language: SupportedLanguage) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disasterType, familySize, language })
      });

      if (!response.ok) throw new Error(await parseApiError(response));

      const payload = (await response.json()) as ChecklistResult;
      setResult(payload);
      return payload;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checklist generation failed.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { result, isLoading, error, generate, setResult };
}
