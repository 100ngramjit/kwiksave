import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithProgress, saveBlob } from "../utils";

const s = {
  card: {
    borderRadius: "var(--radius)",
    padding: "28px",
    marginTop: 24,
    display: "flex",
    flexDirection: "column",
    gap: 24,
    position: "relative",
    overflow: "hidden",
    textAlign: "left",
  },
  top: { display: "flex", gap: 20, flexWrap: "wrap" },
  thumb: {
    width: 180,
    height: 101,
    borderRadius: "calc(var(--radius) / 2)",
    objectFit: "cover",
    flexShrink: 0,
    background: "rgba(255, 255, 255, 0.05)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--glass-border)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  thumbPlaceholder: {
    width: 160,
    height: 90,
    borderRadius: "calc(var(--radius) / 2)",
    background: "var(--muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border)",
  },
  info: { flex: 1, minWidth: 200 },
  title: {
    fontSize: 17,
    fontWeight: 700,
    lineHeight: 1.4,
    color: "var(--foreground)",
    marginBottom: 8,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  metaRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    background: "var(--muted)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border)",
    borderRadius: "4px",
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--muted-foreground)",
    textTransform: "uppercase",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--foreground)",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: 16,
    opacity: 0.8,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
  },
  fmtBtn: {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(8px)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--glass-border)",
    borderRadius: "calc(var(--radius) / 1.5)",
    padding: "16px 20px",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    position: "relative",
    overflow: "hidden",
  },
  fmtType: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--foreground)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fmtDetail: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--muted-foreground)",
  },
  fmtSize: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--primary)",
    marginTop: 4,
  },
  fmtQuality: {
    fontSize: 11,
    color: "var(--secondary-foreground)",
    fontWeight: 700,
    borderRadius: "4px",
    marginTop: 6,
  },
  playlistContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxHeight: 450,
    overflowY: "auto",
    paddingRight: 10,
    marginTop: 10,
  },
  playlistItem: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "12px 16px",
    background: "rgba(255, 255, 255, 0.03)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--glass-border)",
    borderRadius: "calc(var(--radius) / 2)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
  },
  itemIndex: {
    fontSize: 12,
    fontWeight: 800,
    color: "var(--primary)",
    opacity: 0.6,
    width: 24,
  },
  itemThumb: {
    width: 70,
    height: 40,
    borderRadius: 6,
    objectFit: "cover",
    background: "var(--muted)",
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--foreground)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemUploader: {
    fontSize: 11,
    color: "var(--muted-foreground)",
    fontWeight: 500,
  },
  itemDuration: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--primary)",
    background: "rgba(var(--accent-rgb), 0.1)",
    padding: "2px 6px",
    borderRadius: 4,
  },
};

const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

function FormatButton({ fmt, sourceUrl, info, isLocked, onStateChange }) {
  const [state, setState] = useState("idle"); // idle | downloading | saving | done
  const [dlProgress, setDlProgress] = useState(0);
  const [dlDetails, setDlDetails] = useState({
    speed: "",
    eta: "",
    status: "Initializing...",
  });

  useEffect(() => {
    onStateChange(state !== "idle" && state !== "done");
  }, [state, onStateChange]);

  async function handleClick() {
    if (isLocked || state !== "idle") return;

    setState("downloading");
    setDlProgress(0);
    setDlDetails({ speed: "", eta: "", status: "Server is fetching..." });

    const clientId = `dl_${Math.random().toString(36).slice(2, 11)}`;
    const eventSource = new EventSource(`${API_BASE}/api/progress/${clientId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === "downloading") {
          setDlProgress(parseFloat(data.progress));
          setDlDetails({
            speed: data.speed,
            eta: data.eta,
            status: `Server Downloading: ${data.progress}%`,
          });
        } else if (data.status === "finished") {
          setDlProgress(100);
          setDlDetails((prev) => ({
            ...prev,
            status: "Server done, preparing stream...",
          }));
          eventSource.close();
        } else if (data.status === "error") {
          console.error("Server download error:", data.message);
          eventSource.close();
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    const params = new URLSearchParams({
      url: sourceUrl,
      format_id: fmt.format_id,
      filename: info?.title || "download",
      client_id: clientId,
    });
    const dlUrl = `${API_BASE}/api/download?${params}`;

    try {
      const blob = await fetchWithProgress(dlUrl, (pct) => {
        // Transition to browser download progress once server starts streaming
        setDlProgress(pct);
        setDlDetails({
          speed: "",
          eta: "",
          status: `Sending to browser: ${pct}%`,
        });
      });

      eventSource.close();
      setState("saving");

      const ext = fmt.container === "mp3" ? "mp3" : "mp4";
      const cleanTitle = (info?.title || "video")
        .replace(/[^\w\s-]/gi, "")
        .trim();
      saveBlob(blob, `${cleanTitle}.${ext}`);

      setState("done");
    } catch (err) {
      console.error(err);
      if (eventSource) eventSource.close();
      alert(`Download failed: ${err.message}`);
      setState("idle");
    }

    setTimeout(() => {
      setState("idle");
      setDlProgress(0);
    }, 4000);
  }

  const isDownloading = state === "downloading";
  const isSaving = state === "saving";
  const isDone = state === "done";

  return (
    <motion.button
      whileHover={
        isLocked || state !== "idle"
          ? {}
          : {
              translateY: -4,
              borderColor: "var(--primary)",
              boxShadow: "var(--shadow-md)",
            }
      }
      whileTap={isLocked || state !== "idle" ? {} : { scale: 0.98 }}
      style={{
        ...s.fmtBtn,
        opacity: isLocked && state === "idle" ? 0.5 : 1,
        cursor: isLocked || state !== "idle" ? "not-allowed" : "pointer",
        borderColor: isDownloading
          ? "var(--primary)"
          : isDone
            ? "var(--primary)"
            : "var(--glass-border)",
        background: isDone
          ? "var(--primary)"
          : isDownloading
            ? "rgba(var(--accent-rgb), 0.1)"
            : "rgba(255, 255, 255, 0.05)",
      }}
      onClick={handleClick}
      disabled={isLocked && state === "idle"}
    >
      <AnimatePresence mode="wait">
        {isDownloading ? (
          <motion.div
            key="dl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: "100%" }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--primary)",
                marginBottom: 8,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{dlDetails.status}</span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  style={{
                    width: 14,
                    height: 14,
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderColor: "rgba(var(--accent-rgb), 0.2)",
                    borderTopColor: "var(--primary)",
                    borderRadius: "50%",
                  }}
                />
              </div>
              {dlDetails.speed && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    opacity: 0.7,
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 2,
                  }}
                >
                  <span>Speed: {dlDetails.speed}</span>
                  <span>ETA: {dlDetails.eta}</span>
                </div>
              )}
            </div>
            <div
              style={{
                height: 6,
                background: "var(--muted)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <motion.div
                style={{
                  height: "100%",
                  background: "var(--primary)",
                  width: dlProgress === null ? "100%" : `${dlProgress}%`,
                }}
              />
            </div>
          </motion.div>
        ) : isSaving ? (
          <motion.div
            key="sv"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: "var(--foreground)" }}
          >
            <div style={{ fontSize: 13, fontWeight: 700 }}>Finalizing...</div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
              Saving to device
            </div>
          </motion.div>
        ) : isDone ? (
          <motion.div
            key="dn"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ color: "var(--primary-foreground)" }}
          >
            <div style={{ fontSize: 13, fontWeight: 700 }}>✓ Ready</div>
            <div style={{ fontSize: 11, opacity: 0.9, marginTop: 4 }}>
              Download complete
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="id"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ width: "100%" }}
          >
            <div style={s.fmtType}>
              {fmt.container.toUpperCase()}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div style={s.fmtDetail}>{fmt.label}</div>
            <div style={s.fmtSize}>{fmt.size}</div>
            <div style={s.fmtQuality}>{fmt.quality}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default function MediaCard({
  info,
  sourceUrl,
  isParentLocked,
  onDownloadStateChange,
  onFetch,
}) {
  const chips = [
    info.platform?.toUpperCase(),
    info.duration_str,
    info.view_count,
    info.uploader,
  ].filter(Boolean);

  if (info.is_playlist) {
    return (
      <motion.div
        style={s.card}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <div style={s.top}>
          {info.thumbnail && (
            <img src={info.thumbnail} style={s.thumb} alt="playlist thumb" />
          )}
          <div style={s.info}>
            <div style={s.title}>{info.title}</div>
            <div style={s.metaRow}>
              <span style={s.chip}>PLAYLIST</span>
              <span style={s.chip}>{info.view_count}</span>
              <span style={s.chip}>{info.uploader}</span>
            </div>
          </div>
        </div>

        <div
          style={{ height: "1px", background: "var(--border)", opacity: 0.3 }}
        />

        <div>
          <div style={s.sectionLabel}>Playlist Contents</div>
          <div style={s.playlistContainer} className="custom-scrollbar">
            {info.entries?.map((entry, idx) => (
              <motion.div
                key={entry.id || idx}
                style={s.playlistItem}
                whileHover={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "var(--primary)",
                }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onFetch && onFetch(entry.url)}
              >
                <div style={s.itemIndex}>
                  {(idx + 1).toString().padStart(2, "0")}
                </div>
                {entry.thumbnail && (
                  <img src={entry.thumbnail} style={s.itemThumb} alt="" />
                )}
                <div style={s.itemInfo}>
                  <div style={s.itemTitle}>{entry.title}</div>
                  <div style={s.itemUploader}>{entry.uploader}</div>
                </div>
                {entry.duration_str && (
                  <div style={s.itemDuration}>{entry.duration_str}</div>
                )}
              </motion.div>
            ))}
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 12,
              color: "var(--muted-foreground)",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            Click a video to fetch its download options
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={s.card}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 22 }}
    >
      <div style={s.top}>
        {info.thumbnail ? (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={`${API_BASE}/api/proxy/thumbnail?url=${encodeURIComponent(info.thumbnail)}`}
            alt="thumbnail"
            style={s.thumb}
            referrerPolicy="no-referrer"
            onError={(e) => {
              if (!e.target.dataset.triedOriginal) {
                e.target.src = info.thumbnail;
                e.target.dataset.triedOriginal = "true";
              } else {
                e.target.style.display = "none";
              }
            }}
          />
        ) : (
          <div style={s.thumbPlaceholder}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--muted-foreground)"
              strokeWidth="1.5"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
        )}
        <div style={s.info}>
          <div style={s.title}>{info.title}</div>
          <div style={s.metaRow}>
            {chips.map((c, i) => (
              <span key={i} style={s.chip}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{ height: "1px", background: "var(--border)", opacity: 0.5 }}
      />

      <div>
        <div style={s.sectionLabel}>Available Formats</div>
        <div style={s.grid}>
          {info.formats.map((fmt, idx) => (
            <FormatButton
              key={fmt.format_id || idx}
              fmt={fmt}
              sourceUrl={sourceUrl}
              info={info}
              isLocked={isParentLocked}
              onStateChange={onDownloadStateChange}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
