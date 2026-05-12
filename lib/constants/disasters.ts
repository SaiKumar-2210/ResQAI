import {
  Flame,
  Home,
  LandPlot,
  RadioTower,
  Waves,
  Wind
} from "lucide-react";
import type { DisasterType } from "@/lib/types/disaster";

export const disasterScenarios: Array<{
  id: DisasterType;
  label: string;
  description: string;
  icon: typeof Waves;
}> = [
  {
    id: "flood",
    label: "Flood",
    description: "Rising water, blocked roads, submerged paths",
    icon: Waves
  },
  {
    id: "fire",
    label: "Fire",
    description: "Smoke, active flames, unsafe exits",
    icon: Flame
  },
  {
    id: "earthquake",
    label: "Earthquake",
    description: "Aftershocks, falling objects, damaged walls",
    icon: LandPlot
  },
  {
    id: "cyclone",
    label: "Cyclone",
    description: "High winds, storm surge, flying debris",
    icon: Wind
  },
  {
    id: "storm",
    label: "Storm",
    description: "Lightning, heavy rain, low visibility",
    icon: RadioTower
  },
  {
    id: "building-collapse",
    label: "Collapse",
    description: "Cracks, debris, trapped people, instability",
    icon: Home
  }
];
