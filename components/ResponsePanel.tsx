type ResponsePanelProps = {
  responseText: string;
};

export default function ResponsePanel({
  responseText,
}: ResponsePanelProps) {
  return (
    <div className="rounded border p-4">
      <h2 className="mb-2 text-lg font-medium">Assistant Response</h2>
      <p>{responseText || "No response yet."}</p>
    </div>
  );
}