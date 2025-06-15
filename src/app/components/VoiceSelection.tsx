"use client";
import React, { useEffect, useRef, useState } from "react";
import "./AssetCard.css";
import { account, client } from "../../../utils/config";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  MessageSquareWarning,
  Space,
  SquareArrowOutUpRight,
  X,
  Mic,
  Loader2,
  MoreVertical,
  Lock,
  Unlock,
} from "lucide-react";
import { useAccount, useWalletClient } from "wagmi";
import { Address } from "viem";
import { ethers } from "ethers";
type AssetCardProps = {
  assetId: string;
  creator: string;
  isOwner?: boolean; // New prop to show privacy toggle only for owners
  setSelectedVoice: (voice: string) => void;
  setShowModalInside: (show: boolean) => void;
};

export default function VoiceSelection({
  assetId,
  creator,
  isOwner = false,
  setSelectedVoice,
  setShowModalInside,
}: AssetCardProps) {
  type AssetDataType = {
    nftMetadata?: {
      imageUrl?: string;
      name?: string;
    };
    [key: string]: any;
  };

  type MetaDataType = {
    image?: string;
    mediaUrl?: string;
    title?: string;
    description?: string;
    creators?: { address?: string }[];
    [key: string]: any;
  };

  const [assetData, setAssetData] = useState<AssetDataType | null>(null);
  const [metaData, setMetaData] = useState<MetaDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [passed, setPassed] = useState(false);
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [mintingFee, setMintingFee] = useState(0);
  // New state for privacy toggle
  const [isPublic, setIsPublic] = useState(true);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [free, setFree] = useState(false);

  useEffect(() => {
    const fetchAsset = async () => {
        setLoading(true);
        const options = {
            method: "GET",
            headers: {
            "X-Api-Key": "MhBsxkU1z9fG6TofE59KqiiWV-YlYE8Q4awlLQehF3U",
            "X-Chain": "story-aeneid",
            },
        };
        const res = await fetch(
            `https://api.storyapis.com/api/v3/assets/${assetId}`,
            options
        );
        const data = await res.json();
        setAssetData(data.data);

        // Metadata fetch
        const metaRes = await fetch(
            `https://api.storyapis.com/api/v3/assets/${assetId}/metadata`,
            options
        );
        const metaJson = await metaRes.json();
        let meta = null;
        try {
            const metaDetail = await fetch(metaJson.metadataUri);
            meta = await metaDetail.json();
        } catch (err) {
            meta = null;
        }
        setMetaData(meta);
        const response = await fetch(
            `https://api.storyapis.com/api/v3/detailed-ip-license-terms`,
            {
            method: "POST",
            headers: {
                "X-Api-Key": "MhBsxkU1z9fG6TofE59KqiiWV-YlYE8Q4awlLQehF3U",
                "X-Chain": "story-aeneid",
            },
            body: `{"options":{"where":{"ipIds":["${assetId}"]}}}`
            }
        );
        const priceData = await response.json();
        const rawMintingFee = priceData.data[0].terms.defaultMintingFee;
        if (rawMintingFee == null || rawMintingFee == undefined){
            throw new Error("Minting fee is null");
        }
        if (rawMintingFee == 0){
            setFree(true);
        }
        else{
            const mintingFee = BigInt(rawMintingFee) / 1000000000000000000n;
            setMintingFee(Number(mintingFee));
        }
      // Load privacy state from API
      try {
        const privacyRes = await fetch(
          `/api/update-voice-privacy?assetId=${assetId}`
        );
        if (privacyRes.ok) {
          const privacyData = await privacyRes.json();
          setIsPublic(privacyData.isPublic);
        }
      } catch (error) {
        console.error("Error loading privacy state:", error);
        // Default to public if error
        setIsPublic(true);
      }

      setLoading(false);
    };
    fetchAsset();
  }, [assetId]);

  const imageUrl = metaData?.image || assetData?.nftMetadata?.imageUrl;
  const mediaUrl = metaData?.mediaUrl;
  const title = metaData?.title || assetData?.nftMetadata?.name || "Untitled";
  const description = metaData?.description || "";
  const creatorAddr = metaData?.creators?.[0]?.address || creator;

  const truncate = (addr: string | undefined) =>
    addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

  // Play/pause logic
  const handlePlayClick = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  };
  // When audio finishes or is paused
  const handleAudioEnded = () => {
    setAudioPlaying(false);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  // Privacy toggle handler
  const handlePrivacyToggle = async () => {
    setPrivacyLoading(true);
    try {
      const newPrivacyState = !isPublic;

      // Call the API to update privacy
      const res = await fetch("/api/update-voice-privacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId,
          isPublic: newPrivacyState,
          userAddress: creator, // Pass the creator address for future authentication
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update privacy");
      }

      const data = await res.json();
      if (data.success) {
        setIsPublic(newPrivacyState);
      } else {
        throw new Error(data.error || "Failed to update privacy");
      }
    } catch (error) {
      console.error("Error updating privacy:", error);
      alert("Failed to update privacy settings");
    }
    setPrivacyLoading(false);
  };

  if (loading || !assetData || !metaData) {
    return <div className="asset-card loading">Loading asset...</div>;
  }

  const mintLicense = async () => {
      const res = await fetch(
        `https://api.storyapis.com/api/v3/detailed-ip-license-terms`,
        {
          method: "POST",
          headers: {
            "X-Api-Key": "MhBsxkU1z9fG6TofE59KqiiWV-YlYE8Q4awlLQehF3U",
            "X-Chain": "story-aeneid",
          },
          body: `{"options":{"where":{"ipIds":["${assetId}"]}}}`
        }
      );
      const data = await res.json();
      const licenseTerms = data.data[0];
      console.log(licenseTerms);
      // const addr = useWalletClient().data?.account.address;
      console.log(licenseTerms.id);
      console.log(client.license);
      const rawMintingFee = licenseTerms.terms.defaultMintingFee;
      
      if(rawMintingFee == null || rawMintingFee == undefined){
        throw new Error("Minting fee is null");
      }
      if(rawMintingFee == 0){
        const response = await client.license.mintLicenseTokens({
          licenseTermsId: licenseTerms.id,
          licensorIpId: assetId as Address,
          receiver: creatorAddr as Address, // optional
          amount: 1,
          maxMintingFee: BigInt(0), // disabled
          maxRevenueShare: 100, // default
        });
        console.log(response);
        console.log(
          `License Token minted at transaction hash ${response.txHash}, License IDs: ${response.licenseTokenIds}`
        );
        setSelectedVoice(assetId);
        setShowModalInside(false);
        return;
      }
      const mintingFee = BigInt(rawMintingFee) / 1000000000000000000n;
      console.log({
        licenseTermsId: licenseTerms.id,
        licensorIpId: assetId as `0x${string}`,
        receiver: creatorAddr as `0x${string}`, // optional
        amount: 1,
        maxMintingFee: mintingFee, // disabled
        maxRevenueShare: 100, // default
      });
      const response = await client.license.mintLicenseTokens({
        licenseTermsId: licenseTerms.id,
        licensorIpId: assetId as `0x${string}`,
        receiver: creatorAddr as `0x${string}`, // optional
        amount: 1,
        maxMintingFee: 1, // disabled
        maxRevenueShare: 100, // default
      });
      console.log(response);
      console.log(
        `License Token minted at transaction hash ${response.txHash}, License IDs: ${response.licenseTokenIds}`
      );
      setSelectedVoice(assetId);
      setShowModalInside(false);
  };

  return (
    <div className="asset-card">
      {/* Left: Image with play button */}
      <div className="asset-card-image-wrapper">
        <img src={imageUrl} alt={title} className="asset-card-image" />
        <button
          className={`asset-card-play-btn ${audioPlaying ? "pause" : ""}`}
          onClick={handlePlayClick}
          aria-label={audioPlaying ? "Pause" : "Play"}
        >
          {audioPlaying ? (
            // Pause Icon
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="5" width="4" height="14" rx="2" />
              <rect x="14" y="5" width="4" height="14" rx="2" />
            </svg>
          ) : (
            // Play Icon
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          )}
        </button>
        <audio
          ref={audioRef}
          src={mediaUrl}
          onEnded={handleAudioEnded}
          onPause={handleAudioEnded}
          style={{ display: "none" }}
        />
      </div>
      {/* Right: Details */}
      <div className="asset-card-details">
        <div className="asset-card-title">{title}</div>
        <div className="asset-card-desc">{description}</div>
        <a
          href={`https://aeneid.explorer.story.foundation/ipa/${assetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="asset-card-tag"
          title={assetId}
        >
          {truncate(assetId)}
        </a>
        <div className="asset-card-creator">
          Creator: <span>{truncate(creatorAddr.toString())}</span>
        </div>
        {/* Always render an audio player below for control */}
        <audio
          ref={audioRef}
          src={mediaUrl}
          controls
          style={{ width: "100%", marginTop: "10px" }}
          onPlay={() => setAudioPlaying(true)}
          onPause={handleAudioEnded}
          onEnded={handleAudioEnded}
        />
        <div>
          <button
            onClick={(e) => {
              e.preventDefault();
              mintLicense();
            }}
            style={{
              position: 'relative',
              padding: '0.6rem 1.4rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#fff',
              background: 'linear-gradient(135deg, #ff00cc, #3333ff)',
              border: '2px solid transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'color 0.3s ease, box-shadow 0.3s ease',
              boxShadow: '0 0 5px #ff00cc, 0 0 10px #3333ff, inset 0 0 5px rgba(255,255,255,0.2)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {free ? "Use the voice" : "Buy licence for " + mintingFee + " IP"}
          </button>
        </div>

        {/* Privacy Toggle for owners */}
    
      </div>
      <MoreVertical
        className="asset-card-dots"
        onClick={() => setShowOptions(!showOptions)}
      />
      <AnimatePresence>
        {showOptions && !showDisputeModal && (
          <motion.div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 10,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                width: "90%",
                maxWidth: "400px",
                backgroundColor: "#fff",
                borderRadius: "24px",
                padding: "24px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                position: "relative",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  onClick={() =>
                    window.open(
                      `https://aeneid.explorer.story.foundation/ipa/${assetId}`,
                      "_blank"
                    )
                  }
                  style={{
                    padding: "10px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  View Details
                  <SquareArrowOutUpRight />
                </div>
                <div
                  onClick={() => {
                    setShowOptions(false);
                    setShowDisputeModal(true);
                  }}
                  style={{
                    padding: "10px",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    backgroundColor: "#dc3545",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  Raise Dispute
                  <MessageSquareWarning />
                </div>
              </div>
              <X onClick={() => setShowOptions(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showModal && (
          <motion.div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                width: "90%",
                maxWidth: "400px",
                backgroundColor: "#fff",
                borderRadius: "16px",
                padding: "32px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                textAlign: "center",
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <ArrowLeft
                  style={{
                    width: "20%",
                    backgroundColor: "white",
                    alignSelf: "flex-start",
                    color: "white",
                  }}
                />
                {passed ? (
                  <CheckCircle
                    size={48}
                    style={{ color: "#38a169", width: "60%" }}
                  />
                ) : (
                  <AlertCircle
                    size={48}
                    style={{ color: "#e53e3e", width: "60%" }}
                  />
                )}
                <X
                  onClick={() => setShowModal(false)}
                  size={24}
                  style={{
                    cursor: "pointer",
                    color: "#a0aec0",
                    width: "20%",
                    alignSelf: "flex-start",
                  }}
                />
              </div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "#2d3748",
                  marginBottom: "12px",
                }}
              >
                {passed ? "Select Registration Type" : "Invalid Recording"}
              </h2>
              <p style={{ color: "#4a5568", marginBottom: "24px" }}>
                {passed
                  ? "Your recording is saved! Choose how you'd like to register:"
                  : "Invalid recording. Please try again."}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                }}
              >
                {passed ? (
                  <>
                    <motion.button
                      onClick={() => setShowModal(false)}
                      whileHover={{ scale: 1.05 }}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "12px 0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        cursor: "pointer",
                        border: "none",
                        outline: "none",
                        color: "#fff",
                        backgroundColor: "#3182ce",
                      }}
                    >
                      <Mic style={{ marginRight: "8px" }} /> Back
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    onClick={() => {
                      setShowModal(false);
                    }}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      border: "none",
                      outline: "none",
                      color: "#fff",
                      backgroundColor: "#2f855a",
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
      <AnimatePresence>
        {disputeLoading && (
          <motion.div
            key="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <motion.div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* 3 bouncing‐dots */}
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "16px" }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: "white",
                    }}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
              <motion.span
                style={{
                  color: "white",
                  fontSize: "1.125rem",
                  fontWeight: 500,
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
    </div>
  );
}
