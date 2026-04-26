import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import {
  StatsRow,
  HowItWorks,
  Features,
  Legal,
  Footer,
} from "./components/Sections";
import Toast from "./components/Toast";

export default function App() {
  return (
    <div className="main-wrapper">
      <video autoPlay loop muted playsInline className="full-page-video">
        <source src="/sec.mp4" type="video/mp4" />
      </video>
      <div className="full-page-overlay" />

      <Header />
      <main style={{ paddingTop: "110px" }}>
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
      `}</style>
    </div>
  );
}
