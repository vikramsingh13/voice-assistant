import { useState } from 'react'
import './App.css'
import TalkingAvatar from './components/TalkingAvatar';

function App() {
  // State to hold the text that the avatar will speak
  const [speakText, setSpeakText] = useState("");
  // Typed text state for the input field
  const [typedText, setTypedText] = useState("");
  // loading state to indicate when the avatar is generating a response
  const [isSpeakTextLoading, setIsSpeakTextLoading] = useState(false);

  // async function to handle the form submission and generate a response from the avatar
  async function handleChatSubmit(e) {
    e.preventDefault();

    // If no input or if model is already generating a response, do nothing
    if (!typedText.trim() || isSpeakTextLoading) return;

    // Set loading state to true while generating response
    setIsSpeakTextLoading(true);

    // try catch block to handle the async operation of generating a model response
    try {
      // Call the mockChat function to get a response based on the typed text from the user
      const data = await mockChat(typedText);
      setSpeakText(data.reply);
    } catch (error) {
      console.error("Error generating response:", error);
      setSpeakText("Sorry, something went wrong.");
    } finally {
      setIsSpeakTextLoading(false);
    }
  }

  return (
    <main>
      <TalkingAvatar speakText={speakText} />

      <input
        value={typedText}
        onChange={(e) => setTypedText(e.target.value)}
        placeholder="Type something to test avatar..."
      />



      <button onClick={handleChatSubmit} disabled={isSpeakTextLoading}>
        {isSpeakTextLoading ? "Generating..." : "Submit"}
      </button>
    </main>
      
  );
}

export default App;
