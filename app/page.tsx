"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedEvents from "./components/FeaturedEvents";
import FeaturedArtists from "./components/FeaturedArtists";
import Footer from "./components/Footer";
import ParticleField from "./components/ParticleField";
import GradientOrbs from "./components/GradientOrbs";
// import FloatingMusicians from "./components/FloatingMusicians";
import Preloader from "./components/Preloader";
import StickySearchFilters from "./components/StickySearchFilters";
import StatsCounter from "./components/StatsCounter";
import BrandMarquee from "./components/BrandMarquee";

export default function Home() {
  const [preloaderPhase, setPreloaderPhase] = useState<"idle" | "exit" | "gone">("idle");

  return (
    <main className="min-h-screen relative overflow-x-clip">
      {/* Preloader — sits above everything, exit is scroll-driven */}
      {preloaderPhase !== "gone" && (
        <Preloader phase={preloaderPhase === "idle" ? "idle" : "exit"} setPhase={setPreloaderPhase} />
      )}

      {/* Layer 0 – subtle white orbs */}
      <GradientOrbs />

      {/* Layer 1 – white particle network */}
      <ParticleField />

      {/* Layer 2 – floating musician silhouettes removed */}

      {/* Layer 3 – page content with slow motion portal entrance reveal */}
      <div 
        className="relative min-h-screen flex flex-col justify-between" 
        style={{ 
          zIndex: 10,
          opacity: preloaderPhase === "idle" ? 0 : 1,
          transform: preloaderPhase === "idle" 
            ? "translateY(80px) scale(0.98)" 
            : preloaderPhase === "exit" 
              ? "translateY(0) scale(1)" 
              : undefined, // Clear transform when preloader is gone to restore standard viewport coordinates for position: sticky!
          filter: preloaderPhase === "idle" 
            ? "blur(12px)" 
            : preloaderPhase === "exit" 
              ? "blur(0)" 
              : undefined, // Clear filter when preloader is gone to restore standard viewport coordinates for position: sticky!
          transition: preloaderPhase === "gone"
            ? undefined // Clear transition completely when preloader is gone to release GPU compositing layout context for sticky scrolling!
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

        <Footer />
      </div>
    </main>
  );
}
