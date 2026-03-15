import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DownloadBox from "./DownloadBox";

const words = ["Facebook", "X", "Instagram", "YouTube"];

const s = {
  hero: {
    // FIXED CENTERING: flex container ensures perfect centering
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
    maxWidth: 900,
    width: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "var(--secondary)",
    border: "1px solid var(--border)",
    borderRadius: "20px",
    padding: "5px 14px",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--secondary-foreground)",
    marginBottom: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  dot: {
    width: 7,
    height: 7,
    background: "var(--primary)",
    borderRadius: "50%",
    boxShadow: "0 0 8px var(--primary)",
    flexShrink: 0,
  },
  h1: {
    // Restored simple text-align: center; removed flex column
    fontSize: "clamp(34px, 6vw, 68px)",
    fontWeight: 900,
    lineHeight: 1.1,
    letterSpacing: "-1.5px",
    marginBottom: 16,
    color: "var(--foreground)",
    textAlign: "center", // Explicit centering for safety
  },
  accentWrap: {
    display: "inline-block",
    position: "relative",
    minWidth: "clamp(120px, 30vw, 200px)",
    height: "1em",
    verticalAlign: "bottom",
    textAlign: "left", // Needed for the animated word to start at left
  },
  accent: {
    color: "var(--primary)",
    display: "inline-block",
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    whiteSpace: "nowrap",
  },
  sub: {
    fontSize: "clamp(14px, 2vw, 16px)",
    fontWeight: 500,
    color: "var(--muted-foreground)",
    maxWidth: 500,
    margin: "0 auto 32px",
    lineHeight: 1.6,
  },
  // Platforms section removed as per requirement
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { y: 18, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

const textVariants = {
  initial: { opacity: 0, y: 20, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -20, filter: "blur(4px)" },
};

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 1800);
    return () => clearInterval(intervalId);
  }, []);
  const iconMap = {
    X: (
      <svg
        width="clamp(32px, 4vw, 72px)"
        height="clamp(32px, 4vw, 72px)"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    Instagram: (
      <svg
        width="clamp(32px, 4vw, 72px)"
        height="clamp(32px, 4vw, 72px)"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="2" width="20" height="20" rx="4" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="18" cy="6" r="1.5" fill="#E1306C" />
      </svg>
    ),
    YouTube: (
      <svg
        width="clamp(32px, 4vw, 72px)"
        height="clamp(32px, 4vw, 72px)"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    Facebook: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="clamp(32px, 4vw, 72px)"
        height="clamp(32px, 4vw, 72px)"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
      </svg>
    ),
  };

  return (
    <section style={s.hero}>
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={s.badge}
      >
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={s.dot}
        />
        10M+ downloads · Free · No sign-up
      </motion.div>
      {/* Headline with social media logo (logo represents the platform) - doubled size */}
      <motion.h1
        style={{
          fontSize: "clamp(34px, 6vw, 68px)",
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: "-1.5px",
          marginBottom: 12,
          color: "var(--foreground)",
          textAlign: "center",
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
      >
        Export media from{" "}
        <div
          style={{
            color: "var(--primary)",
            display: "inline-flex",
            alignItems: "center",
            verticalAlign: "middle",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={words[index]}
              style={{ display: "flex", alignItems: "center" }}
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.45, ease: "easeInOut" }}
            >
              {iconMap[words[index]]}{" "}
              {/* Logo only - represents the platform */}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.h1>
      <motion.p
        style={{
          fontSize: "clamp(14px, 2vw, 16px)",
          fontWeight: 500,
          color: "var(--muted-foreground)",
          maxWidth: 480,
          margin: "8px auto 32px", // small top margin so it hugs the title
          lineHeight: 1.5,
          textAlign: "center",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        High‑quality. Instant. No hassle.
      </motion.p>
      {/* Platform Icons section removed as per requirement */}
      <DownloadBox />
    </section>
  );
}
