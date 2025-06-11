"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ethers } from "ethers";
import storyContractAbi from "../../../../../StoryContractABI.json";
import { useTomo, getWalletState } from "@tomo-inc/tomo-web-sdk";
import { useAccount, useWalletClient, useWriteContract } from "wagmi";
import { useMemo } from "react";
import {
  Upload,
  Camera,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Shield,
  DollarSign,
  FileAudio,
  User,
  Tag,
  FileText,
  Percent,
  Link2,
  Loader2,
  ChevronRight,
  Image as ImageIcon,
  File,
} from "lucide-react";

export default function PILTermsPage() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const STORY_RPC_URL = "https://aeneid.storyrpc.io";
  const readProvider = new ethers.JsonRpcProvider(STORY_RPC_URL);
  const storyContractAddress = "0x57A220322E44B7b42125d02385CC04816eDB5ec7";
  const { cid } = useParams();
  const router = useRouter();
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const { writeContract } = useWriteContract();
  // Voice Profile state
  const [voicePicture, setVoicePicture] = useState(null);
  const [voicePictureURL, setVoicePictureURL] = useState(null);
  const [voiceName, setVoiceName] = useState("");
  const [voiceCategory, setVoiceCategory] = useState("Generic");
  const [voiceDescription, setVoiceDescription] = useState("");
  const [commercialShare, setCommercialShare] = useState("");
  const [derivativeAttribution, setDerivativeAttribution] = useState(false);
  const [derivativeReciprocal, setDerivativeReciprocal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [defaultMintingFee, setDefaultMintingFee] = useState(0);
  const fileInputRef = useRef(null);

  // Clean up URL object on unmount or change
  useEffect(() => {
    return () => {
      if (voicePictureURL) URL.revokeObjectURL(voicePictureURL);
    };
  }, [voicePictureURL]);

  const useEthersSigner = async () => {
    console.log("handleVoiceSubmit");
    if (!walletClient) {
      console.log("No wallet client available");
      return null;
    }
    console.log("walletClient: ", walletClient);
    const provider = new ethers.BrowserProvider(walletClient);
    return provider.getSigner();
  };
  const triggerFileSelect = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVoicePicture(file);
      setVoicePictureURL(URL.createObjectURL(file));
    }
  };

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setVoicePicture(file);
      setVoicePictureURL(URL.createObjectURL(file));
    }
  };

  // This just toggles the payment pop-up
  const handlePayment = async () => {
    setShowLoadingPopup(true);
    const signer = useEthersSigner();
    // Await the signer since useEthersSigner returns a Promise
    const resolvedSigner = await signer;
    console.log("resolvedSigner: ", resolvedSigner);
    if (!resolvedSigner) {
      console.log("No signer available");
      console.error("No signer available");
      return;
    }
    console.log("handleVoiceSubmit");
    const tx = writeContract({
      abi: storyContractAbi,
      address: storyContractAddress as `0x${string}`,
      functionName: "registerPay",
      args: [],
      value: ethers.parseEther("1.0"),
    });
    setShowPaymentPopup(true);
    setShowLoadingPopup(false);
  };

  // Left here in case you want to call it manually somewhere else,
  // but it will not run automatically when the user clicks "Register Voice."
  const handleVoiceSubmit = async () => {
    setShowLoadingPopup(true);

    const voiceProfile = {
      voicePicture,
      voiceName,
      voiceCategory,
      voiceDescription,
      commercialShare,
      derivativeAttribution,
      derivativeReciprocal,
    };

    const ethereum = window.ethereum;
    if (
      voicePicture != null &&
      voicePicture != undefined &&
      voiceName != null &&
      voiceName != undefined &&
      voiceDescription != null &&
      voiceDescription != undefined &&
      commercialShare != null &&
      commercialShare != undefined
    ) {
      const form = new FormData();
      form.append("file", voicePicture, voicePicture.name);
      const response = await fetch("/api/photoupload", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      const cloningResponse = await fetch("/api/cloning", {
        method: "POST",
        body: JSON.stringify({ voiceCid: cid }),
      });
      const cloningData = await cloningResponse.json();
      const payload = {
        creator_address: walletClient?.account.address,
        imageCid: data.cid,
        voiceCid: cid,
        name: voiceName,
        description: voiceDescription,
        commercialShare: commercialShare,
        derivativeAttribution: derivativeAttribution,
        voiceId: cloningData.cid,
        defaultMintingFee: defaultMintingFee,
      };
      const registrationResponse = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const registrationData = await registrationResponse.json();
      console.log("registrationData: ", registrationData);
      console.log("Registration complete…");
      // Convert Wagmi walletClient.provider to ethers provider/signer
      const signer = useEthersSigner();
      // Await the signer since useEthersSigner returns a Promise
      const resolvedSigner = await signer;
      console.log("resolvedSigner: ", resolvedSigner);
      if (!resolvedSigner) {
        console.log("No signer available");
        console.error("No signer available");
        return;
      }
      console.log("handleVoiceSubmit");
      const tx = writeContract({
        abi: storyContractAbi,
        address: storyContractAddress as `0x${string}`,
        functionName: "registerVoice",
        args: [registrationData.ipId],
      });
      console.log("tx: ", tx);
      // Example: call a void function `registerVoice(address user)`
      console.log("On‐chain registration confirmed.");
      setRegistrationData(registrationData.link);
      setShowLoadingPopup(false);
      setShowPaymentPopup(false);
      setShowSuccessPopup(true);
      // Registration complete…
    }
  };

  // Calculate form completion percentage
  const calculateProgress = () => {
    let completed = 0;
    const total = 6;
    if (voicePicture) completed++;
    if (voiceName) completed++;
    if (voiceCategory) completed++;
    if (voiceDescription) completed++;
    if (commercialShare) completed++;
    if (derivativeAttribution || derivativeReciprocal) completed++;
    return (completed / total) * 100;
  };

  const progress = calculateProgress();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background elements */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {[
          {
            size: 400,
            left: "10%",
            top: "20%",
            color: "rgba(251, 191, 36, 0.05)",
            delay: 0,
          },
          {
            size: 600,
            left: "70%",
            top: "10%",
            color: "rgba(59, 130, 246, 0.04)",
            delay: 2,
          },
          {
            size: 500,
            left: "50%",
            top: "60%",
            color: "rgba(236, 72, 153, 0.05)",
            delay: 4,
          },
        ].map((orb, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              left: orb.left,
              top: orb.top,
              borderRadius: "50%",
              backgroundImage: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              filter: "blur(60px)",
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{
              duration: 20 + i * 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: orb.delay,
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "40px 20px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "40px" }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "rgba(251, 191, 36, 0.1)",
              padding: "8px 20px",
              borderRadius: "50px",
              marginBottom: "24px",
              border: "1px solid rgba(251, 191, 36, 0.2)",
            }}
          >
            <Shield size={20} color="#fbbf24" />
            <span style={{ color: "#fbbf24", fontWeight: "600" }}>
              Voice Registration
            </span>
          </motion.div>

          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "700",
              marginBottom: "16px",
              backgroundImage:
                "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #dc2626 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 40px rgba(251, 191, 36, 0.5)",
            }}
          >
            Complete Your Voice Profile
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "rgba(255, 255, 255, 0.7)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Set up your voice IP with licensing terms and metadata
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            marginBottom: "40px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "50px",
            padding: "4px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            style={{
              height: "12px",
              borderRadius: "50px",
              backgroundImage: "linear-gradient(90deg, #fbbf24, #f59e0b)",
              boxShadow: "0 0 20px rgba(251, 191, 36, 0.5)",
              position: "relative",
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
              }}
              animate={{ left: "100%" }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          </motion.div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              position: "absolute",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.875rem",
              fontWeight: "600",
            }}
          >
            {Math.round(progress)}% Complete
          </motion.span>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "40px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Removed onSubmit so handleVoiceSubmit won't fire automatically */}
          <form
            style={{ display: "flex", flexDirection: "column", gap: "32px" }}
          >
            {/* Picture Upload Section */}
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                  color: "#fff",
                  fontSize: "1.125rem",
                  fontWeight: "600",
                }}
              >
                <ImageIcon size={20} color="#fbbf24" />
                Voice Avatar
              </label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                style={{
                  border: dragActive
                    ? "2px solid #fbbf24"
                    : "2px dashed rgba(251, 191, 36, 0.3)",
                  borderRadius: "20px",
                  padding: "40px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: dragActive
                    ? "rgba(251, 191, 36, 0.05)"
                    : "rgba(255, 255, 255, 0.02)",
                  backgroundImage: voicePictureURL
                    ? `url(${voicePictureURL})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  minHeight: "200px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
              >
                {voicePictureURL ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "16px",
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(251, 191, 36, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid rgba(251, 191, 36, 0.5)",
                      }}
                    >
                      <Camera size={30} color="#fbbf24" />
                    </motion.div>
                    <p style={{ color: "#fff", fontWeight: "500" }}>
                      Click to change image
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Upload size={48} color="rgba(251, 191, 36, 0.6)" />
                    </motion.div>
                    <p
                      style={{
                        marginTop: "16px",
                        fontSize: "1.125rem",
                        color: "rgba(255, 255, 255, 0.8)",
                        fontWeight: "500",
                      }}
                    >
                      Drag & drop your image here
                    </p>
                    <p
                      style={{
                        color: "rgba(255, 255, 255, 0.5)",
                        fontSize: "0.875rem",
                        marginTop: "8px",
                      }}
                    >
                      or click to browse • PNG, JPG or GIF (max 2MB)
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </motion.div>
            </div>

            {/* Form Fields Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "24px",
              }}
            >
              {/* Voice Name */}
              <motion.div whileHover={{ scale: 1.02 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "12px",
                    color: "#fff",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                  }}
                >
                  <User size={18} color="#fbbf24" />
                  Voice Name
                </label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="Enter voice name"
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(251, 191, 36, 0.5)";
                    e.target.style.backgroundColor =
                      "rgba(255, 255, 255, 0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.target.style.backgroundColor =
                      "rgba(255, 255, 255, 0.05)";
                  }}
                />
              </motion.div>

              {/* Category */}
              <motion.div whileHover={{ scale: 1.02 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "12px",
                    color: "#fff",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                  }}
                >
                  <Tag size={18} color="#fbbf24" />
                  Category
                </label>
                <select
                  value={voiceCategory}
                  onChange={(e) => setVoiceCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "1rem",
                    outline: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(251, 191, 36, 0.5)";
                    e.target.style.backgroundColor =
                      "rgba(255, 255, 255, 0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.target.style.backgroundColor =
                      "rgba(255, 255, 255, 0.05)";
                  }}
                >
                  <option
                    value="Generic"
                    style={{ backgroundColor: "#1e1b4b" }}
                  >
                    Generic
                  </option>
                  <option
                    value="Narration"
                    style={{ backgroundColor: "#1e1b4b" }}
                  >
                    Narration
                  </option>
                  <option
                    value="Assistant"
                    style={{ backgroundColor: "#1e1b4b" }}
                  >
                    Assistant
                  </option>
                  <option
                    value="Character"
                    style={{ backgroundColor: "#1e1b4b" }}
                  >
                    Character
                  </option>
                  <option
                    value="Commercial"
                    style={{ backgroundColor: "#1e1b4b" }}
                  >
                    Commercial
                  </option>
                </select>
              </motion.div>
            </div>

            {/* Description */}
            <motion.div whileHover={{ scale: 1.01 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                  color: "#fff",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                }}
              >
                <FileText size={18} color="#fbbf24" />
                Description
              </label>
              <textarea
                value={voiceDescription}
                onChange={(e) => setVoiceDescription(e.target.value)}
                rows={4}
                placeholder="Describe the unique characteristics of this voice..."
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "1rem",
                  outline: "none",
                  resize: "vertical",
                  minHeight: "120px",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(251, 191, 36, 0.5)";
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                }}
              />
            </motion.div>

            {/* Licensing Section */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(236, 72, 153, 0.05))",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid rgba(168, 85, 247, 0.2)",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px",
                  color: "#fff",
                  fontSize: "1.25rem",
                  fontWeight: "600",
                }}
              >
                <DollarSign size={24} color="#a855f7" />
                Licensing Terms
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* Commercial Share */}
                <motion.div whileHover={{ scale: 1.02 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px",
                      color: "#fff",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                    }}
                  >
                    <Percent size={18} color="#a855f7" />
                    Commercial Revenue Share
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      value={commercialShare}
                      onChange={(e) => setCommercialShare(e.target.value)}
                      placeholder="20"
                      min="0"
                      max="100"
                      style={{
                        width: "100%",
                        padding: "14px 50px 14px 20px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "1rem",
                        outline: "none",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(168, 85, 247, 0.5)";
                        e.target.style.backgroundColor =
                          "rgba(255, 255, 255, 0.08)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                        e.target.style.backgroundColor =
                          "rgba(255, 255, 255, 0.05)";
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: "20px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(255, 255, 255, 0.5)",
                        fontSize: "1rem",
                      }}
                    >
                      %
                    </span>
                  </div>
                </motion.div>
                {/* Default Minting Fee */}
                <motion.div whileHover={{ scale: 1.02 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px",
                      color: "#fff",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                    }}
                  >
                    <File size={18} color="#a855f7" />
                    Default Minting Fee
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      value={defaultMintingFee}
                      onChange={(e) => setDefaultMintingFee(Number(e.target.value))}
                      placeholder="1"
                      min="0"
                      max="100"
                      style={{
                        width: "100%",
                        padding: "14px 50px 14px 20px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "1rem",
                        outline: "none",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(168, 85, 247, 0.5)";
                        e.target.style.backgroundColor =
                          "rgba(255, 255, 255, 0.08)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                        e.target.style.backgroundColor =
                          "rgba(255, 255, 255, 0.05)";
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: "20px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(255, 255, 255, 0.5)",
                        fontSize: "1rem",
                      }}
                    >
                      IP
                    </span>
                  </div>
                </motion.div>
                {/* Checkboxes */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <motion.label
                    whileHover={{ x: 4 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontSize: "0.95rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={derivativeAttribution}
                      onChange={(e) =>
                        setDerivativeAttribution(e.target.checked)
                      }
                      style={{
                        width: "20px",
                        height: "20px",
                        cursor: "pointer",
                        accentColor: "#a855f7",
                      }}
                    />
                    <Link2 size={18} color="#a855f7" />
                    <span>Require attribution for derivative works</span>
                  </motion.label>

                  <motion.label
                    whileHover={{ x: 4 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontSize: "0.95rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={derivativeReciprocal}
                      onChange={(e) =>
                        setDerivativeReciprocal(e.target.checked)
                      }
                      style={{
                        width: "20px",
                        height: "20px",
                        cursor: "pointer",
                        accentColor: "#a855f7",
                      }}
                    />
                    <Shield size={18} color="#a855f7" />
                    <span>Enable reciprocal licensing terms</span>
                  </motion.label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "24px",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Only opens payment pop-up; does NOT submit form */}
              <button
                type="button"
                onClick={handlePayment}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "18px 48px",
                  backgroundImage: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  color: "#fff",
                  borderRadius: "50px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  boxShadow: "0 8px 24px rgba(251, 191, 36, 0.4)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>
                  Register Voice
                </span>
                <ChevronRight size={24} />

                {/* Shimmer effect */}
                <motion.div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                  }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentPopup && (
          <>
            {/* BACKDROP: covers entire viewport */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentPopup(false)}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "blur(10px)",
                zIndex: 20,
              }}
            />

            {/* MODAL: also covers entire viewport, but uses flex centering */}
            <motion.div
              key="payment-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 30,
              }}
            >
              <div
                style={{
                  backgroundColor: "#1e1b4b",
                  backgroundImage: "linear-gradient(135deg, #1e1b4b, #312e81)",
                  borderRadius: "24px",
                  padding: "40px",
                  width: "90%",
                  maxWidth: "500px",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                  textAlign: "center",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  position: "relative",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPaymentPopup(false)}
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "8px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  <X size={24} color="rgba(255, 255, 255, 0.6)" />
                </motion.button>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundImage:
                      "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                    boxShadow: "0 0 40px rgba(251, 191, 36, 0.4)",
                  }}
                >
                  <DollarSign size={40} color="#fff" />
                </motion.div>

                <h2
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: "700",
                    color: "#fff",
                    marginBottom: "16px",
                  }}
                >
                  Complete Your Payment
                </h2>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    marginBottom: "32px",
                    fontSize: "1.125rem",
                    lineHeight: "1.6",
                  }}
                >
                  To register your voice IP asset, please pay with IP Token.
                </p>

                <div
                  style={{
                    backgroundColor: "rgba(251, 191, 36, 0.1)",
                    borderRadius: "16px",
                    padding: "20px",
                    marginBottom: "32px",
                    border: "1px solid rgba(251, 191, 36, 0.2)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "700",
                      color: "#fbbf24",
                      marginBottom: "8px",
                    }}
                  >
                    1 IP
                  </div>
                  <div
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "0.95rem",
                    }}
                  >
                    Registration Fee
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    justifyContent: "center",
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPaymentPopup(false)}
                    style={{
                      flex: 1,
                      padding: "14px 32px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "50px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 8px 24px rgba(251, 191, 36, 0.5)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // If you want to submit after payment, call handleVoiceSubmit() here:
                      handleVoiceSubmit();
                      // console.log('Redirecting to IP Token checkout…')
                    }}
                    style={{
                      flex: 1,
                      padding: "14px 32px",
                      backgroundImage:
                        "linear-gradient(135deg, #fbbf24, #f59e0b)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "600",
                      boxShadow: "0 4px 16px rgba(251, 191, 36, 0.3)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Pay Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessPopup && (
          <>
            {/* Backdrop */}
            <motion.div
              key="success-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "blur(10px)",
                zIndex: 50,
              }}
            />

            {/* Success Modal */}
            <motion.div
              key="success-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 60,
              }}
            >
              <div
                style={{
                  backgroundColor: "#1e1b4b",
                  backgroundImage: "linear-gradient(135deg, #1e1b4b, #312e81)",
                  borderRadius: "24px",
                  padding: "40px",
                  width: "90%",
                  maxWidth: "500px",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                  textAlign: "center",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* Confetti animation */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                    borderRadius: "24px",
                  }}
                >
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      style={{
                        position: "absolute",
                        width: "10px",
                        height: "10px",
                        backgroundColor: [
                          "#fbbf24",
                          "#f59e0b",
                          "#ec4899",
                          "#a855f7",
                          "#3b82f6",
                        ][i % 5],
                        borderRadius: "2px",
                        left: `${Math.random() * 100}%`,
                        top: "-10px",
                      }}
                      animate={{
                        y: [0, 600],
                        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                        opacity: [1, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        delay: Math.random() * 0.5,
                        ease: "linear",
                      }}
                    />
                  ))}
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundImage:
                      "linear-gradient(135deg, #10b981, #059669)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                    boxShadow: "0 0 40px rgba(16, 185, 129, 0.4)",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Check size={40} color="#fff" strokeWidth={3} />
                </motion.div>

                <h2
                  style={{
                    fontSize: "2rem",
                    fontWeight: "700",
                    color: "#fff",
                    marginBottom: "16px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  Registration Successful!
                </h2>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    marginBottom: "32px",
                    fontSize: "1.125rem",
                    lineHeight: "1.6",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  Your voice has been successfully registered as an IP asset on
                  Story Protocol.
                </p>

                {registrationData && (
                  <motion.a
                    href={registrationData}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#fbbf24",
                      textDecoration: "none",
                      marginBottom: "24px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    View your voice profile
                    <ChevronRight size={20} />
                  </motion.a>
                )}

                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 8px 24px rgba(16, 185, 129, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowSuccessPopup(false);
                    router.push("/");
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 32px",
                    backgroundImage:
                      "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    borderRadius: "50px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Sparkles size={20} />
                  Go to Homepage
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Loading Modal */}
      <AnimatePresence>
        {showLoadingPopup && (
          <motion.div
            key="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(10px)",
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
                gap: "24px",
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Spinner */}
              <motion.div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  border: "3px solid rgba(255, 255, 255, 0.1)",
                  borderTopColor: "#fbbf24",
                  borderRightColor: "#f59e0b",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />

              <motion.span
                style={{
                  color: "white",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  textAlign: "center",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                Processing Registration...
              </motion.span>

              <motion.p
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "0.95rem",
                  textAlign: "center",
                  maxWidth: "300px",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Please wait while we register your voice on the blockchain
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
