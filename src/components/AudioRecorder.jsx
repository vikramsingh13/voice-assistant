import { useRef, useState } from "react";
import { transcribeAudio } from "../services/openai/stt";

export default function AudioRecorder({ onTranscript, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordedChunksRef = useRef([]);

  async function handleStartRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          setIsTranscribing(true);

          const audioBlob = new Blob(recordedChunksRef.current, {
            type: mediaRecorder.mimeType || "audio/webm",
          });

          const audioFile = new File([audioBlob], "recording.webm", {
            type: audioBlob.type,
          });

          const result = await transcribeAudio(audioFile);
          const transcript = typeof result === "string" ? result : result?.text || "";

          console.log("STT result:", result);
          console.log("Transcript text:", transcript);

          if (!transcript.trim()) {
            console.warn("Transcript was empty.");
            return;
          }

          await onTranscript?.(transcript);
        } catch (error) {
          console.error("Error during recording/transcription pipeline:", error);
        } finally {
          setIsTranscribing(false);
          mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }

  function handleStopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  return (
    <>
      {!isRecording ? (
        <button onClick={handleStartRecording} disabled={disabled || isTranscribing}>
          Record
        </button>
      ) : (
        <button onClick={handleStopRecording}>Stop Recording</button>
      )}

      {isTranscribing && <div>Transcribing...</div>}
    </>
  );
}