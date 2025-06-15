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
  setLicenseTermsId: (licenseTermsId: string) => void;
};

export default function VoiceSelection({
  assetId,
  creator,
  isOwner = false,
  setSelectedVoice,
  setShowModalInside,
  setLicenseTermsId,
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
        setLicenseTermsId(licenseTerms.id.toString());
        return;
      }
    try{
        const mintingFee = BigInt(rawMintingFee) / 1000000000000000000n;
        const response = await client.license.mintLicenseTokens({
            licenseTermsId: licenseTerms.id,
            licensorIpId: assetId as `0x${string}`,
            receiver: creatorAddr as `0x${string}`, // optional
            amount: 1,
            maxMintingFee: 1, // disabled
            maxRevenueShare: 100, // default
        });
        console.log(response.txHash);
        console.log(
        `License Token minted at transaction hash ${response.txHash}, License IDs: ${response.licenseTokenIds}`
        );
        setSelectedVoice(assetId);
        setShowModalInside(false);
        setLicenseTermsId(licenseTerms.id.toString());
      }
      catch(err){
        console.log(err);
        alert("Failed to mint license");
        return;
      }
  };

  return (
    <motion.div
    // Animate in + hover lift
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}
    style={{
      display: "flex",
      gap: "1rem",
      width: "100%",
      padding: "1rem",
      borderRadius: "12px",
      background: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      position: "relative",
    }}
  >
    {/* Image + play */}
    <div
      style={{
        position: "relative",
        flexShrink: 0,
        width: "160px",
        height: "160px",
      }}
    >
      <img
        src={imageUrl}
        alt={title}
        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
      />

      <motion.button
        onClick={handlePlayClick}
        aria-label={audioPlaying ? "Pause" : "Play"}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: audioPlaying ? "#ff00cc" : "rgba(0,0,0,0.6)",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          boxShadow: audioPlaying
            ? "0 0 8px #ff00cc, inset 0 0 4px rgba(255,0,204,0.5)"
            : "0 0 4px rgba(0,0,0,0.5)",
        }}
      >
        {audioPlaying ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="5" width="4" height="14" rx="2" />
            <rect x="14" y="5" width="4" height="14" rx="2" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <polygon points="8,5 19,12 8,19" />
          </svg>
        )}
      </motion.button>

      <audio
        ref={audioRef}
        src={mediaUrl}
        onEnded={handleAudioEnded}
        onPause={handleAudioEnded}
        style={{ display: "none" }}
      />
    </div>

    {/* Details */}
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, color: "#222" }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>{description}</p>
      <a
        href={`https://aeneid.explorer.story.foundation/ipa/${assetId}`}
        target="_blank"
        rel="noopener noreferrer"
        title={assetId}
        style={{ marginTop: "0.25rem", fontSize: "0.8rem", color: "#007BFF", textDecoration: "none" }}
      >
        {truncate(assetId)}
      </a>
      <div style={{ marginTop: "0.25rem", fontSize: "0.8rem", color: "#888" }}>
        Creator: <span>{truncate(creatorAddr.toString())}</span>
      </div>

      <audio
        ref={audioRef}
        src={mediaUrl}
        controls
        onPlay={() => setAudioPlaying(true)}
        onPause={handleAudioEnded}
        onEnded={handleAudioEnded}
        style={{ width: "100%", marginTop: "0.75rem" }}
      />

      <motion.button
        onClick={(e) => { e.preventDefault(); mintLicense() }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        style={{
          marginTop: "1rem",
          padding: "0.6rem 1.4rem",
          fontSize: "1rem",
          fontWeight: "bold",
          color: "#fff",
          background: "linear-gradient(135deg, #ff00cc, #3333ff)",
          border: "2px solid transparent",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 0 5px #ff00cc, 0 0 10px #3333ff, inset 0 0 5px rgba(255,255,255,0.2)",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {free ? "Use the voice" : `Buy license for ${mintingFee} IP`}
      </motion.button>
    </div>
  </motion.div>
  );
}
