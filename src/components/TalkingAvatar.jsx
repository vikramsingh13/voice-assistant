import { useEffect, useRef } from "react";
import { TalkingHead } from "@met4citizen/talkinghead/modules/talkinghead.mjs";
import { HeadAudio } from "@met4citizen/headaudio/modules/headaudio.mjs";

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

      // create a new TalkingHead instance and attach it to the container element
      const head = new TalkingHead(containerRef.current, {
        cameraView: "upper",
      });

      // add the head audio worklet module to the audio context of the TalkingHead instance
      await head.audioCtx.audioWorklet.addModule("headaudio/modules/headworklet.mjs");

      // create a new HeadAudioNode instance and connect it to the audio context of the TalkingHead instance
      const headaudio = new HeadAudio(head.audioCtx, {
        processorOptions: { },
        parameterData: {
          vadGateActiveDb: -40,
          vadGateInactiveDb: -60
        }
      });

      // load a pretrained model for the TalkingHead instance
      // pretrained model came with the HeadAudio library and is designed to work with the HeadAudioNode processor
      await headaudio.loadModel("headaudio/dist/model-en-mixed.bin");

      // connect TalkingHead's speech gain node to HeadAudio node
      head.audioSpeechGainNode.connect(headaudio);

      // Add some delay between gain and reverb nodes
      const delayNode = new DelayNode( head.audioCtx, { delayTime: 0.1 });
      head.audioSpeechGainNode.disconnect(head.audioReverbNode);
      head.audioSpeechGainNode.connect(delayNode);
      delayNode.connect(head.audioReverbNode);

      // Register callback function to set blend shape values
      headaudio.onvalue = (key,value) => {
        Object.assign( head.mtAvatar[ key ],{ newvalue: value, needsUpdate: true });
      };

      // Link node's `update` method to TalkingHead's animation loop
      head.opt.update = headaudio.update.bind(headaudio);

      // update current TalkingHead ref
      headRef.current = head;
      onHeadReady?.(head);

      await head.showAvatar({
        url: "/avatars/model-type2.glb",
        body: "F",
        avatarMood: "neutral",
        ttsLang: "en-US",
        lipsyncLang: 'en',
        baseline: {
          // Adjust Avaturn head angle and eye lids
          headRotateX: -0.05,
          eyeBlinkLeft: 0.15,
          eyeBlinkRight: 0.15
        }
      });

      // Take eye contact and make a hand gesture when new sentence starts
      let lastEnded = 0;
      headaudio.onended = () => {
        lastEnded = Date.now();
      };

      headaudio.onstarted = () => {
        const duration = Date.now() - lastEnded;
        if ( duration > 150 ) { 
          // New sentence, if 100 ms pause (adjust as needed)
          head.lookAtCamera(500);
          head.speakWithHands();
        }
      };

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