"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, MapPin, DollarSign } from "lucide-react";

const events = [
  {
    id: 1, tag: "MUSIC FESTIVAL", title: "New Single Urban Music",
    date: "27 August 2025", location: "Colombo", price: "Starting from LKR 4,500",
    image: "/events/event1.png", badge: null,
  },
  {
    id: 2, tag: "MUSIC PARTY", title: "Urban Music Party",
    date: "27 August 2025", location: "Colombo", price: "Starting from LKR 4,500",
    image: "/events/event2.png", badge: "HOT",
  },
  {
    id: 3, tag: "MUSIC CONCERT", title: "Lovers Night 2027",
    date: "12 February 2027", location: "Brisbane", price: "Starting from LKR 4,500",
    image: "/events/event3.png", badge: null,
  },
  {
    id: 4, tag: "DJ NIGHT", title: "Tharle DJ Night",
    date: "27 August 2026", location: "Colombo", price: "Starting from LKR 4,500",
    image: "/events/event4.png", badge: "COMING SOON",
  },
  {
    id: 5, tag: "LIVE CONCERT", title: "Neon Beats Live",
    date: "05 March 2027", location: "Galle", price: "Starting from LKR 3,500",
    image: "/events/event1.png", badge: "NEW",
  },
  {
    id: 6, tag: "CULTURAL NIGHT", title: "Rhythm & Soul",
    date: "18 November 2026", location: "Kandy", price: "Starting from LKR 5,000",
    image: "/events/event2.png", badge: null,
  },
];

const CARD_W     = 280;
const CARD_H     = 370;
const RADIUS_X   = 420;    // horizontal spread
const SCROLL_PX  = 2400;   // scroll distance for full experience
const N          = events.length;
const ANGLE_STEP = (Math.PI * 2) / N;
const STICKY_TOP  = 130;   // navbar (64px) + filter bar (~66px) height

export default function FeaturedEvents() {
  const spiralRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!spiralRef.current) return;
      const top = spiralRef.current.getBoundingClientRect().top;
      const range = spiralRef.current.offsetHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, -top / range));
      setProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Map progress to rotation angle (1.5 full turns)
  const baseAngle = progress * Math.PI * 2 * 1.5;

  // Calculate each card's projected position
  const cards = events.map((event, i) => {
    const angle = baseAngle + i * ANGLE_STEP;
    const x = Math.sin(angle) * RADIUS_X;
    const z = Math.cos(angle);                    // -1 (back) to 1 (front)
    const depth = (z + 1) / 2;                    // 0 (back) to 1 (front)
    const scale = 0.55 + depth * 0.45;            // 0.55 → 1.0
    const opacity = 0.25 + depth * 0.75;          // 0.25 → 1.0
    const y = Math.sin(angle * 0.5) * 30;         // gentle vertical wave
    const zIndex = Math.round(depth * 100);
    const isFront = depth > 0.92;

    return { ...event, x, y, z, depth, scale, opacity, zIndex, isFront, index: i };
  });

  // Sort by depth so back cards render first
  const sorted = [...cards].sort((a, b) => a.depth - b.depth);

  return (
    <section
      id="events"
      ref={spiralRef}
      style={{ height: SCROLL_PX + 900 }}
    >
      <div
        className="sticky flex flex-col items-center justify-center overflow-hidden"
        style={{ top: STICKY_TOP, height: `calc(100vh - ${STICKY_TOP}px)` }}
      >
        {/* ── Header — stays visible inside the sticky viewport ──── */}
        <div className="text-center mb-4 relative z-[200] select-none">
          <p className="text-white/30 text-[10px] font-semibold tracking-[0.4em] uppercase mb-3">
            YOUR BEST FAVORITE EVENTS START HERE
          </p>
          <h2 className="text-white font-black text-5xl uppercase mb-4 tracking-tight">
            Featured Events
          </h2>
        </div>
          {/* ── Spiral Carousel ───────────────────────────────────── */}
          <div
            className="relative"
            style={{ width: "100%", maxWidth: 1100, height: CARD_H + 40 }}
          >
            {sorted.map((card) => (
              <div
                key={card.id}
                className="absolute rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  left: "50%",
                  top: "50%",
                  background: "#0a0a2e",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transform: `translate(-50%, -50%) translateX(${card.x}px) translateY(${card.y}px) scale(${card.scale})`,
                  opacity: card.opacity,
                  filter: card.isFront ? "brightness(1.1)" : `brightness(${0.4 + card.depth * 0.5})`,
                  zIndex: card.zIndex,
                  transition: "transform 0.15s linear, opacity 0.15s linear, filter 0.25s ease",
                }}
              >
                {/* Image — top 60% */}
                <div className="relative w-full" style={{ height: "58%" }}>
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a2e] via-transparent to-transparent" />

                  {/* Badge */}
                  {card.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-white text-black text-[8px] font-black px-2.5 py-1 rounded-full tracking-[0.18em] uppercase">
                        {card.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Text area — bottom 42% */}
                <div className="px-4 pb-3 pt-1 text-center flex flex-col justify-between" style={{ height: "42%" }}>
                  <div>
                    <p className="text-white/40 text-[9px] font-bold tracking-[0.25em] uppercase mb-1.5">
                      {card.tag}
                    </p>
                    <h3 className="text-white font-black text-sm uppercase mb-2 tracking-wide leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-white/40 text-[11px] leading-relaxed">
                      Date: {card.date} | Location: {card.location}
                    </p>
                    <p className="text-white/40 text-[11px]">
                      Price: {card.price.replace("Starting from ", "")}
                    </p>
                  </div>

                  {/* Green accent bar */}
                  <div className="flex justify-center mt-2">
                    <div
                      className="h-[3px] rounded-full"
                      style={{
                        width: card.isFront ? "60%" : "30%",
                        background: "linear-gradient(90deg, #39BD69, #2ecc71)",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Dot indicators ────────────────────────────────────── */}
          <div className="flex gap-2 mt-6 relative z-[200]">
            {events.map((_, i) => {
              const angle = baseAngle + i * ANGLE_STEP;
              const z = Math.cos(angle);
              const active = (z + 1) / 2 > 0.92;
              return (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: active ? 24 : 6,
                    height: 6,
                    background: active ? "#39BD69" : "rgba(255,255,255,0.25)",
                  }}
                />
              );
            })}
          </div>

          <p className="text-white/20 text-[9px] tracking-[0.3em] uppercase mt-3 select-none relative z-[200]">
            SCROLL TO EXPLORE
          </p>
      </div>
    </section>
  );
}
