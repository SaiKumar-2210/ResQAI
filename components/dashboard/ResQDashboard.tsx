"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Phone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { ChecklistGenerator } from "@/components/checklist/ChecklistGenerator";
import { EmergencyDecisionPanel } from "@/components/chat/EmergencyDecisionPanel";
import { ImageAnalysisPanel } from "@/components/image-analysis/ImageAnalysisPanel";
import { DemoModePanel } from "@/components/demo/DemoModePanel";
import { LocationEmergencyPanel } from "@/components/dashboard/LocationEmergencyPanel";
import { ConnectivityIndicator } from "@/components/pwa/ConnectivityIndicator";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { disasterScenarios } from "@/lib/constants/disasters";
import { emergencyContacts } from "@/lib/constants/contacts";
import { offlineEmergencyTips } from "@/lib/constants/emergencyTips";
import { supportedLanguages } from "@/lib/constants/languages";
import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";

export function ResQDashboard() {
  const [scenario, setScenario] = useState<DisasterType>("flood");
  const [language, setLanguage] = useState<SupportedLanguage>("english");
  const [familySize, setFamilySize] = useState(4);

  const activeScenario = disasterScenarios.find((item) => item.id === scenario) ?? disasterScenarios[0];
  const tips = offlineEmergencyTips[scenario] ?? offlineEmergencyTips.unknown;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <OfflineBanner />

      <section className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <ConnectivityIndicator />
            <Badge variant="outline">Gemma 4 multimodal core</Badge>
            <Badge variant="outline">Emergency decision support</Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-normal sm:text-5xl">
            ResQAI command dashboard
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Analyze disaster images first, then use structured Gemma guidance for multilingual
            actions, preparedness, and low-connectivity fallbacks.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <InstallPrompt />
          <Button asChild variant="outline">
            <a href="tel:112">
              <Phone className="h-4 w-4" />
              Call 112
            </a>
          </Button>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="bg-slate-950/70">
          <CardHeader>
            <CardTitle>Scenario Quick Actions</CardTitle>
            <CardDescription>Choose the disaster context Gemma should prioritize.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {disasterScenarios.map((item) => {
                const Icon = item.icon;
                const active = scenario === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ y: -2 }}
                    onClick={() => setScenario(item.id)}
                    className={`rounded-lg border p-4 text-left transition ${
                      active
                        ? "border-teal-300/50 bg-teal-400/12"
                        : "border-white/10 bg-background/60 hover:bg-secondary/70"
                    }`}
                  >
                    <Icon className="h-5 w-5 text-teal-300" />
                    <p className="mt-3 text-sm font-semibold">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-950/70">
          <CardHeader>
            <CardTitle>Response Settings</CardTitle>
            <CardDescription>Structured outputs use these choices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Language</span>
              <Select
                value={language}
                onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
              >
                {supportedLanguages.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.nativeLabel}
                  </option>
                ))}
              </Select>
            </label>
            <div className="rounded-lg border border-white/10 bg-background/60 p-4">
              <p className="text-sm font-semibold">{activeScenario.label} offline tips</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {tips.map((tip) => (
                  <li key={tip}>• {tip}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ImageAnalysisPanel
          scenario={scenario}
          language={language}
          onScenarioChange={setScenario}
        />
        <EmergencyDecisionPanel
          scenario={scenario}
          language={language}
          onLanguageChange={setLanguage}
          onScenarioChange={setScenario}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ChecklistGenerator
          scenario={scenario}
          language={language}
          familySize={familySize}
          onFamilySizeChange={setFamilySize}
        />
        <DemoModePanel onScenarioChange={setScenario} onLanguageChange={setLanguage} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <LocationEmergencyPanel scenario={scenario} />

        <Card className="bg-slate-950/70">
          <CardHeader>
            <CardTitle>Preparedness Guides</CardTitle>
            <CardDescription>Cached guidance cards for low-connectivity situations.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              "Keep a 24-hour go bag near the exit.",
              "Share a family meeting point before evacuation.",
              "Keep documents in a waterproof pouch.",
              "Use SMS and battery saver when mobile data is weak."
            ].map((guide) => (
              <div key={guide} className="rounded-lg border border-white/10 bg-background/65 p-4">
                <ShieldCheck className="h-5 w-5 text-teal-300" />
                <p className="mt-3 text-sm text-slate-200">{guide}</p>
              </div>
            ))}
            <a
              href="https://ndma.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-background/65 p-4 text-sm text-teal-200 hover:bg-secondary/70"
            >
              National Disaster Management Authority <ExternalLink className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="bg-slate-950/70">
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
            <CardDescription>Tap-to-call numbers for Indian demo context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyContacts.map((contact) => (
              <a
                key={contact.value}
                href={`tel:${contact.value}`}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-background/65 p-3 hover:bg-secondary/70"
              >
                <div>
                  <p className="text-sm font-semibold">{contact.label}</p>
                  <p className="text-xs text-muted-foreground">{contact.note}</p>
                </div>
                <span className="font-mono text-lg text-teal-200">{contact.value}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
