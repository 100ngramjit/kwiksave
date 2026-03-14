import React from 'react';

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 40px',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    background: 'rgba(252, 252, 252, 0.8)',
    backdropFilter: 'blur(12px)',
    zIndex: 100,
    transition: 'background 0.3s ease',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  logo: {
    fontFamily: 'var(--font-sans)',
    fontSize: 22,
    fontWeight: 800,
    color: 'var(--foreground)',
    letterSpacing: '-1px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    background: 'var(--primary)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  logoBeta: {
    background: 'var(--secondary)',
    color: 'var(--secondary-foreground)',
    fontWeight: 700,
    fontSize: 10,
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  right: { display: 'flex', alignItems: 'center', gap: 32 },
  nav: { display: 'flex', gap: 24 },
  navLink: { 
    fontSize: 14, 
    fontWeight: 500,
    color: 'var(--muted-foreground)', 
    cursor: 'pointer', 
    transition: 'color .2s' 
  },
  themeBtn: {
    width: 44,
    height: 24,
    background: 'var(--accent)',
    borderRadius: 12,
    position: 'relative',
    cursor: 'pointer',
    border: '1px solid var(--border)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink: 0,
  },
};

export default function Header({ isDark, onToggleTheme }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <header style={{
      ...styles.header,
      background: isDark ? 'rgba(15, 21, 21, 0.85)' : 'rgba(240, 244, 244, 0.85)'
    }}>
      <div style={styles.logoWrap}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          KwikSave
          <span style={styles.logoBeta}>beta</span>
        </div>
      </div>
      <div style={styles.right}>
        <nav style={styles.nav} className="hide-mobile">
          <span style={{...styles.navLink, ':hover': {color: 'var(--foreground)'}}} onClick={() => scrollTo('how')}>How it works</span>
          <span style={styles.navLink} onClick={() => scrollTo('features')}>Features</span>
          <span style={styles.navLink} onClick={() => scrollTo('legal')}>Legal</span>
        </nav>
        <div 
          style={{
            ...styles.themeBtn,
            background: isDark ? 'var(--primary)' : 'var(--accent)'
          }} 
          onClick={onToggleTheme} 
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div style={{
            width: 18,
            height: 18,
            background: '#fff',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'absolute',
            top: 2,
            left: isDark ? 23 : 3,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDark ? 'var(--primary)' : '#888',
            fontSize: 10,
          }}>
            {isDark ? '🌙' : '☀️'}
          </div>
        </div>
      </div>
    </header>
  );
}
