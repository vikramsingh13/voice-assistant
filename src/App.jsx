import { useState, useRef } from 'react'
import './App.css'
import TalkingAvatar from './components/TalkingAvatar';
import AudioRecorder from './components/AudioRecorder';
import { createChatResponse } from './services/openai/chat';
import { createSpeechAudio } from './services/openai/tts';

function App() {
  // State to hold the text that the avatar will speak
  const [speakText, setSpeakText] = useState("");
  // loading state to indicate when the avatar is generating a response
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  // assistant text response we get back from the model
  const [assistantText, setAssistantText] = useState("");

  // audio url for the user's recorded microphone input
  const [recordedAudioUrl, setRecordedAudioUrl] = useState("");
  // audio url for the generated tts response from the model
  const [responseAudioUrl, setResponseAudioUrl] = useState("");

  // track audio ref for the generated tts response player
  const responseAudioRef = useRef(null);
  // track current head instance to stop it when new response is generated
  const headInstanceRef = useRef(null);
  
  // async function to generate a response from the assistant based on transcript from audio recording
  async function generateAssistantReply(userText) {
    // If no input or if model is already generating a response, do nothing
    if (!userText.trim() || isResponseLoading) return;

    // Stop any current audio playback and head animation when generating a new response
    setIsResponseLoading(true);

    // try catch block to handle the async operation of generating a model response
    try {
      const replyText = await createChatResponse(userText);
      setAssistantText(replyText);
      setSpeakText(replyText);

      if (!replyText.trim()) {
        throw new Error("Assistant reply was empty.");
      }

      const nextResponseAudioUrl = await createSpeechAudio(replyText);
      console.log("TTS object URL:", nextResponseAudioUrl);

      // stop the previous tts audio playback before swapping in the next generated audio
      if (responseAudioRef.current) {
        responseAudioRef.current.pause();
        responseAudioRef.current.currentTime = 0;
      }

      // revoke the previous tts object url before storing the next one
      setResponseAudioUrl((previousResponseAudioUrl) => {
        if (previousResponseAudioUrl) {
          URL.revokeObjectURL(previousResponseAudioUrl);
        }

        return nextResponseAudioUrl;
      });
    } catch (error) {
      console.error("Error generating response:", error);
      setAssistantText("Sorry, something went wrong.");
    } finally {
      setIsResponseLoading(false);
    }
  }

  // callback to get the current head instance from the TalkingAvatar component and store it in a ref so we can stop it when a new response is generated
  function handleHeadReady(headInstance) {
    // set the current head instance in a ref so we can stop it when a new response is generated
    headInstanceRef.current = headInstance;
  }

  // callback function to handle the transcript we get back from the AudioRecorder component
  async function handleTranscript(transcript) {
    if (!transcript.trim()) return;

    // generate a response from the assistant based on the transcript
    await generateAssistantReply(transcript);
  }

  // callback function to store the user's recorded audio separately from the returned tts audio
  function handleRecordedAudio(recordedUrl) {
    setRecordedAudioUrl((previousRecordedAudioUrl) => {
      if (previousRecordedAudioUrl) {
        URL.revokeObjectURL(previousRecordedAudioUrl);
      }

      return recordedUrl;
    });
  }

  // async function to handle playing the generated tts audio response
  async function handlePlayResponseAudio() {
    if (!responseAudioRef.current || !responseAudioUrl) return;
    responseAudioRef.current.currentTime = 0;
    await responseAudioRef.current.play();
  }

  // async function to auto play the generated tts audio once the audio element can play
  async function handleResponseAudioCanPlay() {
    if (!responseAudioRef.current) return;

    try {
      responseAudioRef.current.currentTime = 0;
      await responseAudioRef.current.play();
    } catch (error) {
      console.error("Error auto-playing response audio:", error);
    }
  }

  return (
    <main>
      <TalkingAvatar onHeadReady={handleHeadReady} />

      {/* TODO: refactor later to constantly listen for audio input and generate responses in real-time, rather than using a submit button to trigger the response generation. For now, this is easier for testing and iterating on the core functionality of generating responses based on audio input. */}
      <AudioRecorder 
        onTranscript={handleTranscript}
        onRecordedAudio={handleRecordedAudio}
        disabled={isResponseLoading}  
      />

      {/* Display the assistant's text response below the avatar */}
      <div>{assistantText}</div>

      {/* Render audio player and play button for the generated tts response */}
      {responseAudioUrl && (
        <>
          <audio
            ref={responseAudioRef}
            src={responseAudioUrl}
            controls
          />
        </>
      )}
    </main>
      
  );
}

export default App;