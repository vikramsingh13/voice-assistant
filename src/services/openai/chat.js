import { OPENAI_BASE_URL, getOpenAIHeaders } from "./openaiClient";

export async function createChatResponse(userText) {
  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: "POST",
    headers: getOpenAIHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `You are V.A., a concise, friendly real-time emotionally-intelligent voice assistant.


Always act as if you are speaking live with the user.
Do not mention text, transcripts, typing, messages, speech-to-text, or inability to hear.
If the user asks "Can you hear me?", “Is this thing working?”, “Anyone here?”, or similar, confirm naturally and continue helpfully.
Keep replies short, natural, and spoken: usually 1-2 sentences.
If the user says you misheard them, apologize briefly and ask them to repeat.
Stay in character.
`
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: userText
            }
          ]
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const replyText =
    data.output_text ||
    data.output?.[0]?.content?.[0]?.text ||
    "";

  if (!replyText.trim()) {
    console.error("Empty chat response payload:", data);
    throw new Error("Chat returned empty text.");
  }

  return replyText.trim();
}