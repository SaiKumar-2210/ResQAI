import type { DemoScenario } from "@/lib/types/demo";

export const demoScenarios: DemoScenario[] = [
  {
    id: "flood-image",
    title: "Flood Image Triage",
    disasterType: "flood",
    prompt: "Analyze this flooded street image and tell me whether evacuation is needed.",
    language: "english",
    imagePath: "/images/demo-flood.svg"
  },
  {
    id: "fire-image",
    title: "Fire Perimeter Check",
    disasterType: "fire",
    prompt: "Analyze visible fire and smoke risk and recommend immediate actions.",
    language: "english",
    imagePath: "/images/demo-fire.svg"
  },
  {
    id: "earthquake-telugu",
    title: "Earthquake Guidance in Telugu",
    disasterType: "earthquake",
    prompt: "What should I do during an earthquake?",
    language: "telugu"
  },
  {
    id: "family-kit",
    title: "Family Kit Checklist",
    disasterType: "cyclone",
    prompt: "Generate a survival kit for a family of four.",
    language: "english"
  }
];
