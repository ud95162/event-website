"use client";

import { ArrowRight } from "lucide-react";

export default function NewsletterSection() {
  return (
    <section className="relative px-4 text-center overflow-hidden flex-1 flex flex-col justify-center" style={{ background: "#080808", padding: "clamp(8px, 2vh, 24px) 16px" }}>

      {/* Keyframe styles */}
      <style>{`
        @keyframes pattern-drift-a {
          0%   { background-position: 0px 0px; }
          100% { background-position: 72px 72px; }
        }
        @keyframes pattern-drift-b {
          0%   { background-position: 0px 0px; }
          100% { background-position: -72px 72px; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
      `}</style>

      {/* Animated diagonal lines — drifting right-down */}
      <div className="absolute inset-0" style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          rgba(255,255,255,0.04) 0px,
          rgba(255,255,255,0.04) 1px,
          transparent 1px,
          transparent 18px
        )`,
        animation: "pattern-drift-a 6s linear infinite",
      }} />

      {/* Animated diagonal lines — drifting left-down */}
      <div className="absolute inset-0" style={{
        backgroundImage: `repeating-linear-gradient(
          -45deg,
          rgba(255,255,255,0.025) 0px,
          rgba(255,255,255,0.025) 1px,
          transparent 1px,
          transparent 18px
        )`,
        animation: "pattern-drift-b 9s linear infinite",
      }} />

      {/* Pulsing green glow */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(57,189,105,0.08) 0%, transparent 70%)",
        animation: "glow-pulse 4s ease-in-out infinite",
      }} />

      {/* Fade edges to black */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 110% 100% at 50% 50%, transparent 35%, #080808 80%)",
      }} />

      <div className="relative z-10 max-w-2xl mx-auto">
        <p className="text-white/50 text-[12px] font-semibold tracking-[0.4em] uppercase" style={{ marginBottom: "clamp(4px, 1vh, 8px)" }}>
          NEWSLETTER SUBSCRIPTION
        </p>
        <h2 className="text-white font-black uppercase tracking-tight" style={{ fontSize: "clamp(1.2rem, 3vw + 1vh, 2rem)", marginBottom: "clamp(4px, 1vh, 8px)" }}>
          Never Miss An Event
        </h2>
        {/* Divider */}
        <div className="w-12 h-0.5 mx-auto" style={{ background: "#39BD69", marginBottom: "clamp(4px, 1vh, 16px)" }} />

        <p className="text-white/55 max-w-lg mx-auto leading-relaxed" style={{ fontSize: "clamp(0.8rem, 1.1vw, 1rem)", marginBottom: "clamp(8px, 1.5vh, 20px)" }}>
          Get weekly updates about concerts, festivals, workshops, nightlife events,
          and exclusive early-bird ticket offers directly to your inbox.
        </p>

        <p className="text-white/40 text-[11px] font-semibold tracking-[0.4em] uppercase" style={{ marginBottom: "clamp(4px, 0.8vh, 8px)" }}>
          YOUR EMAIL
        </p>
        <div className="flex max-w-md mx-auto" style={{ marginBottom: "clamp(4px, 1vh, 12px)" }}>
          <input
            type="email"
            placeholder="ENTER YOUR EMAIL HERE"
            className="flex-1 bg-white/10 border border-white/20 border-r-0 rounded-l-lg px-4 py-2.5 text-white text-sm outline-none focus:border-white/40 transition-colors placeholder:text-white/25 placeholder:tracking-[0.12em]"
          />
          <button
            className="flex items-center gap-2 text-[13px] font-bold tracking-[0.15em] uppercase px-5 py-2.5 rounded-r-lg whitespace-nowrap transition-all hover:brightness-110"
            style={{ background: "#39BD69", color: "#fff" }}
          >
            SUBMIT <ArrowRight size={13} />
          </button>
        </div>

        <p className="text-white/25 text-[11px] tracking-[0.2em] uppercase">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
