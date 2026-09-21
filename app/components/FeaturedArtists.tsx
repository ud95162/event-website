"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart } from "lucide-react";
import { useAdminData } from "../context/AdminDataContext";
import { artistSlug } from "../lib/slug";

const FIXED_OVERHEAD = 220;

function useCardSizes(sectionRef: React.RefObject<HTMLElement | null>) {
  const [sizes, setSizes] = useState({ CARD_H: 380, CARD_W: 274 });

  useEffect(() => {
    const calc = (contentH: number) => {
      const CARD_H = Math.round(Math.min(460, Math.max(300, contentH - FIXED_OVERHEAD)));
      const CARD_W = Math.round(CARD_H * 0.72);
      setSizes({ CARD_H, CARD_W });
    };
    const observer = new ResizeObserver(entries => {
      for (const e of entries) calc(e.contentRect.height);
    });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [sectionRef]);

  return sizes;
}

const ACCENT_COLOR = "#39BD69";
const ACCENT_RGB   = "57,189,105";

export default function FeaturedArtists() {
  const { artists: allArtists, loading } = useAdminData();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { CARD_H, CARD_W } = useCardSizes(sectionRef);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Admin-selected featured artists; fall back to the first artists if none picked.
  const artists = useMemo(() => {
    const featured = allArtists.filter((a) => a.featured);
    return (featured.length ? featured : allArtists).slice(0, 8);
  }, [allArtists]);

  const [followed,    setFollowed]    = useState<Set<number>>(new Set());
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const toggleFollow = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowed(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  // Each arrow click scrolls the row by about two cards.
  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (CARD_W + 20) * 2, behavior: "smooth" });
  };

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

      <div className="flex flex-col items-center justify-center w-full">

        {/* Header */}
        <div className="text-center relative z-[200] select-none" style={{ marginBottom: "clamp(8px, 2vh, 32px)" }}>
          <p className="text-white/30 text-[12px] font-semibold tracking-[0.4em] uppercase" style={{ marginBottom: "clamp(4px, 1vh, 12px)" }}>
            PERFORM BEYOND LIMITS
          </p>
          <h2 className="text-white font-black uppercase tracking-tight" style={{ fontSize: "clamp(1.2rem, 3vw + 1vh, 2rem)", marginBottom: "clamp(4px, 1vh, 16px)" }}>
            Featured Artists
          </h2>
        </div>

        {/* Horizontal scroll row + arrows */}
        <div className="relative w-full z-[100]" style={{ maxWidth: 1200 }}>
          <style>{`.fa-row::-webkit-scrollbar{display:none}`}</style>

          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-[150]" style={{ width: 60, background: "linear-gradient(to right, #080808, transparent)" }} />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-[150]" style={{ width: 60, background: "linear-gradient(to left, #080808, transparent)" }} />

          {/* Prev arrow */}
          <button
            onClick={() => scrollByCards(-1)}
            aria-label="Scroll left"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-[200] w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/50 backdrop-blur hover:bg-white hover:border-white transition-all group/prev"
          >
            <ArrowRight size={15} className="text-white group-hover/prev:text-black transition-colors rotate-180" />
          </button>

          {/* Scroll track */}
          <div
            ref={scrollRef}
            className="fa-row flex overflow-x-auto"
            style={{ gap: 20, paddingLeft: 56, paddingRight: 56, paddingTop: 8, paddingBottom: 8, scrollbarWidth: "none", scrollSnapType: "x mandatory" }}
          >
            {/* Skeleton placeholders while data is loading (no cached data yet) */}
            {mounted && loading && artists.length === 0 && [...Array(5)].map((_, i) => (
              <div key={`sk-${i}`} className="relative rounded-2xl overflow-hidden flex-shrink-0" style={{ width: CARD_W, height: CARD_H, background: "#0d0d12", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(110deg, #0d0d12 30%, #16161f 50%, #0d0d12 70%)", backgroundSize: "200% 100%", animation: "fa-skel 1.3s ease-in-out infinite" }} />
              </div>
            ))}
            <style>{`@keyframes fa-skel { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>

            {mounted && artists.map(card => {
              const hovered = hoveredCard === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => router.push(`/artists/${artistSlug(card)}`)}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer flex-shrink-0"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    scrollSnapAlign: "start",
                    background: hovered ? "#0d1f2d" : "#080808",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: hovered ? `0 0 40px rgba(${ACCENT_RGB},0.15)` : "none",
                    transform: hovered ? "translateY(-6px)" : "translateY(0)",
                    transition: "background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
                  }}
                >
                  {/* Image */}
                  <div className="relative w-full overflow-hidden" style={{ height: "62%" }}>
                    <img
                      src={card.image}
                      alt={card.stageName || card.name}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover object-top"
                      style={{
                        transform: hovered ? "scale(1.08)" : "scale(1)",
                        filter: hovered ? "grayscale(0%)" : "grayscale(35%)",
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
                      <h3 className="text-white font-black text-base uppercase mb-3 tracking-wide">{card.stageName || card.name}</h3>
                    </div>
                    <div className="flex justify-center">
                      <div className="h-[3px] rounded-full" style={{ width: hovered ? "60%" : "30%", background: `linear-gradient(90deg,${ACCENT_COLOR},#2ecc71)`, transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next arrow */}
          <button
            onClick={() => scrollByCards(1)}
            aria-label="Scroll right"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-[200] w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/50 backdrop-blur hover:bg-white hover:border-white transition-all group/next"
          >
            <ArrowRight size={15} className="text-white group-hover/next:text-black transition-colors" />
          </button>
        </div>

        {/* Explore button */}
        <div className="text-center mt-6 relative z-[200]">
          <button className="btn-outline text-sm px-10 py-3.5 rounded-full" onClick={() => router.push("/artists")}>
            EXPLORE MORE
          </button>
        </div>

      </div>
    </section>
  );
}
