"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart } from "lucide-react";
import { artistSlug } from "../lib/slug";

// ANGLE_STEP defined after N below

const FIXED_OVERHEAD = 200;

function useCardSizes(sectionRef: React.RefObject<HTMLElement | null>) {
  const [sizes, setSizes] = useState({ CARD_H: 380, CARD_W: 285, RADIUS_X: 400 });

  useEffect(() => {
    const calc = (contentH: number, contentW: number) => {
      const CARD_H   = Math.round(Math.min(520, Math.max(180, contentH - FIXED_OVERHEAD)));
      const CARD_W   = Math.round(CARD_H * 0.75);
      const RADIUS_X = Math.round(Math.min(contentW * 0.36, CARD_W * 1.35));
      setSizes({ CARD_H, CARD_W, RADIUS_X });
    };
    const observer = new ResizeObserver(entries => {
      for (const e of entries) calc(e.contentRect.height, e.contentRect.width);
    });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [sectionRef]);

  return sizes;
}

const ACCENT_COLOR = "#39BD69";
const ACCENT_RGB   = "57,189,105";

const artists = [
  { id: 1, name: "DJ Nova",         role: "EDM / HOUSE MUSIC",         image: "/artists/1.png" },
  { id: 2, name: "Randhir Witana",  role: "SRI LANKAN MUSICAL ARTIST", image: "/artists/2.png" },
  { id: 3, name: "Maya Perera",     role: "POP & ACOUSTIC ARTIST",     image: "/artists/3.png" },
  { id: 4, name: "Ashanthi Dias",   role: "SRI LANKAN MUSICAL ARTIST", image: "/artists/4.png" },
  { id: 5, name: "Kasun Silva",     role: "ROCK & INDIE ARTIST",       image: "/artists/1.png" },
  { id: 6, name: "Nadia Fernando",  role: "R&B / SOUL ARTIST",         image: "/artists/2.png" },
  { id: 7, name: "The Beat Crew",   role: "LIVE BAND",                 image: "/artists/3.png" },
  { id: 8, name: "Hiruni De Silva", role: "CLASSICAL FUSION ARTIST",   image: "/artists/4.png" },
];

const N = Math.min(artists.length, 6);
const ANGLE_STEP = (Math.PI * 2) / N;

export default function FeaturedArtists() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const { CARD_H, CARD_W, RADIUS_X } = useCardSizes(sectionRef);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const currentAngle = useRef(0);
  const targetAngle  = useRef(0);
  const rafRef       = useRef<number>(0);
  const animFn       = useRef<() => void>(() => {});

  const [baseAngle,    setBaseAngle]    = useState(0);
  const [followed,     setFollowed]     = useState<Set<number>>(new Set());
  const [hoveredCard,  setHoveredCard]  = useState<number | null>(null);

  const toggleFollow = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowed(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  animFn.current = () => {
    const diff = targetAngle.current - currentAngle.current;
    if (Math.abs(diff) < 0.0003) {
      currentAngle.current = targetAngle.current;
      setBaseAngle(targetAngle.current);
      return;
    }
    currentAngle.current += diff * 0.09;
    setBaseAngle(currentAngle.current);
    rafRef.current = requestAnimationFrame(() => animFn.current());
  };

  const startAnim = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => animFn.current());
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const activeIndex = ((-Math.round(targetAngle.current / ANGLE_STEP)) % N + N) % N;

  const next = () => { targetAngle.current -= ANGLE_STEP; startAnim(); };
  const prev = () => { targetAngle.current += ANGLE_STEP; startAnim(); };

  const goTo = (i: number) => {
    const base = -i * ANGLE_STEP;
    const k    = Math.round((targetAngle.current - base) / (N * ANGLE_STEP));
    targetAngle.current = base + k * (N * ANGLE_STEP);
    startAnim();
  };

  const cards = artists.slice(0, 6).map((artist, i) => {
    const angle   = baseAngle + i * ANGLE_STEP;
    const x       = Math.sin(angle) * RADIUS_X;
    const z       = Math.cos(angle);
    const depth   = (z + 1) / 2;
    const scale   = 1;
    const opacity = 0.25 + depth * 0.75;
    const y       = Math.sin(angle * 0.5) * 30;
    const zIndex  = Math.round(depth * 100);
    const isFront = depth > 0.92;
    return { ...artist, x, y, depth, scale, opacity, zIndex, isFront };
  });

  const sorted = [...cards].sort((a, b) => a.depth - b.depth);

  return (
    <section ref={sectionRef} id="artists" className="snap-section overflow-hidden flex flex-col justify-center relative" style={{ padding: "3vh 0" }}>

      {/* Background overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(57,189,105,0.015) 0%, transparent 70%)",
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.003) 0px, rgba(255,255,255,0.003) 1px, transparent 1px, transparent 60px),
                            repeating-linear-gradient(90deg, rgba(255,255,255,0.003) 0px, rgba(255,255,255,0.003) 1px, transparent 1px, transparent 60px)`,
        }} />
        <div className="absolute top-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to bottom, #080808, transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to top, #080808, transparent)" }} />
      </div>

      <div className="flex flex-col items-center justify-center">

        {/* Header */}
        <div className="text-center relative z-[200] select-none" style={{ marginBottom: "clamp(8px, 2vh, 32px)" }}>
          <p className="text-white/30 text-[12px] font-semibold tracking-[0.4em] uppercase" style={{ marginBottom: "clamp(4px, 1vh, 12px)" }}>
            PERFORM BEYOND LIMITS
          </p>
          <h2 className="text-white font-black uppercase tracking-tight" style={{ fontSize: "clamp(1.2rem, 3vw + 1vh, 2rem)", marginBottom: "clamp(4px, 1vh, 16px)" }}>
            Featured Artists
          </h2>
        </div>

        {/* Carousel + Arrows */}
        <div className="relative flex items-center justify-center w-full" style={{ maxWidth: 1100 }}>

          <button
            onClick={prev}
            aria-label="Previous artist"
            className="absolute left-4 z-[200] w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:border-white transition-all group/prev"
          >
            <ArrowRight size={14} className="text-white group-hover/prev:text-black transition-colors rotate-180" />
          </button>

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
                {/* Inner: handles visuals + hover (CSS transition) */}
                <div
                  className="absolute rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/artists/${artistSlug(card)}`)}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    background: hoveredCard === card.id ? "#0d1f2d" : "#080808",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: hoveredCard === card.id ? `0 0 40px rgba(${ACCENT_RGB},0.15)` : "none",
                    filter: card.isFront ? "brightness(1.1)" : `brightness(${0.4 + card.depth * 0.5})`,
                    transition: "background 0.4s ease, box-shadow 0.4s ease, filter 0.4s ease",
                  }}
                >
                  {/* Image */}
                  <div className="relative w-full overflow-hidden flex-shrink-0" style={{ height: "62%" }}>
                    <img
                      src={card.image}
                      alt={card.name}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover object-top"
                      style={{
                        transform: hoveredCard === card.id ? "scale(1.08)" : "scale(1)",
                        filter: card.isFront ? "grayscale(0%)" : "grayscale(50%)",
                        transition: "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.5s ease",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />

                    {/* Follow button */}
                    <button
                      onClick={(e) => toggleFollow(card.id, e)}
                      className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{
                        background: followed.has(card.id) ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.45)",
                        border: followed.has(card.id) ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.15)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <Heart size={11} strokeWidth={2.5}
                        style={{ color: followed.has(card.id) ? "#fff" : "rgba(255,255,255,0.7)" }}
                        fill={followed.has(card.id) ? "#fff" : "none"}
                      />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="px-4 pb-4 pt-2 text-center flex flex-col justify-between" style={{ height: "38%" }}>
                    <div>
                      <p className="text-white/35 text-[11px] font-bold tracking-[0.3em] uppercase mb-1.5">{card.role}</p>
                      <h3 className="text-white font-black text-base uppercase mb-3 tracking-wide">{card.name}</h3>
                    </div>
                    <div className="flex justify-center">
                      <div className="h-[3px] rounded-full" style={{ width: card.isFront ? "60%" : "30%", background: `linear-gradient(90deg,${ACCENT_COLOR},#2ecc71)`, transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next artist"
            className="absolute right-4 z-[200] w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:border-white transition-all group/next"
          >
            <ArrowRight size={14} className="text-white group-hover/next:text-black transition-colors" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-3 relative z-[200]">
          {artists.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to artist ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? 24 : 6,
                height: 6,
                background: i === activeIndex ? ACCENT_COLOR : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>

        {/* Explore button */}
        <div className="text-center mt-3 relative z-[200]">
          <button className="btn-outline text-sm px-10 py-3.5 rounded-full">
            EXPLORE MORE
          </button>
        </div>

      </div>
    </section>
  );
}
