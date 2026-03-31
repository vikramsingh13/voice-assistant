import { useState } from 'react'
import './App.css'
import TalkingAvatar from './components/TalkingAvatar';

function App() {
  const [speakText, setSpeakText] = useState("");

  return (
    <main>
      <TalkingAvatar speakText={speakText} />

      <button onClick={() => setSpeakText("Hello, this is Drea!")}>
        Test Avatar
      </button>
    </main>
      
  );
}

export default App
