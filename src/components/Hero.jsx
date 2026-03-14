import React from "react";
import DownloadBox from "./DownloadBox";

const s = {
  hero: {
    textAlign: "center",
    padding: "100px 24px 60px",
    maxWidth: 900,
    margin: "0 auto",
    animation: "fadeIn 0.8s ease-out",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "var(--secondary)",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "20px",
    padding: "6px 16px",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--secondary-foreground)",
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    background: "var(--primary)",
    borderRadius: "50%",
    opacity: 0.8,
  },
  h1: {
    fontFamily: "var(--font-sans)",
    fontSize: "clamp(40px, 7vw, 72px)",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-2px",
    marginBottom: 24,
    color: "var(--foreground)",
  },
  accent: {
    color: "var(--primary)",
    display: "inline-block",
  },
  sub: {
    fontSize: 19,
    fontWeight: 500,
    color: "var(--muted-foreground)",
    maxWidth: 640,
    margin: "0 auto 56px",
    lineHeight: 1.6,
  },
  platforms: {
    display: "flex",
    justifyContent: "center",
    gap: 16,
    marginBottom: 56,
    flexWrap: "wrap",
  },
  platBadge: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 20px",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: 14,
    fontWeight: 600,
    color: "var(--foreground)",
    boxShadow: "var(--shadow-sm)",
    cursor: "default",
    transition: "transform 0.2s ease",
  },
};

export default function Hero() {
  return (
    <section style={s.hero}>
      <div style={s.badge}>
        <div style={s.dot} />
        Over 10M videos saved securely
      </div>

      <h1 style={s.h1}>
        The simplest way to
        <br />
        save <span style={s.accent}>social media</span>
      </h1>

      <p style={s.sub}>
        High-quality video and audio downloads from your favorite platforms.
        Instant, free, and no registration required.
      </p>

      <div style={s.platforms}>
        {/* YouTube */}
        <div style={s.platBadge} title="YouTube">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF0000">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </div>

        {/* Instagram */}
        <div style={s.platBadge} title="Instagram">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E1306C"
            strokeWidth="2.5"
          >
            <rect x="2" y="2" width="20" height="20" rx="4" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="18" cy="6" r="1.5" fill="#E1306C" />
          </svg>
        </div>

        {/* Facebook */}
        <div style={s.platBadge} title="Facebook">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="11" fill="#1877F2" />
            <path
              d="M13.5 8H15V5.5h-1.5C10.96 5.5 10 7.3 10 9.4V11H8v2.5h2v5h3v-5h2.1V11H13v-1.6c0-.9.3-1.4 1.5-1.4Z"
              fill="#ffffff"
            />
          </svg>
        </div>
        {/* Twitter/X */}
        <div style={s.platBadge} title="Twitter / X">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
      </div>

      <DownloadBox />
    </section>
  );
}
