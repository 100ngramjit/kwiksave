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
  inputWrapper: {
    position: "relative",
    flex: 1,
    display: "flex",
    alignItems: "center",
  },
  inputRow: { display: "flex", gap: 12, alignItems: "center" },
  input: {
    width: "100%",
    background: "rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(0, 0, 0, 0.4)",
    borderRadius: "20px",
    padding: "20px 28px",
    paddingRight: "100px",
    fontSize: 17,
    fontWeight: 500,
    color: "var(--foreground)",
    outline: "none",
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
    boxShadow:
      "inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 1px rgba(255,255,255,0.05)",
  },
  pasteBtn: {
    position: "absolute",
    right: 12,
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(0, 0, 0, 0.3)",
    color: "var(--foreground)",
    padding: "8px 16px",
    borderRadius: "12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow:
      "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.1)",
    transition: "all 0.2s",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
  },
  btn: {
    background: "var(--primary)",
    backgroundImage:
      "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)",
    color: "var(--primary-foreground)",
    border: "1px solid rgba(0, 0, 0, 0.3)",
    borderRadius: "calc(var(--radius) / 1.2)",
    padding: "18px 36px",
    fontSize: 15,
    fontWeight: 700,
    whiteSpace: "nowrap",
    transition: "all 0.3s ease",
    cursor: "pointer",
    flexShrink: 0,
    boxShadow:
      "0 10px 20px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.3)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    textShadow: "0 -1px 0 rgba(0,0,0,0.2)",
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
        "URL not recognized. Supported: Instagram, X (Twitter), Facebook",
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

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setPlatform(detectPlatform(text));
        setError("");
        handleFetch(text);
      }
    } catch (err) {
      console.error("Paste failed", err);
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
        <div style={s.inputWrapper}>
          <input
            ref={inputRef}
            className="input-with-paste"
            style={{
              ...s.input,
              borderColor: error
                ? "var(--destructive)"
                : url
                  ? "var(--primary)"
                  : "rgba(0,0,0,0.4)",
              boxShadow: url
                ? "inset 0 4px 8px rgba(0,0,0,0.7), 0 1px 1px rgba(255,255,255,0.08)"
                : "inset 0 3px 6px rgba(0,0,0,0.6), 0 1px 1px rgba(255,255,255,0.05)",
              filter: isLocked ? "grayscale(0.5) opacity(0.7)" : "none",
              background: url ? "rgba(0, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.25)",
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
          {!url && !isLocked && (
            <motion.button
              whileHover={{
                scale: 1.05,
                background: "rgba(255, 255, 255, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              className="mobile-paste-btn"
              style={s.pasteBtn}
              onClick={handlePaste}
            >
              Paste
            </motion.button>
          )}
        </div>
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
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="4" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="18" cy="6" r="1.5" fill="currentColor" />
                    </svg>
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
                      background: "#000",
                      color: "#fff",
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
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
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
                    </svg>
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
