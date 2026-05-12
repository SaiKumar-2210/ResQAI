"use client";

import { Loader2, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useChecklistGenerator } from "@/lib/hooks/useChecklistGenerator";
import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";

export function ChecklistGenerator({
  scenario,
  familySize,
  language,
  onFamilySizeChange
}: {
  scenario: DisasterType;
  familySize: number;
  language: SupportedLanguage;
  onFamilySizeChange: (value: number) => void;
}) {
  const { result, isLoading, error, generate } = useChecklistGenerator();

  return (
    <Card className="bg-slate-950/70">
      <CardHeader>
        <CardTitle>Family Emergency Kit</CardTitle>
        <CardDescription>
          Gemma generates disaster-specific supplies, medicines, documents, and evacuation prep.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input
            type="number"
            min={1}
            max={20}
            value={familySize}
            onChange={(event) => onFamilySizeChange(Number(event.target.value))}
            aria-label="Family size"
          />
          <Button onClick={() => generate(scenario, familySize, language)} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
            Generate Kit
          </Button>
        </div>

        {error ? <p className="text-sm text-red-200">{error}</p> : null}

        {result ? (
          <div className="space-y-4 rounded-lg border border-white/10 bg-background/70 p-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{result.disasterType}</Badge>
              <Badge variant="outline">Family of {result.familySize}</Badge>
              <Badge variant="success">{Math.round(result.confidence * 100)}% confidence</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Survival kit", result.survivalKit],
                ["Medicines", result.medicines],
                ["Documents", result.documents],
                ["Evacuation prep", result.evacuationPrep]
              ].map(([title, items]) => (
                <div key={title as string}>
                  <h4 className="mb-2 text-sm font-semibold">{title as string}</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {(items as string[]).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-50">
              {result.emergencyEscalation}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-background/55 p-4 text-sm text-muted-foreground">
            Select a scenario and family size, then generate a kit.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
