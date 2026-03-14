import React, { useState, useRef } from "react";
import {
  detectPlatform,
  isValidUrl,
  simulateFetch,
  fetchMediaInfo,
  sleep,
} from "../utils";
import MediaCard from "./MediaCard";

/* ── inline styles ── */
const s = {
  box: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "32px",
    maxWidth: 720,
    margin: "0 auto 60px",
    position: "relative",
    boxShadow: "var(--shadow-lg)",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: "var(--primary)",
    borderRadius: "var(--radius) var(--radius) 0 0",
  },
  inputRow: { display: "flex", gap: 12, marginBottom: 20 },
  input: {
    flex: 1,
    background: "var(--background)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border)",
    borderRadius: "calc(var(--radius) / 1.5)",
    padding: "14px 18px",
    fontSize: 16,
    fontWeight: 500,
    color: "var(--foreground)",
    outline: "none",
    minWidth: 0,
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  btn: {
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "none",
    borderRadius: "calc(var(--radius) / 1.5)",
    padding: "14px 28px",
    fontSize: 15,
    fontWeight: 600,
    whiteSpace: "nowrap",
    transition: "opacity 0.2s, transform 0.1s",
    cursor: "pointer",
    flexShrink: 0,
  },
  detectRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    minHeight: 24,
    fontWeight: 500,
    color: "var(--muted-foreground)",
  },
  detectIcon: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 700,
    flexShrink: 0,
  },
  progressWrap: { marginTop: 24 },
  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--muted-foreground)",
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    background: "var(--muted)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "var(--primary)",
    borderRadius: 4,
    transition: "width .4s ease-out",
  },
  error: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(229, 80, 50, 0.1)",
    border: "1px solid var(--destructive)",
    borderRadius: "calc(var(--radius) / 2)",
    padding: "12px 16px",
    marginTop: 20,
    fontSize: 13,
    fontWeight: 500,
    color: "var(--destructive)",
  },
};

export default function DownloadBox() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState(null);
  const [loading, setLoading] = useState(false);
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

  async function handleFetch() {
    setError("");
    setMediaInfo(null);

    if (!url.trim()) {
      setError("Please paste a supported media URL.");
      return;
    }
    if (!isValidUrl(url)) {
      setError("That doesn't look like a valid URL.");
      return;
    }
    if (!platform) {
      setError(
        "URL not recognized. Supported: YouTube, Instagram, X (Twitter), Facebook",
      );
      return;
    }

    setLoading(true);
    setProgress({ pct: 0, label: "Initializing…" });

    try {
      const data = await fetchMediaInfo(url);
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

  const isUrlValid = url.trim() && isValidUrl(url) && platform;

  return (
    <div style={s.box}>
      <div style={s.inputRow}>
        <input
          ref={inputRef}
          style={{
            ...s.input,
            borderColor: error ? "var(--destructive)" : "var(--border)",
            boxShadow: url ? "0 0 0 2px rgba(99, 73, 63, 0.1)" : "none",
          }}
          type="url"
          placeholder="Paste media link here…"
          value={url}
          onChange={handleUrlChange}
          onKeyDown={handleKeyDown}
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          style={{
            ...s.btn,
            opacity: !isUrlValid || loading ? 0.5 : 1,
            cursor: !isUrlValid || loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
          onClick={handleFetch}
          disabled={!isUrlValid || loading}
          onMouseEnter={(e) => {
            if (isUrlValid && !loading) e.target.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            if (isUrlValid) e.target.style.opacity = loading ? "0.7" : "1";
          }}
        >
          {loading && (
            <div
              className="spinner"
              style={{
                width: 16,
                height: 16,
                borderTopColor: "#fff",
                borderWidth: 2,
              }}
            />
          )}
          {loading ? "Analyzing..." : "Fetch"}
        </button>
      </div>

      <div style={s.detectRow}>
        {url && platform === "youtube" && (
          <>
            <div
              style={{
                ...s.detectIcon,
                background: "#ff0000",
                color: "#fff",
                border: "none",
              }}
            >
              ▶
            </div>
            <span style={{ color: "var(--foreground)" }}>
              YouTube recognized
            </span>
          </>
        )}
        {url && platform === "instagram" && (
          <>
            <div
              style={{
                ...s.detectIcon,
                background:
                  "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                color: "#fff",
                border: "none",
              }}
            >
              IG
            </div>
            <span style={{ color: "var(--foreground)" }}>
              Instagram recognized
            </span>
          </>
        )}
        {url && platform === "twitter" && (
          <>
            <div
              style={{
                ...s.detectIcon,
                background: "#1DA1F2",
                color: "#fff",
                border: "none",
              }}
            >
              X
            </div>
            <span style={{ color: "var(--foreground)" }}>X recognized</span>
          </>
        )}
        {url && platform === "facebook" && (
          <>
            <div
              style={{
                ...s.detectIcon,
                background: "#1877F2",
                color: "#fff",
                border: "none",
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

      {loading && (
        <div style={s.progressWrap}>
          <div style={s.progressTop}>
            <span>{progress.label}</span>
            <span>{progress.pct}%</span>
          </div>
          <div style={s.progressTrack}>
            <div
              className="progress-shimmer"
              style={{ ...s.progressFill, width: `${progress.pct}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div style={s.error}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {mediaInfo && !loading && <MediaCard info={mediaInfo} sourceUrl={url} />}
    </div>
  );
}
