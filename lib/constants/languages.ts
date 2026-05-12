import type { SupportedLanguage } from "@/lib/types/language";

export const supportedLanguages: Array<{
  value: SupportedLanguage;
  label: string;
  nativeLabel: string;
}> = [
  { value: "english", label: "English", nativeLabel: "English" },
  { value: "telugu", label: "Telugu", nativeLabel: "తెలుగు" },
  { value: "hindi", label: "Hindi", nativeLabel: "हिन्दी" }
];
