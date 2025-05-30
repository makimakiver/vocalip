'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function PILTermsPage() {
  const { cid } = useParams()
  const router = useRouter()
  // PIL Terms state
  const [licenseType, setLicenseType] = useState('non-exclusive')
  const [territory, setTerritory] = useState('Worldwide')
  const [duration, setDuration] = useState(1)
  const [durationUnit, setDurationUnit] = useState('year')
  const [royaltyRate, setRoyaltyRate] = useState('')
  const [allowedUses, setAllowedUses] = useState('')
  const [allowSublicense, setAllowSublicense] = useState(false)
  const [additionalTerms, setAdditionalTerms] = useState('')
  
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
  const fileInputRef = useRef(null)

  // Clean up URL object on unmount or change
  useEffect(() => {
    return () => {
      if (voicePictureURL) URL.revokeObjectURL(voicePictureURL)
    }
  }, [voicePictureURL])
  // const handleDrag = (e) => {
  //   e.preventDefault()
  //   e.stopPropagation()
  //   if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
  //   else if (e.type === 'dragleave') setDragActive(false)
  // }

  // const handleDrop = (e) => {
  //   e.preventDefault()
  //   e.stopPropagation()
  //   setDragActive(false)
  //   const file = e.dataTransfer.files?.[0]
  //   if (file) {
  //     setVoicePicture(file)
  //     setVoicePictureURL(URL.createObjectURL(file))
  //   }
  // }

  const triggerFileSelect = () => fileInputRef.current?.click()
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setVoicePicture(file)
      setVoicePictureURL(URL.createObjectURL(file))
    }
  }

  const handleVoiceSubmit = async (e) => {
    e.preventDefault()
    // https://lime-adorable-ant-337.mypinata.cloud/ipfs/${cid}?pinataGatewayToken=ENQNk1o-lof8hP0fSPVQeb7DVGFDnEuzsCq9A4YT0HlJbSOQW1t0vNNqsDE_cJkD
    const voiceProfile = { voicePicture, voiceName, voiceCategory, voiceDescription, commercialShare, derivativeAttribution, derivativeReciprocal }
    // upload the voice profile to pinata
    if (voicePicture != null) {
      const form = new FormData();
      console.log('voicePicture', voicePicture)
      form.append("file", voicePicture, voicePicture.name);
      const response = await fetch('/api/photoupload', {
        method: 'POST',
        body: form
      })
      const data = await response.json()
      console.log('Data:', data)
      const payload = {
        imageCid: data.cid,
        voiceCid: cid,
        name: voiceName,
        description: voiceDescription,
        commercialShare: commercialShare,
        derivativeAttribution: derivativeAttribution
      };
      console.log("Hellooo")
      console.log('Payload:', payload)
      const registration_response = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      const registration_data = await registration_response.json()
      console.log('Registration Data:', registration_data)
    }
    // get the cid and use the uri 
    // 
    console.log('Voice Profile:', voiceProfile)
    console.log('voicePicture is null', voicePicture == null)
  }

  const commonStyle = { padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }

  // const onPictureChange = (e) => {
  //   const file = e.target.files[0]
  //   if (file) {
  //     setVoicePicture(file)
  //     const url = URL.createObjectURL(file)
  //     setVoicePictureURL(url)
  //   }
  // }
  const dropZoneStyle = {
    border: dragActive ? '2px dashed #2563eb' : '2px dashed #cbd5e0',
    borderRadius: '6px',
    padding: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: dragActive ? '#eef4ff' : '#fafafb',
    transition: 'background-color 0.2s, border-color 0.2s',
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '32px', width: '100%', maxWidth: '800px' }}>

        {/* PIL Terms */}
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Complete your voice profile</h1>

        {/* Voice Profile */}
        <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
        <form onSubmit={handleVoiceSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>

          {/* Interactive Photo Dropzone */}
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '500' }}>Picture</label>
            <div
              style={dropZoneStyle}
              onClick={triggerFileSelect}
            >
              {voicePictureURL ? (
                <img
                  src={voicePictureURL}
                  alt="Voice"
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
                />
              ) : (
                <>
                  <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>Drag & drop or click to upload</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>PNG, JPG or GIF (max 2MB)</p>
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

          <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Name</label>
            <input
              type="text"
              value={voiceName}
              onChange={e => setVoiceName(e.target.value)}
              placeholder="Voice name"
              style={commonStyle}
            />
          </div>

          <div style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Category</label>
            <input
              type="text"
              value={voiceCategory}
              onChange={e => setVoiceCategory(e.target.value)}
              placeholder="e.g. Narration, Assistant"
              style={commonStyle}
            />
          </div>

          <div style={{ flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Description</label>
            <textarea
              value={voiceDescription}
              onChange={e => setVoiceDescription(e.target.value)}
              rows={2}
              placeholder="Describe voice characteristics"
              style={commonStyle}
            />
          </div>

          <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Commercial Share (%)</label>
            <input
              type="number"
              value={commercialShare}
              onChange={e => setCommercialShare(e.target.value)}
              placeholder="e.g. 20%"
              style={commonStyle}
            />
          </div>

          <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>
              <input
                type="checkbox"
                checked={derivativeAttribution}
                onChange={e => setDerivativeAttribution(e.target.checked)}
                style={{ marginRight: '4px' }}
              /> Derivative Attribution
            </label>
            <label>
              <input
                type="checkbox"
                checked={derivativeReciprocal}
                onChange={e => setDerivativeReciprocal(e.target.checked)}
                style={{ marginRight: '4px' }}
              /> Derivative Reciprocal
            </label>
          </div>

          <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', fontSize: '14px', cursor: 'pointer', backgroundColor: '#10b981', color: '#fff' }}
            >
              Save Voice Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}