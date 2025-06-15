'use client';
import React, { useEffect, useState } from 'react';
import { Player } from '@remotion/player';
import RemotionVideo from '../components/RemotionVideo';
import { ethers } from 'ethers';
import storyContractAbi from '../../../StoryContractABI.json';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import VoiceSelection from '../components/VoiceSelection';

interface single_word_recording {
  word: string;
  start: number;
  end: number;
}

function VideoPage() {
    const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
    const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
    const [captionInput, setCaptionInput] = useState<string>('');
    const [caption, setCaption] = useState<single_word_recording[]>([]);
    const [durationFrames, setDurationFrames] = useState<number>(0);
    const [voiceUrl, setVoiceUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [voices, setVoices] = useState<any[]>([]);
    const contractAddress = "0x57A220322E44B7b42125d02385CC04816eDB5ec7"
    const STORY_RPC_URL = 'https://aeneid.storyrpc.io'
    const readProvider = new ethers.JsonRpcProvider(STORY_RPC_URL)
    const storyContract = new ethers.Contract(contractAddress, storyContractAbi, readProvider)
    const { address, isConnected } = useAccount();
    useEffect(() => {
        fetchVoices();
    }, []);
    
    
    const fetchVoices = async () => {
        try {
            // Get length of dynamic array 'assets' from storage slot 0
            const rawLen = await readProvider.getStorage(contractAddress, 0)
            
            const assetCount = Number(rawLen)
            if (!assetCount) {
                setVoices([])
                return
            }
            const promises: any[] = []
            for (let i = 0; i < assetCount; i++) {
                if (i != 0) {
                    const asset = await storyContract.assets(i)
                    console.log("asset", asset);
                    const assetId = asset[0].toString()
                    const creator = asset[1].toString()
                    promises.push([assetId, creator])
                }
            }
            setVoices(promises)
        } catch (error) {
            let errorMsg = "Error fetching voices: ";
            if (error && typeof error === "object" && "message" in error) {
            errorMsg += (error as { message: string }).message;
            } else {
            errorMsg += String(error);
            }
            console.log("errorMsg", errorMsg);
            setVoices([])
        }
    }
    useEffect(() => {
        console.log("selectedVoice", selectedVoice);
    }, [selectedVoice]);
    const generateVideo = async () => {
        if (!selectedVoice) {
            setShowVoiceModal(true);
            return;
        }
        if (!captionInput.trim()) {
        alert('Please enter a caption');
        return;
        }
        setIsLoading(true);
        setMessage('');
        try {
        const response = await fetch('/api/voice_upload', {
            method: 'POST',
            body: JSON.stringify({ caption: captionInput }),
        });
        const caption_data = await response.json();

        setDurationFrames(
            Number((caption_data.single_word_recordings.at(-1).end * 30).toFixed(0))
        );
        setCaption(caption_data.single_word_recordings);
        setVoiceUrl(caption_data.link);
        } catch (err) {
        setMessage('❌ Failed to generate video.');
        } finally {
        setIsLoading(false);
        }
    };

    const exportVideo = async () => {
        setIsExporting(true);
        setMessage('');
        try {
        const response = await fetch('/api/video_upload', {
            method: 'POST',
            body: JSON.stringify({ caption, voiceUrl }),
        });
        const video_data = await response.json();
        setMessage('✅ Video exported successfully!');
        console.log(video_data);
        } catch (err) {
        setMessage('❌ Export failed.');
        } finally {
        setIsExporting(false);
        }
    };
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
    {/* LEFT HALF */}
    <div style={{
      flex: 1,
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem',
      boxSizing: 'border-box',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>🎥 Reel Video Generator</h1>

      <label style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Caption Text</label>
      <textarea
        rows={10}
        placeholder="Type a caption..."
        value={captionInput}
        onChange={(e) => setCaptionInput(e.target.value)}
        style={{
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid #2d3748',
          marginBottom: '1rem',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />

      <button
        onClick={generateVideo}
        disabled={isLoading}
        style={{
          padding: '0.75rem',
          borderRadius: '8px',
          backgroundColor: isLoading ? '#4a5568' : '#3182ce',
          color: '#fff',
          border: 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          marginBottom: '1rem',
        }}
      >
        {isLoading ? 'Generating...' : 'Select Voice'}
      </button>

      {caption.length > 0 && (
        <button
          onClick={exportVideo}
          disabled={isExporting}
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            backgroundColor: isExporting ? '#4a5568' : '#38a169',
            color: '#fff',
            border: 'none',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          {isExporting ? 'Exporting...' : 'Export Video'}
        </button>
      )}

      {message && (
        <p style={{
          marginTop: 'auto',
          color: message.startsWith('❌') ? '#e53e3e' : '#9ae6b4',
          fontWeight: 600,
        }}>
          {message}
        </p>
      )}
    </div>

    {/* RIGHT HALF */}
    <div style={{
      flex: 1,
      background: '#edf2f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      boxSizing: 'border-box',
    }}>
      {caption.length > 0 ? (
        <Player
          component={RemotionVideo}
          durationInFrames={durationFrames}
          compositionWidth={300}
          compositionHeight={450}
          fps={30}
          inputProps={{ caption, voiceUrl }}
          controls
        />
      ) : (
        <p style={{
          color: '#718096',
          width: '300px',
          height: '450px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          No video generated yet
        </p>
      )}
    </div>

    {/* 3) AnimatePresence Voice-Model Modal */}
    <AnimatePresence>
      {showVoiceModal && (
        <motion.div
          key="voice-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '2rem',
              width: '60vw',
              maxWidth: '600px',
              boxSizing: 'border-box',
              overflowY: 'auto',
              maxHeight: '80vh',
              marginTop: '2rem'
            }}
          >
            <h1 style={{ marginTop: '1rem', fontSize: '2rem', color: 'black', textAlign: 'center' }}>Select Voice Model</h1>
            {voices.map((voice) => (
              <div
                key={voice}
                onClick={() => console.log(voice)}
                style={{
                  display: 'flex',
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  background: '#f7fafc',
                  cursor: 'pointer',
                  fontWeight: 500,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <VoiceSelection assetId={voice[1]} creator={voice[0]} setSelectedVoice={setSelectedVoice} setShowModalInside={setShowVoiceModal}/>
              </div>
            ))}
            <button
              onClick={() => setShowVoiceModal(false)}
              style={{
                marginTop: '1rem',
                background: 'transparent',
                border: 'none',
                color: '#718096',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  );
  
  
}

export default VideoPage;
