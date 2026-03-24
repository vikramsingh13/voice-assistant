import { openai } from "@/lib/openai";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return Response.json(
                { error: "Audio file is required." },
                { status: 400 }
            );
        }

        const transcription = await openai.audio.transcriptions.create({
            file,
            model: "gpt-4o-mini-transcribe"
        });

        return Response.json({
            text: transcription.text,
        });
    } catch (error) {
        console.error("STT error:", error);

        // check if error is an OpenAI API error with a message
        // otherwise return a generic error message
        const errorMessage = "Failed to transcribe audio.";
        // TODO: in production, avoid returning detailed error messages that may contain sensitive info
        // log the detailed error on the server and return a generic message to the client
        console.error("Failed to transcribe audio:", error instanceof Error ? error.message : error);

        return Response.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}