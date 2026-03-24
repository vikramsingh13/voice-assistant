"use client";

import { useRef, useState } from "react";
// import the components we created for recording, audio playback, and displaying transcript/response
import Recorder from "@/components/Recorder";
import AudioPlayer from "@/components/AudioPlayer";
import TranscriptPanel from "@/components/TranscriptPanel";
import ResponsePanel from "@/components/ResponsePanel";

// import audio helpers
import { createAudioFormData, createAudioUrl, revokeAudioUrl } from "@/lib/audio";

// import types for better type safety
import { ChatResponse, SttResponse } from "@/lib/types";


export default function HomePage() {
  const [transcript, setTranscript] = useState("");
  const [responseText, setResponseText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // keep track of the current audio URL to revoke it later and avoid memory leaks
  const currentAudioUrlRef = useRef<string | null>(null);

  async function handleRecordingComplete(audioBlob: Blob) {
    try {
      setIsProcessing(true);
      setTranscript("");
      setResponseText("");

      // create form data for the STT request
      const formData = createAudioFormData(audioBlob);

      const sttResponse = await fetch("/api/stt", {
        method: "POST",
        body: formData,
      });

      const sttData = (await sttResponse.json()) as SttResponse;

      if (!sttResponse.ok || !sttData.text) {
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

      if (!chatResponse.ok || !chatData.text) {
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
        const ttsData = (await ttsResponse.json()) as { error?: string };
        throw new Error(ttsData.error || "TTS request failed.");
      }

      const ttsAudioBlob = await ttsResponse.blob();

      // revoke the previous audio URL if it exists to avoid memory leaks
      if (currentAudioUrlRef.current) {
        revokeAudioUrl(currentAudioUrlRef.current);
      }

      // create a new audio URL for the TTS response
      const audioUrl = createAudioUrl(ttsAudioBlob);
      currentAudioUrlRef.current = audioUrl;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Voice assistant error:", error);
      // generic error message for the client, detailed error logged on the server
      setResponseText(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">DREA | Your Everything Assistant</h1>

      <Recorder onRecordingComplete={handleRecordingComplete} />

      {isProcessing && <p>Processing...</p>}

      <TranscriptPanel transcript={transcript} />
      <ResponsePanel responseText={responseText} />

      <AudioPlayer ref={audioRef} />
    </main>
  );
}