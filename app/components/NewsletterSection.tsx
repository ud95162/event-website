"use client";

import { ArrowRight } from "lucide-react";

export default function NewsletterSection() {
  return (
    <section className="relative py-24 px-4 text-center overflow-hidden" style={{ background: "#080808" }}>

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

      <div className="relative z-10">
        <p className="text-white/50 text-[12px] font-semibold tracking-[0.4em] uppercase mb-4">
          NEWSLETTER SUBSCRIPTION
        </p>
        <h2 className="text-white font-black text-4xl sm:text-5xl uppercase tracking-tight mb-5">
          Never Miss An Event
        </h2>
        <p className="text-white/55 text-base max-w-lg mx-auto leading-relaxed mb-8">
          Get weekly updates about concerts, festivals, workshops, nightlife events,
          and exclusive early-bird ticket offers directly to your inbox.
        </p>

        <p className="text-white/40 text-[12px] font-semibold tracking-[0.3em] uppercase mb-3">
          YOUR EMAIL
        </p>
        <div className="flex max-w-md mx-auto">
          <input
            type="email"
            placeholder="ENTER YOUR EMAIL HERE"
            className="flex-1 bg-white/10 border border-white/20 border-r-0 rounded-l-lg px-5 py-3.5 text-white text-sm outline-none focus:border-white/40 transition-colors placeholder:text-white/25 placeholder:tracking-[0.12em]"
          />
          <button
            className="flex items-center gap-2 text-[13px] font-bold tracking-[0.15em] uppercase px-6 py-3.5 rounded-r-lg whitespace-nowrap transition-all hover:brightness-110"
            style={{ background: "#39BD69", color: "#fff" }}
          >
            SUBMIT <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </section>
  );
}
