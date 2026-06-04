"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronDown, Search } from "lucide-react";

const SLIDE_INTERVAL = 6000;
const ANIM_MS        = 1000;

/* ── Category tags ──────────────────────────────────────────────────────── */
const GREEN  = "green";
const BLUE   = "blue";
const PURPLE = "purple";
const RED    = "red";

const GROUP_COLOR: Record<string, string> = {
  green:  "#22c55e",
  blue:   "#60a5fa",
  purple: "#a855f7",
  red:    "#f43f5e",
};

const categories = [
  { label: "Music",            group: GREEN  },
  { label: "Concerts",         group: GREEN  },
  { label: "DJ Night",         group: GREEN  },
  { label: "Festivals",        group: GREEN  },
  { label: "Business",         group: BLUE   },
  { label: "Workshops",        group: BLUE   },
  { label: "Tech Events",      group: PURPLE },
  { label: "Sports",           group: PURPLE },
  { label: "Food & Drinks",    group: PURPLE },
  { label: "Networking",       group: RED    },
  { label: "Family Events",    group: RED    },
  { label: "Community Events", group: RED    },
];

const panels = [
  {
    image: "/banner3.png",
    tag:   "MUSIC FESTIVAL",
    date:  "15 08 2026 • COLOMBO RACECOURSE",
    title: ["MUSIC", "FESTIVAL"],
    desc:  "International DJs, live performances, and immersive stage experiences.",
  },
  {
    image: "/banner4.png",
    tag:   "WORLD MUSIC DAY",
    date:  "21 06 2026 • COLOMBO CITY CENTRE",
    title: ["WORLD", "MUSIC DAY"],
    desc:  "Live acts, DJ sets, and cultural performances for the whole family.",
  },
  {
    image: "/banner5.png",
    tag:   "CONCERT NIGHT",
    date:  "12 09 2026 • KANDY OPEN GROUNDS",
    title: ["LIVE MUSIC", "& CULTURE"],
    desc:  "Live performances under the stars with the finest artists from across the island.",
  },
];

export default function Hero() {
  const [current,       setCurrent]       = useState(0);
  const [prevIdx,       setPrevIdx]       = useState<number | null>(null);
  const [direction,     setDirection]     = useState<"left" | "right">("left");
  // "ready" = new slide sits offscreen (no transition), "animating" = slides move
  const [phase,         setPhase]         = useState<"ready" | "animating">("animating");
  const [activeByGroup, setActiveByGroup] = useState<Record<string, string>>({ green: "Music" });

  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentRef = useRef(0);
  const ease = `${ANIM_MS}ms cubic-bezier(0.87, 0, 0.13, 1)`;

  const goTo = (dir: "left" | "right") => {
    const next = dir === "left"
      ? (currentRef.current + 1) % panels.length
      : (currentRef.current - 1 + panels.length) % panels.length;

    // Step 1: place new slide offscreen instantly (no transition)
    setDirection(dir);
    setPrevIdx(currentRef.current);
    setPhase("ready");
    setCurrent(next);
    currentRef.current = next;

    // Step 2: next frame — trigger the slide transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase("animating");
      });
    });

    // Step 3: cleanup prev after animation
    setTimeout(() => setPrevIdx(null), ANIM_MS + 100);
  };

  const resetTimer = (dir: "left" | "right" = "left") => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => goTo("left"), SLIDE_INTERVAL);
  };

  const goNext = () => { goTo("left");  resetTimer(); };
  const goPrev = () => { goTo("right"); resetTimer(); };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bigIdx  = current;

  return (
    <section className="flex flex-col flex-1 min-h-0 pt-4 pb-6 relative">

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

      {/* ── Hero — all 3 panels absolutely positioned, slots animate ──── */}
      <div className="flex-1 w-full min-h-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="h-full rounded-2xl"
          style={{ position: "relative", overflow: "hidden" }}
        >
          {panels.map((p, i) => {
            const isCurrent = i === current;
            const isPrev    = i === prevIdx;
            const isBig     = isCurrent;

            if (!isCurrent && !isPrev) return null;

            // Current slide: enters from offscreen, then animates to 0
            // Prev slide: exits to offscreen with transition
            let translateX = "0%";
            let transition = `transform ${ease}`;

            if (isCurrent) {
              if (phase === "ready") {
                // Place offscreen instantly — no transition yet
                translateX = direction === "left" ? "100%" : "-100%";
                transition = "none";
              } else {
                translateX = "0%";
              }
            } else if (isPrev) {
              translateX = direction === "left" ? "-100%" : "100%";
            }

            return (
              <div
                key={i}
                style={{
                  position:  "absolute",
                  top:       0,
                  height:    "100%",
                  left:      0,
                  width:     "100%",
                  overflow:  "hidden",
                  transform: `translateX(${translateX})`,
                  transition,
                  zIndex:    isCurrent ? 2 : 1,
                }}
              >
                <img
                  src={p.image}
                  alt={p.tag}
                  className="w-full h-full object-cover object-center"
                />

                {/* Gradient */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.45) 50%,rgba(0,0,0,.10) 100%)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

                {/* Badge */}
                <div className="absolute top-4 left-4" style={{ zIndex: 2 }}>
                  <span
                    className="text-white text-[9px] font-black px-3 py-1 rounded-full tracking-[0.2em] uppercase whitespace-nowrap"
                    style={{ background: "#E9184F" }}
                  >
                    {p.tag}
                  </span>
                </div>

                {/* Text — only when big, each element animates in with stagger */}
                <div
                  className="absolute bottom-0 left-0 p-7 lg:p-10"
                  style={{
                    opacity:       isBig ? 1 : 0,
                    transition:    `opacity ${ANIM_MS * 0.3}ms ease`,
                    pointerEvents: isBig ? "auto" : "none",
                    zIndex:        2,
                  }}
                >
                  {/* Date — letter-by-letter bold reveal */}
                  <p
                    key={`date-${i}-${bigIdx}`}
                    className="text-[12px] tracking-[0.35em] uppercase mb-3"
                  >
                    {p.date.split("").map((char, k) => (
                      <span
                        key={k}
                        style={{
                          display: "inline-block",
                          whiteSpace: char === " " ? "pre" : "normal",
                          color: "rgba(255,255,255,0.55)",
                          opacity: 0.3,
                          animation: isBig
                            ? `letter-bold 0.6s cubic-bezier(0.22,1,0.36,1) ${ANIM_MS / 1000 + 0.05 + k * 0.03}s forwards`
                            : "none",
                        }}
                      >
                        {char === " " ? " " : char}
                      </span>
                    ))}
                  </p>

                  {/* Title lines — each rises with stagger */}
                  <h1 className="text-white font-black text-4xl lg:text-[3.1rem] leading-none uppercase mb-4 max-w-lg tracking-tight">
                    {p.title.map((line, j) => (
                      <span key={`${i}-${j}-${bigIdx}`} className="block overflow-hidden">
                        {line.split("").map((char, k) => (
                          <span
                            key={k}
                            style={{
                              display:   "inline-block",
                              whiteSpace: char === " " ? "pre" : "normal",
                              animation:  isBig
                                ? `letter-up 0.5s cubic-bezier(0.22,1,0.36,1) ${ANIM_MS / 1000 * 0.5 + 0.1 + j * 0.18 + k * 0.04}s both`
                                : "none",
                            }}
                          >
                            {char === " " ? " " : char}
                          </span>
                        ))}
                      </span>
                    ))}
                  </h1>

                  {/* Description — letter-by-letter bold reveal after title */}
                  <p
                    key={`desc-${i}-${bigIdx}`}
                    className="text-base font-semibold mb-7 max-w-sm leading-relaxed"
                  >
                    {p.desc.split("").map((char, k) => (
                      <span
                        key={k}
                        style={{
                          display: "inline-block",
                          whiteSpace: char === " " ? "pre" : "normal",
                          color: "rgba(255,255,255,0.55)",
                          opacity: 0.3,
                          animation: isBig
                            ? `letter-bold 0.6s cubic-bezier(0.22,1,0.36,1) ${ANIM_MS / 1000 * 0.5 + 0.2 + p.title.length * 0.18 + k * 0.02}s forwards`
                            : "none",
                        }}
                      >
                        {char === " " ? " " : char}
                      </span>
                    ))}
                  </p>

                  {/* CTA */}
                  <button
                    key={`cta-${i}-${bigIdx}`}
                    className="flex items-center gap-3 group/btn"
                    style={{
                      opacity: isBig ? 1 : 0,
                      transition: "opacity 0.4s ease",
                    }}
                  >
                    <span className="text-white text-sm font-bold tracking-[0.25em] uppercase border-b border-white/30 pb-0.5 group-hover/btn:border-white transition-colors">
                      EXPLORE EVENT
                    </span>
                    <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:border-white transition-all">
                      <ArrowRight size={13} className="text-white group-hover/btn:text-black transition-colors" />
                    </div>
                  </button>
                </div>
              </div>
            );
          })}

          {/* ── Dots ──────────────────────────────────────────────────── */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5" style={{ zIndex: 20 }}>
            {panels.map((_, i) => (
              <button
                key={i}
                onClick={goNext}
                className="rounded-full"
                style={{
                  width:      i === bigIdx ? 20 : 6,
                  height:     6,
                  background: i === bigIdx ? "#E9184F" : "rgba(255,255,255,0.4)",
                  transition: "width 0.4s ease, background 0.4s ease",
                }}
              />
            ))}
          </div>

          {/* ── Arrows + scroll ───────────────────────────────────────── */}
          <div
            className="absolute bottom-4 flex flex-col items-end gap-2"
            style={{ right: "8px", zIndex: 20 }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:border-white transition-all group/a"
              >
                <ArrowRight size={14} className="text-white group-hover/a:text-black transition-colors rotate-180" />
              </button>
              <button
                onClick={goNext}
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:border-white transition-all group/b"
              >
                <ArrowRight size={14} className="text-white group-hover/b:text-black transition-colors" />
              </button>
            </div>
            <p className="text-white/30 text-[11px] tracking-[0.3em] uppercase">Scroll Down To Continue</p>
            <ChevronDown size={13} className="text-white/30" />
          </div>

        </div>
      </div>
    </section>
  );
}
