import React, { useState } from "react";
import { sleep, fetchWithProgress, saveBlob } from "../utils";

const s = {
  card: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "24px",
    marginTop: 24,
    animation: "slideIn .35s ease-out",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    boxShadow: "var(--shadow-md)",
  },
  top: { display: "flex", gap: 20, flexWrap: "wrap" },
  thumb: {
    width: 160,
    height: 90,
    borderRadius: "calc(var(--radius) / 2)",
    objectFit: "cover",
    flexShrink: 0,
    background: "var(--muted)",
    border: "1px solid var(--border)",
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
    border: "1px solid var(--border)",
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
    border: "1px solid var(--border)",
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
    background: "var(--background)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border)",
    borderRadius: "calc(var(--radius) / 2)",
    padding: 16,
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
    gap: 4,
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
  fmtDetail: { fontSize: 13, fontWeight: 500, color: "var(--muted-foreground)" },
  fmtSize: { fontSize: 12, fontWeight: 600, color: "var(--primary)", marginTop: 4 },
  fmtQuality: {
    fontSize: 11,
    color: "var(--secondary-foreground)",
    background: "var(--secondary)",
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: "4px",
    alignSelf: "start",
    marginTop: 6,
  },
};

const API_BASE = "http://localhost:8000";

function FormatButton({ fmt, sourceUrl, info }) {
  const [state, setState] = useState("idle"); // idle | downloading | saving | done
  const [dlProgress, setDlProgress] = useState(0); // 0-100 or null (indeterminate)

  async function handleClick() {
    if (state !== "idle") return;
    
    setState("downloading");
    setDlProgress(0);

    const params = new URLSearchParams({
      url: sourceUrl,
      format_id: fmt.format_id,
      filename: info?.title || "download",
    });
    const dlUrl = `${API_BASE}/api/download?${params}`;

    try {
      // 1. Actually download the file through our progress-tracking fetcher
      const blob = await fetchWithProgress(dlUrl, (pct) => {
        setDlProgress(pct);
      });

      // 2. Transision to saving state briefly
      setState("saving");
      await sleep(100);

      // 3. Trigger the browser's save dialog for the blob
      const ext = fmt.container === 'mp3' ? 'mp3' : 'mp4';
      const cleanTitle = (info?.title || "video").replace(/[^\w\s-]/gi, '').trim();
      saveBlob(blob, `${cleanTitle}.${ext}`);

      // 4. Show success state
      setState("done");
    } catch (err) {
      console.error(err);
      alert(`Download failed: ${err.message}`);
      setState("idle");
    }

    setTimeout(() => {
      setState("idle");
      setDlProgress(0);
    }, 4500);
  }

  if (state === "downloading") {
    const isIndeterminate = dlProgress === null;
    return (
      <div style={{ ...s.fmtBtn, borderColor: "var(--primary)", background: "var(--background)", cursor: "default" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span>{isIndeterminate ? "Streaming..." : `Fetching ${dlProgress}%`}</span>
          <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
        </div>
        <div style={{ height: 6, background: "var(--muted)", borderRadius: 3, overflow: "hidden" }}>
          <div 
            className="progress-shimmer"
            style={{ 
              height: "100%", 
              background: "var(--primary)", 
              width: isIndeterminate ? "100%" : `${dlProgress}%`, 
              transition: isIndeterminate ? "none" : "width .15s ease-out" 
            }} 
          />
        </div>
      </div>
    );
  }

  if (state === "saving") {
    return (
      <div style={{ ...s.fmtBtn, background: "var(--secondary)", borderColor: "var(--secondary-foreground)", cursor: "default" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--secondary-foreground)" }}>Finalizing...</div>
        <div style={{ fontSize: 12, color: "var(--secondary-foreground)", opacity: 0.8, marginTop: 4 }}>
          Saving to device
        </div>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div style={{ ...s.fmtBtn, background: "var(--primary)", borderColor: "var(--primary)", cursor: "default", animation: "slideIn .3s ease-out" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary-foreground)", display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>✓ Complete</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--primary-foreground)", opacity: 0.8, marginTop: 4 }}>
          File is ready!
        </div>
      </div>
    );
  }

  return (
    <button
      style={s.fmtBtn}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--primary)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={s.fmtType}>
        {fmt.container.toUpperCase()}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </div>
      <div style={s.fmtDetail}>{fmt.label}</div>
      <div style={s.fmtSize}>{fmt.size}</div>
      <div style={s.fmtQuality}>{fmt.quality}</div>
    </button>
  );
}

export default function MediaCard({ info, sourceUrl }) {
  const chips = [
    info.platform?.toUpperCase(),
    info.duration_str,
    info.view_count,
    info.uploader,
  ].filter(Boolean);

  return (
    <div style={s.card}>
      <div style={s.top}>
        {info.thumbnail ? (
          <img
            src={`${API_BASE}/api/proxy/thumbnail?url=${encodeURIComponent(info.thumbnail)}`}
            alt="thumbnail"
            style={s.thumb}
            referrerPolicy="no-referrer"
            onError={(e) => { 
              // Fallback to original if proxy fails
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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
        )}
        <div style={s.info}>
          <div style={s.title}>{info.title}</div>
          <div style={s.metaRow}>
            {chips.map((c, i) => (
              <span key={i} style={s.chip}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: "1px", background: "var(--border)", opacity: 0.5 }} />

      <div>
        <div style={s.sectionLabel}>Available Formats</div>
        <div style={s.grid}>
          {info.formats.map((fmt, idx) => (
            <FormatButton key={fmt.format_id || idx} fmt={fmt} sourceUrl={sourceUrl} info={info} />
          ))}
        </div>
      </div>
    </div>
  );
}
