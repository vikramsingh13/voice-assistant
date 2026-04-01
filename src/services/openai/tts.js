import { OPENAI_BASE_URL, getOpenAIHeaders } from "./openaiClient";

export async function createSpeechAudio(text) {
  const response = await fetch(`${OPENAI_BASE_URL}/audio/speech`, {
    method: "POST",
    headers: getOpenAIHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text,
      format: "mp3",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TTS failed: ${response.status} ${errorText}`);
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}