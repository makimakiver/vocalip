// app/apps/page.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Grid3X3, Video, Sparkles, ArrowRight, Play, Zap } from "lucide-react";

interface AppCard {
  title: string;
  image: string;
  description: string;
  link?: string;
  icon?: React.ReactNode;
  color: string;
  bgGradient: string;
}

const apps: AppCard[] = [
  {
    title: "Reel Video Creator",
    image: "/BrainRIP.png",
    description:
      "Create reels with voices on this platform and profits will be shared with you and the creator of the voice.",
    link: "/brain-rot",
    icon: <Video size={32} />,
    color: "#ec4899",
    bgGradient:
      "linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.1))",
  },
];

export default function AppListPage() {
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

      {/* Floating particles */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            style={{
              position: "absolute",
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              left: `${(i * 6.67) % 100}%`,
              top: `${(i * 5) % 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut",
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
            <Grid3X3 size={20} color="#fbbf24" />
            <span style={{ color: "#fbbf24", fontWeight: "600" }}>
              Voice-Powered Applications
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
            Explore dApps
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "rgba(255, 255, 255, 0.7)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Discover applications built on our voice IP marketplace
          </p>
        </motion.div>

        {/* Apps Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "32px",
            marginBottom: "80px",
          }}
        >
          {apps.map((app, index) => (
            <motion.div
              key={app.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(20px)",
                borderRadius: "24px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                transition: "all 0.3s ease",
              }}
            >
              {/* Card glow effect */}
              <motion.div
                style={{
                  position: "absolute",
                  top: "-50%",
                  right: "-20%",
                  width: "300px",
                  height: "300px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${app.color}15 0%, transparent 70%)`,
                  filter: "blur(60px)",
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

              {/* Image Section */}
              <div
                style={{
                  position: "relative",
                  height: "200px",
                  background: app.bgGradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <motion.img
                  src={app.image}
                  alt={app.title}
                  style={{
                    width: "120px",
                    height: "auto",
                    filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))",
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />

                {/* Icon overlay */}
                <motion.div
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    width: "50px",
                    height: "50px",
                    borderRadius: "16px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: app.color,
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  {app.icon || <Sparkles size={24} />}
                </motion.div>
              </div>

              {/* Content Section */}
              <div style={{ padding: "32px" }}>
                <h2
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: "700",
                    color: "#fff",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  {app.title}
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ color: app.color }}
                  >
                    <Zap size={20} />
                  </motion.span>
                </h2>

                <p
                  style={{
                    fontSize: "1.05rem",
                    lineHeight: 1.7,
                    color: "rgba(255, 255, 255, 0.7)",
                    marginBottom: "24px",
                  }}
                >
                  {app.description}
                </p>

                {app.link && (
                  <motion.a
                    href={app.link}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 28px",
                      borderRadius: "50px",
                      backgroundImage: `linear-gradient(135deg, ${app.color}, ${app.color}dd)`,
                      color: "#fff",
                      textDecoration: "none",
                      fontWeight: "600",
                      fontSize: "1rem",
                      boxShadow: `0 8px 24px ${app.color}40`,
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Play size={20} />
                    <span style={{ position: "relative", zIndex: 1 }}>
                      Launch App
                    </span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight size={20} />
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
                      animate={{ left: "100%" }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />
                  </motion.a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "60px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at center, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <h3
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              color: "#fff",
              marginBottom: "16px",
              position: "relative",
            }}
          >
            More Apps Coming Soon
          </h3>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "1.125rem",
              position: "relative",
            }}
          >
            We're building more exciting applications. Stay tuned!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
