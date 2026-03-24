import { openai } from "@/lib/openai";
// import chat system prompts
import { systemPromptChat } from "@/lib/prompts/systemPrompts";

type ChatRequestBody = {
    message?: string;
};

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as ChatRequestBody;
        const message = body.message?.trim();

        if (!message) {
            return Response.json(
                { error: "Message is required."},
                { status: 400 }
            );
        }

        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: [
                {
                    role: "system",
                    content: systemPromptChat["twoShotHelpfulAssistant"]
                },
                {
                    role: "user",
                    content: message
                },
            ],
        });

        // TODO: return the system prompt name and version for logs and future debugging and analytics
        return Response.json({
            text: response.output_text,
        });
    } catch (error) {
        console.error("chat route POST Chat error:", error);

        // generic error message for the client, detailed error logged on the server
        const errorMessage = "Failed to generate response.";
        
        // TODO: in production, avoid returning detailed error messages that may contain sensitive info
        // log the detailed error on the server and return a generic message to the client
        console.error("Failed to generate response:", error instanceof Error ? error.message : error);

        return Response.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}