// app/components/VoiceRecorder.tsx
'use client';

import React, { useState, useRef } from 'react';

export default function VoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const recorderRef = useRef<MediaRecorder>();
  const chunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext>();
    /**
   * Convert any Blob (e.g. from MediaRecorder) into a base64 string
   */
  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reader.abort();
        reject(new Error('Problem reading blob as base64.'));
      };
      reader.onload = () => {
        // reader.result is something like "data:<mime>;base64,AAAA..."
        const dataUrl = reader.result as string;
        // strip off "data:*/*;base64," prefix to get just the raw base64
        const base64 = dataUrl.split(',', 2)[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  }

// in your startRecording()
async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate:       { ideal: 48000 },
        sampleSize:       { ideal: 16 },
        channelCount:     { ideal: 1 },
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl:  false,
      }
    });

    const mr = new MediaRecorder(stream, {
      mimeType:           'audio/webm;codecs=opus',
      audioBitsPerSecond: 128_000,
    });

    recorderRef.current = mr;
    chunksRef.current = [];

    mr.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    // emit new dataavailable every 200ms for smoother real-time streaming
    mr.start(200);
    setRecording(true);
  }

  const stopRecording = async () => {
    if (!recorderRef.current) return;
    console.log('Stopping recording');
    // stop & wait for final dataavailable
    recorderRef.current.onstop = async () => {
      // 3) build a single Blob
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const form = new FormData();
      form.append('file', blob, 'recording.webm');

      const res = await fetch('/api/recording', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: blob,
      });
      const cid = await res.json();
      console.log('CID', cid);

      // 5) decode to AudioBuffer (PCM)
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      // audioContextRef.current.decodeAudioData(
      //   buf,
      //   (decoded) => {
      //     setAudioBuffer(decoded);
      //   },
      //   (err) => {
      //     console.error('decodeAudioData error', err);
      //   }
      // );
    };
    recorderRef.current.stop();
    
    setRecording(false);
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <button
        onClick={recording ? stopRecording : startRecording}
        style={{
          padding: '0.5rem 1rem',
          background: recording ? '#e53e3e' : '#38a169',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        {recording ? 'Stop' : 'Record'}
      </button>

      {arrayBuffer && (
        <p>
          <strong>Raw ArrayBuffer length:</strong> {arrayBuffer.byteLength} bytes
        </p>
      )}
      {audioBuffer && (
        <p>
          <strong>Decoded PCM buffer:</strong> {audioBuffer.length} samples,{' '}
          {audioBuffer.numberOfChannels} channel(s)
        </p>
      )}
    </div>
  );
}
