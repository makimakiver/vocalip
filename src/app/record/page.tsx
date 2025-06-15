"use client";

import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  UploadCloud,
  X,
  CheckCircle,
  AlertCircle,
  Mic as Microphone,
  Play,
  StopCircle,
  ArrowLeft,
  Waves,
  Volume2,
  Shield,
  Headphones,
  ChevronRight,
  Sparkles,
} from "lucide-react";
// import * as Select from '@radix-ui/react-select'
// import SelectDemo from '../components/Select'

export default function VoiceRecorder() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recording, setRecording] = useState(false);
  const [passed, setPassed] = useState(false);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [armed, setArmed] = useState(false);
  const [currentCid, setCurrentCid] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const recorderRef = useRef<MediaRecorder>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setDragging] = useState(false);
  const [onFiles, setOnFiles] = useState<File[]>([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [inputLevel, setInputLevel] = useState(0); // 0–100 meter
  const audioAnalyserRef = useRef<AnalyserNode | null>(null); // reference to the analyser
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // THIS WAS MISSING
  const [isVisualizationRunning, setIsVisualizationRunning] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [recordingError, setRecordingError] = useState<string>("");
  const isRecordingRef = useRef(false); // Add ref to track recording state
  const waveformDataRef = useRef<number[]>([]); // Store waveform history

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  /**
   * Convert any Blob (e.g. from MediaRecorder) into a base64 string
   */
  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const removeFile = () => {
    setOnFiles((prev) => {
      const newFiles = prev.slice(0, -1);
      console.log("NewFiles", newFiles);
      return newFiles;
    });
  };

  // 2) sync fileUploaded whenever onFiles changes
  useEffect(() => {
    console.log("onFiles changed:", onFiles); // now you'll see the updated array
    setFileUploaded(onFiles.length > 0);
  }, [onFiles]);

  const validateAudioFile = (file: File): boolean => {
    const validTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/mp3",
      "audio/webm",
      "audio/ogg",
      "video/mp4",
      "video/webm",
    ];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid audio or video file");
      return false;
    }

    if (file.size > maxSize) {
      alert("File size must be less than 10MB");
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(validateAudioFile);
    if (validFiles.length > 0) {
      setOnFiles((prev) => [...prev, ...validFiles]);
      setFileUploaded(true);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    if (armed) return;

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith("audio/") || file.type.startsWith("video/")
    );

    const validFiles = files.filter(validateAudioFile);

    if (validFiles.length > 0) {
      setOnFiles((prev) => [...prev, ...validFiles]);
      setFileUploaded(true);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      isRecordingRef.current = false; // Set ref to false on cleanup
      // Clean up audio context and recorder on unmount
      if (audioContextRef.current) audioContextRef.current.close();
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Enhanced visualization with frequency bars
  const drawEnhancedVisualization = () => {
    if (
      !canvasRef ||
      !canvasRef.current ||
      !audioAnalyserRef.current ||
      !isRecordingRef.current
    ) {
      return;
    }

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const analyser = audioAnalyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;
    setInputLevel(Math.min(100, average));

    // Clear canvas with gradient
    const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1e1b4b");
    gradient.addColorStop(1, "#312e81");
    canvasCtx.fillStyle = gradient;
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw frequency bars
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

      // Create gradient for bars
      const barGradient = canvasCtx.createLinearGradient(
        0,
        canvas.height - barHeight,
        0,
        canvas.height
      );

      if (barHeight > canvas.height * 0.6) {
        // High levels - red/orange
        barGradient.addColorStop(0, "#ef4444");
        barGradient.addColorStop(0.5, "#f59e0b");
        barGradient.addColorStop(1, "#fbbf24");
      } else if (barHeight > canvas.height * 0.3) {
        // Medium levels - orange/yellow
        barGradient.addColorStop(0, "#f59e0b");
        barGradient.addColorStop(0.5, "#fbbf24");
        barGradient.addColorStop(1, "#facc15");
      } else {
        // Low levels - yellow
        barGradient.addColorStop(0, "#fbbf24");
        barGradient.addColorStop(1, "#fde047");
      }

      canvasCtx.fillStyle = barGradient;
      canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

      // Add glow effect for higher bars
      if (barHeight > canvas.height * 0.5) {
        canvasCtx.shadowBlur = 20;
        canvasCtx.shadowColor = "#fbbf24";
        canvasCtx.fillRect(
          x,
          canvas.height - barHeight,
          barWidth - 2,
          barHeight
        );
        canvasCtx.shadowBlur = 0;
      }

      x += barWidth;
    }

    // Add decorative elements
    canvasCtx.strokeStyle = "rgba(251, 191, 36, 0.2)";
    canvasCtx.lineWidth = 1;
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, canvas.height / 2);
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();

    // Recording indicator with pulse
    const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
    canvasCtx.fillStyle = "#ef4444";
    canvasCtx.beginPath();
    canvasCtx.arc(canvas.width - 30, 30, 12, 0, Math.PI * 2);
    canvasCtx.fill();

    // Pulse ring
    canvasCtx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
    canvasCtx.lineWidth = 3;
    canvasCtx.beginPath();
    canvasCtx.arc(canvas.width - 30, 30, 20 + pulse * 10, 0, Math.PI * 2);
    canvasCtx.stroke();

    if (isRecordingRef.current) {
      animationFrameRef.current = requestAnimationFrame(
        drawEnhancedVisualization
      );
    }
  };

  async function startRecording() {
    try {
      // Check if we're on HTTPS or localhost
      if (
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost"
      ) {
        setRecordingError(
          "Microphone access requires HTTPS.\n\nPlease access this site using HTTPS or run it on localhost."
        );
        setPassed(false);
        setShowModal(true);
        setRecording(false);
        setArmed(false);
        isRecordingRef.current = false; // Set ref to false
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: { ideal: 48000 },
          sampleSize: { ideal: 24 },
          channelCount: { ideal: 1 },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;

      // Set up audio analysis for visualization
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Resume audio context if it's suspended
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
        console.log("Audio context resumed");
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256; // Smaller for better performance
      analyser.smoothingTimeConstant = 0.3; // Lower for more responsive waveform
      source.connect(analyser);
      audioAnalyserRef.current = analyser;

      console.log("Audio analyser set up successfully");

      const mr = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 256_000,
      });

      recorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      // emit new dataavailable every 200ms for smoother real-time streaming
      mr.start(200);
      setRecording(true);
      isRecordingRef.current = true; // Set ref to true
      waveformDataRef.current = []; // Clear waveform history
      setRecordingError(""); // Clear any previous errors
      // reset & start counting
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

      // Start visualization after a small delay to ensure canvas is ready
      setTimeout(() => {
        setIsVisualizationRunning(true);
        setFrameCount(0);
        drawEnhancedVisualization();
      }, 100);
    } catch (error) {
      console.error("Error starting recording:", error);

      // More specific error handling
      let errorMessage = "";
      if (error instanceof DOMException) {
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          errorMessage =
            "Microphone access denied.\n\nTo fix this:\n1. Click the lock/info icon in your address bar\n2. Find 'Microphone' settings\n3. Change to 'Allow'\n4. Refresh the page and try again";
        } else if (error.name === "NotFoundError") {
          errorMessage =
            "No microphone found. Please connect a microphone and try again.";
        } else if (error.name === "NotReadableError") {
          errorMessage = "Microphone is already in use by another application.";
        } else {
          errorMessage = "Error accessing microphone: " + error.message;
        }
      } else {
        errorMessage = "Error starting recording. Please try again.";
      }
      setRecordingError(errorMessage);
      setPassed(false);
      setShowModal(true);

      // Reset states on error
      setRecording(false);
      setArmed(false);
      isRecordingRef.current = false; // Set ref to false
      setIsVisualizationRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  const handleNext = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setRecordingError(""); // Clear any previous errors
    const file = onFiles[0];
    console.log("File", file);
    if (file) {
      try {
        const form = new FormData();
        form.append("file", file, file.name);
        const res = await fetch("/api/recording", {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        const cid = await res.json();
        console.log("CID", cid.cid);
        setCurrentCid(cid.cid);
        setShowModal(true);
        setPassed(true);
      } catch (error) {
        console.error("Upload error:", error);
        setRecordingError(
          "Failed to upload the file. Please check your connection and try again."
        );
        setPassed(false);
        setShowModal(true);
      }
    } else {
      setRecordingError(
        "No file selected. Please select an audio file to upload."
      );
      setPassed(false);
      setShowModal(true);
    }
    setOnFiles([]);
  };

  const stopRecording = async () => {
    // Stop visualization
    setIsVisualizationRunning(false);
    isRecordingRef.current = false; // Set ref to false
    waveformDataRef.current = []; // Clear waveform data
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setInputLevel(0);

    // stop your MediaRecorder…
    console.log("Recording time:", recordingTime);

    if (recordingTime < 30) {
      console.log(
        `Recording is less than 30 seconds (was ${recordingTime} seconds)`
      );
      setRecording(false);
      isRecordingRef.current = false; // Set ref to false
      setPassed(false);
      setRecordingError(
        `Recording too short. You recorded ${recordingTime} seconds, but 30 seconds are required.`
      );
      setShowModal(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsVisualizationRunning(false);
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!recorderRef.current) return;
    console.log("Stopping recording");
    // stop & wait for final dataavailable
    recorderRef.current.onstop = async () => {
      // 3) build a single Blob
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });

      try {
        const form = new FormData();
        form.append("file", blob, "recording.webm");
        const res = await fetch("/api/recording", {
          method: "POST",
          body: blob,
        });

        if (!res.ok) {
          throw new Error("Recording upload failed");
        }

        const cid = await res.json();
        console.log("CID", cid.cid);
        setCurrentCid(cid.cid);

        setPassed(true);
        setShowModal(true);
      } catch (error) {
        console.error("Recording upload error:", error);
        setRecordingError(
          "Failed to upload the recording. Please check your connection and try again."
        );
        setPassed(false);
        setShowModal(true);
      }

      setRecording(false);
      isRecordingRef.current = false; // Set ref to false
    };
    recorderRef.current.stop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setRecording(false);
    isRecordingRef.current = false; // Set ref to false
  };

  // Updated function to go directly to registration
  const handleContinueToRegistration = () => {
    if (!currentCid) return;
    router.push(`/registration/${currentCid}/individual`);
  };

  // Get color for level
  const getMeterColor = (level: number) => {
    if (level < 30) return "#10b981"; // Green
    if (level < 70) return "#fbbf24"; // Yellow
    return "#ef4444"; // Red
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background elements */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {[
          { size: 300, left: "10%", top: "15%", opacity: 0.1, duration: 20 },
          { size: 400, left: "70%", top: "10%", opacity: 0.09, duration: 22 },
          { size: 500, left: "30%", top: "60%", opacity: 0.08, duration: 24 },
          { size: 600, left: "80%", top: "40%", opacity: 0.07, duration: 26 },
          { size: 700, left: "20%", top: "80%", opacity: 0.06, duration: 28 },
          { size: 800, left: "60%", top: "30%", opacity: 0.05, duration: 30 },
          { size: 900, left: "40%", top: "70%", opacity: 0.04, duration: 32 },
          { size: 1000, left: "90%", top: "50%", opacity: 0.03, duration: 34 },
        ].map((item, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              width: `${item.size}px`,
              height: `${item.size}px`,
              left: item.left,
              top: item.top,
              borderRadius: "50%",
              backgroundImage: `radial-gradient(circle, rgba(251, 191, 36, ${item.opacity}) 0%, transparent 70%)`,
              filter: "blur(40px)",
              willChange: "transform",
            }}
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -100, 100, 0],
              scale: [1, 1.5, 1, 1.2],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: "center",
            marginBottom: "48px",
          }}
        >
          <h1
            style={{
              fontSize: "4rem",
              fontWeight: "700",
              marginBottom: "16px",
              backgroundImage:
                "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #dc2626 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 40px rgba(251, 191, 36, 0.5)",
            }}
          >
            Instant Voice Clone
          </h1>
          <p
            style={{
              fontSize: "1.5rem",
              color: "rgba(255, 255, 255, 0.8)",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Create your unique voice IP asset with professional-grade recording
          </p>
        </motion.div>

        {/* Instruction Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
            width: "100%",
            maxWidth: "900px",
          }}
        >
          {[
            {
              icon: <Shield />,
              title: "Quiet Environment",
              description: "Find a noise-free space for optimal quality",
              color: "#10b981",
            },
            {
              icon: <Headphones />,
              title: "Quality Equipment",
              description: "Use a good microphone or headset",
              color: "#3b82f6",
            },
            {
              icon: <Waves />,
              title: "Consistent Voice",
              description: "Maintain steady tone and volume",
              color: "#f59e0b",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                padding: "24px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundImage: `linear-gradient(135deg, ${item.color}40, ${item.color}20)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                {React.cloneElement(item.icon, { size: 24, color: item.color })}
              </div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#fff",
                  marginBottom: "8px",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Model Selection */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' }}>
            AI Model:
          </span>
          <SelectDemo />
        </motion.div> */}

        {/* Main Recording/Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          onClick={() => {
            if (armed || recording) return;
            triggerFileSelect();
          }}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            backgroundColor: isDragging
              ? "rgba(251, 191, 36, 0.1)"
              : recording
              ? "rgba(239, 68, 68, 0.05)"
              : "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            borderStyle: recording ? "solid" : "dashed",
            borderWidth: "3px",
            borderColor: isDragging
              ? "#fbbf24"
              : recording
              ? "#ef4444"
              : "rgba(255, 255, 255, 0.2)",
            borderRadius: "24px",
            padding: recording ? "48px" : "0",
            minWidth: "900px",
            minHeight: recording ? "500px" : "400px",
            transition: "all 0.3s ease",
            cursor: armed || recording ? "default" : "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {!armed && !fileUploaded ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "400px",
                gap: "32px",
              }}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <UploadCloud size={80} style={{ color: "#fbbf24" }} />
              </motion.div>
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "1.5rem",
                    color: "#fff",
                    fontWeight: "500",
                  }}
                >
                  Drop your audio file here
                </p>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    marginTop: "8px",
                    fontSize: "1.125rem",
                  }}
                >
                  or click to browse • Max 10MB
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "32px",
                  color: "rgba(255, 255, 255, 0.5)",
                  margin: "16px 0",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>━━━━━━</span>
                <span style={{ fontSize: "1.25rem", fontWeight: "500" }}>
                  OR
                </span>
                <span style={{ fontSize: "1.25rem" }}>━━━━━━</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/mpeg, audio/wav, audio/mp3, video/mp4, video/webm"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </motion.div>
          ) : !armed && fileUploaded && onFiles ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: "32px",
                height: "400px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOnFiles([]);
                    setFileUploaded(false);
                  }}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                >
                  <ArrowLeft size={24} color="#fff" />
                </motion.button>
                <h2
                  style={{
                    color: "#fff",
                    fontSize: "1.5rem",
                    fontWeight: "600",
                  }}
                >
                  Selected Files
                </h2>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {onFiles.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          backgroundImage:
                            "linear-gradient(135deg, #fbbf24, #f59e0b)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Volume2 size={24} color="#fff" />
                      </div>
                      <div>
                        <p style={{ color: "#fff", fontWeight: "500" }}>
                          {file.name}
                        </p>
                        <p
                          style={{
                            color: "rgba(255, 255, 255, 0.6)",
                            fontSize: "0.875rem",
                          }}
                        >
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.2)",
                        border: "none",
                        borderRadius: "12px",
                        padding: "8px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <X size={20} color="#ef4444" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : recording ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "24px",
                height: "100%",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    fontSize: "5rem",
                    fontWeight: "700",
                    backgroundImage:
                      "linear-gradient(135deg, #ef4444, #dc2626)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: "16px",
                  }}
                >
                  {formatTime(recordingTime)}
                </motion.div>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "1.25rem",
                  }}
                >
                  Recording in progress...
                </p>
              </div>

              {/* Enhanced Audio Visualization */}
              <div
                style={{
                  width: "100%",
                  maxWidth: "700px",
                  position: "relative",
                }}
              >
                <canvas
                  ref={canvasRef}
                  width="700"
                  height="180"
                  style={{
                    width: "100%",
                    height: "180px",
                    borderRadius: "16px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    display: "block",
                    boxShadow: "0 0 40px rgba(251, 191, 36, 0.2)",
                  }}
                />

                {/* Level Meter */}
                <div
                  style={{
                    marginTop: "24px",
                    background: "rgba(0, 0, 0, 0.3)",
                    borderRadius: "8px",
                    padding: "6px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    style={{
                      height: "12px",
                      borderRadius: "6px",
                      backgroundImage: `linear-gradient(90deg, #10b981 0%, #fbbf24 50%, #ef4444 100%)`,
                      transformOrigin: "left",
                    }}
                    animate={{
                      scaleX: inputLevel / 100,
                    }}
                    transition={{ duration: 0.1 }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "12px",
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: "1rem",
                  }}
                >
                  <span>Input Level</span>
                  <span
                    style={{
                      color: getMeterColor(inputLevel),
                      fontWeight: "600",
                    }}
                  >
                    {inputLevel < 30
                      ? "Low"
                      : inputLevel < 70
                      ? "Good"
                      : "High"}{" "}
                    ({Math.round(inputLevel)}%)
                  </span>
                </div>
              </div>

              <p
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "1rem",
                  textAlign: "center",
                }}
              >
                Speak clearly and maintain consistent volume • Minimum 30
                seconds required
              </p>

              {/* Stop Recording Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  stopRecording();
                }}
                style={{
                  marginTop: "32px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "20px 48px",
                  backgroundImage: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "#fff",
                  borderRadius: "50px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  boxShadow: "0 8px 24px rgba(239, 68, 68, 0.4)",
                  transition: "all 0.3s ease",
                }}
              >
                Stop Recording
                <StopCircle size={28} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "32px",
                height: "400px",
                position: "relative",
              }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setArmed(false);
                }}
                style={{
                  position: "absolute",
                  top: "24px",
                  left: "24px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px",
                  cursor: "pointer",
                }}
              >
                <ArrowLeft size={24} color="#fff" />
              </motion.button>

              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "50%",
                  backgroundImage: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 60px rgba(251, 191, 36, 0.4)",
                }}
              >
                <Microphone size={64} color="#fff" />
              </motion.div>

              <div style={{ textAlign: "center" }}>
                <h2
                  style={{
                    color: "#fff",
                    fontSize: "1.75rem",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Ready to Record
                </h2>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: "1.125rem",
                  }}
                >
                  Click start when you're ready • Allow microphone access
                </p>
              </div>

              {/* Start Recording Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  startRecording();
                }}
                style={{
                  marginTop: "32px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "20px 48px",
                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  color: "#fff",
                  borderRadius: "50px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  boxShadow: "0 8px 24px rgba(251, 191, 36, 0.4)",
                  transition: "all 0.3s ease",
                }}
              >
                Start Recording
                <Play size={28} />
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Record Voice Button - shown when not armed */}
        {!armed && !fileUploaded && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setArmed(true)}
            style={{
              marginTop: "40px",
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "20px 48px",
              backgroundImage: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              color: "#fff",
              borderRadius: "50px",
              border: "none",
              cursor: "pointer",
              fontSize: "1.25rem",
              fontWeight: "600",
              boxShadow: "0 8px 24px rgba(251, 191, 36, 0.4)",
              transition: "all 0.3s ease",
            }}
          >
            Record Voice
            <Microphone size={28} />
          </motion.button>
        )}

        {/* Next Button */}
        {fileUploaded && !recording && !armed && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={onFiles.length === 0}
            style={{
              marginTop: "40px",
              padding: "16px 48px",
              backgroundImage:
                onFiles.length > 0
                  ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                  : "none",
              backgroundColor:
                onFiles.length > 0 ? "transparent" : "rgba(255, 255, 255, 0.1)",
              color: onFiles.length > 0 ? "#fff" : "rgba(255, 255, 255, 0.3)",
              borderRadius: "50px",
              fontWeight: "600",
              fontSize: "1.125rem",
              border: "none",
              cursor: onFiles.length > 0 ? "pointer" : "not-allowed",
              boxShadow:
                onFiles.length > 0
                  ? "0 8px 24px rgba(251, 191, 36, 0.4)"
                  : "none",
              transition: "all 0.3s ease",
            }}
          >
            Continue →
          </motion.button>
        )}
      </div>

      {/* Updated Modal - No more individual/company selection */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              backdropFilter: "blur(10px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                width: "90%",
                maxWidth: recordingError ? "500px" : "500px",
                backgroundColor: "#1e1b4b",
                backgroundImage: "linear-gradient(135deg, #1e1b4b, #312e81)",
                borderRadius: "24px",
                padding: "40px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setShowModal(false);
                  setRecordingError("");
                }}
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
                  backgroundImage: passed
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(135deg, #ef4444, #dc2626)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  boxShadow: `0 0 40px ${
                    passed
                      ? "rgba(16, 185, 129, 0.4)"
                      : "rgba(239, 68, 68, 0.4)"
                  }`,
                }}
              >
                {passed ? (
                  <CheckCircle size={40} color="#fff" />
                ) : (
                  <AlertCircle size={40} color="#fff" />
                )}
              </motion.div>

              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: "16px",
                }}
              >
                {passed ? "Voice Captured Successfully!" : "Recording Failed"}
              </h2>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  marginBottom: "32px",
                  whiteSpace: "pre-line",
                  lineHeight: "1.6",
                }}
              >
                {passed
                  ? "Your voice has been processed and is ready for registration. Click continue to set up your voice IP asset."
                  : recordingError || "Something went wrong. Please try again."}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  justifyContent: "center",
                }}
              >
                {passed ? (
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 8px 24px rgba(251, 191, 36, 0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleContinueToRegistration}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "16px 40px",
                      borderRadius: "50px",
                      backgroundImage:
                        "linear-gradient(135deg, #fbbf24, #f59e0b)",
                      border: "none",
                      cursor: "pointer",
                      color: "#fff",
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Sparkles size={24} />
                    Continue to Registration
                    <ChevronRight size={24} />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowModal(false);
                      setArmed(true);
                      setRecordingError("");
                    }}
                    style={{
                      padding: "14px 32px",
                      borderRadius: "50px",
                      backgroundImage:
                        "linear-gradient(135deg, #fbbf24, #f59e0b)",
                      border: "none",
                      cursor: "pointer",
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: "1.125rem",
                      boxShadow: "0 8px 24px rgba(251, 191, 36, 0.4)",
                      transition: "all 0.3s ease",
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
