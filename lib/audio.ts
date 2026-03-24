// lib/audio.ts
// utility functions for handling audio data, creating form data for STT requests, and managing audio URLs

export function createAudioFormData(audioBlob: Blob, filename = "recording.webm") {
  const formData = new FormData();
  formData.append("file", audioBlob, filename);
  return formData;
}

export function createAudioUrl(audioBlob: Blob) {
  return URL.createObjectURL(audioBlob);
}

export function revokeAudioUrl(audioUrl: string) {
  URL.revokeObjectURL(audioUrl);
}