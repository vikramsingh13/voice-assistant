import { useEffect, useRef } from "react";
import { TalkingHead } from "@met4citizen/talkinghead";

function TalkingAvatar({ speakText }) {
  const containerRef = useRef(null);
  const headRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current) return;

      const head = new TalkingHead(containerRef.current, {
        cameraView: "upper",
      });

      headRef.current = head;

      await head.showAvatar({
        url: "/avatars/model.glb",
        body: "F",
        avatarMood: "neutral",
        ttsLang: "en-US",
      });

      if (cancelled) {
        head.dispose?.();
      }
    }

    init();

    return () => {
      cancelled = true;
      headRef.current?.dispose?.();
      headRef.current = null;
    };
  }, []);

  useEffect(() => {
    async function speak() {
      if (!speakText || !headRef.current) return;
      await headRef.current.speakText(speakText);
    }

    speak();
  }, [speakText]);

  return <div ref={containerRef} style={{ width: "100%", height: "500px" }} />;
}

export default TalkingAvatar;