"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupportedLanguage } from "@/lib/types/language";

const voiceLanguageMap: Record<SupportedLanguage, string> = {
  english: "en-US",
  telugu: "te-IN",
  hindi: "hi-IN"
};

const voiceLanguagePrefixes: Record<SupportedLanguage, string[]> = {
  english: ["en"],
  telugu: ["te", "hi", "en"],
  hindi: ["hi", "en"]
};

function cleanSpeechText(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function useVoiceOutput(language: SupportedLanguage) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!supported) return;

    function loadVoices() {
      setVoices(window.speechSynthesis.getVoices());
    }

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [supported]);

  const selectedVoice = useMemo(() => {
    const preferredLang = voiceLanguageMap[language].toLowerCase();
    const exact = voices.find((voice) => voice.lang.toLowerCase() === preferredLang);
    if (exact) return exact;

    const prefixes = voiceLanguagePrefixes[language];
    return (
      prefixes
        .map((prefix) =>
          voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix.toLowerCase()))
        )
        .find(Boolean) ?? null
    );
  }, [language, voices]);

  const hasLanguageVoice = useMemo(() => {
    const targetPrefix = voiceLanguageMap[language].split("-")[0].toLowerCase();
    return voices.some((voice) => voice.lang.toLowerCase().startsWith(targetPrefix));
  }, [language, voices]);

  const speak = useCallback((text: string) => {
    if (!supported || !text.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanSpeechText(text));
    utterance.lang = voiceLanguageMap[language];
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [language, selectedVoice, supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [supported]);

  return {
    supported,
    isSpeaking,
    speak,
    stop,
    selectedVoiceName: selectedVoice?.name ?? null,
    hasLanguageVoice,
    voicesLoaded: voices.length > 0
  };
}
