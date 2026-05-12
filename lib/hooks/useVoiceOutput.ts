"use client";

import { useState } from "react";
import type { SupportedLanguage } from "@/lib/types/language";

const voiceLanguageMap: Record<SupportedLanguage, string> = {
  english: "en-US",
  telugu: "te-IN",
  hindi: "hi-IN"
};

function cleanSpeechText(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function useVoiceOutput(language: SupportedLanguage) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  function speak(text: string) {
    if (!supported || !text.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanSpeechText(text));
    utterance.lang = voiceLanguageMap[language];
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  return { supported, isSpeaking, speak, stop };
}
