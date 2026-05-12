"use client";

import { useRef, useState } from "react";
import type { SupportedLanguage } from "@/lib/types/language";
import { parseApiError } from "@/lib/utils/api";

function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

export function useGeminiVoiceInput(language: SupportedLanguage) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supported =
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined";

  async function transcribeBlob(blob: Blob) {
    setIsTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "voice-input.webm");
      formData.append("language", language);

      const response = await fetch("/api/ai/transcribe", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error(await parseApiError(response));

      const payload = (await response.json()) as { transcript: string };
      return payload.transcript;
    } finally {
      setIsTranscribing(false);
    }
  }

  async function startRecording() {
    if (!supported) {
      setError("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorderRef.current = recorder;
      streamRef.current = stream;
      setError(null);
      setIsRecording(true);
      recorder.start();
    } catch (recordError) {
      setError(
        recordError instanceof Error
          ? `Could not access microphone: ${recordError.message}`
          : "Could not access microphone."
      );
    }
  }

  async function stopAndTranscribe() {
    const recorder = recorderRef.current;
    if (!recorder) return "";

    return new Promise<string>((resolve) => {
      recorder.onstop = async () => {
        setIsRecording(false);
        streamRef.current?.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });

        try {
          const transcript = await transcribeBlob(blob);
          resolve(transcript);
        } catch (transcribeError) {
          setError(
            transcribeError instanceof Error
              ? transcribeError.message
              : "Could not transcribe microphone audio."
          );
          resolve("");
        }
      };

      recorder.stop();
    });
  }

  return {
    supported,
    isRecording,
    isTranscribing,
    error,
    startRecording,
    stopAndTranscribe
  };
}
