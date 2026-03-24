type TranscriptPanelProps = {
  transcript: string;
};

export default function TranscriptPanel({
  transcript,
}: TranscriptPanelProps) {
  return (
    <div className="rounded border p-4">
      <h2 className="mb-2 text-lg font-medium">Transcript</h2>
      <p>{transcript || "No transcript yet."}</p>
    </div>
  );
}