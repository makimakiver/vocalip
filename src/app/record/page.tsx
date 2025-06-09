// app/components/VoiceRecorder.tsx
'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, UploadCloud, X, CheckCircle, AlertCircle, Mic as Microphone, Play, StopCircle, ArrowLeft } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import SelectDemo from '../components/Select';

export default function VoiceRecorder() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [recordingTime, setRecordingTime] = useState(0)
  const [recording, setRecording] = useState(false);
  const [passed, setPassed] = useState(false);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [armed, setArmed] = useState(false);
  const [currentCid, setCurrentCid] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const recorderRef = useRef<MediaRecorder>();
  const chunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext>();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isDragging, setDragging] = useState(false);
  const [onFiles, setOnFiles] = useState<File[] | null>(null);
    /**
   * Convert any Blob (e.g. from MediaRecorder) into a base64 string
   */
  const triggerFileSelect = () => fileInputRef.current?.click()
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setOnFiles(file)
      setVoiceURL(URL.createObjectURL(file))
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

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
    // emit new dataavailable every 200ms for smoother real-time streaming
    mr.start(200);
    setRecording(true);
    // reset & start counting
    setRecordingTime(0)
    timerRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1)
    }, 1000)
  }

  const stopRecording = async () => {
    // stop your MediaRecorder…
    console.log('Timer', timerRef.current);
    const timer: number = timerRef.current as unknown as number;
    if (timer && timer < 30000) {
      console.log('Timer is less than 30 seconds');
      setRecording(false);
      setPassed(false);
      setShowModal(true);
      return;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
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

      // const res2 = await fetch('/api/humanValidation', {
      //   method: 'POST',
      //   body: JSON.stringify({ voiceCid: cid.cid }),
      // });
      // const text = await res2.json();
      // console.log('Text', text.text);
      // console.log('Similarity', text.similarity_score);
      // if (text.similarity_score > 0.8) {
      //   setPassed(true);
      // } else {
      //   setPassed(false);
      // }
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
    <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
    }}
  >
    {/* Header */}
    <div style={{ height: '100px', display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '8vh'}}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, color: '#2d3748', marginBottom: '16px' }}>
          Instant Voice Clone
        </h2>
      </div>
    </div>
    {/* Instruction Panel */}
    <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <AlertCircle style={{ color: '#4a5568', marginTop: '4px' }} />
        <div>
          <h4 style={{ margin: 0, fontWeight: 500, color: '#2d3748' }}>
            Avoid noisy environments
          </h4>
          <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '0.875rem' }}>
            Background sounds interfere with recording quality.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <CheckCircle style={{ color: '#4a5568', marginTop: '4px' }} />
        <div>
          <h4 style={{ margin: 0, fontWeight: 500, color: '#2d3748' }}>
            Check microphone quality
          </h4>
          <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '0.875rem' }}>
            Use external or headphone mics for better capture.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <Microphone style={{ color: '#4a5568', marginTop: '4px' }} />
        <div>
          <h4 style={{ margin: 0, fontWeight: 500, color: '#2d3748' }}>
            Use consistent equipment
          </h4>
          <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '0.875rem' }}>
            Don’t change equipment between samples.
          </p>
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '32px', marginBottom: '24px', justifyContent: 'center', width: '100%', marginLeft: '40vw'}}>
      <SelectDemo />
    </div>
    {/* Upload / Record Section */}
    <div
      onClick={() => {
        if (armed) {
          return;
        }
        triggerFileSelect();
      }}
      style={{
        border: '2px dashed #cbd5e0',
        borderRadius: '12px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: '#fff',
        marginBottom: '16px',
        minWidth: '600px',
        height: '200px',
        position: 'relative',
      }}
    >
      { !armed ? (
        <>
          <UploadCloud size={48} style={{ color: '#a0aec0', marginBottom: '12px' }} />
          <p style={{ margin: 0, color: '#4a5568' }}>
            Click to upload, or drag and drop
          </p>
          <p style={{ margin: '4px 0 16px', color: '#a0aec0', fontSize: '0.875rem' }}>
            Audio or video, up to 10MB each
          </p>
          <span style={{ color: '#a0aec0', fontSize: '0.875rem', marginBottom: '16px' }}>
            or
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />  
        </>
      ) : !recording ? (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <ArrowLeft size={24} style={{ color: '#a0aec0', marginBottom: '12px', cursor: 'pointer' }} onClick={() => setArmed(false)} />
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2d3748', marginBottom: '16px' }}>Uploading files?</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2d3748', marginBottom: '16px' }}>Recording...</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2d3748', marginBottom: '16px' }}>{recordingTime} seconds</div>
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!armed) {
            setArmed(true);
            return;
          }
          if (recording) {
            stopRecording();
          } else {
            startRecording();
          }
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '10px 20px',
          backgroundColor: recording ? '#e53e3e' : '#38a169',
          color: '#fff',
          borderRadius: '24px',
          border: 'none',
          cursor: 'pointer',
          outline: 'none',
          fontWeight: 600,
          marginTop: 'auto',
        }}
      >
      { !armed
        ? <>
            Record audio
            <Microphone style={{ marginLeft: '8px' }} />
          </>
        : recording
        ? <>
          <StopCircle size={24} style={{ marginLeft: '8px' }} />
        </>
        : <>
          <Play size={24} style={{ marginLeft: '8px' }} />
          </>
      }
      </button>
    </div>

    {/* Footer Controls */}
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
      <input type="checkbox" id="tenSec" style={{ marginRight: '8px' }} />
      <label htmlFor="tenSec" style={{ color: '#4a5568', fontSize: '0.875rem' }}>
        10 seconds of audio required
      </label>
    </div>
    <button
      disabled
      style={{
        width: '120px',
        padding: '12px',
        backgroundColor: '#cbd5e0',
        color: '#718096',
        borderRadius: '24px',
        fontWeight: 600,
        border: 'none',
        cursor: 'not-allowed',
      }}
    >
      Next
    </button>

    {/* <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #e2e8f0, #f9fafb)',
        padding: '24px',
      }}
    > */}

    {/* Modal */}
    <AnimatePresence>
      {showModal && (
        <motion.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
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
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              textAlign: 'center',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div style={{ marginBottom: '16px' }}>
              <X
                onClick={() => setShowModal(false)}
                size={24}
                style={{ cursor: 'pointer', color: '#a0aec0', position: 'absolute', top: '16px', right: '16px' }}
              />
              {passed ? (
                <CheckCircle size={48} style={{ color: '#38a169' }} />
              ) : (
                <AlertCircle size={48} style={{ color: '#e53e3e' }} />
              )}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2d3748', marginBottom: '12px' }}>
              {passed ? 'Select Registration Type' : 'Invalid Recording'}
            </h2>
            <p style={{ color: '#4a5568', marginBottom: '24px' }}>
              {passed
                ? "Your recording is saved! Choose how you'd like to register:"  
                : 'Invalid recording. Please try again.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {passed ? (
                <>  
                  <motion.button
                    onClick={() => handleSelection('individual')}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      border: 'none',
                      outline: 'none',
                      color: '#fff',
                      backgroundColor: '#3182ce',
                    }}
                  >
                    <Microphone style={{ marginRight: '8px' }} /> Individual
                  </motion.button>

                  <motion.button
                    onClick={() => handleSelection('company')}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      border: 'none',
                      outline: 'none',
                      color: '#fff',
                      backgroundColor: '#2f855a',
                    }}
                  >
                    <Microphone style={{ marginRight: '8px' }} /> Company
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={() => {
                    setShowModal(false);
                    startRecording();
                  }}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    backgroundColor: '#2f855a',
                  }}
                >
                  Try Again
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  );
}