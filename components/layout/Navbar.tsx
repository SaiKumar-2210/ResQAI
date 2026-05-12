import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
            <Activity className="h-5 w-5" />
          </span>
          <span className="font-semibold tracking-wide">ResQAI</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/#capabilities" className="hover:text-foreground">
            Capabilities
          </Link>
          <Link href="/#demo" className="hover:text-foreground">
            Demo
          </Link>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
        </nav>
        <Button asChild size="sm">
          <Link href="/dashboard">
            Open System <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
