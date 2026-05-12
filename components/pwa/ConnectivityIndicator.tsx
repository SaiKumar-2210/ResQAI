"use client";

import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOfflineMode } from "@/lib/hooks/useOfflineMode";

export function ConnectivityIndicator() {
  const { isOffline } = useOfflineMode();

  return (
    <Badge variant={isOffline ? "warning" : "success"} className="gap-1.5">
      {isOffline ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
      {isOffline ? "Offline fallback" : "Online"}
    </Badge>
  );
}
