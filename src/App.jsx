import { useState, useRef } from 'react'
import './App.css'
import TalkingAvatar from './components/TalkingAvatar';
import AudioRecorder from './components/AudioRecorder';
import { createChatResponse } from './services/openai/chat';
import { createSpeechAudio } from './services/openai/tts';

function App() {
  // State to hold the text that the avatar will speak
  const [speakText, setSpeakText] = useState("");
  // Typed text state for the input field
  const [typedText, setTypedText] = useState("");
  // loading state to indicate when the avatar is generating a response
  const [isSpeakTextLoading, setIsSpeakTextLoading] = useState(false);
  // assistant text response we get back from the model
  const [assistantText, setAssistantText] = useState("");
  // audio url state for the generated speech audio
  const [audioUrl, setAudioUrl] = useState("");

  // track audio ref to stop previous audio when new response is generated
  const audioRef = useRef(null);
  // track current head instance to stop it when new response is generated
  const headInstanceRef = useRef(null);
  
  // async function to generate a response from the assistant based on user text input or transcript from audio recording
  async function generateAssistantReply(userText) {
    // If no input or if model is already generating a response, do nothing
    if (!userText.trim() || isSpeakTextLoading) return;

    // Stop any current audio playback and head animation when generating a new response
    setIsSpeakTextLoading(true);

    // try catch block to handle the async operation of generating a model response
    try {
      const replyText = await createChatResponse(userText);
      setAssistantText(replyText);
      setSpeakText(replyText);

      if (!replyText.trim()) {
        throw new Error("Assistant reply was empty.");
      }

      const nextAudioUrl = await createSpeechAudio(replyText);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(nextAudioUrl);
    } catch (error) {
      console.error("Error generating response:", error);
      setAssistantText("Sorry, something went wrong.");
    } finally {
      setIsSpeakTextLoading(false);
    }
  }

  // async function to handle the form submission and generate a response from the avatar
  async function handleChatSubmit() {
    // If no input or if model is already generating a response, do nothing
    if (!typedText.trim() || isSpeakTextLoading) return;

    // Set loading state to true while generating response
    setIsSpeakTextLoading(true);


    // try catch block to handle the async operation of generating a model response
    try {
      const replyText = await createChatResponse(typedText);
      setAssistantText(replyText);
      setSpeakText(replyText);

      if (!replyText.trim()) {
        throw new Error("Assistant reply was empty.");
      }

      const nextAudioUrl = await createSpeechAudio(replyText);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(nextAudioUrl);
    } catch (error) {
      console.error("Error generating response:", error);
      setAssistantText("Sorry, something went wrong.");
    } finally {
      setIsSpeakTextLoading(false);
    }
  }

  // callback to get the current head instance from the TalkingAvatar component and store it in a ref so we can stop it when a new response is generated
  function handleHeadReady(headInstance) {
    // set the current head instance in a ref so we can stop it when a new response is generated
    headInstanceRef.current = headInstance;
  }

  // callback function to handle the transcript we get back from the AudioRecorder component
  async function handleTranscript(transcript) {
    setTypedText(transcript);

    if (!transcript.trim()) return;

    // generate a response from the assistant based on the transcript
    await generateAssistantReply(transcript);
  }

  // async function to handle playing audio response
  async function handlePlayAudio() {
    if(!audioRef.current || !audioUrl) return;
    audioRef.current.currentTime = 0;
    await audioRef.current.play();
  }

  // useEffect to stop any current audio playback or head animation when a new response is being generated
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <main>
      <TalkingAvatar onHeadReady={handleHeadReady} />

      {/* TODO: refactor later to constantly listen for audio input and generate responses in real-time, rather than using a submit button to trigger the response generation. For now, this is easier for testing and iterating on the core functionality of generating responses based on audio input. */}
      <AudioRecorder 
        onTranscript={handleTranscript}
        disabled={isSpeakTextLoading}  
      />

      {/* Display the assistant's text response below the avatar */}
      <div>{assistantText}</div>

      {/* Render audio player and play button if audioUrl is available */}
      {audioUrl && (
        <>
          <audio ref={audioRef} src={audioUrl} controls />
          <button onClick={handlePlayAudio} disabled={!audioUrl}>
            Play Response
          </button>
        </>
      )}
    </main>
      
  );
}

export default App;
