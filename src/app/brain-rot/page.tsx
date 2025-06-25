"use client";
import React, { useEffect, useState, useRef } from "react";
import { Player } from "@remotion/player";
import RemotionVideo from "../components/RemotionVideo";
import { ethers } from "ethers";
import storyContractAbi from "../../../StoryContractABI.json";
import { useAccount } from "wagmi";
import { Address } from "viem";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import VoiceSelection from "../components/VoiceSelection";
import {
  Video,
  Mic,
  Upload,
  X,
  Sparkles,
  ChevronRight,
  FileText,
  User,
  Tag,
  Play,
  Pause,
  SquareArrowOutUpRight,
  Download,
  Loader2,
} from "lucide-react";

interface single_word_recording {
  word: string;
  start: number;
  end: number;
}

function VideoPage() {
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoRegistered, setVideoRegistered] = useState<string | null>(null);
  const [videoDescription, setVideoDescription] = useState<string>("");
  const [creatorName, setCreatorName] = useState<string>("");
  const [configurationModal, setConfigurationModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [licenseTermsId, setLicenseTermsId] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState<string>("");
  const [caption, setCaption] = useState<single_word_recording[]>([]);
  const [durationFrames, setDurationFrames] = useState<number>(0);
  const [voiceUrl, setVoiceUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [voices, setVoices] = useState<any[]>([]);
  const [loadingVideoRegistered, setLoadingVideoRegistered] =
    useState<boolean>(false);
  const [videoDownloadUrl, setVideoDownloadUrl] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const contractAddress = "0x1065d627CF25c0380e8fF33F4c5b23C4826d6D17";
  const STORY_RPC_URL = "https://aeneid.storyrpc.io";
  const readProvider = new ethers.JsonRpcProvider(STORY_RPC_URL);
  const storyContract = new ethers.Contract(
    contractAddress,
    storyContractAbi,
    readProvider
  );
  const { address, isConnected } = useAccount();

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      // Get length of dynamic array 'assets' from storage slot 0
      const rawLen = await readProvider.getStorage(contractAddress, 0);

      const assetCount = Number(rawLen);
      if (!assetCount) {
        setVoices([]);
        return;
      }
      const promises: any[] = [];
      for (let i = 0; i < assetCount; i++) {
        const asset = await storyContract.assets(i);
        const assetId = asset[0].toString();
        const creator = asset[1].toString();
        promises.push([assetId, creator]);
      }
      setVoices(promises);
    } catch (error) {
      let errorMsg = "Error fetching voices: ";
      if (error && typeof error === "object" && "message" in error) {
        errorMsg += (error as { message: string }).message;
      } else {
        errorMsg += String(error);
      }
      console.log("errorMsg", errorMsg);
      setVoices([]);
    }
  };

  const generateVideo = async () => {
    if (!selectedVoice) {
      setShowVoiceModal(true);
      return;
    }
    if (!captionInput.trim()) {
      alert("Please enter a caption");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch("/api/voice_upload", {
        method: "POST",
        body: JSON.stringify({ caption: captionInput, assetId: selectedVoice }),
      });
      const caption_data = await response.json();

      setDurationFrames(
        Number((caption_data.single_word_recordings.at(-1).end * 30).toFixed(0))
      );
      setCaption(caption_data.single_word_recordings);
      setVoiceUrl(caption_data.link);
    } catch (err) {
      setMessage("❌ Failed to generate video.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportVideo = async () => {
    setIsExporting(true);
    setMessage("");
    try {
      const response = await fetch("/api/video_upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption,
          voiceUrl,
          voiceId: selectedVoice,
          licenseTermsId,
          creatorName: creatorName,
          creatorAddress: address,
          title: videoTitle,
          description: videoDescription,
        }),
      });

      // Check if the response is ok
      if (!response.ok) {
        const error = await response.json();
        console.error("Video upload error:", error);
        setMessage(
          `❌ Export failed: ${error.details || error.error || "Unknown error"}`
        );
        return;
      }

      const video_data = await response.json();

      // Check if we actually got an ipId
      if (!video_data.ipId) {
        console.error("No ipId returned from video upload:", video_data);
        setMessage("❌ Export failed: No IP ID returned");
        return;
      }

      console.log("Video registered successfully:", video_data);
      setMessage("✅ Video exported successfully!");
      setVideoRegistered(
        `https://aeneid.explorer.story.foundation/ipa/${video_data.ipId}`
      );
      setVideoDownloadUrl(video_data.link);
    } catch (err) {
      console.error("Export error:", err);
      setMessage(
        `❌ Export failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const downloadVideo = async () => {
    if (!videoDownloadUrl) return;

    setIsDownloading(true);
    try {
      const response = await fetch(videoDownloadUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${videoTitle || "video"}.mp4`;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download video");
    } finally {
      setIsDownloading(false);
    }
  };

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
          display: "flex",
          width: "100vw",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
          padding: "2rem",
          gap: "2rem",
        }}
      >
        {/* LEFT HALF */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "2.5rem",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}
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
              marginBottom: "1.5rem",
              border: "1px solid rgba(251, 191, 36, 0.2)",
              alignSelf: "flex-start",
            }}
          >
            <Video size={20} color="#fbbf24" />
            <span style={{ color: "#fbbf24", fontWeight: "600" }}>
              Reel Creator
            </span>
          </motion.div>

          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              marginBottom: "2rem",
              backgroundImage:
                "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #dc2626 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 40px rgba(251, 191, 36, 0.5)",
            }}
          >
            Reel Video Generator
          </h1>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "1rem",
              color: "#fff",
              fontSize: "1.125rem",
              fontWeight: "600",
            }}
          >
            <FileText size={20} color="#fbbf24" />
            Caption Text
          </label>
          <textarea
            rows={8}
            placeholder="Type a caption..."
            value={captionInput}
            onChange={(e) => setCaptionInput(e.target.value)}
            style={{
              padding: "1rem",
              borderRadius: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: "1.5rem",
              width: "100%",
              boxSizing: "border-box",
              color: "#fff",
              fontSize: "1rem",
              outline: "none",
              transition: "all 0.3s ease",
              resize: "vertical",
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

          {selectedVoice == null ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowVoiceModal(true)}
              disabled={isLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                padding: "1rem 2rem",
                borderRadius: "50px",
                backgroundImage: isLoading
                  ? "none"
                  : "linear-gradient(135deg, #fbbf24, #f59e0b)",
                backgroundColor: isLoading
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",
                color: "#fff",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                boxShadow: isLoading
                  ? "none"
                  : "0 8px 24px rgba(251, 191, 36, 0.4)",
                transition: "all 0.3s ease",
              }}
            >
              <Mic size={24} />
              {isLoading ? "Generating..." : "Select Voice"}
            </motion.button>
          ) : (
            <>
              <div
                style={{
                  backgroundColor: "rgba(251, 191, 36, 0.1)",
                  borderRadius: "12px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  border: "1px solid rgba(251, 191, 36, 0.2)",
                }}
              >
                <p
                  style={{
                    color: "#fbbf24",
                    fontWeight: "600",
                    margin: 0,
                  }}
                >
                  Selected Voice: {selectedVoice}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateVideo}
                disabled={isLoading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "1rem 2rem",
                  borderRadius: "50px",
                  backgroundImage: isLoading
                    ? "none"
                    : "linear-gradient(135deg, #3182ce, #2563eb)",
                  backgroundColor: isLoading
                    ? "rgba(255, 255, 255, 0.1)"
                    : "transparent",
                  color: "#fff",
                  border: "none",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  boxShadow: isLoading
                    ? "none"
                    : "0 8px 24px rgba(49, 130, 206, 0.4)",
                  transition: "all 0.3s ease",
                }}
              >
                <Play size={24} />
                Generate Video
              </motion.button>
            </>
          )}

          {caption.length > 0 && (
            <>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setConfigurationModal(true)}
                disabled={isExporting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "1rem 2rem",
                  borderRadius: "50px",
                  backgroundImage: isExporting
                    ? "none"
                    : "linear-gradient(135deg, #10b981, #059669)",
                  backgroundColor: isExporting
                    ? "rgba(255, 255, 255, 0.1)"
                    : "transparent",
                  color: "#fff",
                  border: "none",
                  cursor: isExporting ? "not-allowed" : "pointer",
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  boxShadow: isExporting
                    ? "none"
                    : "0 8px 24px rgba(16, 185, 129, 0.4)",
                  transition: "all 0.3s ease",
                }}
              >
                <Upload size={24} />
                {isExporting ? "Exporting..." : "Export Video"}
              </motion.button>

              {videoDownloadUrl && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadVideo}
                  disabled={isDownloading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "1rem 2rem",
                    borderRadius: "50px",
                    backgroundImage: isDownloading
                      ? "none"
                      : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    backgroundColor: isDownloading
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                    color: "#fff",
                    border: "none",
                    cursor: isDownloading ? "not-allowed" : "pointer",
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                    boxShadow: isDownloading
                      ? "none"
                      : "0 8px 24px rgba(139, 92, 246, 0.4)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Download size={24} />
                  {isDownloading ? "Downloading..." : "Download Video"}
                </motion.button>
              )}
            </>
          )}

          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: "auto",
                color: message.startsWith("❌") ? "#ef4444" : "#10b981",
                fontWeight: 600,
                fontSize: "1.125rem",
                textAlign: "center",
                padding: "1rem",
                backgroundColor: message.startsWith("❌")
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(16, 185, 129, 0.1)",
                borderRadius: "12px",
                border: `1px solid ${
                  message.startsWith("❌")
                    ? "rgba(239, 68, 68, 0.2)"
                    : "rgba(16, 185, 129, 0.2)"
                }`,
              }}
            >
              {message}
            </motion.p>
          )}
        </motion.div>

        {/* RIGHT HALF */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            flex: 1,
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}
        >
          {caption.length > 0 ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
              }}
            >
              <Player
                component={RemotionVideo}
                durationInFrames={durationFrames}
                compositionWidth={400}
                compositionHeight={600}
                fps={30}
                inputProps={{ caption, voiceUrl }}
                controls
              />
            </motion.div>
          ) : (
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                width: "400px",
                height: "600px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                border: "2px dashed rgba(255, 255, 255, 0.1)",
              }}
            >
              <Video size={48} color="rgba(255, 255, 255, 0.3)" />
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  fontSize: "1.125rem",
                  textAlign: "center",
                  padding: "0 2rem",
                }}
              >
                No video generated yet
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Loading Overlay for Video Generation */}
      <AnimatePresence>
        {isLoading && (
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
                padding: "40px",
                backgroundColor: "rgba(30, 27, 75, 0.9)",
                borderRadius: "24px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Animated spinner */}
              <motion.div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "4px solid rgba(255, 255, 255, 0.1)",
                  borderTopColor: "#fbbf24",
                  borderRightColor: "#f59e0b",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />

              <motion.h3
                style={{
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  textAlign: "center",
                  margin: 0,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Generating Your Video
              </motion.h3>

              <motion.p
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "1rem",
                  textAlign: "center",
                  maxWidth: "300px",
                  margin: 0,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Processing voice synthesis and creating caption timing...
              </motion.p>

              {/* Progress dots */}
              <div style={{ display: "flex", gap: "8px" }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#fbbf24",
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay for Video Export */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            key="export-loading-overlay"
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
                padding: "40px",
                backgroundColor: "rgba(30, 27, 75, 0.9)",
                borderRadius: "24px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Animated spinner */}
              <motion.div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "4px solid rgba(255, 255, 255, 0.1)",
                  borderTopColor: "#10b981",
                  borderRightColor: "#059669",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />

              <motion.h3
                style={{
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  textAlign: "center",
                  margin: 0,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Exporting Your Video
              </motion.h3>

              <motion.p
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "1rem",
                  textAlign: "center",
                  maxWidth: "350px",
                  margin: 0,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Creating video file, uploading to IPFS, and registering on Story
                Protocol. This may take a moment...
              </motion.p>

              {/* Progress dots */}
              <div style={{ display: "flex", gap: "8px" }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3) AnimatePresence Voice-Model Modal */}
      <AnimatePresence>
        {showVoiceModal && (
          <motion.div
            key="voice-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              style={{
                backgroundColor: "#1e1b4b",
                borderRadius: "16px",
                padding: "1.5rem",
                width: "90%",
                maxWidth: "800px",
                maxHeight: "80vh",
                overflowY: "auto",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  Select Voice
                </h2>
                <button
                  onClick={() => setShowVoiceModal(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: "1.5rem",
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {voices.map((voice) => (
                  <VoiceSelection
                    key={voice[1]}
                    assetId={voice[1]}
                    creator={voice[0]}
                    setSelectedVoice={setSelectedVoice}
                    setShowModalInside={setShowVoiceModal}
                    setLicenseTermsId={setLicenseTermsId}
                  />
                ))}
              </div>
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
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 150,
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              style={{
                backgroundColor: "#1e1b4b",
                backgroundImage: "linear-gradient(135deg, #1e1b4b, #312e81)",
                borderRadius: "24px",
                padding: "2.5rem",
                width: "90%",
                maxWidth: "500px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: "700",
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  Video Configuration
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setConfigurationModal(false)}
                  style={{
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
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#fff",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                  }}
                >
                  <Tag size={18} color="#fbbf24" />
                  Title
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Enter video title"
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
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
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#fff",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                  }}
                >
                  <FileText size={18} color="#fbbf24" />
                  Description
                </label>
                <textarea
                  rows={4}
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Enter description..."
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    fontSize: "1rem",
                    outline: "none",
                    resize: "vertical",
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
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#fff",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                  }}
                >
                  <User size={18} color="#fbbf24" />
                  Creator's Name
                </label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
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
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConfigurationModal(false)}
                  style={{
                    padding: "0.75rem 2rem",
                    borderRadius: "50px",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "rgba(255, 255, 255, 0.8)",
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    exportVideo();
                    setConfigurationModal(false);
                  }}
                  disabled={!videoTitle.trim() || !creatorName.trim()}
                  style={{
                    padding: "0.75rem 2rem",
                    borderRadius: "50px",
                    backgroundImage:
                      videoTitle.trim() && creatorName.trim()
                        ? "linear-gradient(135deg, #10b981, #059669)"
                        : "none",
                    backgroundColor:
                      videoTitle.trim() && creatorName.trim()
                        ? "transparent"
                        : "rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    border: "none",
                    cursor:
                      videoTitle.trim() && creatorName.trim()
                        ? "pointer"
                        : "not-allowed",
                    fontWeight: 600,
                    boxShadow:
                      videoTitle.trim() && creatorName.trim()
                        ? "0 8px 24px rgba(16, 185, 129, 0.4)"
                        : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  Save & Export
                </motion.button>
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
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(10, 0, 30, 0.85)",
              backdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              style={{
                backgroundColor: "#1e1b4b",
                backgroundImage: "linear-gradient(135deg, #1e1b4b, #312e81)",
                border: "2px solid rgba(111, 0, 255, 0.3)",
                boxShadow:
                  "0 0 40px rgba(111, 0, 255, 0.4), inset 0 0 20px rgba(0, 255, 240, 0.1)",
                borderRadius: "24px",
                padding: "3rem",
                maxWidth: "450px",
                width: "90%",
                color: "#e0e0ff",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Success animation background */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  overflow: "hidden",
                  borderRadius: "24px",
                }}
              >
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    style={{
                      position: "absolute",
                      width: "6px",
                      height: "6px",
                      backgroundColor: [
                        "#fbbf24",
                        "#f59e0b",
                        "#10b981",
                        "#3b82f6",
                      ][i % 4],
                      borderRadius: "50%",
                      left: `${Math.random() * 100}%`,
                      top: "-10px",
                    }}
                    animate={{
                      y: [0, 500],
                      opacity: [1, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      delay: Math.random() * 0.5,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundImage: "linear-gradient(135deg, #10b981, #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  boxShadow: "0 0 40px rgba(16, 185, 129, 0.5)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Sparkles size={40} color="#fff" />
              </motion.div>

              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: "1rem",
                  textShadow: "0 0 20px rgba(0, 255, 240, 0.5)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Video Registered!
              </h1>

              <p
                style={{
                  fontSize: "1.125rem",
                  color: "rgba(255, 255, 255, 0.8)",
                  marginBottom: "2rem",
                  lineHeight: 1.6,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Your video has been successfully registered on Story Protocol
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open(videoRegistered, "_blank")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "1rem",
                    backgroundImage:
                      "linear-gradient(135deg, #3b82f6, #2563eb)",
                    borderRadius: "16px",
                    border: "none",
                    color: "#fff",
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  View on Explorer
                  <SquareArrowOutUpRight size={20} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadVideo}
                  disabled={isDownloading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "1rem",
                    backgroundImage: isDownloading
                      ? "none"
                      : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    backgroundColor: isDownloading
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                    borderRadius: "16px",
                    border: "none",
                    color: "#fff",
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    cursor: isDownloading ? "not-allowed" : "pointer",
                    boxShadow: isDownloading
                      ? "none"
                      : "0 8px 24px rgba(139, 92, 246, 0.4)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Download size={20} />
                  {isDownloading ? "Downloading..." : "Download Video"}
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setVideoRegistered(null)}
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
                  zIndex: 2,
                }}
              >
                <X size={24} color="rgba(255, 255, 255, 0.6)" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VideoPage;
