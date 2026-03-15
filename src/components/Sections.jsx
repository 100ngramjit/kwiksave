import React, { useState } from "react";
import { motion } from "framer-motion";

/* ── shared ── */
const section = {
  maxWidth: 940,
  margin: "120px auto",
  padding: "0 24px",
  scrollMarginTop: "80px",
};
const sectionTitle = {
  fontFamily: "var(--font-sans)",
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 12,
  letterSpacing: "-1px",
  color: "var(--foreground)",
};
const sectionSub = {
  color: "var(--muted-foreground)",
  fontSize: 17,
  fontWeight: 500,
  marginBottom: 60,
  lineHeight: 1.6,
};

/* ══════════════════════════════════════════════
   Stats Row
══════════════════════════════════════════════ */
export function StatsRow() {
  const stats = [
    { num: "10M+", label: "Downloads" },
    { num: "4K", label: "Ultra HD" },
    { num: "320kbps", label: "Audio" },
    { num: "Free", label: "Forever" },
  ];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 24,
        padding: "80px 24px",
        // background: "var(--background)",
        // borderTop: "1px solid var(--border)",
        // borderBottom: "1px solid var(--border)",
        maxWidth: 1100,
        margin: "0 auto",
        flexWrap: "wrap",
      }}
    >
      {stats.map(({ num, label }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          style={{
            textAlign: "center",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "24px 40px",
            boxShadow: "var(--shadow-sm)",
            flex: "1 1 200px",
            maxWidth: 240,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 36,
              fontWeight: 800,
              color: "var(--primary)",
              letterSpacing: "-1px",
            }}
          >
            {num}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--muted-foreground)",
              marginTop: 6,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   How It Works
══════════════════════════════════════════════ */
const steps = [
  {
    num: "01",
    title: "Paste the link",
    body: "Copy the URL of the video or story you want to save and paste it above.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Pick your format",
    body: "Choose from various resolutions and formats like MP4, MP3, or high-res images.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Download instantly",
    body: "Your download starts the moment you click. No waiting, no registration.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how" style={section}>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div style={sectionTitle}>Simple 3-step process</div>
        <div style={sectionSub}>Engineered for speed and ease of use.</div>
      </motion.div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
        }}
      >
        {steps.map(({ num, title, body, icon }, i) => (
          <motion.div
            key={num}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            whileHover={{ scale: 1.02 }}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 40,
              position: "relative",
              boxShadow: "var(--shadow-sm)",
              cursor: "default",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "var(--primary)",
                marginBottom: 20,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.5 }}>STEP</span> {num}
            </div>
            <div
              style={{
                width: 56,
                height: 56,
                background: "var(--secondary)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
                color: "var(--secondary-foreground)",
              }}
            >
              {icon}
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 12,
                color: "var(--foreground)",
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "var(--muted-foreground)",
                lineHeight: 1.6,
              }}
            >
              {body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   Features
══════════════════════════════════════════════ */
const features = [
  {
    title: "Smart detection",
    body: "Just paste a link. We handle the heavy lifting and identify the source platform instantly.",
  },
  {
    title: "Best quality available",
    body: "From 1080p to 4K resolutions and 320kbps audio. Get the highest quality the platform offers.",
  },
  {
    title: "No watermarks",
    body: "All downloads are clean and high-definition, exactly as the creator intended them to be.",
  },
  {
    title: "Multi-device support",
    body: "Optimized for mobile, tablet, and desktop. Save media directly to your gallery or files.",
  },
  {
    title: "Privacy focused",
    body: "We don't store your data or link history. Everything is processed temporary and wiped.",
  },
  {
    title: "Lightning fast",
    body: "Optimized download pipes ensure your media stays high-quality and downloads arrive quickly.",
  },
];

export function Features() {
  return (
    <section id="features" style={section}>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div style={sectionTitle}>Everything you need</div>
        <div style={sectionSub}>
          A powerful toolset for all your saving needs.
        </div>
      </motion.div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        {features.map(({ title, body }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 3) * 0.1 }}
            whileHover={{ translateY: -5, borderColor: "var(--primary)" }}
            style={{
              background: "var(--card)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "var(--border)",
              borderRadius: "var(--radius)",
              padding: 32,
              cursor: "default",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                background: "var(--primary)",
                borderRadius: "50%",
                marginBottom: 16,
                boxShadow: "0 0 6px var(--primary)",
              }}
            />
            <h4
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 12,
                color: "var(--foreground)",
              }}
            >
              {title}
            </h4>
            <p
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "var(--muted-foreground)",
                lineHeight: 1.6,
              }}
            >
              {body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   Legal
══════════════════════════════════════════════ */
export function Legal() {
  const [tab, setTab] = useState("terms");

  return (
    <section id="legal" style={{ ...section, marginBottom: 140 }}>
      <div style={sectionTitle}>Policies</div>
      <div style={sectionSub}>Understand our guidelines and terms.</div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          background: "var(--accent)",
          padding: 6,
          borderRadius: "var(--radius)",
          width: "fit-content",
          marginBottom: 32,
        }}
      >
        {["terms", "privacy"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 700,
              background: tab === t ? "var(--card)" : "transparent",
              color:
                tab === t ? "var(--foreground)" : "var(--muted-foreground)",
              border: "none",
              borderRadius: "calc(var(--radius) - 4px)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "var(--font-sans)",
            }}
          >
            {t === "terms" ? "Terms & Conditions" : "Privacy Policy"}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 48,
          boxShadow: "var(--shadow-md)",
        }}
      >
        {tab === "terms" ? (
          <>
            <LegalSection title="General Use">
              By using kwiksave, you agree to use our service only for personal
              and non-commercial purposes.
            </LegalSection>
            <LegalSection title="Ownership & Rights">
              Users are solely responsible for ensuring they have the legal
              right to download specific media content. We do not host any
              content.
            </LegalSection>
            <LegalSection title="Disclaimer" last>
              kwiksave is provided "as is" without warranties. We are not
              responsible for any misuse of the tool.
            </LegalSection>
          </>
        ) : (
          <>
            <LegalSection title="Zero Log Policy">
              We do not track or store your input URLs or the resulting media
              information once your session ends.
            </LegalSection>
            <LegalSection title="Encryption">
              All transmissions between your browser and our API are secured
              using industry-standard SSL encryption.
            </LegalSection>
          </>
        )}
      </motion.div>
    </section>
  );
}

function LegalSection({ title, children, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 32 }}>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 12,
          color: "var(--foreground)",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: "var(--muted-foreground)",
          lineHeight: 1.7,
        }}
      >
        {children}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Footer
══════════════════════════════════════════════ */
export function Footer() {
  const scrollTo = (id) => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      style={{
        background: "var(--card)",
        borderTop: "1px solid var(--border)",
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 40,
          marginBottom: 32,
          flexWrap: "wrap",
        }}
      >
        {["how", "features", "legal"].map((id) => (
          <span
            key={id}
            onClick={() =>
              document
                .getElementById(id)
                ?.scrollIntoView({ behavior: "smooth" })
            }
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--muted-foreground)",
              cursor: "pointer",
              transition: "color 0.2s ease",
            }}
            className="nav-link"
          >
            {id === "how"
              ? "How it works"
              : id === "features"
                ? "Features"
                : "Privacy & Terms"}
          </span>
        ))}
      </div>
      <p
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "var(--muted-foreground)",
          lineHeight: 1.7,
        }}
      >
        © 2026 KwikSave. Part of the open web.
        <br />
        Built for performance and privacy.
      </p>
    </footer>
  );
}
