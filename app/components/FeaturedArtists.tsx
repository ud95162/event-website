"use client";

import { useEffect, useRef, useState } from "react";

const artists = [
  {
    id: 1, name: "DJ Nova", role: "EDM / HOUSE MUSIC",
    bio: "Known for electrifying performances and festival energy across Asia.",
    image: "/artists/1.png",
  },
  {
    id: 2, name: "Randhir Witana", role: "SRI LANKAN MUSICAL ARTIST",
    bio: "Known for electrifying performances and festival energy across Asia.",
    image: "/artists/2.png",
  },
  {
    id: 3, name: "Maya Perera", role: "POP & ACOUSTIC ARTIST",
    bio: "Award-winning vocalist with soulful live performances.",
    image: "/artists/3.png",
  },
  {
    id: 4, name: "Ashanthi Dias", role: "SRI LANKAN MUSICAL ARTIST",
    bio: "An energetic fusion band bringing modern and classic hits together.",
    image: "/artists/4.png",
  },
];

const SCROLL_PX   = 1600;
const STICKY_TOP  = 130;
const N           = artists.length;

export default function FeaturedArtists() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const top = sectionRef.current.getBoundingClientRect().top;
      const range = sectionRef.current.offsetHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, -(top - 300) / range));
      setProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sweepProgress = Math.min(1, progress / 0.85);
  const spotlightPos  = -0.15 + sweepProgress * 1.3;

  return (
    <section
      id="artists"
      ref={sectionRef}
      style={{ height: SCROLL_PX + 800 }}
    >
      <div
        className="sticky flex flex-col items-center justify-center overflow-hidden"
        style={{ top: STICKY_TOP, height: `calc(100vh - ${STICKY_TOP}px)` }}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="text-center mb-10 relative z-[200] select-none">
          <p className="text-white/30 text-[10px] font-semibold tracking-[0.4em] uppercase mb-3">
            PERFORM BEYOND LIMITS
          </p>
          <h2 className="text-white font-black text-5xl uppercase mb-4 tracking-tight">
            Featured Artists
          </h2>
        </div>

        {/* ── Artist Cards ────────────────────────────────────────── */}
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative">

          {/* Spotlight beam glow */}
          <div
            className="absolute pointer-events-none z-[10]"
            style={{
              top: "-40%",
              left: `${spotlightPos * 100}%`,
              width: 300,
              height: "180%",
              transform: "translateX(-50%)",
              background: "radial-gradient(ellipse 150px 400px at center, rgba(57,189,105,0.15) 0%, rgba(57,189,105,0.05) 40%, transparent 70%)",
              opacity: progress > 0.01 && progress < 0.9 ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {artists.map((artist, i) => {
              const cardCenter = (i + 0.5) / N;
              const dist = spotlightPos - cardCenter;
              const hasBeenHit = spotlightPos > cardCenter - 0.08;
              const proximity = Math.max(0, 1 - Math.abs(dist) * 5);
              const brightness = hasBeenHit
                ? 0.7 + proximity * 0.3
                : 0.08 + proximity * 0.4;
              const scale = hasBeenHit
                ? 1 + proximity * 0.04
                : 0.94 + proximity * 0.03;
              const textOpacity = hasBeenHit ? 1 : 0;
              const glowIntensity = proximity * 0.5;

              // Green accent bar width — fills as spotlight passes
              const barWidth = hasBeenHit ? 40 + proximity * 60 : 0;

              return (
                <div
                  key={artist.id}
                  className="relative rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    background: "#1a1a2e",
                    filter: `brightness(${brightness})`,
                    transform: `scale(${scale})`,
                    boxShadow: glowIntensity > 0.05
                      ? `0 0 ${30 + glowIntensity * 40}px rgba(57,189,105,${glowIntensity}), inset 0 0 0 1px rgba(57,189,105,${glowIntensity * 0.6})`
                      : hasBeenHit
                        ? "0 8px 30px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)"
                        : "inset 0 0 0 1px rgba(255,255,255,0.06)",
                    transition: "transform 0.4s cubic-bezier(0.25,1,0.5,1), filter 0.4s ease, box-shadow 0.4s ease",
                  }}
                >
                  {/* Image area */}
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
                    {/* Gradient fade to card bg */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(to top, #1a1a2e 0%, rgba(26,26,46,0.4) 40%, transparent 100%)",
                      }}
                    />

                    {/* Spotlight cone overlay */}
                    {proximity > 0.1 && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `radial-gradient(ellipse at 50% 30%, rgba(255,255,255,${proximity * 0.08}) 0%, transparent 70%)`,
                        }}
                      />
                    )}
                  </div>

                  {/* Text area */}
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


                    {/* Green accent bar */}
                    <div className="flex justify-center">
                      <div
                        className="h-[3px] rounded-full"
                        style={{
                          width: `${barWidth}%`,
                          background: "linear-gradient(90deg, #39BD69, #2ecc71)",
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

        {/* ── Explore button ──────────────────────────────────────── */}
        <div
          className="text-center mt-10 relative z-[200]"
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
