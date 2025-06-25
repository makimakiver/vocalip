import React from "react";
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig } from "remotion";

interface single_word_recording {
  word: string;
  start: number;
  end: number;
}

function RemotionVideo({
  caption,
  voiceUrl,
}: {
  caption: single_word_recording[];
  voiceUrl: string;
}) {
  const currentFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = currentFrame / fps;

  const getCurrentWord = () => {
    const currentWord = caption.find(
      (word) => currentTime >= word.start && currentTime <= word.end
    );
    return currentWord ? currentWord.word : "";
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        }}
      >
        <h2
          style={{
            color: "white",
            fontSize: "48px",
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Arial, sans-serif",
            textShadow: "0 0 20px rgba(255, 255, 255, 0.5)",
          }}
        >
          {getCurrentWord()}
        </h2>
      </AbsoluteFill>
      <Audio src={voiceUrl} />
    </AbsoluteFill>
  );
}

export default RemotionVideo;
