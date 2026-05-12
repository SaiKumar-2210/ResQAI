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

function getSpeechErrorMessage(error?: string) {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "Microphone permission was blocked. Allow microphone access in the browser and try again.";
  }

  if (error === "no-speech") {
    return "No speech was detected. Try again closer to the microphone.";
  }

  if (error === "audio-capture") {
    return "No microphone was found or it is being used by another app.";
  }

  if (error === "language-not-supported") {
    return "This browser does not support speech recognition for the selected language.";
  }

  if (error === "network") {
    return "Speech recognition needs browser speech services and network access.";
  }

  return error ? `Microphone error: ${error}` : "Microphone failed.";
}

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
      setError("Speech recognition is not supported in this browser. Try Chrome or Edge for microphone input.");
      return;
    }

    if (typeof window !== "undefined" && !window.isSecureContext) {
      setError("Microphone access requires HTTPS or localhost.");
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
      setError(getSpeechErrorMessage(event.error));
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setError(null);
    setIsListening(true);

    try {
      recognition.start();
    } catch (startError) {
      setIsListening(false);
      setError(
        startError instanceof Error
          ? `Could not start microphone: ${startError.message}`
          : "Could not start microphone."
      );
    }
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
