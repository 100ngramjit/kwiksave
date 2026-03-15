import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { detectPlatform, isValidUrl, fetchMediaInfo } from "../utils";
import MediaCard from "./MediaCard";

/* ── inline styles ── */
const s = {
  box: {
    borderRadius: "var(--radius)",
    padding: "32px",
    maxWidth: 1620,
    width: "100%",
    margin: "0 auto 60px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  inputRow: { display: "flex", gap: 12 },
  input: {
    flex: 1,
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "color-mix(in oklab, var(--glass-border), var(--primary) 75%)",
    borderRadius: "calc(var(--radius) / 1.2)",
    padding: "18px 24px",
    fontSize: 16,
    fontWeight: 500,
    color: "var(--foreground)",
    outline: "none",
    minWidth: 0,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  btn: {
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "none",
    borderRadius: "calc(var(--radius) / 1.2)",
    padding: "18px 36px",
    fontSize: 15,
    fontWeight: 700,
    whiteSpace: "nowrap",
    transition: "all 0.3s ease",
    cursor: "pointer",
    flexShrink: 0,
    boxShadow: "0 8px 16px rgba(var(--accent-rgb), 0.15)",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  detectRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    fontWeight: 600,
    color: "var(--muted-foreground)",
    marginTop: 16,
  },
  detectIcon: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 800,
    flexShrink: 0,
  },
  progressWrap: { marginTop: 24 },
  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    fontWeight: 700,
    color: "var(--muted-foreground)",
    marginBottom: 10,
  },
  progressTrack: {
    height: 10,
    background: "var(--muted)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "var(--primary)",
    borderRadius: 5,
    transition: "width .4s ease-out",
  },
  error: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255, 79, 79, 0.1)",
    border: "1px solid var(--destructive)",
    borderRadius: "calc(var(--radius) / 2)",
    padding: "14px 18px",
    marginTop: 20,
    fontSize: 13,
    fontWeight: 600,
    color: "var(--destructive)",
  },
};

export default function DownloadBox() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({ pct: 0, label: "" });
  const [error, setError] = useState("");
  const [mediaInfo, setMediaInfo] = useState(null);
  const inputRef = useRef();

  function handleUrlChange(e) {
    const val = e.target.value;
    setUrl(val);
    setError("");
    setMediaInfo(null);
    setPlatform(detectPlatform(val));
  }

  async function handleFetch(customUrl) {
    const targetUrl = typeof customUrl === "string" ? customUrl : url;

    setError("");
    setMediaInfo(null);

    if (!targetUrl.trim()) {
      setError("Please paste a supported media URL.");
      return;
    }

    const currentPlatform =
      typeof customUrl === "string" ? detectPlatform(targetUrl) : platform;

    if (!currentPlatform) {
      setError(
        "URL not recognized. Supported: YouTube, Instagram, X (Twitter), Facebook",
      );
      return;
    }

    if (typeof customUrl === "string") {
      setUrl(targetUrl);
      setPlatform(currentPlatform);
    }

    setLoading(true);
    setProgress({ pct: 0, label: "Initializing…" });

    try {
      const data = await fetchMediaInfo(targetUrl);
      setMediaInfo(data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleFetch();
  }

  const isUrlValid = url.trim() && platform;
  const isLocked = loading || isDownloading;

  return (
    <motion.div
      style={s.box}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={s.inputRow} className="input-row-mobile">
        <input
          ref={inputRef}
          style={{
            ...s.input,
            borderColor: error
              ? "var(--destructive)"
              : "color-mix(in oklab, var(--glass-border), var(--primary) 25%)",
            boxShadow: url ? "0 0 0 4px rgba(var(--accent-rgb), 0.15)" : "none",
            filter: isLocked ? "grayscale(0.5) opacity(0.7)" : "none",
            background: url
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(255, 255, 255, 0.05)",
          }}
          type="url"
          placeholder="Paste media link here…"
          value={url}
          onChange={handleUrlChange}
          onKeyDown={handleKeyDown}
          disabled={isLocked}
          readOnly={isLocked}
          autoComplete="off"
          spellCheck={false}
        />
        <motion.button
          whileHover={
            !isUrlValid || isLocked ? {} : { scale: 1.02, opacity: 0.9 }
          }
          whileTap={!isUrlValid || isLocked ? {} : { scale: 0.98 }}
          style={{
            ...s.btn,
            background: isLocked ? "var(--muted)" : "var(--primary)",
            color: isLocked
              ? "var(--muted-foreground)"
              : "var(--primary-foreground)",
            cursor: !isUrlValid || isLocked ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: !isUrlValid && !isLocked ? 0.6 : 1,
          }}
          onClick={handleFetch}
          disabled={!isUrlValid || isLocked}
        >
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{
                width: 18,
                height: 18,
                borderWidth: "2.5px",
                borderStyle: "solid",
                borderColor: "rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                borderRadius: "50%",
              }}
            />
          )}
          {loading ? "Analyzing..." : "Fetch"}
        </motion.button>
      </div>

      <AnimatePresence>
        {url && platform && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={s.detectRow}>
              {(platform === "youtube" || platform === "youtube_playlist") && (
                <>
                  <div
                    style={{
                      ...s.detectIcon,
                      background: "#ff0000",
                      color: "#fff",
                    }}
                  >
                    ▶
                  </div>
                  <span style={{ color: "var(--foreground)" }}>
                    {platform === "youtube_playlist"
                      ? "YouTube Playlist recognized"
                      : "YouTube recognized"}
                  </span>
                </>
              )}
              {platform === "instagram" && (
                <>
                  <div
                    style={{
                      ...s.detectIcon,
                      background:
                        "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                      color: "#fff",
                    }}
                  >
                    IG
                  </div>
                  <span style={{ color: "var(--foreground)" }}>
                    Instagram recognized
                  </span>
                </>
              )}
              {platform === "twitter" && (
                <>
                  <div
                    style={{
                      ...s.detectIcon,
                      background: "#1DA1F2",
                      color: "#fff",
                    }}
                  >
                    X
                  </div>
                  <span style={{ color: "var(--foreground)" }}>
                    X recognized
                  </span>
                </>
              )}
              {platform === "facebook" && (
                <>
                  <div
                    style={{
                      ...s.detectIcon,
                      background: "#1877F2",
                      color: "#fff",
                    }}
                  >
                    FB
                  </div>
                  <span style={{ color: "var(--foreground)" }}>
                    Facebook recognized
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={s.progressWrap}
          >
            <div style={s.progressTop}>
              <span>{progress.label}</span>
              <span>{progress.pct}%</span>
            </div>
            <div style={s.progressTrack}>
              <motion.div
                className="progress-shimmer"
                style={{ ...s.progressFill, width: `${progress.pct}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={s.error}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {mediaInfo && !loading && (
        <MediaCard
          info={mediaInfo}
          sourceUrl={url}
          isParentLocked={isLocked}
          onDownloadStateChange={setIsDownloading}
          onFetch={handleFetch}
        />
      )}
    </motion.div>
  );
}
