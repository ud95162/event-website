"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart, Share2, MapPin } from "lucide-react";
import { useUserLocation, haversineKm, formatDistance } from "../context/LocationContext";
import { events } from "../data/events";

const CARD_W     = 340;
const CARD_H     = 440;
const RADIUS_X   = 420;
const N          = events.length;
const ANGLE_STEP = (Math.PI * 2) / N;

export default function FeaturedEvents() {
  const { userLocation } = useUserLocation();
  const router = useRouter();

  /* ── Angle state: current (animated) vs target (snaps on click) ─────── */
  const currentAngle = useRef(0);
  const targetAngle  = useRef(0);
  const rafRef       = useRef<number>(0);
  const animFn       = useRef<() => void>(() => {});

  const [baseAngle,  setBaseAngle]  = useState(0);
  const [liked,      setLiked]      = useState<Set<number>>(new Set());
  const [shared,     setShared]     = useState<Set<number>>(new Set());

  const toggleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const handleShare = (id: number, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
    setShared(prev => { const s = new Set(prev); s.add(id); return s; });
    setTimeout(() => setShared(prev => { const s = new Set(prev); s.delete(id); return s; }), 1500);
  };

  /* RAF lerp — same momentum feel as the scroll version */
  animFn.current = () => {
    const diff = targetAngle.current - currentAngle.current;
    if (Math.abs(diff) < 0.0003) {
      currentAngle.current = targetAngle.current;
      setBaseAngle(targetAngle.current);
      return;
    }
    currentAngle.current += diff * 0.09;   // 0.09 ≈ scroll easing speed
    setBaseAngle(currentAngle.current);
    rafRef.current = requestAnimationFrame(() => animFn.current());
  };

  const startAnim = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => animFn.current());
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  /* Active card index derived from target angle */
  const activeIndex = ((-Math.round(targetAngle.current / ANGLE_STEP)) % N + N) % N;

  /* ── Navigation helpers ──────────────────────────────────────────────── */
  const next = () => {
    targetAngle.current -= ANGLE_STEP;
    startAnim();
  };

  const prev = () => {
    targetAngle.current += ANGLE_STEP;
    startAnim();
  };

  /* Jump to specific dot — takes the shortest rotation path */
  const goTo = (i: number) => {
    const base = -i * ANGLE_STEP;
    const k    = Math.round((targetAngle.current - base) / (N * ANGLE_STEP));
    targetAngle.current = base + k * (N * ANGLE_STEP);
    startAnim();
  };

  /* ── Card positions ──────────────────────────────────────────────────── */
  const cards = events.map((event, i) => {
    const angle   = baseAngle + i * ANGLE_STEP;
    const x       = Math.sin(angle) * RADIUS_X;
    const z       = Math.cos(angle);
    const depth   = (z + 1) / 2;
    const scale   = 0.55 + depth * 0.45;
    const opacity = 0.25 + depth * 0.75;
    const y       = Math.sin(angle * 0.5) * 30;
    const zIndex  = Math.round(depth * 100);
    const isFront = depth > 0.92;
    return { ...event, x, y, depth, scale, opacity, zIndex, isFront };
  });

  const sorted = [...cards].sort((a, b) => a.depth - b.depth);

  return (
    <section id="events" className="py-20 overflow-hidden">
      <div className="flex flex-col items-center justify-center">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="text-center mb-8 relative z-[200] select-none">
          <p className="text-white/30 text-[12px] font-semibold tracking-[0.4em] uppercase mb-3">
            YOUR BEST FAVORITE EVENTS START HERE
          </p>
          <h2 className="text-white font-black text-3xl uppercase mb-4 tracking-tight">
            Featured Events
          </h2>
        </div>

        {/* ── Carousel + Arrows ─────────────────────────────────────── */}
        <div
          className="relative flex items-center justify-center w-full"
          style={{ maxWidth: 1100 }}
        >
          {/* Prev arrow */}
          <button
            onClick={prev}
            aria-label="Previous event"
            className="absolute left-4 z-[200] w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:border-white transition-all group/prev"
          >
            <ArrowRight size={14} className="text-white group-hover/prev:text-black transition-colors rotate-180" />
          </button>

          {/* Card stage */}
          <div className="relative" style={{ width: "100%", height: CARD_H + 40 }}>
            {sorted.map(card => (
              <div
                key={card.id}
                className="absolute rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => router.push(`/events/${card.id}`)}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  left: "50%",
                  top: "50%",
                  background: "#0a0a2e",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transform: `translate(-50%,-50%) translateX(${card.x}px) translateY(${card.y}px) scale(${card.scale})`,
                  opacity: card.opacity,
                  filter: card.isFront ? "brightness(1.1)" : `brightness(${0.4 + card.depth * 0.5})`,
                  zIndex: card.zIndex,
                  willChange: "transform",
                }}
              >
                {/* Image */}
                <div className="relative w-full" style={{ height: "58%" }}>
                  <img src={card.image} alt={card.title} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a2e] via-transparent to-transparent" />
                  {card.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-white text-black text-[10px] font-black px-2.5 py-1 rounded-full tracking-[0.18em] uppercase">
                        {card.badge}
                      </span>
                    </div>
                  )}
                  {/* Heart + Share */}
                  <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
                    <button
                      onClick={(e) => toggleLike(card.id, e)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{
                        background: liked.has(card.id) ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.45)",
                        border: liked.has(card.id) ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.15)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <Heart
                        size={11}
                        strokeWidth={2.5}
                        className="transition-colors"
                        style={{ color: liked.has(card.id) ? "#fff" : "rgba(255,255,255,0.7)" }}
                        fill={liked.has(card.id) ? "#fff" : "none"}
                      />
                    </button>
                    <button
                      onClick={(e) => handleShare(card.id, card.title, e)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{
                        background: shared.has(card.id) ? "rgba(57,189,105,0.85)" : "rgba(0,0,0,0.45)",
                        border: shared.has(card.id) ? "1px solid rgba(57,189,105,0.6)" : "1px solid rgba(255,255,255,0.15)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <Share2
                        size={11}
                        strokeWidth={2.5}
                        style={{ color: shared.has(card.id) ? "#fff" : "rgba(255,255,255,0.7)" }}
                      />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="px-4 pb-3 pt-1 text-center flex flex-col justify-between" style={{ height: "42%" }}>
                  <div>
                    <p className="text-white/40 text-[11px] font-bold tracking-[0.25em] uppercase mb-1.5">{card.tag}</p>
                    <h3 className="text-white font-black text-base uppercase mb-2 tracking-wide leading-tight">{card.title}</h3>
                    <p className="text-white/40 text-[13px] leading-relaxed">Date: {card.date} | Location: {card.location}</p>
                    <p className="text-white/40 text-[13px]">Price: {card.price.replace("Starting from ", "")}</p>
                    {userLocation && (
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <MapPin size={9} className="text-[#39BD69]" />
                        <span className="text-[12px] font-semibold" style={{ color: "#39BD69" }}>
                          {formatDistance(haversineKm(userLocation.lat, userLocation.lon, card.lat, card.lon))}
                        </span>
                      </div>
                    )}
                  </div>
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

          {/* Next arrow */}
          <button
            onClick={next}
            aria-label="Next event"
            className="absolute right-4 z-[200] w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:border-white transition-all group/next"
          >
            <ArrowRight size={14} className="text-white group-hover/next:text-black transition-colors" />
          </button>
        </div>

        {/* ── Dot indicators ────────────────────────────────────────── */}
        <div className="flex gap-2 mt-6 relative z-[200]">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to event ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? 24 : 6,
                height: 6,
                background: i === activeIndex ? "#39BD69" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>

        {/* ── Explore button ────────────────────────────────────────── */}
        <div className="text-center mt-6 relative z-[200]">
          <button
            className="btn-outline text-sm px-10 py-3.5 rounded-full"
            onClick={() => router.push("/events")}
          >
            EXPLORE MORE
          </button>
        </div>

      </div>
    </section>
  );
}
