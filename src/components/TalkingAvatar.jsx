import { useEffect, useRef } from "react";
import { TalkingHead } from "@met4citizen/talkinghead/modules/talkinghead.mjs";

// Component to render the talking avatar using the @met4citizen/talkinghead library
// props:
// - onHeadReady: TalkingHead instance
function TalkingAvatar({ onHeadReady }) {
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
      onHeadReady?.(head);

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
      // clean up TalkingHead instance and call onHeadReady with null when component unmounts
      onHeadReady?.(null);
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "500px" }} />;
}

export default TalkingAvatar;