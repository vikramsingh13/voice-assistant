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