"use client";

import { forwardRef } from "react";

const AudioPlayer = forwardRef<HTMLAudioElement, React.ComponentProps<"audio">>(
  function AudioPlayer(props, ref) {
    return <audio ref={ref} controls className="w-full" {...props} />;
  }
);

export default AudioPlayer;