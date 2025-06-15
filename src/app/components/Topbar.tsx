// app/components/Topbar.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ConnectButton } from "@tomo-inc/tomo-evm-kit";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Mic, Home, List, Info, Grid3X3, Sparkles } from "lucide-react";

export default function Topbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Home", href: "/", icon: <Home size={18} /> },
    {
      label: "Voice Marketplace",
      href: "/all-voices",
      icon: <List size={18} />,
    },
    { label: "Apps", href: "/apps", icon: <Grid3X3 size={18} /> },
    { label: "Record", href: "/record", icon: <Mic size={18} /> },
    { label: "My Voices", href: "/my-voices", icon: <Sparkles size={18} /> },
    {
      label: "About",
      href: "https://spiny-elderberry-76f.notion.site/Voice-as-an-IP-assets-1fd1ff50043d8013bdeec147323122a9?pvs=74",
      icon: <Info size={18} />,
    },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "1rem 2rem",
        transition: "all 0.3s ease",
      }}
    >
      <motion.div
        animate={{
          backgroundColor: scrolled
            ? "rgba(30, 27, 75, 0.95)"
            : "rgba(30, 27, 75, 0.1)",
          backdropFilter: scrolled
            ? "blur(20px) saturate(150%)"
            : "blur(8px) saturate(120%)",
          borderColor: scrolled
            ? "rgba(251, 191, 36, 0.15)"
            : "rgba(251, 191, 36, 0.05)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(251, 191, 36, 0.05)"
            : "0 4px 16px rgba(0, 0, 0, 0.1)",
        }}
        style={{
          borderRadius: "24px",
          border: "1px solid",
          padding: "0.75rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          background: scrolled
            ? "linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(49, 46, 129, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(30, 27, 75, 0.1) 0%, rgba(49, 46, 129, 0.1) 100%)",
        }}
      >
        {/* Animated gradient accent line */}
        <motion.div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, #fbbf24, #f59e0b, transparent)",
            opacity: scrolled ? 0.8 : 0.3,
          }}
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Glow effects */}
        <div
          style={{
            position: "absolute",
            top: "-50%",
            left: "-20%",
            width: "40%",
            height: "200%",
            background:
              "radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)",
            filter: "blur(40px)",
            opacity: scrolled ? 0.6 : 0.3,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-50%",
            right: "-20%",
            width: "40%",
            height: "200%",
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
            filter: "blur(40px)",
            opacity: scrolled ? 0.6 : 0.3,
            pointerEvents: "none",
          }}
        />

        {/* Logo + Title */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              cursor: "pointer",
            }}
          >
            <motion.div
              style={{
                position: "relative",
                width: 50,
                height: 50,
              }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="/logo_black.png"
                alt="logo"
                width={50}
                height={50}
                style={{
                  borderRadius: "50%",
                  border: "2px solid rgba(251, 191, 36, 0.4)",
                  boxShadow:
                    "0 0 30px rgba(251, 191, 36, 0.4), inset 0 0 20px rgba(251, 191, 36, 0.2)",
                }}
              />
              {/* Rotating ring */}
              <motion.div
                style={{
                  position: "absolute",
                  inset: -4,
                  borderRadius: "50%",
                  border: "2px dotted rgba(251, 191, 36, 0.6)",
                  borderTopColor: "transparent",
                  borderBottomColor: "transparent",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                backgroundImage:
                  "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
                textShadow: "0 0 30px rgba(251, 191, 36, 0.5)",
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
              }}
            >
              Vocalip
            </span>
          </motion.div>
        </Link>

        {/* Nav Links */}
        <nav>
          <ul
            style={{
              display: "flex",
              gap: "0.5rem",
              listStyle: "none",
              margin: 0,
              padding: 0,
              alignItems: "center",
            }}
          >
            {links.map(({ label, href, icon }) => {
              const isActive =
                pathname === href ||
                (href !== "/" && pathname.startsWith(href));
              const isExternal = href.startsWith("http");

              return (
                <li key={href} style={{ position: "relative" }}>
                  <Link
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    onMouseEnter={() => setHoveredLink(href)}
                    onMouseLeave={() => setHoveredLink(null)}
                    style={{
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        position: "relative",
                        padding: "0.6rem 1rem",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        backgroundColor: isActive
                          ? "rgba(251, 191, 36, 0.1)"
                          : "transparent",
                        border: isActive
                          ? "1px solid rgba(251, 191, 36, 0.2)"
                          : "1px solid transparent",
                        transition: "all 0.3s ease",
                        overflow: "hidden",
                      }}
                    >
                      {/* Hover glow effect */}
                      <AnimatePresence>
                        {hoveredLink === href && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "radial-gradient(circle at center, rgba(251, 191, 36, 0.15) 0%, transparent 70%)",
                              pointerEvents: "none",
                            }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Icon */}
                      <motion.div
                        animate={{
                          color: isActive
                            ? "#fbbf24"
                            : "rgba(255, 255, 255, 0.8)",
                        }}
                        style={{
                          filter: isActive
                            ? "drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))"
                            : "none",
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {icon}
                      </motion.div>

                      {/* Label */}
                      <span
                        style={{
                          color: isActive
                            ? "#fbbf24"
                            : "rgba(255, 255, 255, 0.9)",
                          fontSize: "0.95rem",
                          fontWeight: isActive ? "600" : "500",
                          transition: "all 0.3s ease",
                          textShadow: isActive
                            ? "0 0 8px rgba(251, 191, 36, 0.5)"
                            : "none",
                        }}
                      >
                        {label}
                      </span>
                    </motion.div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Wallet Connect with custom styling */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: "relative",
          }}
        >
          <ConnectButton />
        </motion.div>
      </motion.div>
    </motion.header>
  );
}
