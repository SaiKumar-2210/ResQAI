"use client";

import { PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demoScenarios } from "@/lib/constants/demoData";
import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";

export function DemoModePanel({
  onScenarioChange,
  onLanguageChange
}: {
  onScenarioChange: (value: DisasterType) => void;
  onLanguageChange: (value: SupportedLanguage) => void;
}) {
  return (
    <Card className="bg-slate-950/70">
      <CardHeader>
        <CardTitle>Guided Demo Mode</CardTitle>
        <CardDescription>
          Prebuilt flows keep the Kaggle demo moving even when API latency varies.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {demoScenarios.map((demo) => (
          <div key={demo.id} className="rounded-lg border border-white/10 bg-background/65 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold">{demo.title}</h4>
              <Badge variant="outline">{demo.language}</Badge>
            </div>
            <p className="min-h-12 text-sm text-muted-foreground">{demo.prompt}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                onScenarioChange(demo.disasterType);
                onLanguageChange(demo.language);
              }}
            >
              <PlayCircle className="h-4 w-4" />
              Load Scenario
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
