"use client";

import { useRef, useState } from "react";
import Recorder from "@/components/Recorder";

export default function HomePage() {
  const [transcript, setTranscript] = useState("");
  const [responseText, setResponseText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function handleRecordingComplete(audioBlob: Blob) {
    try {
      setIsProcessing(true);
      setTranscript("");
      setResponseText("");

      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const sttResponse = await fetch("/api/stt", {
        method: "POST",
        body: formData,
      });

      const sttData = await sttResponse.json();

      if (!sttResponse.ok) {
        throw new Error(sttData.error || "STT request failed.");
      }

      setTranscript(sttData.text);

      const chatResponse = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: sttData.text,
        }),
      });

      const chatData = await chatResponse.json();

      if (!chatResponse.ok) {
        throw new Error(chatData.error || "Chat request failed.");
      }

      setResponseText(chatData.text);

      const ttsResponse = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: chatData.text,
        }),
      });

      if (!ttsResponse.ok) {
        const ttsData = await ttsResponse.json();
        throw new Error(ttsData.error || "TTS request failed.");
      }

      const audioBlobResponse = await ttsResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlobResponse);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Voice assistant error:", error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">DREA | Your Everything Assistant</h1>

      <Recorder onRecordingComplete={handleRecordingComplete} />

      {isProcessing && <p>Processing...</p>}

      <div className="rounded border p-4">
        <h2 className="mb-2 text-lg font-medium">Transcript</h2>
        <p>{transcript || "No transcript yet."}</p>
      </div>

      <div className="rounded border p-4">
        <h2 className="mb-2 text-lg font-medium">Assistant Response</h2>
        <p>{responseText || "No response yet."}</p>
      </div>

      <audio ref={audioRef} controls className="w-full" />
    </main>
  );
}