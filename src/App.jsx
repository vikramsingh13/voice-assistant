import { useState, useRef } from 'react'
import './App.css'
import TalkingAvatar from './components/TalkingAvatar';
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
  
  // callback to get the current head instance from the TalkingAvatar component and store it in a ref so we can stop it when a new response is generated
  function handleHeadReady(headInstance) {
    // set the current head instance in a ref so we can stop it when a new response is generated
    headInstanceRef.current = headInstance;
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

  // async function to handle playing audio response
  async function handlePlayAudio() {
    if(!audioRef.current || !audioUrl) return;
    audioRef.current.currentTime = 0;
    await audioRef.current.play();
  }

  return (
    <main>
      <TalkingAvatar onHeadReady={handleHeadReady} />

      {/* Input field to type text for the avatar to respond to. 
      for now we are testing with text user input*/}
      <input
        value={typedText}
        onChange={(e) => setTypedText(e.target.value)}
        placeholder="Type something to test tts..."
      />

      <button onClick={handleChatSubmit} disabled={isSpeakTextLoading}>
        {isSpeakTextLoading ? "Generating..." : "Submit"}
      </button>

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
