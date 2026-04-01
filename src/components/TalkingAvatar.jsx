import { useEffect, useRef } from "react";
import { TalkingHead } from "@met4citizen/talkinghead/modules/talkinghead.mjs";

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
        url: "/avatars/model-type2.glb",
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
      // causing issues with react strict mode, so commenting out for now. Will need to revisit cleanup logic in the future.
      //headRef.current?.dispose?.();
      headRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "500px" }} />;
}

export default TalkingAvatar;