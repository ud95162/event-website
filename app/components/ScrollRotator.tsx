"use client";

import { useEffect, useRef } from "react";

/* A single large treble-clef that rotates a full 360° as the user
   scrolls through the #events section. Fixed to the viewport so it
   stays centred while the section content scrolls underneath it. */

export default function ScrollRotator() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;

    const tick = () => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      if (!outer || !inner) { raf = requestAnimationFrame(tick); return; }

      const section = document.getElementById("events");
      const scrollY  = window.scrollY;
      const vh       = window.innerHeight;

      if (section) {
        /* absolute position of the section */
        const sectionTop    = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        /* start rotating when section top reaches bottom of viewport,
           complete one full rotation when section bottom leaves top */
        const rangeStart = sectionTop - vh;
        const rangeEnd   = sectionTop + sectionHeight;
        const range      = rangeEnd - rangeStart;

        const progress = Math.max(0, Math.min(1, (scrollY - rangeStart) / range));
        const rotation = progress * 360;

        /* soft fade: fully visible in the middle quarter, invisible at edges */
        const fade = Math.sin(progress * Math.PI); // 0 → 1 → 0
        const opacity = (fade * 0.13).toFixed(4);

        inner.style.transform = `rotate(${rotation.toFixed(2)}deg)`;
        outer.style.opacity   = opacity;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    /* Fixed anchor — keeps the symbol centred on the right half of the
       viewport regardless of scroll position */
    <div
      ref={outerRef}
      className="fixed pointer-events-none select-none"
      style={{
        zIndex: 3,
        right: "6vw",
        top: "50%",
        transform: "translateY(-50%)",
        opacity: 0,
        filter: "blur(0.5px)",
      }}
    >
      {/* Rotating shell — transformOrigin is center of this div */}
      <div
        ref={innerRef}
        style={{
          width: 220,
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transformOrigin: "center center",
        }}
      >
        <svg
          width={220}
          height={220}
          viewBox="-110 -110 220 220"
          fill="none"
        >
          {/* outer dashed ring */}
          <circle r={106} stroke="white" strokeOpacity={0.25}
            strokeWidth={0.7} strokeDasharray="5 14" />

          {/* inner rings */}
          <circle r={92} stroke="white" strokeOpacity={0.15} strokeWidth={0.5} />
          <circle r={78} stroke="white" strokeOpacity={0.10} strokeWidth={0.4} />

          {/* 12 radial tick marks */}
          {Array.from({ length: 12 }, (_, i) => {
            const a  = (i / 12) * Math.PI * 2;
            const r1 = 94, r2 = 108;
            return (
              <line key={i}
                x1={Math.cos(a) * r1} y1={Math.sin(a) * r1}
                x2={Math.cos(a) * r2} y2={Math.sin(a) * r2}
                stroke="white" strokeOpacity={0.3} strokeWidth={0.9}
              />
            );
          })}

          {/* 4 small note-heads at compass points */}
          {[0, 90, 180, 270].map(deg => {
            const rad = (deg * Math.PI) / 180;
            const cx  = Math.cos(rad) * 84;
            const cy  = Math.sin(rad) * 84;
            return (
              <ellipse key={deg} cx={cx} cy={cy}
                rx={6} ry={4.5}
                transform={`rotate(${deg} ${cx} ${cy})`}
                fill="white" fillOpacity={0.35}
              />
            );
          })}

          {/* centre treble clef — rendered as SVG foreignObject text isn't
              reliable, so we draw a simplified clef path via scaled text */}
          <text
            x="0" y="0"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="88"
            fontFamily="'Century Gothic', sans-serif"
            fill="white"
            fillOpacity={0.9}
          >
            𝄞
          </text>
        </svg>
      </div>
    </div>
  );
}
