"use client";

import { useEffect, useRef, useState } from "react";
import { useAdminData } from "../context/AdminDataContext";

/* ── Brand entries ────────────────────────────────────────────────────── */
type Brand = { id: string | number; name: string; logo?: string; slug?: string; color?: string };

const row1Brands: Brand[] = [
  { id: "spotify",      name: "Spotify",      slug: "spotify",      color: "#1DB954" },
  { id: "youtube",      name: "YouTube",      slug: "youtube",      color: "#FF0000" },
  { id: "redbull",      name: "Red Bull",     slug: "redbull",      color: "#CC1A2E" },
  { id: "samsung",      name: "Samsung",      slug: "samsung",      color: "#1428A0" },
  { id: "cocacola",     name: "Coca-Cola",    slug: "cocacola",     color: "#FF1A1A" },
  { id: "jbl",          name: "JBL",          slug: "jbl",          color: "#FF8C00" },
  { id: "nike",         name: "Nike",         slug: "nike",         color: "#F5492E" },
  { id: "heineken",     name: "Heineken",     slug: "heineken",     color: "#00A651" },
  { id: "visa",         name: "Visa",         slug: "visa",         color: "#F7B600" },
  { id: "livenation",   name: "Live Nation",  slug: "livenation",   color: "#E01A2C" },
];

const row2Brands: Brand[] = [
  { id: "monster",      name: "Monster",      slug: "monsterenergy", color: "#A0D200" },
  { id: "bose",         name: "Bose",         slug: "bose",          color: "#FFFFFF" },
  { id: "sennheiser",   name: "Sennheiser",   slug: "sennheiser",    color: "#3399FF" },
  { id: "ticketmaster", name: "Ticketmaster", slug: "ticketmaster",  color: "#0088FF" },
  { id: "pioneer",      name: "Pioneer",      slug: "pioneerdj",     color: "#E02020" },
  { id: "sony",         name: "Sony",         slug: "sony",          color: "#6699FF" },
  { id: "yamaha",       name: "Yamaha",       slug: "yamaha",        color: "#CF0A2C" },
  { id: "adidas",       name: "Adidas",       slug: "adidas",        color: "#FFFFFF" },
  { id: "mastercard",   name: "Mastercard",   slug: "mastercard",    color: "#F79E1B" },
  { id: "pepsi",        name: "Pepsi",        slug: "pepsi",         color: "#4D88FF" },
];

/* ── Single brand card ────────────────────────────────────────────────── */
function BrandCard({ brand }: { brand: Brand }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const color = brand.color || "#39BD69";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-shrink-0 cursor-default rounded-xl px-6 py-4 flex flex-col items-center justify-center gap-2.5 backdrop-blur-md"
      style={{
        minWidth: 150,
        background: hovered
          ? `linear-gradient(135deg, ${color}1A 0%, ${color}08 100%)`
          : "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: `1px solid ${hovered ? color + "55" : "rgba(255,255,255,0.08)"}`,
        boxShadow: hovered
          ? `inset 0 1px 0 ${color}22, 0 4px 24px rgba(0,0,0,0.3), 0 0 24px ${color}28`
          : "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.2)",
        transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease, filter 0.4s ease",
        filter: hovered ? "brightness(1.15)" : "brightness(1)",
      }}
    >
      {brand.logo ? (
        // Admin-uploaded logo
        <img src={brand.logo} alt={brand.name} style={{ maxWidth: 90, maxHeight: 52, objectFit: "contain", flexShrink: 0 }} />
      ) : !imgError && brand.slug ? (
        // Fallback demo icon (simpleicons)
        <img src={`https://cdn.simpleicons.org/${brand.slug}`} alt={brand.name} width={52} height={52} style={{ flexShrink: 0 }} onError={() => setImgError(true)} />
      ) : (
        <div className="w-13 h-13 rounded-full flex items-center justify-center text-[13px] font-black" style={{ width: 52, height: 52, background: color + "33", color }}>
          {brand.name[0]}
        </div>
      )}
      <span className="text-white/45 text-[11px] font-semibold tracking-wide whitespace-nowrap">{brand.name}</span>
    </div>
  );
}

/* ── Marquee row ──────────────────────────────────────────────────────── */
function MarqueeRow({ brands, direction }: { brands: Brand[]; direction: "left" | "right" }) {
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
      if (direction === "left"  && pos <= -half) pos += half;
      if (direction === "right" && pos >= 0)     pos -= half;
      el.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [direction]);

  return (
    <div className="relative overflow-hidden w-full">
      <div className="absolute left-0 top-0 bottom-0 w-28 z-10" style={{ background: "linear-gradient(to right, #080808, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-28 z-10" style={{ background: "linear-gradient(to left, #080808, transparent)" }} />
      <div ref={trackRef} className="flex items-center gap-16 whitespace-nowrap w-max will-change-transform">
        {items.map((brand, i) => (
          <BrandCard key={`${brand.id}-${i}`} brand={brand} />
        ))}
      </div>
    </div>
  );
}

/* ── Section ──────────────────────────────────────────────────────────── */
export default function BrandMarquee() {
  const { brands } = useAdminData();

  // Use admin-managed brands when any exist; otherwise fall back to the demo set.
  let r1: Brand[], r2: Brand[];
  if (brands.length > 0) {
    const all: Brand[] = brands.map(b => ({ id: b.id, name: b.name, logo: b.logo }));
    const mid = Math.ceil(all.length / 2);
    r1 = all.slice(0, mid);
    r2 = all.slice(mid);
    if (r2.length === 0) r2 = r1;   // only a couple of brands — reuse for the second row
  } else {
    r1 = row1Brands;
    r2 = row2Brands;
  }

  return (
    <section className="snap-section overflow-hidden flex flex-col items-center justify-evenly">
      {/* Header */}
      <div className="text-center relative z-[200] select-none flex flex-col items-center" style={{ gap: "clamp(4px, 1vh, 12px)" }}>
        <p className="text-white/30 text-[12px] font-semibold tracking-[0.4em] uppercase">
          TRUSTED BY THE BEST
        </p>
        <h2 className="text-white font-black uppercase tracking-tight" style={{ fontSize: "clamp(1.2rem, 3vw + 1vh, 2rem)" }}>
          Brands &amp; Companies
        </h2>
      </div>

      <MarqueeRow brands={r1} direction="left" />
      <MarqueeRow brands={r2} direction="right" />
    </section>
  );
}
