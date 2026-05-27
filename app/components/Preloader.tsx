"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface PreloaderProps {
  phase: "idle" | "exit";
  setPhase: (phase: "idle" | "exit" | "gone") => void;
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function Preloader({ phase, setPhase }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const triggerRef = useRef(false);
  const grainRef   = useRef<HTMLCanvasElement>(null);

  /* ── Progress bar ────────────────────────────────────────────────────── */
  useEffect(() => {
    const TOTAL = 2500, STEP = 25;
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += STEP;
      const t = Math.min(elapsed / TOTAL, 1);
      setProgress(+(100 * (1 - Math.pow(1 - t, 2.5))).toFixed(1));
      if (elapsed >= TOTAL) clearInterval(id);
    }, STEP);
    return () => clearInterval(id);
  }, []);

  /* ── Exit trigger ────────────────────────────────────────────────────── */
  const triggerExit = useCallback(() => {
    if (triggerRef.current) return;
    triggerRef.current = true;
    setPhase("exit");
    setTimeout(() => {
      document.body.style.overflow = "";
      window.scrollTo(0, 0);
      setPhase("gone");
    }, 1300);
  }, [setPhase]);

  /* ── Scroll / touch listeners ────────────────────────────────────────── */
  useEffect(() => {
    if (phase === "idle" || phase === "exit") {
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (progress >= 95 && e.deltaY > 5) triggerExit();
    };
    let y0 = 0;
    const onTS = (e: TouchEvent) => { y0 = e.touches[0].clientY; };
    const onTM = (e: TouchEvent) => {
      e.preventDefault();
      if (progress >= 95 && y0 - e.touches[0].clientY > 30) triggerExit();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTS, { passive: true });
    window.addEventListener("touchmove", onTM, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchmove", onTM);
    };
  }, [phase, progress, triggerExit]);

  /* ── Animated film grain (small canvas, redrawn ~12fps) ──────────────── */
  useEffect(() => {
    const cvs = grainRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d")!;
    const W = 256, H = 256;
    cvs.width = W;
    cvs.height = H;

    const render = () => {
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 18;
      }
      ctx.putImageData(img, 0, 0);
    };

    render();
    const id = setInterval(render, 80);
    return () => clearInterval(id);
  }, []);

  const isLoaded = progress >= 100;

  /* ── Fade-scale-bloom animation states ───────────────────────────────── */
  const [showEmblem, setShowEmblem]   = useState(false);
  const [showDivider, setShowDivider] = useState(false);
  const [bloomPhase, setBloomPhase]   = useState(false);
  const [startFill, setStartFill]     = useState(false);
  const [animationConfig, setAnimationConfig] = useState<{
    events: { delay: number; duration: number; dashOffsetStart: number }[];
    company: { delay: number; duration: number; dashOffsetStart: number }[];
  } | null>(null);

  const animStarted = useRef(false);

  useEffect(() => {
    if (animStarted.current) return;
    animStarted.current = true;

    // Generate random drawing parameters on client side to avoid hydration mismatch
    const eventsConfigs = ["E", "V", "E", "N", "T", "S"].map(() => ({
      delay: Math.random() * 300,
      duration: 1000 + Math.random() * 400,
      dashOffsetStart: Math.random() > 0.5 ? 450 : -450,
    }));
    const companyConfigs = ["C", "O", "M", "P", "A", "N", "Y"].map(() => ({
      delay: 350 + Math.random() * 250,
      duration: 900 + Math.random() * 350,
      dashOffsetStart: Math.random() > 0.5 ? 150 : -150,
    }));
    setAnimationConfig({ events: eventsConfigs, company: companyConfigs });

    // 1. EC emblem scales up
    const t0 = setTimeout(() => setShowEmblem(true), 250);
    // 2. Divider sweeps in
    const t1 = setTimeout(() => setShowDivider(true), 1300);
    // 3. Liquid fill reveal begins at 1600ms
    const t2 = setTimeout(() => setStartFill(true), 1600);
    // 4. Full glow bloom on everything at 2400ms
    const t3 = setTimeout(() => setBloomPhase(true), 2400);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  /* ══ JSX ══════════════════════════════════════════════════════════════ */
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      onClick={isLoaded ? triggerExit : undefined}
      style={{
        zIndex: 200,
        background: "#050505",
        animation: phase === "exit"
          ? "pl-exit 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards"
          : undefined,
      }}
    >
      {/* ── Aurora gradient blobs ────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: "45vmax", height: "45vmax",
            top: "15%", left: "10%",
            background: "radial-gradient(circle, rgba(20,50,120,0.35) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "aurora-1 16s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "40vmax", height: "40vmax",
            top: "40%", right: "5%",
            background: "radial-gradient(circle, rgba(70,20,100,0.30) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "aurora-2 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "35vmax", height: "35vmax",
            bottom: "10%", left: "30%",
            background: "radial-gradient(circle, rgba(10,70,80,0.25) 0%, transparent 70%)",
            filter: "blur(70px)",
            animation: "aurora-3 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "30vmax", height: "30vmax",
            top: "5%", right: "25%",
            background: "radial-gradient(circle, rgba(100,30,60,0.18) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "aurora-4 18s ease-in-out infinite",
          }}
        />
      </div>

      {/* ── Animated film grain ─────────────────────────────────────────── */}
      <canvas
        ref={grainRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          width: "100%",
          height: "100%",
          opacity: 0.045,
          imageRendering: "pixelated",
        }}
      />

      {/* ── Subtle center glow — draws the eye inward ──────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "70vmax",
          height: "70vmax",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 60%)",
          transition: "opacity 1.5s ease",
          opacity: bloomPhase ? 1 : 0.3,
        }}
      />

      {/* ── Vignette ───────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 20%, #050505 100%)",
        }}
      />

      {/* ── Content: Emblem + Text ─────────────────────────────────────── */}
      <div className="relative flex flex-col items-center select-none z-10">

        {/* ── EC Emblem ───────────────────────────────────────────────── */}
        <div
          style={{
            marginBottom: 32,
            opacity: showEmblem ? 1 : 0,
            transform: showEmblem ? "scale(1)" : "scale(0.5)",
            filter: showEmblem
              ? bloomPhase ? "blur(0px) drop-shadow(0 0 15px rgba(255,255,255,0.15))" : "blur(0px)"
              : "blur(6px)",
            transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <svg viewBox="0 0 120 120" style={{ width: 90, height: 90, overflow: "visible" }}>
            {/* Outer circle */}
            <circle
              cx="60" cy="60" r="48"
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.2"
            />
            {/* Inner decorative circle */}
            <circle
              cx="60" cy="60" r="42"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.5"
            />
            {/* EC initials */}
            <text
              x="60" y="67"
              textAnchor="middle"
              fontSize="30"
              fontWeight="700"
              fontFamily="'Century Gothic', sans-serif"
              letterSpacing="5"
              fill="white"
              fillOpacity="0.85"
            >
              EC
            </text>
          </svg>
        </div>

        {/* ── Brand Name Container (Outline & Fill Animations) ───────── */}
        <div className="relative select-none flex flex-col items-center justify-center" style={{ width: "clamp(320px, 80vw, 800px)" }}>
          
          {/* Injecting drawing keyframes */}
          <style>{`
            @keyframes draw-forward {
              from { stroke-dashoffset: 450; }
              to { stroke-dashoffset: 0; }
            }
            @keyframes draw-backward {
              from { stroke-dashoffset: -450; }
              to { stroke-dashoffset: 0; }
            }
            @keyframes draw-forward-small {
              from { stroke-dashoffset: 150; }
              to { stroke-dashoffset: 0; }
            }
            @keyframes draw-backward-small {
              from { stroke-dashoffset: -150; }
              to { stroke-dashoffset: 0; }
            }
          `}</style>

          {/* 1. EVENTS Outline & Fill Row */}
          <div className="relative overflow-visible w-full h-[130px] flex justify-center items-center">
            {/* Outline Layer (Bottom) */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
              <svg viewBox="0 0 800 130" className="w-full h-full overflow-visible">
                <g fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8">
                  {["E", "V", "E", "N", "T", "S"].map((letter, i) => {
                    const x = 400 + (i - 2.5) * 88;
                    const config = animationConfig?.events[i];
                    return (
                      <text
                        key={`outline-ev-${i}`}
                        x={x}
                        y="95"
                        textAnchor="middle"
                        fontSize="110"
                        fontWeight="900"
                        fontFamily="'Century Gothic', sans-serif"
                        letterSpacing="0.08em"
                        style={config ? {
                          strokeDasharray: 450,
                          strokeDashoffset: config.dashOffsetStart,
                          animationName: config.dashOffsetStart > 0 ? "draw-forward" : "draw-backward",
                          animationDuration: `${config.duration}ms`,
                          animationDelay: `${config.delay}ms`,
                          animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                          animationFillMode: "forwards",
                        } : {}}
                      >
                        {letter}
                      </text>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Filled Layer — bottom-to-top water fill */}
            <div
              className="absolute inset-0 flex justify-center items-center pointer-events-none"
              style={{
                clipPath: startFill ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
                transition: "clip-path 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <svg viewBox="0 0 800 130" className="w-full h-full overflow-visible">
                <g fill="#ffffff" stroke="none">
                  {["E", "V", "E", "N", "T", "S"].map((letter, i) => {
                    const x = 400 + (i - 2.5) * 88;
                    return (
                      <text
                        key={`filled-ev-${i}`}
                        x={x}
                        y="95"
                        textAnchor="middle"
                        fontSize="110"
                        fontWeight="900"
                        fontFamily="'Century Gothic', sans-serif"
                        letterSpacing="0.08em"
                        style={{
                          textShadow: bloomPhase
                            ? "0 0 30px rgba(255,255,255,0.25), 0 0 80px rgba(255,255,255,0.12)"
                            : "none",
                          transition: "text-shadow 1s ease",
                        }}
                      >
                        {letter}
                      </text>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>

          {/* ── Divider ────────────────────────────────────────────────── */}
          <div style={{ height: 2, overflow: "hidden", marginTop: 14, marginBottom: 14, width: "100%" }}>
            <div
              style={{
                width: showDivider ? 240 : 0,
                height: 2,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
                transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                margin: "0 auto",
              }}
            />
          </div>

          {/* 2. COMPANY Outline & Fill Row */}
          <div className="relative overflow-visible w-full h-[45px] flex justify-center items-center">
            {/* Outline Layer (Bottom) */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
              <svg viewBox="0 0 800 45" className="w-full h-full overflow-visible">
                <g fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2">
                  {["C", "O", "M", "P", "A", "N", "Y"].map((letter, i) => {
                    const x = 400 + (i - 3) * 64;
                    const config = animationConfig?.company[i];
                    return (
                      <text
                        key={`outline-co-${i}`}
                        x={x}
                        y="32"
                        textAnchor="middle"
                        fontSize="30"
                        fontWeight="900"
                        fontFamily="'Century Gothic', sans-serif"
                        letterSpacing="0.35em"
                        style={config ? {
                          strokeDasharray: 150,
                          strokeDashoffset: config.dashOffsetStart,
                          animationName: config.dashOffsetStart > 0 ? "draw-forward-small" : "draw-backward-small",
                          animationDuration: `${config.duration}ms`,
                          animationDelay: `${config.delay}ms`,
                          animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                          animationFillMode: "forwards",
                        } : {}}
                      >
                        {letter}
                      </text>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Filled Layer — bottom-to-top water fill */}
            <div
              className="absolute inset-0 flex justify-center items-center pointer-events-none"
              style={{
                clipPath: startFill ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
                transition: "clip-path 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.15s",
              }}
            >
              <svg viewBox="0 0 800 45" className="w-full h-full overflow-visible">
                <g fill="rgba(255,255,255,0.55)" stroke="none">
                  {["C", "O", "M", "P", "A", "N", "Y"].map((letter, i) => {
                    const x = 400 + (i - 3) * 64;
                    return (
                      <text
                        key={`filled-co-${i}`}
                        x={x}
                        y="32"
                        textAnchor="middle"
                        fontSize="30"
                        fontWeight="900"
                        fontFamily="'Century Gothic', sans-serif"
                        letterSpacing="0.35em"
                        style={{
                          textShadow: bloomPhase
                            ? "0 0 16px rgba(255,255,255,0.15)"
                            : "none",
                          transition: "text-shadow 1s ease",
                        }}
                      >
                        {letter}
                      </text>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* ── Progress / CTA ──────────────────────────────────────────── */}
      <div
        className="absolute bottom-16 flex flex-col items-center justify-center h-24 w-full px-6 select-none"
        style={{ animation: "pl-enter 0.8s 0.5s both" }}
      >
        {!isLoaded ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative overflow-hidden rounded-full"
              style={{ width: 220, height: 1.5, background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "#ffffff",
                  boxShadow: "0 0 8px rgba(255,255,255,0.6)",
                  transition: "width 0.05s linear",
                }}
              />
            </div>
            <p className="text-white/20 text-[9px] tracking-[0.45em] tabular-nums uppercase">
              LOADING EXPERIENCE {Math.round(progress).toString().padStart(3, "0")}%
            </p>
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-2.5 animate-pulse"
            style={{ animationDuration: "2.2s" }}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/60 text-[10px] font-black tracking-[0.45em] uppercase">
                SCROLL DOWN TO ENTER
              </span>
              <span className="text-white/30 text-[8px] tracking-[0.3em] uppercase">
                OR CLICK ANYWHERE TO START
              </span>
            </div>
            <div className="w-5 h-8 rounded-full border-2 border-white/20 flex justify-center p-1.5 relative mt-1 opacity-60">
              <div
                className="w-1 h-1.5 bg-white rounded-full absolute"
                style={{ animation: "eq-pulse 1.4s ease-in-out infinite", transformOrigin: "center top" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Corner frame marks ──────────────────────────────────────── */}
      {(["top-6 left-6 border-t border-l",
         "top-6 right-6 border-t border-r",
         "bottom-6 left-6 border-b border-l",
         "bottom-6 right-6 border-b border-r"] as const).map((cls) => (
        <div key={cls} className={`absolute w-5 h-5 border-white/8 ${cls}`} />
      ))}

      {/* ── Aurora keyframes ───────────────────────────────────────────── */}
      <style jsx global>{`
        @keyframes aurora-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(80px, -40px) scale(1.12); }
          66%      { transform: translate(-50px, 60px) scale(0.92); }
        }
        @keyframes aurora-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(-70px, 50px) scale(1.15); }
          66%      { transform: translate(40px, -60px) scale(0.88); }
        }
        @keyframes aurora-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(55px, -35px) scale(1.1); }
        }
        @keyframes aurora-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%      { transform: translate(-45px, 55px) scale(1.08); }
          80%      { transform: translate(35px, -25px) scale(0.94); }
        }
      `}</style>
    </div>
  );
}
