import { BrainCircuit, Languages, Radar, ShieldCheck, Smartphone, UploadCloud } from "lucide-react";

const features = [
  {
    title: "Multimodal hazard triage",
    description: "Upload disaster images and let Gemma reason about water, smoke, blocked roads, and structural risks.",
    icon: UploadCloud
  },
  {
    title: "Structured risk output",
    description: "Danger level, confidence, evacuation flag, hazards, and immediate actions power visual decisions.",
    icon: Radar
  },
  {
    title: "Multilingual guidance",
    description: "Emergency instructions are available in English, Telugu, and Hindi.",
    icon: Languages
  },
  {
    title: "Safety guardrails",
    description: "Escalation rules and conservative wording reduce dangerous overconfidence.",
    icon: ShieldCheck
  },
  {
    title: "Streaming support",
    description: "Guidance streams incrementally for a faster, more AI-native field experience.",
    icon: BrainCircuit
  },
  {
    title: "Offline-first UX",
    description: "Fallback cards and PWA support help users keep critical tips during poor connectivity.",
    icon: Smartphone
  }
];

export function FeatureGrid() {
  return (
    <section id="capabilities" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-teal-200">Capabilities</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
          Built for decisions, not generic chat.
        </h2>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="rounded-lg border border-white/10 bg-slate-950/55 p-5">
              <Icon className="h-5 w-5 text-teal-300" />
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
