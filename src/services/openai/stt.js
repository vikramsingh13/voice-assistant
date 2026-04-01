import { error } from "three";
import { OPENAI_BASE_URL, getOpenAIHeaders } from "./openaiClient";

// async function to send audio data to OpenAI's STT endpoint
// takes in an audio blob and returns the transcribed text
export async function transcribeAudio(audioBlob) {
    if (!audioBlob) {
        throw new Error("No audio file provided");
    }

    // store audio transcript to return
    let transcript = "";

    // create form data to send the audio file and model information
    const formData = new FormData();
    // add the audio file to the form data
    formData.append("file", audioBlob);
    // specify the model to use for transcription
    formData.append("model", "gpt-4o-mini-transcribe");

    // send the POST request to OpenAI's transcription endpoint
    const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
        method: "POST",
        headers: getOpenAIHeaders(),
        body: formData,
    });

    // check if the response is successful, if not throw an error
    if (!response.ok) {
        try {
            const errorData = await response.json();
        } catch (e) {
            // TODO: handle case where response is not JSON (e.g., network error, server error)
        }

        // throw an error with the message from the response or a generic error message
        throw new Error(`Transcription request failed: ${errorData?.error?.message || response.statusText}`);
    }

    try {

        // parse the response JSON and return the transcribed text
        const data = await response.json();
        transcript = data.text;
    } catch(e) {
        console.error("Error parsing transcription response:", e);
        // TODO: store user-friendly prompt query for failure scenarios separately.
        transcript = "Couldn't parse transcription response. Let the user know something went wrong and to try again, e.g. 'Sorry, couldn't catch that. Could you please repeat that?'";
    }

    // in this application this transcript will be used as the user query for the chatbot, so we want to return a user-friendly message in case of any errors during transcription or response parsing, rather than an empty string or raw error message.
    return transcript;
}
