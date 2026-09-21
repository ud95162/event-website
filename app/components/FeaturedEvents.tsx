"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart, Share2, MapPin } from "lucide-react";
import { useUserLocation, haversineKm, formatDistance } from "../context/LocationContext";
import { useAdminData } from "../context/AdminDataContext";
import { eventSlug } from "../lib/slug";
import { fromPrice } from "../lib/price";

// Non-card content above/below the row (header + explore button).
const FIXED_OVERHEAD = 220;

function useCardSizes(sectionRef: React.RefObject<HTMLElement | null>) {
  const [sizes, setSizes] = useState({ CARD_H: 380, CARD_W: 274, IMG_H: 220, INFO_H: 160 });

  useEffect(() => {
    const calc = (contentH: number) => {
      const CARD_H = Math.round(Math.min(460, Math.max(300, contentH - FIXED_OVERHEAD)));
      const CARD_W = Math.round(CARD_H * 0.72);
      const IMG_H  = Math.round(CARD_H * 0.58);
      const INFO_H = CARD_H - IMG_H;
      setSizes({ CARD_H, CARD_W, IMG_H, INFO_H });
    };

    const observer = new ResizeObserver(entries => {
      for (const e of entries) calc(e.contentRect.height);
    });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [sectionRef]);

  return sizes;
}

export default function FeaturedEvents() {
  const { userLocation } = useUserLocation();
  const { events: allEvents, loading } = useAdminData();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { CARD_H, CARD_W, IMG_H, INFO_H } = useCardSizes(sectionRef);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Admin-selected featured events; fall back to the first events if none picked.
  const events = useMemo(() => {
    const featured = allEvents.filter((e) => e.featured);
    return (featured.length ? featured : allEvents).slice(0, 8);
  }, [allEvents]);

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

  // Each arrow click scrolls the row by about two cards.
  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (CARD_W + 20) * 2, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} id="events" className="snap-section overflow-hidden flex flex-col justify-center" style={{ padding: "3vh 0" }}>

      <div className="flex flex-col items-center justify-center w-full">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="text-center relative z-[200] select-none" style={{ marginBottom: "clamp(8px, 2vh, 32px)" }}>
          <p className="text-white/30 text-[12px] font-semibold tracking-[0.4em] uppercase" style={{ marginBottom: "clamp(4px, 1vh, 12px)" }}>
            YOUR BEST FAVORITE EVENTS START HERE
          </p>
          <h2 className="text-white font-black uppercase tracking-tight" style={{ fontSize: "clamp(1.2rem, 3vw + 1vh, 2rem)", marginBottom: "clamp(4px, 1vh, 16px)" }}>
            Featured Events
          </h2>
        </div>

        {/* ── Horizontal scroll row + arrows ────────────────────────── */}
        <div className="relative w-full" style={{ maxWidth: 1200 }}>
          <style>{`.fe-row::-webkit-scrollbar{display:none}`}</style>

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
            className="fe-row flex overflow-x-auto"
            style={{ gap: 20, paddingLeft: 56, paddingRight: 56, paddingTop: 8, paddingBottom: 8, scrollbarWidth: "none", scrollSnapType: "x mandatory" }}
          >
            {/* Skeleton placeholders while data is loading (no cached data yet) */}
            {mounted && loading && events.length === 0 && [...Array(5)].map((_, i) => (
              <div key={`sk-${i}`} className="relative rounded-2xl overflow-hidden flex-shrink-0" style={{ width: CARD_W, height: CARD_H, background: "#0d0d12", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(110deg, #0d0d12 30%, #16161f 50%, #0d0d12 70%)", backgroundSize: "200% 100%", animation: "fe-skel 1.3s ease-in-out infinite" }} />
              </div>
            ))}
            <style>{`@keyframes fe-skel { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>

            {mounted && events.map(card => {
              const hovered = hoveredCard === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => router.push(`/events/${eventSlug(card)}`)}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer flex-shrink-0"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    scrollSnapAlign: "start",
                    background: hovered ? "#0d2318" : "#080808",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: hovered ? "0 0 40px rgba(57,189,105,0.15)" : "none",
                    transform: hovered ? "translateY(-6px)" : "translateY(0)",
                    transition: "background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
                  }}
                >
                  {/* Image */}
                  <div className="relative w-full overflow-hidden" style={{ height: IMG_H }}>
                    <img src={card.image} alt={card.title} loading="eager" decoding="async" className="w-full h-full object-cover object-top"
                      style={{
                        transform: hovered ? "scale(1.08)" : "scale(1)",
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
                        <Heart size={11} strokeWidth={2.5} style={{ color: liked.has(card.id) ? "#fff" : "rgba(255,255,255,0.7)" }} fill={liked.has(card.id) ? "#fff" : "none"} />
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
                        <Share2 size={11} strokeWidth={2.5} style={{ color: shared.has(card.id) ? "#fff" : "rgba(255,255,255,0.7)" }} />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-4 pb-3 pt-2 text-center flex flex-col justify-between overflow-hidden" style={{ height: INFO_H }}>
                    <div>
                      <h3 className="text-white font-black uppercase tracking-wide leading-tight mb-2"
                        style={{ fontSize: 16 }}>{card.title}</h3>
                      <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
                        Date: {card.date} | Location: {card.location}
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>Price: {fromPrice(card.tickets, card.price)}</p>
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
                      <div className="h-[3px] rounded-full" style={{ width: hovered ? "60%" : "30%", background: "linear-gradient(90deg, #39BD69, #2ecc71)", transition: "width 0.4s ease" }} />
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
