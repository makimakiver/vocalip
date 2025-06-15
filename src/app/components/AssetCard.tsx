"use client";
import React, { useEffect, useRef, useState } from "react";
import "./AssetCard.css";
import { client } from "../../../utils/config";
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
  Play,
  Pause,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { useAccount, useWalletClient } from "wagmi";
import { Address } from "viem";

type AssetCardProps = {
  assetId: string;
  creator: string;
  isOwner?: boolean;
};

export default function AssetCard({
  assetId,
  creator,
  isOwner = false,
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

  enum DisputeType {
    None = "NONE",
    ImproperRegistration = "IMPROPER_REGISTRATION",
    ImproperUsage = "IMPROPER_USAGE",
    ImproperPayment = "IMPROPER_PAYMENT",
    ContentStandardsViolation = "CONTENT_STANDARDS_VIOLATION",
  }

  const [assetData, setAssetData] = useState<AssetDataType | null>(null);
  const [metaData, setMetaData] = useState<MetaDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeType, setDisputeType] = useState<DisputeType>(DisputeType.None);
  const [disputeButton, setDisputeButton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [passed, setPassed] = useState(false);
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [buttonText, setButtonText] = useState("");

  useEffect(() => {
    if (disputeType !== DisputeType.None) {
      setDisputeButton(true);
    } else {
      setDisputeButton(false);
    }
  }, [disputeType]);

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
          body: `{"options":{"where":{"ipIds":["${assetId}"]}}}`,
        }
      );

      const priceData = await response.json();
      const rawMintingFee = priceData.data[0].terms.defaultMintingFee;
      if (rawMintingFee == null || rawMintingFee == undefined) {
        throw new Error("Minting fee is null");
      }
      if (rawMintingFee == 0) {
        setButtonText("Buy licence for Free!!");
      } else {
        const mintingFee = BigInt(rawMintingFee) / 1000000000000000000n;
        setButtonText("Buy licence for " + mintingFee + " IP");
      }
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

  const handleAudioEnded = () => {
    setAudioPlaying(false);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const handlePrivacyToggle = async () => {
    setPrivacyLoading(true);
    try {
      const newPrivacyState = !isPublic;

      const res = await fetch("/api/update-voice-privacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId,
          isPublic: newPrivacyState,
          userAddress: creator,
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
    return (
      <motion.div
        className="asset-card-modern loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-shimmer" />
        <div className="loading-content">
          <Loader2 size={32} className="loading-spinner" />
          <span>Loading voice asset...</span>
        </div>
      </motion.div>
    );
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
        body: `{"options":{"where":{"ipIds":["${assetId}"]}}}`,
      }
    );
    const data = await res.json();
    const licenseTerms = data.data[0];
    console.log(licenseTerms);
    console.log(licenseTerms.id);
    console.log(client.license);
    const rawMintingFee = licenseTerms.terms.defaultMintingFee;

    if (rawMintingFee == null || rawMintingFee == undefined) {
      throw new Error("Minting fee is null");
    }
    if (rawMintingFee == 0) {
      const response = await client.license.mintLicenseTokens({
        licenseTermsId: licenseTerms.id,
        licensorIpId: assetId as Address,
        receiver: creatorAddr as Address,
        amount: 1,
        maxMintingFee: BigInt(0),
        maxRevenueShare: 100,
      });
      console.log(response);
      console.log(
        `License Token minted at transaction hash ${response.txHash}, License IDs: ${response.licenseTokenIds}`
      );
      setButtonText("Buy licence for Free!!");
      return;
    }
    const mintingFee = BigInt(rawMintingFee) / 1000000000000000000n;
    console.log({
      licenseTermsId: licenseTerms.id,
      licensorIpId: assetId as `0x${string}`,
      receiver: creatorAddr as `0x${string}`,
      amount: 1,
      maxMintingFee: mintingFee,
      maxRevenueShare: 100,
    });
    const response = await client.license.mintLicenseTokens({
      licenseTermsId: licenseTerms.id,
      licensorIpId: assetId as `0x${string}`,
      receiver: creatorAddr as `0x${string}`,
      amount: 1,
      maxMintingFee: 1,
      maxRevenueShare: 100,
    });
    console.log(response);
    console.log(
      `License Token minted at transaction hash ${response.txHash}, License IDs: ${response.licenseTokenIds}`
    );
    setButtonText("Buy licence for " + mintingFee + "IP");
  };

  const raiseDispute = async () => {
    if (disputeType === DisputeType.None) {
      alert("Please select a dispute type");
      return;
    }
    setDisputeLoading(true);
    const res = await fetch("/api/raise-dispute", {
      method: "POST",
      body: JSON.stringify({ ipId: assetId, disputeType: disputeType }),
    });
    const json = await res.json();
    console.log(json);
    setShowModal(true);
    if (json.error) {
      setPassed(false);
    } else {
      setPassed(true);
    }
    setShowDisputeModal(false);
    setDisputeLoading(false);
  };

  return (
    <motion.div
      className="asset-card-modern"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-gradient-border" />

      <div className="card-content">
        <div className="card-media-section">
          <div className="card-image-wrapper">
            <img src={imageUrl} alt={title} className="card-image" />
            <div className="card-image-overlay">
              <motion.button
                className={`play-button ${audioPlaying ? "playing" : ""}`}
                onClick={handlePlayClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {audioPlaying ? <Pause size={24} /> : <Play size={24} />}
              </motion.button>
            </div>
            {audioPlaying && (
              <div className="audio-visualizer">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="visualizer-bar"
                    animate={{
                      height: ["20%", "100%", "20%"],
                    }}
                    transition={{
                      duration: 0.5 + i * 0.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="card-details">
            <div className="title-section">
              <h3 className="card-title">{title}</h3>
              <motion.button
                className="options-button"
                onClick={() => setShowOptions(!showOptions)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <MoreVertical size={20} />
              </motion.button>
            </div>

            <p className="card-description">{description}</p>

            <div className="card-meta">
              <div className="meta-item">
                <span className="meta-label">Creator</span>
                <a
                  href={`https://aeneid.explorer.story.foundation/address/${creatorAddr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meta-value creator-link"
                >
                  {truncate(creatorAddr.toString())}
                  <SquareArrowOutUpRight size={14} />
                </a>
              </div>

              <div className="meta-item">
                <span className="meta-label">Asset ID</span>
                <a
                  href={`https://aeneid.explorer.story.foundation/ipa/${assetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meta-value asset-link"
                >
                  {truncate(assetId)}
                  <SquareArrowOutUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={mediaUrl}
          className="audio-player"
          onPlay={() => setAudioPlaying(true)}
          onPause={handleAudioEnded}
          onEnded={handleAudioEnded}
        />

        <div className="card-actions">
          <motion.button
            className="license-button"
            onClick={(e) => {
              e.preventDefault();
              mintLicense();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="button-gradient" />
            <DollarSign size={20} />
            <span>{buttonText || "License Voice"}</span>
            <Sparkles size={16} className="button-sparkle" />
          </motion.button>

          {isOwner && (
            <motion.button
              className={`privacy-button ${isPublic ? "public" : "private"}`}
              onClick={handlePrivacyToggle}
              disabled={privacyLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {privacyLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isPublic ? (
                <>
                  <Lock size={18} />
                  <span>Make Private</span>
                </>
              ) : (
                <>
                  <Unlock size={18} />
                  <span>Make Public</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

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
        {showDisputeModal && !showOptions && (
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
                maxWidth: "60vw",
                backgroundColor: "#fff",
                borderRadius: "24px",
                padding: "24px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                position: "relative",
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <ArrowLeft
                  className="asset-card-close"
                  onClick={() => {
                    setShowDisputeModal(false);
                    setShowOptions(true);
                  }}
                />
                <h2>Raise Dispute</h2>
                <X
                  className="asset-card-close"
                  onClick={() => setShowDisputeModal(false)}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "12px",
                  margin: "12px",
                }}
              >
                <div
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "16px",
                    width: "50%",
                    padding: "20px",
                    background:
                      disputeType === DisputeType.ImproperRegistration
                        ? "linear-gradient(145deg, #d0f0ff, #aee6ff)"
                        : "linear-gradient(145deg, #ffffff, #f0f0f0)",
                    boxShadow:
                      disputeType === DisputeType.ImproperRegistration
                        ? "0 10px 24px rgba(0, 100, 200, 0.2)"
                        : "0 6px 16px rgba(0, 0, 0, 0.05)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 20px rgba(0, 0, 0, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 16px rgba(0, 0, 0, 0.05)";
                  }}
                  onClick={() =>
                    setDisputeType(DisputeType.ImproperRegistration)
                  }
                >
                  <h3
                    style={{
                      marginBottom: "10px",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    🔒 Improper Registration
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                      color: "#555",
                    }}
                  >
                    The content has been used or published without the creator's
                    permission or outside agreed terms.
                  </p>
                </div>
                <div
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "16px",
                    width: "50%",
                    padding: "20px",
                    background:
                      disputeType === DisputeType.ImproperUsage
                        ? "linear-gradient(145deg, #d0f0ff, #aee6ff)"
                        : "linear-gradient(145deg, #ffffff, #f0f0f0)",
                    boxShadow:
                      disputeType === DisputeType.ImproperUsage
                        ? "0 10px 24px rgba(0, 100, 200, 0.2)"
                        : "0 6px 16px rgba(0, 0, 0, 0.05)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 20px rgba(0, 0, 0, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 16px rgba(0, 0, 0, 0.05)";
                  }}
                  onClick={() => setDisputeType(DisputeType.ImproperUsage)}
                >
                  <h3
                    style={{
                      marginBottom: "10px",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    🔒 Improper Usage
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                      color: "#555",
                    }}
                  >
                    the voice is not used properly.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  margin: "12px",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "16px",
                    width: "50%",
                    padding: "20px",
                    background:
                      disputeType === DisputeType.ImproperPayment
                        ? "linear-gradient(145deg, #d0f0ff, #aee6ff)"
                        : "linear-gradient(145deg, #ffffff, #f0f0f0)",
                    boxShadow:
                      disputeType === DisputeType.ImproperPayment
                        ? "0 10px 24px rgba(0, 100, 200, 0.2)"
                        : "0 6px 16px rgba(0, 0, 0, 0.05)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 20px rgba(0, 0, 0, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 16px rgba(0, 0, 0, 0.05)";
                  }}
                  onClick={() => setDisputeType(DisputeType.ImproperPayment)}
                >
                  <h3
                    style={{
                      marginBottom: "10px",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    🔒 Improper Payment
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                      color: "#555",
                    }}
                  >
                    The content has been used or published without the creator's
                    permission or outside agreed terms.
                  </p>
                </div>
                <div
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "16px",
                    width: "50%",
                    padding: "20px",
                    background:
                      disputeType === DisputeType.ContentStandardsViolation
                        ? "linear-gradient(145deg, #d0f0ff, #aee6ff)"
                        : "linear-gradient(145deg, #ffffff, #f0f0f0)",
                    boxShadow:
                      disputeType === DisputeType.ContentStandardsViolation
                        ? "0 10px 24px rgba(0, 100, 200, 0.2)"
                        : "0 6px 16px rgba(0, 0, 0, 0.05)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 20px rgba(0, 0, 0, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 16px rgba(0, 0, 0, 0.05)";
                  }}
                  onClick={() =>
                    setDisputeType(DisputeType.ContentStandardsViolation)
                  }
                >
                  <h3
                    style={{
                      marginBottom: "10px",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    🔒 Content Standards Violation
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                      color: "#555",
                    }}
                  >
                    The content has been used or published without the creator's
                    permission or outside agreed terms.
                  </p>
                </div>
              </div>
              {disputeButton && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={raiseDispute}
                    disabled={!disputeButton}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: disputeButton ? "#0070f3" : "#ccc",
                      color: disputeButton ? "#fff" : "#666",
                      border: "none",
                      borderRadius: "8px",
                      cursor: disputeButton ? "pointer" : "not-allowed",
                      fontSize: "16px",
                      fontWeight: "bold",
                      transition:
                        "background-color 0.3s ease, transform 0.2s ease",
                      marginTop: "12px",
                    }}
                    onMouseEnter={(e) => {
                      if (disputeButton)
                        e.currentTarget.style.backgroundColor = "#005ad1";
                    }}
                    onMouseLeave={(e) => {
                      if (disputeButton)
                        e.currentTarget.style.backgroundColor = "#0070f3";
                    }}
                  >
                    Raise Dispute
                  </button>
                </div>
              )}
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
    </motion.div>
  );
}
