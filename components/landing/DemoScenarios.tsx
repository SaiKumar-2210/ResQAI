import Link from "next/link";
import { ArrowRight, Flame, ListChecks, MessageSquareText, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

const demos = [
  {
    title: "Flood image",
    description: "Upload a flood scene and receive danger level plus evacuation guidance.",
    icon: Waves
  },
  {
    title: "Telugu earthquake guidance",
    description: "Ask what to do during an earthquake and receive Telugu response steps.",
    icon: MessageSquareText
  },
  {
    title: "Family emergency kit",
    description: "Generate survival, medicine, document, and evacuation checklists.",
    icon: ListChecks
  },
  {
    title: "Fire scene triage",
    description: "Use Gemma image reasoning to identify visible smoke and exit hazards.",
    icon: Flame
  }
];

export function DemoScenarios() {
  return (
    <section id="demo" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <div className="rounded-lg border border-white/10 bg-slate-950/70 p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-teal-200">Hackathon demo mode</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal">Reliable flows when the room Wi-Fi is not.</h2>
          </div>
          <Button asChild>
            <Link href="/dashboard">
              Try Demo Scenario <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {demos.map((demo) => {
            const Icon = demo.icon;
            return (
              <div key={demo.title} className="rounded-lg border border-white/10 bg-background/70 p-4">
                <Icon className="h-5 w-5 text-teal-300" />
                <h3 className="mt-4 text-sm font-semibold">{demo.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{demo.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
