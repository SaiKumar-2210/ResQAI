import type { DisasterType } from "./disaster";
import type { SupportedLanguage } from "./language";

export interface DemoScenario {
  id: string;
  title: string;
  disasterType: DisasterType;
  prompt: string;
  language: SupportedLanguage;
  imagePath?: string;
}
