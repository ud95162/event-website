"use client";

import { useEffect, useRef, useState } from "react";

/* ── Brand colors ─────────────────────────────────────────────────────── */
const BRAND_COLORS: Record<string, string> = {
  spotify:      "#1DB954",
  youtube:      "#FF0000",
  redbull:      "#E8002A",
  samsung:      "#5B8AF5",
  cocacola:     "#FF1A1A",
  jbl:          "#FF8C00",
  nike:         "#F5492E",
  heineken:     "#00B84A",
  visa:         "#F7B600",
  livenation:   "#E01A2C",
  monster:      "#A0D200",
  bose:         "#D4A853",
  sennheiser:   "#3399FF",
  ticketmaster: "#0088FF",
  pioneer:      "#E02020",
  sony:         "#6699FF",
  yamaha:       "#CF0A2C",
  adidas:       "#88BBFF",
  mastercard:   "#FF6B35",
  pepsi:        "#4D88FF",
};

/* ── Inline SVG brand logos (use fill="currentColor" — color driven by parent) ── */

const SpotifyLogo = () => (
  <svg viewBox="0 0 168 168" width={120} height={40} fill="currentColor">
    <path d="M84 0C37.6 0 0 37.6 0 84s37.6 84 84 84 84-37.6 84-84S130.4 0 84 0zm38.5 121.2c-1.5 2.5-4.7 3.2-7.1 1.7-19.5-11.9-44-14.6-72.9-8-2.8.6-5.6-1.1-6.2-3.9-.6-2.8 1.1-5.6 3.9-6.2 31.6-7.2 58.7-4.1 80.6 9.3 2.5 1.5 3.2 4.7 1.7 7.1zm10.3-22.9c-1.9 3.1-5.9 4-9 2.1-22.3-13.7-56.3-17.7-82.7-9.7-3.4 1-7.1-.9-8.1-4.3-1-3.4.9-7.1 4.3-8.1 30.1-9.1 67.5-4.7 93.1 11 3.1 1.9 4 5.9 2.1 9zm.9-23.8c-26.8-15.9-71-17.4-96.5-9.6-4.1 1.3-8.4-1.1-9.6-5.2-1.3-4.1 1.1-8.4 5.2-9.6 29.3-8.9 78-7.2 108.8 11.1 3.7 2.2 4.9 6.9 2.7 10.6-2.2 3.7-6.9 4.9-10.6 2.7z"/>
  </svg>
);

const YoutubeLogo = () => (
  <svg viewBox="0 0 159 110" width={100} height={36} fill="currentColor">
    <path d="M154 17.5c-1.8-6.7-7.1-12-13.8-13.8C128 0 79.5 0 79.5 0S31 0 18.8 3.7C12.1 5.5 6.8 10.8 5 17.5 1.2 29.7 1.2 55 1.2 55s0 25.3 3.8 37.5c1.8 6.7 7.1 12 13.8 13.8C31 110 79.5 110 79.5 110s48.5 0 60.7-3.7c6.7-1.8 12-7.1 13.8-13.8 3.8-12.2 3.8-37.5 3.8-37.5s0-25.3-3.8-37.5zM64 79V31l40.5 24L64 79z"/>
  </svg>
);

const RedBullLogo = () => (
  <svg viewBox="0 0 200 50" width={110} height={32} fill="currentColor">
    <text x="0" y="38" fontFamily="'Century Gothic', sans-serif" fontWeight="900" fontSize="38" letterSpacing="2">RED BULL</text>
  </svg>
);

const SamsungLogo = () => (
  <svg viewBox="0 0 200 40" width={120} height={30} fill="currentColor">
    <text x="0" y="32" fontFamily="'Century Gothic', sans-serif" fontWeight="700" fontSize="32" letterSpacing="6">SAMSUNG</text>
  </svg>
);

const NikeLogo = () => (
  <svg viewBox="0 0 192 75" width={90} height={35} fill="currentColor">
    <path d="M42.7 75C29.1 75 18.4 69.2 13.3 58l57.4-25.8c3.6-1.6 5-3.4 5-5.8 0-3.8-3.2-6.4-7.8-6.4-8.6 0-17.6 7.2-17.6 7.2L1.8 50.2S-4 30.4 14.2 15.2C25.4 6 39.8 0 53.8 0c18 0 29.2 9.6 29.2 24 0 10-6 19-16.6 23.8L42.7 75zM175.6 9.8l-39 56.6h-14.4l14-20.2-14-36.4h15.2l6.6 20.4 17.4-20.4h14.2z"/>
  </svg>
);

const AdidasLogo = () => (
  <svg viewBox="0 0 200 50" width={110} height={35} fill="currentColor">
    <polygon points="60,50 40,10 50,10 70,50"/>
    <polygon points="85,50 55,10 65,10 95,50"/>
    <polygon points="110,50 70,10 80,10 120,50"/>
    <text x="125" y="42" fontFamily="'Century Gothic', sans-serif" fontWeight="700" fontSize="22" letterSpacing="1">adidas</text>
  </svg>
);

const SonyLogo = () => (
  <svg viewBox="0 0 200 50" width={100} height={30} fill="currentColor">
    <text x="0" y="40" fontFamily="'Century Gothic', sans-serif" fontWeight="400" fontSize="44" letterSpacing="8">SONY</text>
  </svg>
);

const PepsiLogo = () => (
  <svg viewBox="0 0 200 50" width={100} height={30} fill="currentColor">
    <text x="0" y="38" fontFamily="'Century Gothic', sans-serif" fontWeight="900" fontSize="36" letterSpacing="3" fontStyle="italic">PEPSI</text>
  </svg>
);

const VisaLogo = () => (
  <svg viewBox="0 0 200 65" width={90} height={30} fill="currentColor">
    <text x="0" y="52" fontFamily="'Century Gothic', sans-serif" fontWeight="700" fontSize="58" fontStyle="italic" letterSpacing="2">VISA</text>
  </svg>
);

const JBLLogo = () => (
  <svg viewBox="0 0 120 50" width={70} height={30} fill="currentColor">
    <text x="0" y="42" fontFamily="'Century Gothic', sans-serif" fontWeight="900" fontSize="46" letterSpacing="2">JBL</text>
  </svg>
);

const BoseLogo = () => (
  <svg viewBox="0 0 160 50" width={90} height={28} fill="currentColor">
    <text x="0" y="40" fontFamily="'Century Gothic', sans-serif" fontWeight="400" fontSize="42" letterSpacing="4">BOSE</text>
  </svg>
);

const SennheiserLogo = () => (
  <svg viewBox="0 0 280 40" width={130} height={24} fill="currentColor">
    <text x="0" y="32" fontFamily="'Century Gothic', sans-serif" fontWeight="600" fontSize="28" letterSpacing="5">SENNHEISER</text>
  </svg>
);

const YamahaLogo = () => (
  <svg viewBox="0 0 200 50" width={110} height={30} fill="currentColor">
    <text x="0" y="38" fontFamily="'Century Gothic', sans-serif" fontWeight="700" fontSize="34" letterSpacing="6">YAMAHA</text>
  </svg>
);

const PioneerLogo = () => (
  <svg viewBox="0 0 200 40" width={110} height={28} fill="currentColor">
    <text x="0" y="32" fontFamily="'Century Gothic', sans-serif" fontWeight="600" fontSize="30" letterSpacing="5">PIONEER</text>
  </svg>
);

const MasterCardLogo = ({ hovered }: { hovered: boolean }) => (
  <svg viewBox="0 0 200 50" width={120} height={30}>
    <circle cx="38" cy="25" r="22" fill={hovered ? "#EB001B" : "currentColor"} opacity={hovered ? 1 : 0.7}/>
    <circle cx="62" cy="25" r="22" fill={hovered ? "#F79E1B" : "currentColor"} opacity={hovered ? 0.85 : 0.5}/>
    <text x="95" y="34" fontFamily="'Century Gothic', sans-serif" fontWeight="600" fontSize="22" letterSpacing="1" fill="currentColor">mastercard</text>
  </svg>
);

const HeinekenLogo = () => (
  <svg viewBox="0 0 240 40" width={120} height={26} fill="currentColor">
    <text x="0" y="32" fontFamily="'Century Gothic', sans-serif" fontWeight="700" fontSize="30" letterSpacing="4">HEINEKEN</text>
  </svg>
);

const CocaColaLogo = () => (
  <svg viewBox="0 0 240 50" width={120} height={28} fill="currentColor">
    <text x="0" y="40" fontFamily="'Century Gothic', sans-serif" fontWeight="400" fontSize="34" fontStyle="italic" letterSpacing="1">Coca-Cola</text>
  </svg>
);

const MonsterLogo = () => (
  <svg viewBox="0 0 220 40" width={110} height={26} fill="currentColor">
    <text x="0" y="32" fontFamily="'Century Gothic', sans-serif" fontWeight="900" fontSize="28" letterSpacing="3">MONSTER</text>
  </svg>
);

const LiveNationLogo = () => (
  <svg viewBox="0 0 260 40" width={130} height={26} fill="currentColor">
    <text x="0" y="32" fontFamily="'Century Gothic', sans-serif" fontWeight="800" fontSize="28" letterSpacing="3">LIVE NATION</text>
  </svg>
);

const TicketmasterLogo = () => (
  <svg viewBox="0 0 300 40" width={140} height={26} fill="currentColor">
    <text x="0" y="32" fontFamily="'Century Gothic', sans-serif" fontWeight="600" fontSize="28" letterSpacing="3">ticketmaster</text>
  </svg>
);

/* ── Brand entries ────────────────────────────────────────────────────── */

type BrandEntry = { id: string; logo: (hovered: boolean) => React.ReactNode };

const row1Brands: BrandEntry[] = [
  { id: "spotify",     logo: () => <SpotifyLogo /> },
  { id: "redbull",     logo: () => <RedBullLogo /> },
  { id: "youtube",     logo: () => <YoutubeLogo /> },
  { id: "samsung",     logo: () => <SamsungLogo /> },
  { id: "cocacola",    logo: () => <CocaColaLogo /> },
  { id: "jbl",         logo: () => <JBLLogo /> },
  { id: "nike",        logo: () => <NikeLogo /> },
  { id: "heineken",    logo: () => <HeinekenLogo /> },
  { id: "visa",        logo: () => <VisaLogo /> },
  { id: "livenation",  logo: () => <LiveNationLogo /> },
];

const row2Brands: BrandEntry[] = [
  { id: "monster",      logo: () => <MonsterLogo /> },
  { id: "bose",         logo: () => <BoseLogo /> },
  { id: "sennheiser",   logo: () => <SennheiserLogo /> },
  { id: "ticketmaster", logo: () => <TicketmasterLogo /> },
  { id: "pioneer",      logo: () => <PioneerLogo /> },
  { id: "sony",         logo: () => <SonyLogo /> },
  { id: "yamaha",       logo: () => <YamahaLogo /> },
  { id: "adidas",       logo: () => <AdidasLogo /> },
  { id: "mastercard",   logo: (h) => <MasterCardLogo hovered={h} /> },
  { id: "pepsi",        logo: () => <PepsiLogo /> },
];

/* ── Single brand card with hover color ──────────────────────────────── */

function BrandCard({ id, logo }: BrandEntry) {
  const [hovered, setHovered] = useState(false);
  const color = BRAND_COLORS[id] ?? "#ffffff";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-shrink-0 cursor-default rounded-xl px-6 py-4 flex items-center justify-center backdrop-blur-md"
      style={{
        color: hovered ? color : "rgba(255,255,255,0.22)",
        background: hovered
          ? `linear-gradient(135deg, ${color}1A 0%, ${color}08 100%)`
          : "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: `1px solid ${hovered ? color + "55" : "rgba(255,255,255,0.08)"}`,
        boxShadow: hovered
          ? `inset 0 1px 0 ${color}22, 0 4px 24px rgba(0,0,0,0.3), 0 0 24px ${color}28`
          : "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.2)",
        transition: "color 0.4s ease, background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
      }}
    >
      {logo(hovered)}
    </div>
  );
}

/* ── Marquee row ──────────────────────────────────────────────────────── */

function MarqueeRow({ brands, direction }: { brands: BrandEntry[]; direction: "left" | "right" }) {
  const items = [...brands, ...brands];
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const speed = direction === "left" ? -0.5 : 0.5;
    let pos = direction === "right" ? -(el.scrollWidth / 2) : 0;
    let raf: number;

    const step = () => {
      pos += speed;
      const half = el.scrollWidth / 2;
      if (direction === "left" && pos <= -half) pos += half;
      if (direction === "right" && pos >= 0) pos -= half;
      el.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [direction]);

  return (
    <div className="relative overflow-hidden py-6">
      <div className="absolute left-0 top-0 bottom-0 w-28 z-10" style={{ background: "linear-gradient(to right, #080808, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-28 z-10" style={{ background: "linear-gradient(to left, #080808, transparent)" }} />

      <div
        ref={trackRef}
        className="flex items-center gap-20 whitespace-nowrap w-max will-change-transform"
      >
        {items.map((brand, i) => (
          <BrandCard key={`${brand.id}-${i}`} id={brand.id} logo={brand.logo} />
        ))}
      </div>
    </div>
  );
}

/* ── Section ──────────────────────────────────────────────────────────── */

export default function BrandMarquee() {
  return (
    <section className="py-16 overflow-hidden">
      <div className="text-center mb-10 select-none">
        <p className="text-white/30 text-[10px] font-semibold tracking-[0.4em] uppercase mb-3">
          TRUSTED BY THE BEST
        </p>
        <h2 className="text-white font-black text-3xl uppercase tracking-tight">
          Brands & Companies
        </h2>
      </div>

      <MarqueeRow brands={row1Brands} direction="left" />
      <MarqueeRow brands={row2Brands} direction="right" />
    </section>
  );
}
