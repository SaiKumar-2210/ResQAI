"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileImage, Loader2, ShieldAlert, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useImageAnalysis } from "@/lib/hooks/useImageAnalysis";
import type { DisasterType, DangerLevel } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";
import { bytesToDisplaySize, createDemoDisasterImage } from "@/lib/utils/image";

function dangerVariant(level: DangerLevel) {
  if (level === "CRITICAL" || level === "HIGH") return "danger";
  if (level === "MODERATE") return "warning";
  return "success";
}

export function ImageAnalysisPanel({
  scenario,
  language,
  onScenarioChange
}: {
  scenario: DisasterType;
  language: SupportedLanguage;
  onScenarioChange: (value: DisasterType) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { result, isLoading, error, analyzeImage } = useImageAnalysis();

  const fileMeta = useMemo(() => {
    if (!file) return null;
    return {
      name: file.name,
      details: `${file.type || "image"} - ${bytesToDisplaySize(file.size)}`
    };
  }, [file]);

  function handleFile(nextFile: File | null) {
    setFile(nextFile);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
  }

  async function runAnalysis(nextFile = file) {
    if (!nextFile) return;
    await analyzeImage(nextFile, language, scenario);
  }

  async function runDemo(type: "flood" | "fire") {
    const demoFile = await createDemoDisasterImage(type);
    handleFile(demoFile);
    onScenarioChange(type);
    await analyzeImage(demoFile, language, type);
  }

  return (
    <Card id="image-analysis" className="overflow-hidden bg-slate-950/70">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Gemma Multimodal Image Triage</CardTitle>
            <CardDescription>
              Upload a scene photo to classify visible hazards and evacuation priority.
            </CardDescription>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex">
            JSON mode
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border border-dashed border-white/15 bg-background/60 p-4">
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => runDemo("flood")} disabled={isLoading}>
              <UploadCloud className="h-4 w-4" />
              Demo Flood
            </Button>
            <Button size="sm" variant="outline" onClick={() => runDemo("fire")} disabled={isLoading}>
              <UploadCloud className="h-4 w-4" />
              Demo Fire
            </Button>
            <Button size="sm" onClick={() => runAnalysis()} disabled={!file || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
              Analyze
            </Button>
          </div>
          {fileMeta ? (
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <FileImage className="h-3.5 w-3.5" />
              {fileMeta.name} - {fileMeta.details}
            </p>
          ) : null}
        </div>

        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Uploaded disaster preview"
            className="h-56 w-full rounded-lg border border-white/10 object-cover"
          />
        ) : (
          <div className="flex h-56 items-center justify-center rounded-lg border border-white/10 bg-secondary/40 text-sm text-muted-foreground">
            Image preview appears here
          </div>
        )}

        {error ? (
          <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="space-y-4 rounded-lg border border-white/10 bg-background/70 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={dangerVariant(result.dangerLevel)}>
                {result.dangerLevel} danger
              </Badge>
              <Badge variant={result.evacuationNeeded ? "danger" : "success"}>
                {result.evacuationNeeded ? "Evacuation advised" : "Evacuation not obvious"}
              </Badge>
              <Badge variant="outline">Confidence {Math.round(result.confidence * 100)}%</Badge>
            </div>
            <Progress value={result.confidence * 100} />
            <p className="text-sm leading-6 text-slate-200">{result.summary}</p>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4 text-amber-300" />
                  Visible hazards
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.visibleHazards.map((hazard) => (
                    <li key={hazard}>- {hazard}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-teal-300" />
                  Immediate actions
                </h4>
                <div className="space-y-2">
                  {result.immediateActions.map((action) => (
                    <div key={action.label} className="rounded-md bg-secondary/55 p-3">
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{action.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-md border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-100">
              {result.emergencyEscalation}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
