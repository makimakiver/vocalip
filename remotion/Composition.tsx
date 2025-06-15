import React, { useEffect, useState } from 'react'
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, Video } from 'remotion'

interface single_word_recording {
    word: string;
    start: number;
    end: number;
}

function MyComposition({ caption, voiceUrl }: { caption: single_word_recording[], voiceUrl: string }) {
    const [currentWord, setCurrentWord] = useState<string>('');
    const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
    const currentFrame = useCurrentFrame();
    const fps = useVideoConfig().fps;
    const getCurrentWord = () => {
        const currentWord = caption.find(word => word.start <= currentFrame / fps && word.end >= currentFrame / fps);
        if (currentWord) {
            return currentWord.word;
        }
        return '';
    }


    return (
        <AbsoluteFill style={{ 
            backgroundColor: 'black' }}>
                <AbsoluteFill style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '80px', fontSize: '24px'}}>
                    <h2 style={{ color: 'white' }}>{getCurrentWord()}</h2>
                </AbsoluteFill>
            <Audio src={voiceUrl} />
        </AbsoluteFill>
    )
}

export default MyComposition