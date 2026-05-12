"use client";

import { useMemo, useState } from "react";
import { Copy, Loader2, MapPin, MessageSquare, Phone, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import type { DisasterType } from "@/lib/types/disaster";
import {
  buildEmergencyLocationMessage,
  emergencyNumberForScenario,
  mapUrlForLocation
} from "@/lib/utils/emergency";

export function LocationEmergencyPanel({ scenario }: { scenario: DisasterType }) {
  const { location, isLoading, error, requestLocation } = useUserLocation();
  const [copied, setCopied] = useState(false);

  const emergencyNumber = emergencyNumberForScenario(scenario);
  const emergencyMessage = useMemo(
    () => buildEmergencyLocationMessage(scenario, location),
    [location, scenario]
  );
  const smsHref = `sms:${emergencyNumber}?body=${encodeURIComponent(emergencyMessage)}`;

  async function copyMessage() {
    await navigator.clipboard.writeText(emergencyMessage);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Card className="bg-slate-950/70">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Location SOS</CardTitle>
            <CardDescription>
              Prepare a location-aware emergency message and call the right response number.
            </CardDescription>
          </div>
          <Badge variant="outline">{scenario === "fire" ? "Fire 101" : "Emergency 112"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-white/10 bg-background/65 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldAlert className="h-4 w-4 text-teal-300" />
            User-controlled emergency sharing
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            ResQAI prepares the message. You choose whether to call, text, or copy it.
          </p>
        </div>

        {location ? (
          <div className="rounded-lg border border-teal-400/20 bg-teal-400/10 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-teal-100">
              <MapPin className="h-4 w-4" />
              Location ready
            </p>
            <p className="mt-2 font-mono text-xs text-teal-50">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
            <p className="mt-1 text-xs text-teal-100/80">
              Accuracy about {Math.round(location.accuracy)} meters
            </p>
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-200">{error}</p> : null}

        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={requestLocation} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            Get Location
          </Button>
          <Button asChild>
            <a href={`tel:${emergencyNumber}`}>
              <Phone className="h-4 w-4" />
              Call {emergencyNumber}
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={smsHref}>
              <MessageSquare className="h-4 w-4" />
              SMS Location
            </a>
          </Button>
          <Button variant="outline" onClick={copyMessage}>
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy Message"}
          </Button>
        </div>

        {location ? (
          <Button asChild variant="ghost" className="w-full">
            <a href={mapUrlForLocation(location)} target="_blank" rel="noreferrer">
              <MapPin className="h-4 w-4" />
              Open Map
            </a>
          </Button>
        ) : null}

        <div className="rounded-lg border border-white/10 bg-background/55 p-3 text-sm text-muted-foreground">
          {emergencyMessage}
        </div>
      </CardContent>
    </Card>
  );
}
