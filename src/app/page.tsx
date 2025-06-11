// app/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic,
  Image,
  FolderOpen,
  DollarSign,
  ArrowRight,
  Sparkles,
  Zap,
  Headphones,
  Volume2,
  Waves,
} from "lucide-react";

export default function HomePage() {
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        margin: 0,
        padding: 0,
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
            left: "5%",
            top: "10%",
            color: "rgba(251, 191, 36, 0.08)",
            delay: 0,
          },
          {
            size: 600,
            left: "80%",
            top: "20%",
            color: "rgba(59, 130, 246, 0.06)",
            delay: 1,
          },
          {
            size: 500,
            left: "60%",
            top: "70%",
            color: "rgba(236, 72, 153, 0.07)",
            delay: 2,
          },
          {
            size: 700,
            left: "20%",
            top: "60%",
            color: "rgba(34, 197, 94, 0.05)",
            delay: 3,
          },
          {
            size: 450,
            left: "40%",
            top: "30%",
            color: "rgba(168, 85, 247, 0.06)",
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

      {/* Floating particles */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            style={{
              position: "absolute",
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              left: `${(i * 5) % 100}%`,
              top: `${(i * 7) % 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <main
        style={{
          position: "relative",
          zIndex: 1,
          padding: "2rem 1rem",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)",
            backdropFilter: "blur(20px)",
            padding: "3rem 3rem",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            marginBottom: "4rem",
          }}
        >
          <section style={{ textAlign: "center", marginBottom: "2rem" }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                backgroundColor: "rgba(251, 191, 36, 0.2)",
                padding: "8px 20px",
                borderRadius: "50px",
                marginBottom: "2rem",
                border: "1px solid rgba(251, 191, 36, 0.3)",
              }}
            >
              <Sparkles size={20} color="#fbbf24" />
              <span style={{ color: "#fbbf24", fontWeight: "600" }}>
                Powered by Story Protocol
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: "4.5rem",
                fontWeight: "800",
                marginBottom: "1.5rem",
                backgroundImage:
                  "linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #ec4899 50%, #a855f7 75%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: "1.1",
              }}
            >
              Voice IP Marketplace
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                fontSize: "1.5rem",
                color: "rgba(255, 255, 255, 0.8)",
                maxWidth: "700px",
                margin: "0 auto 3rem",
                lineHeight: "1.6",
              }}
            >
              Transform your unique voice into a valuable NFT asset. License it
              for commercial use and earn automated revenue streams.
            </motion.p>
          </section>

          {/* Features Section */}
          <section
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            {[
              {
                icon: <Mic size={32} />,
                title: "Record & Upload",
                description:
                  "Capture your voice in-browser or upload an existing file and store it on IPFS.",
                color: "#fbbf24",
                bgGradient:
                  "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))",
              },
              {
                icon: <Image size={32} />,
                title: "Mint Your Voice NFT",
                description:
                  "Mint an ERC-721 token with your voice metadata and IPFS URI.",
                color: "#ec4899",
                bgGradient:
                  "linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.1))",
              },
              {
                icon: <FolderOpen size={32} />,
                title: "Manage Your Voices",
                description:
                  'View all your minted voice assets on the "My Voices" page.',
                color: "#a855f7",
                bgGradient:
                  "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.1))",
              },
              {
                icon: <DollarSign size={32} />,
                title: "Revenue Attribution",
                description:
                  "Automatically split and receive earnings whenever your voice is licensed.",
                color: "#10b981",
                bgGradient:
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2rem",
                  backgroundImage: feature.bgGradient,
                  backdropFilter: "blur(10px)",
                  borderRadius: "20px",
                  padding: "2rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Animated background accent */}
                <motion.div
                  style={{
                    position: "absolute",
                    top: "-50%",
                    right: "-20%",
                    width: "200px",
                    height: "200px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${feature.color}20 0%, transparent 70%)`,
                    filter: "blur(40px)",
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    fontSize: "2rem",
                    color: feature.color,
                    backgroundColor: `${feature.color}20`,
                    width: "80px",
                    height: "80px",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {feature.icon}
                </motion.div>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "1.75rem",
                      color: "#fff",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {i + 1}. {feature.title}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: "1.125rem",
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
                <motion.div
                  initial={{ opacity: 0.5 }}
                  whileHover={{ opacity: 1, x: 5 }}
                  style={{
                    marginLeft: "auto",
                    color: feature.color,
                  }}
                >
                  <ArrowRight size={28} />
                </motion.div>
              </motion.div>
            ))}
          </section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "4rem",
            }}
          >
            <Link href="/record" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(251, 191, 36, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #dc2626 100%)",
                  color: "#fff",
                  border: "none",
                  padding: "1.25rem 3rem",
                  borderRadius: "50px",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: "0 10px 30px rgba(251, 191, 36, 0.3)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>
                  Start Recording Now
                </span>
                <motion.div
                  animate={{
                    x: [0, 5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Mic size={24} />
                </motion.div>

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
                  animate={{
                    left: "100%",
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              </motion.button>
            </Link>
          </motion.section>
        </motion.div>

        {/* How it works section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          style={{
            marginTop: "4rem",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "3rem",
              fontWeight: "700",
              marginBottom: "3rem",
              color: "#fff",
            }}
          >
            How It Works
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              {
                icon: <Headphones />,
                title: "Record",
                desc: "30 seconds minimum",
                step: "01",
              },
              {
                icon: <Zap />,
                title: "Process",
                desc: "AI voice cloning",
                step: "02",
              },
              {
                icon: <Volume2 />,
                title: "Mint",
                desc: "Create your NFT",
                step: "03",
              },
              {
                icon: <Waves />,
                title: "Earn",
                desc: "Get paid for usage",
                step: "04",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                whileHover={{ y: -10 }}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "20px",
                  padding: "2rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "20px",
                    fontSize: "3rem",
                    fontWeight: "800",
                    color: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  {item.step}
                </div>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "16px",
                    backgroundImage:
                      "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                    color: "#fff",
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  style={{
                    color: "#fff",
                    fontSize: "1.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
