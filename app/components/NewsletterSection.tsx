"use client";

import { ArrowRight } from "lucide-react";

export default function NewsletterSection() {
  return (
    <section className="relative py-24 px-4 text-center overflow-hidden">
      <img
        src="/bg/footer.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/50" />
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
