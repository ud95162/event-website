"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

type SymbolProps = { size: number; opacity: number };

/* ── SVG music symbol components ─────────────────────────────────────────── */

function QuarterNote({ size, opacity }: SymbolProps) {
  return (
    <svg width={Math.round(size * 0.45)} height={size} viewBox="0 0 18 50" fill="none">
      <ellipse cx="7" cy="43" rx="8.5" ry="6" transform="rotate(-22 7 43)"
        fill="white" fillOpacity={opacity} />
      <line x1="14.8" y1="40" x2="14.8" y2="2" stroke="white"
        strokeOpacity={opacity} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function EighthNote({ size, opacity }: SymbolProps) {
  return (
    <svg width={Math.round(size * 0.55)} height={size} viewBox="0 0 26 52" fill="none">
      <ellipse cx="7" cy="45" rx="8.5" ry="6" transform="rotate(-22 7 45)"
        fill="white" fillOpacity={opacity} />
      <line x1="14.8" y1="42" x2="14.8" y2="4" stroke="white"
        strokeOpacity={opacity} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14.8,4 C26,-2 27,14 17,24" fill="white" fillOpacity={opacity} />
    </svg>
  );
}

function BeamedPair({ size, opacity }: SymbolProps) {
  return (
    <svg width={size} height={Math.round(size * 0.75)} viewBox="0 0 60 45" fill="none">
      <ellipse cx="8" cy="39" rx="8.5" ry="6" transform="rotate(-22 8 39)"
        fill="white" fillOpacity={opacity} />
      <line x1="15.5" y1="36" x2="15.5" y2="5" stroke="white"
        strokeOpacity={opacity} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="37" cy="33" rx="8.5" ry="6" transform="rotate(-22 37 33)"
        fill="white" fillOpacity={opacity} />
      <line x1="44.5" y1="30" x2="44.5" y2="0" stroke="white"
        strokeOpacity={opacity} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15.5,5 L44.5,0 L44.5,6 L15.5,11 Z" fill="white" fillOpacity={opacity} />
    </svg>
  );
}

function BeamedTriple({ size, opacity }: SymbolProps) {
  return (
    <svg width={Math.round(size * 1.15)} height={size} viewBox="0 0 75 58" fill="none">
      <ellipse cx="8"  cy="51" rx="8.5" ry="6" transform="rotate(-22 8 51)"
        fill="white" fillOpacity={opacity} />
      <line x1="15.5" y1="48" x2="15.5" y2="9" stroke="white"
        strokeOpacity={opacity} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="34" cy="46" rx="8.5" ry="6" transform="rotate(-22 34 46)"
        fill="white" fillOpacity={opacity} />
      <line x1="41.5" y1="43" x2="41.5" y2="4" stroke="white"
        strokeOpacity={opacity} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="59" cy="40" rx="8.5" ry="6" transform="rotate(-22 59 40)"
        fill="white" fillOpacity={opacity} />
      <line x1="66.5" y1="37" x2="66.5" y2="0" stroke="white"
        strokeOpacity={opacity} strokeWidth="2.5" strokeLinecap="round" />
      {/* double beam */}
      <path d="M15.5,9  L66.5,0  L66.5,6  L15.5,15 Z" fill="white" fillOpacity={opacity} />
      <path d="M15.5,17 L66.5,8  L66.5,14 L15.5,23 Z" fill="white" fillOpacity={opacity} />
    </svg>
  );
}

function TrebleClef({ size, opacity }: SymbolProps) {
  return (
    <svg width={Math.round(size * 0.5)} height={size} viewBox="0 0 50 120">
      <text x="2" y="108" fontSize="108"
        fontFamily="'Century Gothic', sans-serif"
        fill="white" fillOpacity={opacity}>𝄞</text>
    </svg>
  );
}

function StaffWave({ size, opacity }: SymbolProps) {
  const w = size;
  const h = Math.round(size * 0.48);
  const sy = (i: number) => h * 0.18 + i * (h * 0.15);
  const noteOp = Math.min(opacity * 1.4, 0.18);
  const nx = [w * 0.36, w * 0.56, w * 0.74];
  const ny = [sy(2.8), sy(2.2), sy(1.7)];
  const stemTop = [sy(0.2), sy(-0.15), sy(-0.45)];
  const dx = w * 0.03;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      {/* five wavy staff lines */}
      {[0, 1, 2, 3, 4].map(i => (
        <path key={i}
          d={`M0,${sy(i)} Q${w * 0.25},${sy(i) - h * 0.06} ${w * 0.5},${sy(i)} Q${w * 0.75},${sy(i) + h * 0.06} ${w},${sy(i)}`}
          stroke="white" strokeOpacity={opacity * 0.55} strokeWidth={0.85} />
      ))}
      {/* three note heads + stems */}
      {nx.map((cx, i) => (
        <g key={i}>
          <ellipse cx={cx} cy={ny[i]} rx={w * 0.033} ry={h * 0.13}
            transform={`rotate(-22 ${cx} ${ny[i]})`}
            fill="white" fillOpacity={noteOp} />
          <line x1={cx + dx} y1={ny[i] - h * 0.06}
                x2={cx + dx} y2={stemTop[i]}
            stroke="white" strokeOpacity={noteOp} strokeWidth={1.7} strokeLinecap="round" />
        </g>
      ))}
      {/* beam connecting notes 2 & 3 */}
      <path
        d={`M${nx[1]+dx},${stemTop[1]} L${nx[2]+dx},${stemTop[2]} L${nx[2]+dx},${stemTop[2]+h*0.075} L${nx[1]+dx},${stemTop[1]+h*0.075} Z`}
        fill="white" fillOpacity={noteOp} />
    </svg>
  );
}

/* ── Symbol layout data ───────────────────────────────────────────────────── */

interface NoteSymbol {
  id: string;
  Comp: React.ComponentType<SymbolProps>;
  size: number;
  pos: Partial<Pick<CSSProperties, "left" | "right" | "top">>;
  parallaxY: number;
  parallaxRotate: number;
  baseRotate: number;
  floatAmp: number;
  floatSpeed: number;
  floatPhase: number;
  opacity: number;
}

const symbols: NoteSymbol[] = [
  {
    id: "treble",
    Comp: TrebleClef,
    size: 165,
    pos: { left: "2vw", top: "10vh" },
    parallaxY: 0.14, parallaxRotate: 0.003, baseRotate: -6,
    floatAmp: 15, floatSpeed: 0.30, floatPhase: 0,
    opacity: 0.09,
  },
  {
    id: "staffwave",
    Comp: StaffWave,
    size: 310,
    pos: { right: "0px", top: "6vh" },
    parallaxY: -0.16, parallaxRotate: -0.003, baseRotate: 7,
    floatAmp: 11, floatSpeed: 0.27, floatPhase: 1.0,
    opacity: 0.085,
  },
  {
    id: "beamed-pair",
    Comp: BeamedPair,
    size: 120,
    pos: { left: "7vw", top: "56vh" },
    parallaxY: 0.22, parallaxRotate: 0.005, baseRotate: -14,
    floatAmp: 19, floatSpeed: 0.38, floatPhase: 2.1,
    opacity: 0.09,
  },
  {
    id: "quarter-right",
    Comp: QuarterNote,
    size: 105,
    pos: { right: "13vw", top: "34vh" },
    parallaxY: -0.20, parallaxRotate: -0.005, baseRotate: 12,
    floatAmp: 16, floatSpeed: 0.42, floatPhase: 0.6,
    opacity: 0.085,
  },
  {
    id: "triple-right",
    Comp: BeamedTriple,
    size: 112,
    pos: { right: "2vw", top: "62vh" },
    parallaxY: -0.24, parallaxRotate: -0.004, baseRotate: 4,
    floatAmp: 21, floatSpeed: 0.33, floatPhase: 3.2,
    opacity: 0.075,
  },
  {
    id: "eighth-center",
    Comp: EighthNote,
    size: 92,
    pos: { left: "40vw", top: "17vh" },
    parallaxY: 0.18, parallaxRotate: 0.006, baseRotate: -20,
    floatAmp: 13, floatSpeed: 0.46, floatPhase: 1.5,
    opacity: 0.07,
  },
];

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function FloatingMusicians() {
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollY  = useRef(0);

  useEffect(() => {
    let raf: number;
    const onScroll = () => { scrollY.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      const t = Date.now() / 1000;
      wrapRefs.current.forEach((el, i) => {
        if (!el) return;
        const s = symbols[i];
        const float      = Math.sin(t * s.floatSpeed + s.floatPhase) * s.floatAmp;
        const translateY = scrollY.current * s.parallaxY + float;
        const rotation   = s.baseRotate + scrollY.current * s.parallaxRotate;
        el.style.transform = `translateY(${translateY}px) rotate(${rotation}deg)`;
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
      {symbols.map((s, i) => (
        <div
          key={s.id}
          ref={(el) => { wrapRefs.current[i] = el; }}
          className="absolute will-change-transform"
          style={{
            ...s.pos,
            filter: "blur(0.5px)",
          }}
        >
          <s.Comp size={s.size} opacity={s.opacity} />
        </div>
      ))}
    </div>
  );
}
