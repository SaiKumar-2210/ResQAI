"use client";

import { useState } from "react";
import { Bot, Loader2, MessageSquareText, Send, ShieldAlert, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useStreamingChat } from "@/lib/hooks/useStreamingChat";
import type { DisasterType } from "@/lib/types/disaster";
import type { SupportedLanguage } from "@/lib/types/language";

export function EmergencyDecisionPanel({
  scenario,
  language,
  onLanguageChange,
  onScenarioChange
}: {
  scenario: DisasterType;
  language: SupportedLanguage;
  onLanguageChange: (value: SupportedLanguage) => void;
  onScenarioChange: (value: DisasterType) => void;
}) {
  const [message, setMessage] = useState("");
  const { messages, isStreaming, error, sendMessage } = useStreamingChat();

  async function submit(nextMessage = message) {
    if (!nextMessage.trim() || isStreaming) return;
    setMessage("");
    await sendMessage(nextMessage.trim(), language, scenario);
  }

  async function runTeluguEarthquakeDemo() {
    onScenarioChange("earthquake");
    onLanguageChange("telugu");
    await sendMessage("What should I do during an earthquake?", "telugu", "earthquake");
  }

  return (
    <Card className="bg-slate-950/70">
      <CardHeader>
        <CardTitle>Emergency Decision Support</CardTitle>
        <CardDescription>
          Stream Gemma guidance for survival questions with multilingual response control.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={runTeluguEarthquakeDemo} disabled={isStreaming}>
            <MessageSquareText className="h-4 w-4" />
            Telugu Earthquake Demo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onScenarioChange("fire");
              setMessage("Smoke is entering my apartment corridor. What should I do?");
            }}
          >
            Fire Exit Guidance
          </Button>
        </div>

        <div className="min-h-[290px] space-y-3 rounded-lg border border-white/10 bg-background/65 p-3">
          {messages.length === 0 ? (
            <div className="flex h-[260px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
              <ShieldAlert className="mb-3 h-8 w-8 text-teal-300" />
              Ask for decision guidance or run the Telugu earthquake demo.
            </div>
          ) : (
            messages.map((item) => (
              <div
                key={item.id}
                className={`flex gap-3 rounded-lg p-3 ${
                  item.role === "assistant" ? "bg-secondary/55" : "bg-teal-400/10"
                }`}
              >
                <div className="mt-0.5">
                  {item.role === "assistant" ? (
                    <Bot className="h-4 w-4 text-teal-300" />
                  ) : (
                    <User className="h-4 w-4 text-sky-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {item.role === "assistant" ? "ResQAI" : "You"}
                    </span>
                    {item.structured ? (
                      <>
                        <Badge variant={item.structured.dangerLevel === "LOW" ? "success" : "warning"}>
                          {item.structured.dangerLevel}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(item.structured.confidence * 100)}%
                        </Badge>
                      </>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
                    {item.role === "assistant" && item.content.trim().startsWith("{")
                      ? "Gemma is streaming structured emergency guidance..."
                      : item.content}
                  </p>
                  {item.structured?.immediateActions?.length ? (
                    <div className="mt-3 grid gap-2">
                      {item.structured.immediateActions.map((action) => (
                        <div key={action.label} className="rounded-md border border-white/10 p-2">
                          <p className="text-sm font-medium">{action.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{action.reason}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        {error ? <p className="text-sm text-red-200">{error}</p> : null}

        <div className="space-y-3">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask: What should I do during an earthquake?"
          />
          <Button className="w-full" onClick={() => submit()} disabled={!message.trim() || isStreaming}>
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Stream Guidance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
