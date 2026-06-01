"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedEvents from "./components/FeaturedEvents";
import FeaturedArtists from "./components/FeaturedArtists";
import Footer from "./components/Footer";
import NewsletterSection from "./components/NewsletterSection";
import ParticleField from "./components/ParticleField";
import WaveBackground from "./components/WaveBackground";
import GradientOrbs from "./components/GradientOrbs";
// import FloatingMusicians from "./components/FloatingMusicians";
import Preloader from "./components/Preloader";
import StickySearchFilters from "./components/StickySearchFilters";
import StatsCounter from "./components/StatsCounter";
import BrandMarquee from "./components/BrandMarquee";
import { hasPreloaderShown, markPreloaderShown } from "./preloaderState";

// useLayoutEffect is skipped during SSR; useEffect is the server-safe fallback.
// On the client it runs synchronously before the browser paints — no flash.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Home() {
  // "checking" = haven't read localStorage yet (Preloader not rendered at all)
  // "idle"     = first visit confirmed, show preloader
  // "exit"     = preloader animating out
  // "gone"     = preloader done / returning visitor
  const [preloaderPhase, setPreloaderPhase] = useState<"checking" | "idle" | "exit" | "gone">("checking");

  // Runs synchronously before the browser paints (skipped during SSR).
  // We only mount the Preloader AFTER we know this is a first-time visit,
  // which prevents its useEffect from ever touching body.overflow on repeat visits.
  useIsomorphicLayoutEffect(() => {
    if (hasPreloaderShown()) {
      setPreloaderPhase("gone");
    } else {
      markPreloaderShown(); // mark immediately so any navigation away skips preloader
      setPreloaderPhase("idle");
    }
  }, []);

  return (
    <main className="min-h-screen relative overflow-x-clip">
      {/* Preloader — only mounted once we know it's a first-time visit */}
      {(preloaderPhase === "idle" || preloaderPhase === "exit") && (
        <Preloader phase={preloaderPhase === "idle" ? "idle" : "exit"} setPhase={setPreloaderPhase} />
      )}

      {/* Layer 0a – dark gradient wave animation */}
      <WaveBackground />

      {/* Layer 0b – subtle white orbs */}
      <GradientOrbs />

      {/* Layer 1 – white particle network */}
      <ParticleField />

      {/* Layer 2 – floating musician silhouettes removed */}

      {/* Layer 3 – page content with slow motion portal entrance reveal */}
      <div 
        className="relative min-h-screen flex flex-col justify-between" 
        style={{ 
          zIndex: 10,
          opacity: (preloaderPhase === "checking" || preloaderPhase === "idle") ? 0 : 1,
          transform: (preloaderPhase === "checking" || preloaderPhase === "idle")
            ? "translateY(80px) scale(0.98)"
            : preloaderPhase === "exit"
              ? "translateY(0) scale(1)"
              : undefined, // Clear when gone — restores sticky positioning
          filter: (preloaderPhase === "checking" || preloaderPhase === "idle")
            ? "blur(12px)"
            : preloaderPhase === "exit"
              ? "blur(0)"
              : undefined, // Clear when gone — restores sticky positioning
          transition: preloaderPhase === "gone"
            ? undefined // No transition when gone — releases GPU compositing context for sticky scroll
            : "opacity 1.8s cubic-bezier(0.16, 1, 0.3, 1), transform 1.8s cubic-bezier(0.16, 1, 0.3, 1), filter 1.8s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Everything except the footer sits in this layout block so sticky filters scroll out when footer appears */}
        <div className="flex-1 pt-16">
          <Navbar />
          <StickySearchFilters />

          <Hero />
          <StatsCounter />
          <FeaturedEvents />
          <FeaturedArtists />
          <BrandMarquee />
        </div>

        <NewsletterSection />
        <Footer />
      </div>
    </main>
  );
}
