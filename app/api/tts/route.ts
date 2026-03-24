import { openai } from "@/lib/openai";

type TtsRequestBody = {
  text?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TtsRequestBody;
    const text = body.text?.trim();

    if (!text) {
      return Response.json(
        { error: "Text is required." },
        { status: 400 }
      );
    }

    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text,
      response_format: "mp3",
    });

    const audioBuffer = Buffer.from(await speech.arrayBuffer());

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="speech.mp3"',
      },
    });
  } catch (error) {
    console.error("TTS error:", error);

    // generic error message for the client, detailed error logged on the server
    const errorMessage = "Failed to generate speech.";

    // TODO: in production, avoid returning detailed error messages that may contain sensitive info
    // log the detailed error on the server and return a generic message to the client
    console.error("Failed to generate speech:", error instanceof Error ? error.message : error);

    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}