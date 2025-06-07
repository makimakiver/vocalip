'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ethers } from 'ethers'
import storyContractAbi from '../../../../../StoryContractABI.json'
import { useTomo, getWalletState } from '@tomo-inc/tomo-web-sdk';
import { useAccount, useWalletClient, useWriteContract } from 'wagmi';
import { useMemo } from 'react';

export default function PILTermsPage() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const STORY_RPC_URL = 'https://aeneid.storyrpc.io';
  const readProvider = new ethers.JsonRpcProvider(STORY_RPC_URL)
  const storyContractAddress = '0x57A220322E44B7b42125d02385CC04816eDB5ec7'
  const { cid } = useParams()
  const router = useRouter()
  const [showPaymentPopup, setShowPaymentPopup] = useState(false)
  const { writeContract } = useWriteContract()
  // Voice Profile state
  const [voicePicture, setVoicePicture] = useState(null)
  const [voicePictureURL, setVoicePictureURL] = useState(null)
  const [voiceName, setVoiceName] = useState('')
  const [voiceCategory, setVoiceCategory] = useState('Generic')
  const [voiceDescription, setVoiceDescription] = useState('')
  const [commercialShare, setCommercialShare] = useState('')
  const [derivativeAttribution, setDerivativeAttribution] = useState(false)
  const [derivativeReciprocal, setDerivativeReciprocal] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showLoadingPopup, setShowLoadingPopup] = useState(false)
  const [registrationData, setRegistrationData] = useState(null)
  const fileInputRef = useRef(null)

  // Clean up URL object on unmount or change
  useEffect(() => {
    return () => {
      if (voicePictureURL) URL.revokeObjectURL(voicePictureURL)
    }
  }, [voicePictureURL])

  const useEthersSigner = async () => {
    console.log('handleVoiceSubmit')
    if (!walletClient) {
      console.log('No wallet client available')
      return null
    }
    console.log('walletClient: ', walletClient)
    const provider = new ethers.BrowserProvider(walletClient)
    return provider.getSigner()
  }
  const triggerFileSelect = () => fileInputRef.current?.click()
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setVoicePicture(file)
      setVoicePictureURL(URL.createObjectURL(file))
    }
  }

  // This just toggles the payment pop-up
  const handlePayment = async () => {
    setShowLoadingPopup(true)
    const signer = useEthersSigner();
    // Await the signer since useEthersSigner returns a Promise
    const resolvedSigner = await signer;
    console.log('resolvedSigner: ', resolvedSigner)
    if (!resolvedSigner) {
      console.log('No signer available')
      console.error('No signer available')
      return
    }
    console.log('handleVoiceSubmit')
    const tx = writeContract({ 
      abi: storyContractAbi,
      address: storyContractAddress as `0x${string}`,
      functionName: 'registerPay',
      args: [],
      value: ethers.parseEther("1.0")
    })
    setShowPaymentPopup(true)
    setShowLoadingPopup(false)
  }

  // Left here in case you want to call it manually somewhere else,
  // but it will not run automatically when the user clicks “Register Voice.”
  const handleVoiceSubmit = async () => {
    setShowLoadingPopup(true)
    
    const voiceProfile = {
      voicePicture,
      voiceName,
      voiceCategory,
      voiceDescription,
      commercialShare,
      derivativeAttribution,
      derivativeReciprocal
    }
    
    const ethereum = window.ethereum;
    if (voicePicture != null && voicePicture != undefined && voiceName != null && voiceName != undefined && voiceDescription != null && voiceDescription != undefined && commercialShare != null && commercialShare != undefined) {
      const form = new FormData()
      form.append('file', voicePicture, voicePicture.name)
      const response = await fetch('/api/photoupload', {
        method: 'POST',
        body: form
      })
      const data = await response.json()
      const cloningResponse = await fetch('/api/cloning', {
        method: 'POST',
        body: JSON.stringify({ voiceCid: cid })
      })
      const cloningData = await cloningResponse.json()
      const payload = {
        creator_address: walletClient?.account,
        imageCid: data.cid,
        voiceCid: cid,
        name: voiceName,
        description: voiceDescription,
        commercialShare: commercialShare,
        derivativeAttribution: derivativeAttribution,
        voiceId: cloningData.cid
      }
      const registrationResponse = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      const registrationData = await registrationResponse.json()
      console.log('registrationData: ', registrationData)
      console.log('Registration complete…')
      // Convert Wagmi walletClient.provider to ethers provider/signer
      const signer = useEthersSigner();
      // Await the signer since useEthersSigner returns a Promise
      const resolvedSigner = await signer;
      console.log('resolvedSigner: ', resolvedSigner)
      if (!resolvedSigner) {
        console.log('No signer available')
        console.error('No signer available')
        return
      }
      console.log('handleVoiceSubmit')
      const tx = writeContract({ 
        abi: storyContractAbi,
        address: storyContractAddress as `0x${string}`,
        functionName: 'registerVoice',
        args: [registrationData.ipId],
        
      })
      console.log('tx: ', tx)
      // Example: call a void function `registerVoice(address user)`
      console.log('On‐chain registration confirmed.')
      setRegistrationData(registrationData.link)
      setShowLoadingPopup(false)
      setShowPaymentPopup(false)
      setShowSuccessPopup(true)
      // Registration complete…
    }
  }
  
  const commonStyle = {
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px'
  }

  const dropZoneStyle = {
    border: dragActive ? '2px dashed #2563eb' : '2px dashed #cbd5e0',
    borderRadius: '6px',
    padding: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: dragActive ? '#eef4ff' : '#fafafb',
    transition: 'background-color 0.2s, border-color 0.2s'
  }

  return (
    <>
      {/* Outer flex wrapper for the form; closes here so the modal isn't nested */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
      >
        <div
          style={{
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            padding: '32px',
            width: '100%',
            maxWidth: '800px'
          }}
        >
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '24px'
            }}
          >
            Complete your voice profile
          </h1>

          <hr
            style={{
              margin: '32px 0',
              border: 'none',
              borderTop: '1px solid #e5e7eb'
            }}
          />

          {/* Removed onSubmit so handleVoiceSubmit won't fire automatically */}
          <form
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'flex-start'
            }}
          >
            {/* Interactive Photo Dropzone */}
            <div
              style={{
                flex: '1 1 200px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <label style={{ fontWeight: '500' }}>Picture</label>
              <div style={dropZoneStyle} onClick={triggerFileSelect}>
                {voicePictureURL ? (
                  <img
                    src={voicePictureURL}
                    alt="Voice"
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                ) : (
                  <>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#374151'
                      }}
                    >
                      Drag & drop or click to upload
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#6b7280'
                      }}
                    >
                      PNG, JPG or GIF (max 2MB)
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div
              style={{
                flex: '1 1 160px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <label>Name</label>
              <input
                type="text"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                placeholder="Voice name"
                style={commonStyle}
              />
            </div>

            <div
              style={{
                flex: '1 1 140px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <label>Category</label>
              <input
                type="text"
                value={voiceCategory}
                onChange={(e) => setVoiceCategory(e.target.value)}
                placeholder="e.g. Narration, Assistant"
                style={commonStyle}
              />
            </div>

            <div
              style={{
                flex: '1 1 100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <label>Description</label>
              <textarea
                value={voiceDescription}
                onChange={(e) => setVoiceDescription(e.target.value)}
                rows={2}
                placeholder="Describe voice characteristics"
                style={commonStyle}
              />
            </div>

            <div
              style={{
                flex: '1 1 120px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <label>Commercial Share (%)</label>
              <input
                type="number"
                value={commercialShare}
                onChange={(e) => setCommercialShare(e.target.value)}
                placeholder="e.g. 20%"
                style={commonStyle}
              />
            </div>

            <div
              style={{
                flex: '1 1 160px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={derivativeAttribution}
                  onChange={(e) => setDerivativeAttribution(e.target.checked)}
                  style={{ marginRight: '4px' }}
                />{' '}
                Derivative Attribution
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={derivativeReciprocal}
                  onChange={(e) => setDerivativeReciprocal(e.target.checked)}
                  style={{ marginRight: '4px' }}
                />{' '}
                Derivative Reciprocal
              </label>
            </div>

            <div
              style={{
                flex: '1 1 100%',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              {/* Only opens payment pop-up; does NOT submit form */}
              <button
                type="button"
                onClick={handlePayment}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  backgroundColor: '#10b981',
                  color: '#fff'
                }}
              >
                Register Voice
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* AnimatePresence + modal overlay (now outside the flex container)      */}
      <AnimatePresence>
        {showPaymentPopup && (
          <>
            {/* BACKDROP: covers entire viewport */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentPopup(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 20
              }}
            />

            {/* MODAL: also covers entire viewport, but uses flex centering */}
            <motion.div
              key="payment-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 30
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  padding: '24px',
                  width: '90%',
                  maxWidth: '400px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  textAlign: 'center'
                }}
              >
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  Complete Your Payment
                </h2>
                <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                 To register your voice, please pay with IP Token.
                </p>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => setShowPaymentPopup(false)}
                      style={{
                        width: '50%',
                        height: '100%',
                        padding: '10px 24px',
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        backgroundColor: 'red',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Cancel
                    </button>
                  <button
                    onClick={() => {
                      // If you want to submit after payment, call handleVoiceSubmit() here:
                      handleVoiceSubmit()
                      // console.log('Redirecting to IP Token checkout…')
                    }}
                    style={{
                      width: '50%',
                      height: '100%',
                      padding: '10px 24px',
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Pay 1 IP to register
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* 2) Success Notification Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <>
            {/* Backdrop */}
            <motion.div
              key="success-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessPopup(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                zIndex: 50
              }}
            />

            {/* Success Modal */}
            <motion.div
              key="success-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 60
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  padding: '24px',
                  width: '80%',
                  maxWidth: '320px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  textAlign: 'center'
                }}
              >
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  Registration Successful!
                </h2>
                <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                  Your voice profile has been registered successfully.
                </p>
                {registrationData && (
                  <a href={registrationData} target="_blank" rel="noopener noreferrer">
                    View your voice profile
                  </a>
                )}
                <button
                  onClick={() => {
                    setShowSuccessPopup(false)
                    router.push('/')
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Go back to home
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* 3) Loading Popup */}
      <AnimatePresence>
        {showLoadingPopup && (
          <motion.div
            key="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <motion.div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* 3 bouncing‐dots */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: 'white'
                    }}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
              <motion.span
                style={{
                  color: 'white',
                  fontSize: '1.125rem',
                  fontWeight: 500
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                Loading...
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
