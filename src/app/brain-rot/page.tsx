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
    const [videoTitle, setVideoTitle] = useState<string>('');
    const [videoRegistered, setVideoRegistered] = useState<string | null>(null);
    const [videoDescription, setVideoDescription] = useState<string>('');
    const [creatorName, setCreatorName] = useState<string>('');
    const [configurationModal, setConfigurationModal] = useState<boolean>(false);
    const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
    const [licenseTermsId, setLicenseTermsId] = useState<string>('');
    const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
    const [captionInput, setCaptionInput] = useState<string>('');
    const [caption, setCaption] = useState<single_word_recording[]>([]);
    const [durationFrames, setDurationFrames] = useState<number>(0);
    const [voiceUrl, setVoiceUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [voices, setVoices] = useState<any[]>([]);
    const [loadingVideoRegistered, setLoadingVideoRegistered] = useState<boolean>(false);
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

        try {
        const response = await fetch('/api/voice_upload', {
            method: 'POST',
            body: JSON.stringify({ caption: captionInput, assetId: selectedVoice }),
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
            body: JSON.stringify({ caption, voiceUrl, voiceId: selectedVoice, licenseTermsId, creatorName: creatorName, creatorAddress: address, title: videoTitle, description: videoDescription }),
        });
        const video_data = await response.json();
        setMessage('✅ Video exported successfully!');
        setVideoRegistered(`https://aeneid.explorer.story.foundation/ipa/${video_data.ipId}`);
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
      {selectedVoice == null ? (
      <button
        onClick={() => setShowVoiceModal(true)}
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
      ) : (
        <>
            <p>Selected Voice: {selectedVoice}</p>
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
            Generate Video
            </button>
        </>

      )}
      {caption.length > 0 && (
        <button
          onClick={() => setConfigurationModal(true)}
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
                <VoiceSelection assetId={voice[1]} creator={voice[0]} setSelectedVoice={setSelectedVoice} setShowModalInside={setShowVoiceModal} setLicenseTermsId={setLicenseTermsId}  />
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
    <AnimatePresence>
        {configurationModal && (
          <motion.div
            key="config-modal"
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
              zIndex: 150,
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
                width: '90%',
                maxWidth: '500px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <h2 style={{ textAlign: 'center' }}>Video Configuration</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontWeight: 600 }}>Title</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Enter video title"
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontWeight: 600 }}>Description</label>
                <textarea
                  rows={4}
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Enter description..."
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontWeight: 600 }}>Creator’s Name</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  onClick={() => setConfigurationModal(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid #718096',
                    color: '#718096',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    exportVideo();
                    setConfigurationModal(false);
                  }}
                  disabled={!videoTitle.trim() || !creatorName.trim()}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    background: videoTitle.trim() && creatorName.trim() ? '#38a169' : '#a0aec0',
                    color: '#fff',
                    border: 'none',
                    cursor: videoTitle.trim() && creatorName.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {videoRegistered && (
            <motion.div
            key="video-registered"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(10, 0, 30, 0.85)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999,
            }}
            >
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                style={{
                background: 'linear-gradient(135deg, #1e003e 0%, #26004b 100%)',
                border: '2px solid #6f00ff',
                boxShadow: '0 0 20px #6f00ff, inset 0 0 10px #00fff0',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '400px',
                width: '90%',
                color: '#e0e0ff',
                textAlign: 'center',
                }}
            >
                <h1 style={{
                marginBottom: '1rem',
                fontSize: '1.75rem',
                color: '#00fff0',
                textShadow: '0 0 8px #00fff0, 0 0 20px #6f00ff',
                }}>
                🎬 Video Registered
                </h1>
                <div onClick={() => window.open(videoRegistered, '_blank')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <p style={{
                    fontSize: '1rem',
                    lineHeight: 1.4,
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #00fff0',
                    textShadow: '0 0 4px #00fff0',
                    }}>
                    View on Explorer
                    </p>
                </div>
            </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  </div>
  );
  
  
}

export default VideoPage;
