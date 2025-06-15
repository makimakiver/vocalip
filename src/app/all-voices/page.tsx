"use client";
import { useState } from "react";
import { ethers } from "ethers";
import storyContractAbi from "../../../StoryContractABI.json";
import AssetCard from "../components/AssetCard";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, Sparkles, List, RefreshCw } from "lucide-react";

export default function AllVoicesPage() {
  const contractAddress = "0x57A220322E44B7b42125d02385CC04816eDB5ec7";
  const STORY_RPC_URL = "https://aeneid.storyrpc.io";
  const readProvider = new ethers.JsonRpcProvider(STORY_RPC_URL);
  const storyContract = new ethers.Contract(
    contractAddress,
    storyContractAbi,
    readProvider
  );
  const [voices, setVoices] = useState<String[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchAllVoices = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get length of dynamic array 'assets' from storage slot 0
      const rawLen = await readProvider.getStorage(contractAddress, 0);
      const assetCount = Number(rawLen);
      if (!assetCount) {
        setVoices([]);
        setLoading(false);
        setHasLoaded(true);
        return;
      }
      const promises = [];
      for (let i = 0; i < assetCount; i++) {
        promises.push(storyContract.assets(i));
      }
      const results = await Promise.all(promises);
      setVoices(results);
      setHasLoaded(true);
    } catch (error) {
      let errorMsg = "Error fetching voices: ";
      if (error && typeof error === "object" && "message" in error) {
        errorMsg += (error as { message: string }).message;
      } else {
        errorMsg += String(error);
      }
      setError(errorMsg);
      setVoices([]);
    }
    setLoading(false);
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
          position: "relative",
          zIndex: 1,
          padding: "40px 20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "48px" }}
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
            <List size={20} color="#fbbf24" />
            <span style={{ color: "#fbbf24", fontWeight: "600" }}>
              Voice Collection
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
            Voice Marketplace
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "rgba(255, 255, 255, 0.7)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Explore and license voice NFTs from our growing collection
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "48px",
          }}
        >
          <motion.button
            onClick={fetchAllVoices}
            disabled={loading}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 32px rgba(251, 191, 36, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px 32px",
              backgroundImage: loading
                ? "linear-gradient(135deg, #718096, #4a5568)"
                : "linear-gradient(135deg, #fbbf24, #f59e0b)",
              color: "#fff",
              borderRadius: "50px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1.125rem",
              fontWeight: "600",
              boxShadow: "0 4px 16px rgba(251, 191, 36, 0.3)",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                {hasLoaded ? (
                  <>
                    <RefreshCw size={20} />
                    Refresh Voices
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Fetch Available Voices
                  </>
                )}
              </>
            )}

            {/* Shimmer effect */}
            {!loading && (
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
            )}
          </motion.button>
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderRadius: "16px",
                padding: "20px",
                textAlign: "center",
                marginBottom: "32px",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                maxWidth: "600px",
                margin: "0 auto 32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <AlertCircle size={24} color="#ef4444" />
                <p style={{ color: "#ef4444", margin: 0, fontWeight: "500" }}>
                  {error}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voices Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "100px 0",
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  border: "3px solid rgba(255, 255, 255, 0.1)",
                  borderTopColor: "#fbbf24",
                  borderRightColor: "#f59e0b",
                }}
              />
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  marginTop: "24px",
                  fontSize: "1.125rem",
                }}
              >
                Loading voices...
              </p>
            </motion.div>
          ) : voices.length > 0 ? (
            <motion.div
              key="voices"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))",
                gap: "24px",
              }}
            >
              {voices.map((voice, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <AssetCard assetId={voice[1]} creator={voice[0]} />
                </motion.div>
              ))}
            </motion.div>
          ) : hasLoaded ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                borderRadius: "24px",
                padding: "60px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  backgroundImage:
                    "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 32px",
                  border: "2px dashed rgba(251, 191, 36, 0.3)",
                }}
              >
                <List size={48} color="#fbbf24" />
              </motion.div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "1.75rem",
                  marginBottom: "16px",
                  fontWeight: "600",
                }}
              >
                No Voices Yet
              </h2>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "1.125rem",
                }}
              >
                Be the first to contribute to our voice collection!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              <p style={{ fontSize: "1.125rem" }}>
                Click "Fetch Available Voices" to explore available voices
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Section - shown when voices are loaded */}
        {voices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              marginTop: "60px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                padding: "24px 48px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.1)",
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
                {voices.length}
              </div>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "0.95rem",
                }}
              >
                Total Voices Available
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
