import React from "react";
import { motion } from "framer-motion";

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    position: "fixed",
    top: "24px",
    left: "16px",
    right: "16px",
    margin: "0 auto",
    maxWidth: "1200px",
    height: "72px",
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "var(--skeuo-shadow-raised)",
    zIndex: 9999,
  },
  logoWrap: { display: "flex", alignItems: "center", gap: 10 },
  logo: {
    fontFamily: "var(--font-sans)",
    fontSize: 22,
    fontWeight: 800,
    color: "var(--foreground)",
    letterSpacing: "-1px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
  },
  logoIcon: {
    width: 38,
    height: 38,
    background: "var(--primary)",
    backgroundImage: "var(--skeuo-metal)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--primary-foreground)",
    border: "1px solid var(--skeuo-border-dark)",
    boxShadow: "var(--skeuo-shadow-raised)",
    flexShrink: 0,
  },
  logoBeta: {
    background: "var(--secondary)",
    color: "var(--secondary-foreground)",
    fontWeight: 700,
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: "4px",
    textTransform: "uppercase",
  },
  right: { display: "flex", alignItems: "center", gap: 32 },
  nav: { display: "flex", gap: 24 },
  navLink: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--muted-foreground)",
    cursor: "pointer",
    transition: "all .2s",
    "&:hover": {
      color: "var(--foreground)",
    },
  },
  themeBtn: {
    width: 48,
    height: 26,
    background: "var(--accent)",
    borderRadius: 13,
    position: "relative",
    cursor: "pointer",
    border: "1px solid var(--border)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    flexShrink: 0,
  },
};

export default function Header() {
  const scrollTo = (id) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (id !== "top") {
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      style={styles.header}
      className="main-header"
    >
      <div style={styles.logoWrap} onClick={() => scrollTo("top")}>
        <div style={styles.logo}>
          <motion.div
            style={styles.logoIcon}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </motion.div>
          KwikSave
          <span style={styles.logoBeta}>beta</span>
        </div>
      </div>
      <div style={styles.right}>
        <nav style={styles.nav} className="hide-mobile">
          <span className="nav-link" onClick={() => scrollTo("how")}>
            How it works
          </span>
          <span className="nav-link" onClick={() => scrollTo("features")}>
            Features
          </span>
          <span className="nav-link" onClick={() => scrollTo("legal")}>
            Legal
          </span>
        </nav>
      </div>
    </motion.header>
  );
}
