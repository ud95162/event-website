"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Heart } from "lucide-react";

const ACCENT_RGB   = "57,189,105";
const ACCENT_COLOR = "#39BD69";
const PAGE_SIZE    = 4;

const artists = [
  { id: 1,  name: "DJ Nova",          role: "EDM / HOUSE MUSIC",           image: "/artists/1.png" },
  { id: 2,  name: "Randhir Witana",   role: "SRI LANKAN MUSICAL ARTIST",   image: "/artists/2.png" },
  { id: 3,  name: "Maya Perera",      role: "POP & ACOUSTIC ARTIST",       image: "/artists/3.png" },
  { id: 4,  name: "Ashanthi Dias",    role: "SRI LANKAN MUSICAL ARTIST",   image: "/artists/4.png" },
  { id: 5,  name: "Kasun Silva",      role: "ROCK & INDIE ARTIST",         image: "/artists/1.png" },
  { id: 6,  name: "Nadia Fernando",   role: "R&B / SOUL ARTIST",           image: "/artists/2.png" },
  { id: 7,  name: "The Beat Crew",    role: "LIVE BAND",                   image: "/artists/3.png" },
  { id: 8,  name: "Hiruni De Silva",  role: "CLASSICAL FUSION ARTIST",     image: "/artists/4.png" },
];

const TOTAL_PAGES = Math.ceil(artists.length / PAGE_SIZE);

export default function FeaturedArtists() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress,  setProgress]  = useState(0);
  const [page,      setPage]      = useState(0);
  const [followed,  setFollowed]  = useState<Set<number>>(new Set());
  const rafRef                    = useRef<number>(0);
  const isInViewRef               = useRef(false);

  const toggleFollow = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowed(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const runSweep = () => {
    cancelAnimationFrame(rafRef.current);
    setProgress(0);
    const start    = performance.now();
    const duration = 2200;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          runSweep();
        } else {
          cancelAnimationFrame(rafRef.current);
          setProgress(0);
        }
      },
      { threshold: 0.25 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { observer.disconnect(); cancelAnimationFrame(rafRef.current); };
  }, []);

  const goToPage = (newPage: number) => {
    setPage(newPage);
    if (isInViewRef.current) runSweep();
  };

  const prev = () => goToPage((page - 1 + TOTAL_PAGES) % TOTAL_PAGES);
  const next = () => goToPage((page + 1) % TOTAL_PAGES);

  const visible = artists.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const N = visible.length;

  const sweepProgress = Math.min(1, progress / 0.85);
  const spotlightPos  = -0.15 + sweepProgress * 1.3;

  return (
    <section id="artists" ref={sectionRef} className="py-20 overflow-hidden">
      <div className="flex flex-col items-center justify-center">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="text-center mb-10 relative z-[200] select-none">
          <p className="text-white/30 text-[10px] font-semibold tracking-[0.4em] uppercase mb-3">
            PERFORM BEYOND LIMITS
          </p>
          <h2 className="text-white font-black text-5xl uppercase mb-4 tracking-tight">
            Featured Artists
          </h2>
        </div>

        {/* ── Cards + Arrows ──────────────────────────────────────── */}
        <div
          className="relative flex items-center justify-center w-full"
          style={{ maxWidth: 1100 }}
        >
          {/* Prev arrow */}
          <button
            onClick={prev}
            aria-label="Previous artists"
            className="absolute left-4 z-[200] w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:border-white transition-all group/prev"
          >
            <ArrowRight size={14} className="text-white group-hover/prev:text-black transition-colors rotate-180" />
          </button>

          {/* Card grid */}
          <div className="max-w-6xl w-full mx-auto px-14 relative">

            {/* Spotlight beam */}
            <div
              className="absolute pointer-events-none z-[10]"
              style={{
                top: "-40%",
                left: `${spotlightPos * 100}%`,
                width: 300,
                height: "180%",
                transform: "translateX(-50%)",
                background: `radial-gradient(ellipse 150px 400px at center, rgba(${ACCENT_RGB},0.18) 0%, rgba(${ACCENT_RGB},0.06) 40%, transparent 70%)`,
                opacity: progress > 0.01 && progress < 0.95 ? 1 : 0,
                transition: "opacity 0.5s ease",
              }}
            />

            <div key={page} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {visible.map((artist, i) => {
                const cardCenter    = (i + 0.5) / N;
                const dist          = spotlightPos - cardCenter;
                const hasBeenHit    = spotlightPos > cardCenter - 0.08;
                const proximity     = Math.max(0, 1 - Math.abs(dist) * 5);
                const brightness    = hasBeenHit ? 0.7 + proximity * 0.3 : 0.08 + proximity * 0.4;
                const scale         = hasBeenHit ? 1 + proximity * 0.04 : 0.94 + proximity * 0.03;
                const textOpacity   = hasBeenHit ? 1 : 0;
                const glowIntensity = proximity * 0.5;
                const barWidth      = hasBeenHit ? 40 + proximity * 60 : 0;

                return (
                  <div
                    key={artist.id}
                    className="relative rounded-2xl overflow-hidden cursor-pointer"
                    style={{
                      background: "#1a1a2e",
                      filter: `brightness(${brightness})`,
                      transform: `scale(${scale})`,
                      boxShadow: glowIntensity > 0.05
                        ? `0 0 ${30 + glowIntensity * 40}px rgba(${ACCENT_RGB},${glowIntensity}), inset 0 0 0 1px rgba(${ACCENT_RGB},${(glowIntensity * 0.6).toFixed(2)})`
                        : hasBeenHit
                          ? "0 8px 30px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)"
                          : "inset 0 0 0 1px rgba(255,255,255,0.06)",
                      transition: "transform 0.4s cubic-bezier(0.25,1,0.5,1), filter 0.4s ease, box-shadow 0.4s ease",
                    }}
                  >
                    {/* Image */}
                    <div className="relative w-full overflow-hidden" style={{ height: 240 }}>
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="w-full h-full object-cover object-top"
                        style={{
                          filter: hasBeenHit ? "grayscale(0%)" : "grayscale(100%)",
                          transition: "filter 0.8s ease",
                        }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to top, #1a1a2e 0%, rgba(26,26,46,0.4) 40%, transparent 100%)" }}
                      />
                      {proximity > 0.1 && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: `radial-gradient(ellipse at 50% 30%, rgba(${ACCENT_RGB},${(proximity * 0.18).toFixed(2)}) 0%, transparent 70%)` }}
                        />
                      )}
                      {/* Follow heart */}
                      <button
                        onClick={(e) => toggleFollow(artist.id, e)}
                        className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                        style={{
                          background: followed.has(artist.id) ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.45)",
                          border: followed.has(artist.id) ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.15)",
                          backdropFilter: "blur(6px)",
                        }}
                        title={followed.has(artist.id) ? "Following" : "Follow artist"}
                      >
                        <Heart
                          size={11}
                          strokeWidth={2.5}
                          style={{ color: followed.has(artist.id) ? "#fff" : "rgba(255,255,255,0.7)" }}
                          fill={followed.has(artist.id) ? "#fff" : "none"}
                        />
                      </button>
                    </div>

                    {/* Text */}
                    <div
                      className="px-5 pb-5 pt-2 text-center"
                      style={{
                        opacity: textOpacity,
                        transform: hasBeenHit ? "translateY(0)" : "translateY(12px)",
                        transition: "opacity 0.6s ease, transform 0.6s ease",
                      }}
                    >
                      <p className="text-white/35 text-[9px] font-bold tracking-[0.3em] uppercase mb-1.5">
                        {artist.role}
                      </p>
                      <h3 className="text-white font-black text-sm uppercase mb-2 tracking-wide">
                        {artist.name}
                      </h3>
                      <div className="flex justify-center">
                        <div
                          className="h-[3px] rounded-full"
                          style={{
                            width: `${barWidth}%`,
                            background: ACCENT_COLOR,
                            transition: "width 0.6s cubic-bezier(0.25,1,0.5,1)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next arrow */}
          <button
            onClick={next}
            aria-label="Next artists"
            className="absolute right-4 z-[200] w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:border-white transition-all group/next"
          >
            <ArrowRight size={14} className="text-white group-hover/next:text-black transition-colors" />
          </button>
        </div>

        {/* ── Page dots ───────────────────────────────────────────── */}
        <div className="flex gap-2 mt-6 relative z-[200]">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              aria-label={`Go to page ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === page ? 24 : 6,
                height: 6,
                background: i === page ? ACCENT_COLOR : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>

        {/* ── Explore button ──────────────────────────────────────── */}
        <div
          className="text-center mt-6 relative z-[200]"
          style={{
            opacity: progress > 0.85 ? 1 : 0,
            transform: progress > 0.85 ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <button className="btn-outline text-xs px-10 py-3.5 rounded-full">
            EXPLORE MORE
          </button>
        </div>
      </div>
    </section>
  );
}
