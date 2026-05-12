"use client";

import { useRef, useState } from "react";
import type { SupportedLanguage } from "@/lib/types/language";

type SpeechResult = {
  transcript: string;
  isFinal: boolean;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    [index: number]: { transcript: string };
  }>;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const speechLanguageMap: Record<SupportedLanguage, string> = {
  english: "en-US",
  telugu: "te-IN",
  hindi: "hi-IN"
};

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") return null;
  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition(language: SupportedLanguage) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const supported = Boolean(getSpeechRecognitionConstructor());

  function startListening(onFinalTranscript?: (value: string) => void) {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = speechLanguageMap[language];
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) finalText += text;
        else interimText += text;
      }

      const nextTranscript = (finalText || interimText).trim();
      setTranscript(nextTranscript);

      if (finalText.trim()) {
        onFinalTranscript?.(finalText.trim());
      }
    };

    recognition.onerror = (event) => {
      setError(event.error ? `Microphone error: ${event.error}` : "Microphone failed.");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setError(null);
    setIsListening(true);
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  return {
    supported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    setTranscript
  };
}
