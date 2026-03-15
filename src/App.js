import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import { StatsRow, HowItWorks, Features, Legal, Footer } from './components/Sections';
import Toast from './components/Toast';

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <>
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <Header isDark={isDark} onToggleTheme={() => setIsDark(d => !d)} />
      <main style={{ paddingTop: '72px' }}>
        <Hero />
        <StatsRow />
        <HowItWorks />
        <Features />
        <Legal />
      </main>
      <Footer />
      <Toast />

      {/* Mobile nav styles */}
      <style>{`
        @media (max-width: 600px) {
          .hide-mobile { display: none !important; }
        }
        @media (max-width: 600px) {
          header { padding: 14px 18px !important; }
        }
      `}</style>
    </>
  );
}
