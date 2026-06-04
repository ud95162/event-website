"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart } from "lucide-react";

const CARD_W     = 300;
const CARD_H     = 400;
const RADIUS_X   = 400;
const ANGLE_STEP = (Math.PI * 2) / 8;

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

const N = artists.length;

export default function FeaturedArtists() {
  const router = useRouter();

  const currentAngle = useRef(0);
  const targetAngle  = useRef(0);
  const rafRef       = useRef<number>(0);
  const animFn       = useRef<() => void>(() => {});

  const [baseAngle, setBaseAngle] = useState(0);
  const [followed,  setFollowed]  = useState<Set<number>>(new Set());

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

  const cards = artists.map((artist, i) => {
    const angle   = baseAngle + i * ANGLE_STEP;
    const x       = Math.sin(angle) * RADIUS_X;
    const z       = Math.cos(angle);
    const depth   = (z + 1) / 2;
    const scale   = 0.55 + depth * 0.45;
    const opacity = 0.25 + depth * 0.75;
    const y       = Math.sin(angle * 0.5) * 30;
    const zIndex  = Math.round(depth * 100);
    const isFront = depth > 0.92;
    return { ...artist, x, y, depth, scale, opacity, zIndex, isFront };
  });

  const sorted = [...cards].sort((a, b) => a.depth - b.depth);

  return (
    <section id="artists" className="py-20 overflow-hidden h-screen flex flex-col justify-center relative">

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
        <div className="text-center mb-8 relative z-[200] select-none">
          <p className="text-white/30 text-[12px] font-semibold tracking-[0.4em] uppercase mb-3">
            PERFORM BEYOND LIMITS
          </p>
          <h2 className="text-white font-black text-3xl uppercase mb-4 tracking-tight">
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
            {sorted.map(card => (
              <div
                key={card.id}
                className="absolute rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => router.push(`/artists/${card.id}`)}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  left: "50%",
                  top: "50%",
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transform: `translate(-50%,-50%) translateX(${card.x}px) translateY(${card.y}px) scale(${card.scale})`,
                  opacity: card.opacity,
                  filter: card.isFront ? "brightness(1.1)" : `brightness(${0.4 + card.depth * 0.5})`,
                  zIndex: card.zIndex,
                  willChange: "transform",
                }}
              >
                {/* Image */}
                <div className="relative w-full" style={{ height: "62%" }}>
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover object-top"
                    style={{
                      filter: card.isFront ? "grayscale(0%)" : "grayscale(60%)",
                      transition: "filter 0.5s ease",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />

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
                    <Heart
                      size={11}
                      strokeWidth={2.5}
                      style={{ color: followed.has(card.id) ? "#fff" : "rgba(255,255,255,0.7)" }}
                      fill={followed.has(card.id) ? "#fff" : "none"}
                    />
                  </button>
                </div>

                {/* Info */}
                <div className="px-4 pb-4 pt-2 text-center flex flex-col justify-between" style={{ height: "38%" }}>
                  <div>
                    <p className="text-white/35 text-[11px] font-bold tracking-[0.3em] uppercase mb-1.5">
                      {card.role}
                    </p>
                    <h3 className="text-white font-black text-base uppercase mb-3 tracking-wide">
                      {card.name}
                    </h3>
                  </div>
                  <div className="flex justify-center">
                    <div
                      className="h-[3px] rounded-full"
                      style={{
                        width: card.isFront ? "60%" : "30%",
                        background: `linear-gradient(90deg, ${ACCENT_COLOR}, #2ecc71)`,
                        transition: "width 0.4s ease",
                      }}
                    />
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
        <div className="flex gap-2 mt-6 relative z-[200]">
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
        <div className="text-center mt-6 relative z-[200]">
          <button className="btn-outline text-sm px-10 py-3.5 rounded-full">
            EXPLORE MORE
          </button>
        </div>

      </div>
    </section>
  );
}
