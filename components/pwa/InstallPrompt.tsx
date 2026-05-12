"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/lib/hooks/usePwaInstall";

export function InstallPrompt() {
  const { canInstall, install } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <Button size="sm" variant="outline" onClick={install}>
      <Download className="h-4 w-4" />
      Install
    </Button>
  );
}
