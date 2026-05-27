"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { label: "Events Discovered", value: 250, suffix: "+" },
  { label: "Satisfied Users", value: 12, suffix: "K+" },
  { label: "Total Reach", value: 48, suffix: "M+" },
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

function StatItem({ label, value, suffix, trigger, delay }: {
  label: string; value: number; suffix: string; trigger: boolean; delay: number;
}) {
  const [started, setStarted] = useState(false);
  const count = useCountUp(value, 2000, started);

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
      className="flex-1 flex flex-col items-center text-center py-10 px-4"
      style={{
        opacity: started ? 1 : 0,
        transform: started ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Number */}
      <span
        className="font-black tracking-tighter leading-none mb-3"
        style={{
          fontSize: "clamp(3.5rem, 7vw, 5.5rem)",
          background: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.35) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {count}{suffix}
      </span>

      {/* Green accent dot */}
      <div
        className="w-1.5 h-1.5 rounded-full mb-3"
        style={{
          background: "#39BD69",
          boxShadow: "0 0 8px rgba(57,189,105,0.6)",
          transform: started ? "scale(1)" : "scale(0)",
          transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
          transitionDelay: `${delay + 400}ms`,
        }}
      />

      {/* Label */}
      <p className="text-white/40 text-xs font-semibold tracking-[0.2em] uppercase">
        {label}
      </p>
    </div>
  );
}

export default function StatsCounter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger animation every time it enters, reset when it leaves
        setInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center">
          {stats.map((stat, i) => (
            <StatItem
              key={stat.label}
              label={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              trigger={inView}
              delay={i * 250}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
