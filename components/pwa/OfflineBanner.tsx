"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useOfflineMode } from "@/lib/hooks/useOfflineMode";

export function OfflineBanner() {
  const { isOffline } = useOfflineMode();

  if (!isOffline) return null;

  return (
    <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-50">
      <AlertTriangle className="mb-2 h-4 w-4" />
      <AlertTitle>Low connectivity mode</AlertTitle>
      <AlertDescription>
        Live Gemma calls may be unavailable. Use cached emergency cards and call local emergency
        services if danger is imminent.
      </AlertDescription>
    </Alert>
  );
}
