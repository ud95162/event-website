"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart, Share2, MapPin } from "lucide-react";
import { useUserLocation, haversineKm, formatDistance } from "../context/LocationContext";
import { events as allEvents } from "../data/events";
import { eventSlug } from "../lib/slug";

const events     = allEvents.slice(0, 6);
const N          = events.length;
const ANGLE_STEP = (Math.PI * 2) / N;

// Non-card content: header(80) + headerMargin(14) + stageOffset(40) + mt6×2(48) + dots(6) + button(50) ≈ 238
const FIXED_OVERHEAD = 200;

function useCardSizes(sectionRef: React.RefObject<HTMLElement | null>) {
  const [sizes, setSizes] = useState({ CARD_H: 380, CARD_W: 285, IMG_H: 220, INFO_H: 160, RADIUS_X: 400 });

  useEffect(() => {
    const calc = (contentH: number, contentW: number) => {
      // contentRect already excludes padding — no need to subtract it again
      const CARD_H = Math.round(Math.min(520, Math.max(180, contentH - FIXED_OVERHEAD)));
      const CARD_W = Math.round(CARD_H * 0.75);
      const IMG_H  = Math.round(CARD_H * 0.58);
      const INFO_H = CARD_H - IMG_H;
      const RADIUS_X = Math.round(Math.min(contentW * 0.36, CARD_W * 1.35));
      setSizes({ CARD_H, CARD_W, IMG_H, INFO_H, RADIUS_X });
    };

    const observer = new ResizeObserver(entries => {
      for (const e of entries) calc(e.contentRect.height, e.contentRect.width);
    });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [sectionRef]);

  return sizes;
}

export default function FeaturedEvents() {
  const { userLocation } = useUserLocation();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const { CARD_H, CARD_W, IMG_H, INFO_H, RADIUS_X } = useCardSizes(sectionRef);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* ── Angle state: current (animated) vs target (snaps on click) ─────── */
  const currentAngle = useRef(0);
  const targetAngle  = useRef(0);
  const rafRef       = useRef<number>(0);
  const animFn       = useRef<() => void>(() => {});

  const [baseAngle,  setBaseAngle]  = useState(0);
  const [liked,      setLiked]      = useState<Set<number>>(new Set());
  const [shared,     setShared]     = useState<Set<number>>(new Set());
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

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
    const scale   = 1;
    const opacity = 0.25 + depth * 0.75;
    const y       = Math.sin(angle * 0.5) * 30;
    const zIndex  = Math.round(depth * 100);
    const isFront = depth > 0.92;
    return { ...event, x, y, depth, scale, opacity, zIndex, isFront };
  });

  const sorted = [...cards].sort((a, b) => a.depth - b.depth);

  return (
    <section ref={sectionRef} id="events" className="snap-section overflow-hidden flex flex-col justify-center" style={{ padding: "3vh 0" }}>

      <div className="flex flex-col items-center justify-center">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="text-center relative z-[200] select-none" style={{ marginBottom: "clamp(8px, 2vh, 32px)" }}>
          <p className="text-white/30 text-[12px] font-semibold tracking-[0.4em] uppercase" style={{ marginBottom: "clamp(4px, 1vh, 12px)" }}>
            YOUR BEST FAVORITE EVENTS START HERE
          </p>
          <h2 className="text-white font-black uppercase tracking-tight" style={{ fontSize: "clamp(1.2rem, 3vw + 1vh, 2rem)", marginBottom: "clamp(4px, 1vh, 16px)" }}>
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
            {mounted && sorted.map(card => (
              /* Outer: handles position only (RAF-driven, no CSS transition) */
              <div
                key={card.id}
                className="absolute"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%,-50%) translateX(${card.x}px) translateY(${card.y}px)`,
                  opacity: card.opacity,
                  zIndex: card.zIndex,
                  willChange: "transform",
                }}
              >
              {/* Inner: handles scale + visuals (CSS transition) */}
              <div
                className="absolute rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => router.push(`/events/${eventSlug(card)}`)}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  minHeight: CARD_H,
                  maxHeight: CARD_H,
                  top: "50%",
                  left: "50%",
                  overflow: "hidden",
                  background: hoveredCard === card.id ? "#0d2318" : "#080808",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: hoveredCard === card.id ? "0 0 40px rgba(57,189,105,0.15)" : "none",
                  transform: `translate(-50%,-50%)`,
                  filter: card.isFront ? "brightness(1.1)" : `brightness(${0.4 + card.depth * 0.5})`,
                  transition: "background 0.4s ease, box-shadow 0.4s ease, filter 0.4s ease",
                }}
              >
                {/* Image */}
                <div className="relative w-full overflow-hidden flex-shrink-0" style={{ height: IMG_H }}>
                  <img src={card.image} alt={card.title} loading="eager" decoding="async" className="w-full h-full object-cover object-top"
                    style={{
                      transform: hoveredCard === card.id ? "scale(1.08)" : "scale(1)",
                      transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
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
                <div className="px-4 pb-3 pt-1 text-center flex flex-col justify-between overflow-hidden" style={{ height: INFO_H }}>
                  <div>
                    <h3 className="text-white font-black uppercase tracking-wide leading-tight mb-2 transition-all duration-300"
                      style={{ fontSize: hoveredCard === card.id ? "17px" : "16px" }}>{card.title}</h3>
                    <p className="leading-relaxed transition-all duration-300"
                      style={{
                        color: hoveredCard === card.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
                        fontSize: hoveredCard === card.id ? "14px" : "13px",
                        fontWeight: hoveredCard === card.id ? 500 : 400,
                      }}>Date: {card.date} | Location: {card.location}</p>
                    <p className="transition-all duration-300"
                      style={{
                        color: hoveredCard === card.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
                        fontSize: hoveredCard === card.id ? "14px" : "13px",
                        fontWeight: hoveredCard === card.id ? 500 : 400,
                      }}>Price: {card.price.replace("Starting from ", "")}</p>
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
        <div className="flex gap-2 mt-3 relative z-[200]">
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
        <div className="text-center mt-3 relative z-[200]">
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
