"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const speakWithGemini = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      audioRef.current?.pause();
      if (audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src);

      const response = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanSpeechText(text), language })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Gemini voice output failed.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        setIsSpeaking(false);
        setError("Could not play generated audio.");
      };

      setIsSpeaking(true);
      await audio.play();
    } catch (speechError) {
      setIsSpeaking(false);
      setError(speechError instanceof Error ? speechError.message : "Gemini voice output failed.");
    } finally {
      setIsGenerating(false);
    }
  }, [language]);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    if (language !== "english" && !hasLanguageVoice) {
      await speakWithGemini(text);
      return;
    }

    if (!supported) {
      await speakWithGemini(text);
      return;
    }

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
  }, [hasLanguageVoice, language, selectedVoice, speakWithGemini, supported]);

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    audioRef.current?.pause();
    setIsSpeaking(false);
  }, [supported]);

  return {
    supported,
    isSpeaking,
    isGenerating,
    speak,
    speakWithGemini,
    stop,
    error,
    selectedVoiceName: selectedVoice?.name ?? null,
    hasLanguageVoice,
    voicesLoaded: voices.length > 0
  };
}
