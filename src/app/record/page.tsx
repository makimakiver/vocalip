// app/components/VoiceRecorder.tsx
'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Mic, X } from 'lucide-react';


export default function VoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [passed, setPassed] = useState(false);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [currentCid, setCurrentCid] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const recorderRef = useRef<MediaRecorder>();
  const chunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext>();
  const router = useRouter();
  const [targetText, setTargetText] = useState<string | null>(null);
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
        sampleSize:       { ideal: 24 },
        channelCount:     { ideal: 1 },
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl:  false,
      }
    });

    const mr = new MediaRecorder(stream, {
      mimeType:           'audio/webm;codecs=opus',
      audioBitsPerSecond: 256_000,
    });

    recorderRef.current = mr;
    chunksRef.current = [];

    mr.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    setTargetText("Ladies and gentlemen, today I want to address the recent breach of Cetus Protocol, a prominent decentralized exchange on the Sui blockchain. On May 22nd, attackers exploited an integer overflow vulnerability in Cetus’s liquidity calculation, draining over two hundred million dollars from its pools in under fifteen minutes. Although the protocol team and Sui validators swiftly intervened—freezing a large portion of the stolen assets—this remains one of the largest heists in DeFi this year. The attacker leveraged a flash loan and manipulated a narrow tick range to deceive the reserve formulas, effectively siphoning liquidity intended for everyday users. In response, Cetus rapidly paused its smart contracts, offered a substantial whitehat bounty for the return of any remaining funds, and is working hand in hand with the Sui Foundation to reimburse those affected. This incident is a clarion call for our entire industry: every protocol must undergo meticulous security audits, implement rigorous overflow checks, and prepare robust emergency measures. By learning from this breach and sharing best practices, we can reinforce the foundation of decentralized finance and ensure that trust, transparency, and resilience remain its guiding principles.");
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
      console.log('CID', cid.cid);
      setCurrentCid(cid.cid);
      const res2 = await fetch('/api/humanValidation', {
        method: 'POST',
        body: JSON.stringify({ voiceCid: cid.cid, text: targetText }),
      });
      const text = await res2.json();
      console.log('Text', text.text);
      console.log('Similarity', text.similarity_score);
      if (text.similarity_score > 0.8) {
        setPassed(true);
      } else {
        setPassed(false);
      }
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
      setRecording(false);
      setShowModal(true);
    };
    recorderRef.current.stop();
    setRecording(false);
  };
  const handleSelection = (type: 'individual' | 'company') => {
    if (!currentCid) return;
    router.push(`/registration/${currentCid}/${type}`);
  };
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      {targetText && (
        <div
          style={{
            maxWidth: '600px',
            backgroundColor: '#f7fafc',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            color: '#2d3748',
            lineHeight: 1.5,
          }}
        >
          {targetText}
        </div>
      )}
      <motion.button
        onClick={recording ? stopRecording : startRecording}
        style={{
          padding: '12px 24px',
          borderRadius: '24px',
          fontWeight: 600,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          color: '#fff',
          cursor: 'pointer',
          border: 'none',
          outline: 'none',
          backgroundColor: recording ? '#e53e3e' : '#38a169'
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {recording ? 'Stop Recording' : 'Start Recording'}
      </motion.button>

      <AnimatePresence>
        {showModal && passed && (
          <motion.div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                width: '90%',
                maxWidth: '400px',
                backgroundColor: '#fff',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <h2 style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#2d3748',
                marginBottom: '16px'
              }}>
                <User style={{ marginRight: '8px' }} size={24} />
                Select Registration Type
              </h2>
              <p style={{
                color: '#4a5568',
                marginBottom: '24px'
              }}>
                Your recording is saved! Choose how you'd like to register:
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <motion.button
                  onClick={() => handleSelection('individual')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    backgroundColor: '#3182ce'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <User style={{ marginRight: '8px' }} size={20} /> Individual
                </motion.button>

                <motion.button
                  onClick={() => handleSelection('company')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    backgroundColor: '#2f855a'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Building2 style={{ marginRight: '8px' }} size={20} /> Company
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showModal && !passed && (
          <motion.div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                width: '90%',
                maxWidth: '400px',
                backgroundColor: '#fff',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <h2 style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#2d3748',
                marginBottom: '16px'
              }}>
                <User style={{ marginRight: '8px' }} size={24} />
                Invalid Recording
              </h2>
              <p style={{
                color: '#4a5568',
                marginBottom: '24px'
              }}>
                Invalid recording. Please try again.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <motion.button
                  onClick={() => router.push('/')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    backgroundColor: '#e53e3e'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <X style={{ marginRight: '8px' }} size={20} /> cancel
                </motion.button>

                <motion.button
                  onClick={() => {
                    setShowModal(false);
                    startRecording();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    backgroundColor: '#2f855a'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Mic style={{ marginRight: '8px' }} size={20} /> Try Again
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}