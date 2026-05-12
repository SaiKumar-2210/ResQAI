import type { SupportedLanguage } from "@/lib/types/language";
import { generateGeminiSpeech, generateGemmaContent, getGemmaConfig } from "./gemmaClient";
import { extractTextFromGemmaResponse } from "./sanitization";

const ttsVoiceByLanguage: Record<SupportedLanguage, string> = {
  english: "Kore",
  telugu: "Kore",
  hindi: "Kore"
};

const languageLabel: Record<SupportedLanguage, string> = {
  english: "English",
  telugu: "Telugu",
  hindi: "Hindi"
};

function pcmBase64ToWavBuffer(base64Pcm: string, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
  const pcm = Buffer.from(base64Pcm, "base64");
  const header = Buffer.alloc(44);
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

export async function synthesizeSpeech(text: string, language: SupportedLanguage) {
  const cleanedText = text.replace(/\s+/g, " ").trim().slice(0, 900);
  const prompt = `Read this emergency guidance clearly in ${languageLabel[language]} with a calm, urgent tone: ${cleanedText}`;
  const response = await generateGeminiSpeech({
    text: prompt,
    voiceName: ttsVoiceByLanguage[language]
  });

  const data = (response.payload as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { data?: string };
          inline_data?: { data?: string };
        }>;
      };
    }>;
  }).candidates?.[0]?.content?.parts?.[0];

  const base64Pcm = data?.inlineData?.data ?? data?.inline_data?.data;

  if (!base64Pcm) {
    throw new Error("Gemini TTS returned no audio.");
  }

  return pcmBase64ToWavBuffer(base64Pcm);
}

export async function transcribeEmergencyAudio(input: {
  base64Audio: string;
  mimeType: string;
  language: SupportedLanguage;
}) {
  const config = getGemmaConfig();
  const response = await generateGemmaContent({
    model: config.audioModel,
    systemPrompt: "You transcribe short emergency voice notes accurately. Return only the transcript text.",
    temperature: 0,
    timeoutMs: 45_000,
    maxOutputTokens: 180,
    contents: [
      {
        role: "user",
        parts: [
          {
            inline_data: {
              mime_type: input.mimeType,
              data: input.base64Audio
            }
          },
          {
            text: `Transcribe this voice input in ${languageLabel[input.language]}. If the audio is in another language, transcribe it as heard. Return only the spoken words.`
          }
        ]
      }
    ]
  });

  const transcript = extractTextFromGemmaResponse(response.payload).trim();
  if (!transcript) throw new Error("Gemini audio transcription returned no text.");

  return {
    transcript,
    modelUsed: config.audioModel
  };
}
