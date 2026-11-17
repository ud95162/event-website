"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Stat = { value?: number; suffix?: string; text?: string; sub?: string; label?: string };

const stats: Stat[] = [
  { value: 250, suffix: "+", label: "Events Listed" },
  { value: 40, suffix: "+", sub: "Talent Across 5 Categories & 25+ Disciplines" },
  { value: 30, suffix: "+", label: "Organizers" },
  { text: "All", sub: "Provinces Across Sri Lanka", label: "Island-wide coverage" },
  { value: 4, suffix: "K+", label: "Monthly Visitors" },
  { value: 100, suffix: "K+", label: "Reach" },
];

function useCountUp(target: number, duration: number, trigger: boolean) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) {
      setCount(0);
      return;
    }
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger, target, duration]);

  return count;
}

function StatItem({ value, suffix, text, sub, label, trigger, delay }: Stat & { trigger: boolean; delay: number }) {
  const [started, setStarted] = useState(false);
  const count = useCountUp(value ?? 0, 2000, started);

  useEffect(() => {
    if (!trigger) {
      setStarted(false);
      return;
    }
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [trigger, delay]);

  return (
    <div
      className="flex flex-col items-center text-center"
      style={{
        padding: "clamp(8px, 2vh, 24px) 8px",
        opacity: started ? 1 : 0,
        transform: started ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <span
        className="font-black tracking-tighter leading-none italic"
        style={{
          marginBottom: "clamp(4px, 1vh, 10px)",
          paddingRight: "0.08em",
          fontSize: "clamp(2rem, 4.5vw + 1vh, 4.5rem)",
          background: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.35) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {text ?? `${count}${suffix ?? ""}`}
      </span>
      {sub && <p className="text-white/60 text-xs sm:text-sm">{sub}</p>}
      {label && (
        <p className="text-white/40 text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase" style={{ marginTop: sub ? 6 : 0 }}>
          {label}
        </p>
      )}
    </div>
  );
}

const ctaCards = [
  {
    eyebrow: "For organizers",
    title: "Got an event?",
    accent: "List it free.",
    body: "Send your details, we check and publish, and your event goes out across every channel we run.",
    bullets: ["Free to list, no catch", "Link to your own ticketing", "Go Sponsored for the spotlight"],
    cta: "List your event",
    href: "/admin/login",
    watermark: "LIST",
    primary: true,
  },
  {
    eyebrow: "For talent",
    title: "Your talent deserves",
    accent: "to be found.",
    body: "Performers, creators and experts get a free profile that brings every appearance together, so fans and organizers can find you.",
    bullets: ["Free basic profile", "Shown on every event you play", "Discoverable by organizers"],
    cta: "Create your profile",
    href: "/admin/login",
    watermark: "YOU",
    primary: false,
  },
];

function CtaCards({ show }: { show: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" >
      {ctaCards.map((c, i) => (
        <div
          key={c.eyebrow}
          className="relative overflow-hidden rounded-3xl flex flex-col items-start"
          style={{
            padding: "clamp(20px, 3vh, 40px) clamp(20px, 3vw, 40px)",
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.08)",
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
            transitionDelay: `${800 + i * 200}ms`,
          }}
        >
          <span
            aria-hidden
            className="absolute font-black leading-none select-none pointer-events-none"
            style={{ right: -8, bottom: -24, fontSize: "clamp(5rem, 11vw, 10rem)", color: "rgba(255,255,255,0.04)" }}
          >
            {c.watermark}
          </span>
          <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase mb-3">{c.eyebrow}</p>
          <h3 className="font-black tracking-tight leading-[1.05] text-white" style={{ fontSize: "clamp(1.5rem, 2.6vw + 0.6vh, 2.5rem)" }}>
            {c.title}
            <br />
            <span className="text-white/60">{c.accent}</span>
          </h3>
          <p className="text-white/50 text-sm leading-relaxed mt-3 max-w-sm">{c.body}</p>
          <ul className="mt-4 space-y-1.5 relative z-10">
            {c.bullets.map((b) => (
              <li key={b} className="text-white/80 text-sm flex gap-3">
                <span className="text-white/40">—</span>
                {b}
              </li>
            ))}
          </ul>
          <Link
            href={c.href}
            className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[11px] font-bold tracking-[0.18em] uppercase text-white transition-transform hover:scale-[1.03]"
            style={
              c.primary
                ? { background: "#D93651" }
                : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }
            }
          >
            {c.cta} <span aria-hidden>→</span>
          </Link>
        </div>
      ))}
    </div>
  );
}

function useInView(threshold = 0.3) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    // Trigger the animation every time it enters, reset when it leaves
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

export default function StatsCounter() {
  const [statsRef, statsInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  return (
    <>
      {/* Stats — one screen tall, like the Featured sections */}
      <section ref={statsRef} className="snap-section snap-grow flex flex-col justify-center relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(232,220,192,0.015) 0%, transparent 70%)",
          }} />
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.003) 0px, rgba(255,255,255,0.003) 1px, transparent 1px, transparent 60px),
                              repeating-linear-gradient(90deg, rgba(255,255,255,0.003) 0px, rgba(255,255,255,0.003) 1px, transparent 1px, transparent 60px)`,
          }} />
          <div className="absolute top-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to bottom, #0F1116, transparent)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to top, #0F1116, transparent)" }} />
        </div>

        <div data-reveal className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 items-start">
            {stats.map((stat, i) => (
              <StatItem key={i} {...stat} trigger={statsInView} delay={i * 200} />
            ))}
          </div>
          <p
            className="text-center text-xs sm:text-sm tracking-[0.25em] uppercase text-white/40"
            style={{
              marginTop: "clamp(8px, 2vh, 24px)",
              opacity: statsInView ? 1 : 0,
              transition: "opacity 0.8s ease 1.2s",
            }}
          >
            — And growing <span style={{ color: "#E8DCC0" }}>every day</span> —
          </p>
        </div>
      </section>

      {/* List your event / Create your profile — its own screen-tall section */}
      <section ref={ctaRef} className="snap-section snap-grow flex flex-col justify-center">
        <div data-reveal className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <CtaCards show={ctaInView} />
        </div>
      </section>
    </>
  );
}
