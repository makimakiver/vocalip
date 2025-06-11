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
  Space,
} from "lucide-react";
import * as Select from "@radix-ui/react-select";
import SelectDemo from "../components/Select";

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
  const recorderRef = useRef<MediaRecorder>();
  const chunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext>();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isDragging, setDragging] = useState(false);
  const [onFiles, setOnFiles] = useState<File[]>([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [inputLevel, setInputLevel] = useState(0); // 0–255 meter
  const audioAnalyserRef = useRef<AnalyserNode | null>(null); // reference to the analyser
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
  const triggerFileSelect = () => fileInputRef.current?.click();
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
      // Clean up audio context and recorder on unmount
      if (audioContextRef.current) audioContextRef.current.close();
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    };
  }, []);

  async function startRecording() {
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
    // reset & start counting
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
  }

  const handleNext = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
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
        setPassed(false);
        setShowModal(true);
      }
    } else {
      setPassed(false);
      setShowModal(true);
    }
    setOnFiles([]);
  };

  const stopRecording = async () => {
    // stop your MediaRecorder…
    console.log("Timer", timerRef.current);

    if (recordingTime < 30) {
      console.log("Recording is less than 30 seconds");
      setRecording(false);
      setPassed(false);
      setShowModal(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
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

        // const res2 = await fetch('/api/humanValidation', {
        //   method: 'POST',
        //   body: JSON.stringify({ voiceCid: cid.cid }),
        // });
        // const text = await res2.json();
        // console.log('Text', text.text);
        // console.log('Similarity', text.similarity_score);
        // if (text.similarity_score > 0.8) {
        //   setPassed(true);
        // } else {
        //   setPassed(false);
        // }
        // 5) decode to AudioBuffer (PCM)
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }

        // audioContextRef.current.decodeAudioData(
        //   buf,
        //   (decoded) => {
        //     setAudioBuffer(decoded);
        //   },
        //   (err) => {
        //     console.error('decodeAudioData error', err);
        //   }
        // );

        setPassed(true);
        setShowModal(true);
      } catch (error) {
        console.error("Recording upload error:", error);
        setPassed(false);
        setShowModal(true);
      }

      setRecording(false);
    };
    recorderRef.current.stop();
    setRecording(false);
  };

  const handleSelection = (type: "individual" | "company") => {
    if (!currentCid) return;
    router.push(`/registration/${currentCid}/${type}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: "100px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: "8vh",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              color: "#2d3748",
              marginBottom: "16px",
            }}
          >
            Instant Voice Clone
          </h2>
        </div>
      </div>
      {/* Instruction Panel */}
      <div style={{ display: "flex", gap: "32px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <AlertCircle style={{ color: "#4a5568", marginTop: "4px" }} />
          <div>
            <h4 style={{ margin: 0, fontWeight: 500, color: "#2d3748" }}>
              Avoid noisy environments
            </h4>
            <p
              style={{
                margin: "4px 0 0",
                color: "#718096",
                fontSize: "0.875rem",
              }}
            >
              Background sounds interfere with recording quality.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <CheckCircle style={{ color: "#4a5568", marginTop: "4px" }} />
          <div>
            <h4 style={{ margin: 0, fontWeight: 500, color: "#2d3748" }}>
              Check microphone quality
            </h4>
            <p
              style={{
                margin: "4px 0 0",
                color: "#718096",
                fontSize: "0.875rem",
              }}
            >
              Use external or headphone mics for better capture.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <Microphone style={{ color: "#4a5568", marginTop: "4px" }} />
          <div>
            <h4 style={{ margin: 0, fontWeight: 500, color: "#2d3748" }}>
              Use consistent equipment
            </h4>
            <p
              style={{
                margin: "4px 0 0",
                color: "#718096",
                fontSize: "0.875rem",
              }}
            >
              Don't change equipment between samples.
            </p>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "32px",
          marginBottom: "24px",
          justifyContent: "center",
          width: "100%",
          marginLeft: "40vw",
        }}
      >
        <SelectDemo />
      </div>
      {/* Upload / Record Section */}
      <div
        onClick={() => {
          if (armed) {
            return;
          }
          triggerFileSelect();
        }}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: isDragging ? "2px dashed #3b82f6" : "2px dashed #cbd5e0",
          borderRadius: "12px",
          padding: !armed && fileUploaded && onFiles ? "0px" : "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          backgroundColor: isDragging ? "#eff6ff" : "#fff",
          marginBottom: "16px",
          minWidth: "600px",
          height: "200px",
          transition: "all 0.2s ease",
        }}
      >
        {!armed && !fileUploaded ? (
          <>
            <UploadCloud
              size={30}
              style={{ color: "#a0aec0", marginBottom: "12px" }}
            />
            <p style={{ margin: 0, color: "#4a5568" }}>
              Click to upload, or drag and drop
            </p>
            <p
              style={{
                margin: "4px 0 16px",
                color: "#a0aec0",
                fontSize: "0.875rem",
              }}
            >
              Audio or video, up to 10MB each
            </p>
            <span
              style={{
                color: "#a0aec0",
                fontSize: "0.875rem",
                marginBottom: "16px",
              }}
            >
              or
            </span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="audio/mpeg, audio/wav, audio/mp3, video/mp4, video/webm"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </>
        ) : !armed && fileUploaded && onFiles ? (
          <div
            style={{
              padding: "16px",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Back button sits at the left of the cell */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                textAlign: "left",
                width: "100%",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                borderRadius: "12px",
              }}
            >
              <motion.button
                onClick={() => {
                  setOnFiles([]);
                  setFileUploaded(false);
                }}
                whileHover={{ scale: 1.05 }}
                style={{
                  justifySelf: "start", // left-align
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                <ArrowLeft size={20} /> Back
              </motion.button>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "12px",
                  borderRadius: "12px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "#2d3748",
                  }}
                >
                  Selected Files
                </h3>
                <p
                  style={{
                    margin: "4px 0 12px",
                    fontSize: "0.875rem",
                    color: "#718096",
                  }}
                >
                  Click the × to remove any file
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "left",
                    width: "40%",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "12px",
                    borderRadius: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      maxHeight: "140px",
                      overflowY: "auto",
                    }}
                  >
                    {onFiles.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "8px 12px",
                          backgroundColor: "#EDF2F7",
                          borderRadius: "12px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginRight: "8px",
                          }}
                        >
                          <span
                            style={{ fontSize: "0.875rem", color: "#2d3748" }}
                          >
                            {f.name}
                          </span>
                          <span
                            style={{
                              marginLeft: "4px",
                              fontSize: "0.75rem",
                              color: "#718096",
                            }}
                          >
                            ({(f.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <X
                          size={16}
                          style={{ cursor: "pointer", color: "#A0AEC0" }}
                          onClick={() => removeFile()}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : recording ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "#2d3748",
                marginBottom: "16px",
              }}
            >
              Recording...
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "#2d3748",
                marginBottom: "16px",
              }}
            >
              {recordingTime} seconds
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <ArrowLeft
              size={24}
              style={{
                color: "#a0aec0",
                marginBottom: "12px",
                cursor: "pointer",
              }}
              onClick={() => setArmed(false)}
            />
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "#2d3748",
                marginBottom: "16px",
              }}
            >
              Uploading files?
            </div>
          </div>
        )}
        {!fileUploaded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!armed) {
                setArmed(true);
                return;
              }
              if (recording) {
                stopRecording();
              } else {
                startRecording();
              }
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 20px",
              backgroundColor: recording ? "#e53e3e" : "#38a169",
              color: "#fff",
              borderRadius: "24px",
              border: "none",
              cursor: "pointer",
              outline: "none",
              fontWeight: 600,
              marginTop: "auto",
            }}
          >
            {!armed ? (
              <>
                Record audio
                <Microphone style={{ marginLeft: "8px" }} />
              </>
            ) : recording ? (
              <>
                <StopCircle size={24} style={{ marginLeft: "8px" }} />
              </>
            ) : (
              <>
                <Play size={24} style={{ marginLeft: "8px" }} />
              </>
            )}
          </button>
        )}
      </div>

      {/* Footer Controls */}
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}
      >
        <input type="checkbox" id="tenSec" style={{ marginRight: "8px" }} />
        <label
          htmlFor="tenSec"
          style={{ color: "#4a5568", fontSize: "0.875rem" }}
        >
          10 seconds of audio required
        </label>
      </div>
      <button
        onClick={(e) => handleNext(e)}
        disabled={onFiles.length === 0} // see note below
        style={{
          padding: "12px 24px", // horizontal padding makes the button wide enough
          backgroundColor: onFiles.length != 0 ? "#3182ce" : "#cbd5e0",
          color: onFiles.length != 0 ? "#fff" : "#718096",
          borderRadius: "24px",
          fontWeight: 600,
          border: "none",
          cursor: onFiles.length != 0 ? "pointer" : "not-allowed",
          transition: "background-color 0.2s",
        }}
      >
        Next
      </button>

      {/* <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #e2e8f0, #f9fafb)',
        padding: '24px',
      }}
    > */}

      {/* Modal */}
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
                      onClick={() => handleSelection("individual")}
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
                      <Microphone style={{ marginRight: "8px" }} /> Individual
                    </motion.button>

                    <motion.button
                      onClick={() => handleSelection("company")}
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
                        backgroundColor: "#2f855a",
                      }}
                    >
                      <Microphone style={{ marginRight: "8px" }} /> Company
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    onClick={() => {
                      setShowModal(false);
                      startRecording();
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
    </div>
  );
}
