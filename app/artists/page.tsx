"use client";

import { Suspense, useState, useLayoutEffect, useEffect, useRef } from "react";
import { thumb } from "../lib/images";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Artist } from "../data/artists";
import { useAdminData } from "../context/AdminDataContext";
import { artistSlug } from "../lib/slug";
import { isEventPast } from "../lib/eventTime";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StickySearchFilters from "../components/StickySearchFilters";
import ParticleField from "../components/ParticleField";
import SponsoredTag from "../components/SponsoredTag";
import ArtistCard, { upcomingEventCount } from "../components/ArtistCard";
import { TALENT_CATEGORIES, talentCategory } from "../lib/talent";
import Preloader from "../components/Preloader";
import { hasPreloaderShown, markPreloaderShown } from "../preloaderState";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function ArtistRow({ title, subtitle, artists: rowArtists, followed, onFollow, direction = "left" }: {
  title: string; subtitle?: string;
  artists: Artist[];
  followed: Set<number>;
  onFollow: (id: number) => void;
  direction?: "left" | "right";
}) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const animating = useRef(false);
  const posRef    = useRef(0);
  const rafRef    = useRef<number>(0);
  const CARD_STEP = 244 * 3;

  const items = [...rowArtists, ...rowArtists];

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const speed = 0.4;
    posRef.current = direction === "right" ? -(el.scrollWidth / 2) : 0;

    const step = () => {
      if (!pausedRef.current && !animating.current) {
        posRef.current += direction === "left" ? -speed : speed;
        const half = el.scrollWidth / 2;
        if (direction === "left"  && posRef.current <= -half) posRef.current += half;
        if (direction === "right" && posRef.current >= 0)     posRef.current -= half;
        el.style.transform = `translateX(${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [direction, rowArtists.length]);

  const slideTo = (delta: number) => {
    const el = trackRef.current;
    if (!el || animating.current) return;
    animating.current = true;
    const start = posRef.current;
    const target = start + delta;
    const duration = 700;
    const t0 = performance.now();
    const animate = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2,3)/2;
      let pos = start + (target - start) * eased;
      const half = el.scrollWidth / 2;
      if (pos <= -half) pos += half;
      if (pos >= 0 && direction === "right") pos -= half;
      posRef.current = pos;
      el.style.transform = `translateX(${pos}px)`;
      if (p < 1) requestAnimationFrame(animate);
      else animating.current = false;
    };
    requestAnimationFrame(animate);
  };

  const ArrowBtn = ({ onClick, children, side }: { onClick: () => void; children: React.ReactNode; side: "left" | "right" }) => (
    <button
      onClick={onClick}
      style={{
        position: "absolute", [side]: 12, top: "50%", transform: "translateY(-50%)", zIndex: 10,
        width: 40, height: 40, borderRadius: "50%", cursor: "pointer",
        background: "rgba(10,10,14,0.85)", border: "1px solid rgba(255,255,255,0.18)",
        backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,0.8)", transition: "all 0.2s",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "#000"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(10,10,14,0.85)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; }}
    >{children}</button>
  );

  if (!rowArtists.length) return null;

  return (
    <div data-reveal style={{ marginBottom: 40 }}>
      <div style={{ marginBottom: 16 }}>
        {subtitle && <p style={{ fontSize: 10, fontWeight: 700, color: "#ffffff", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 4 }}>{subtitle}</p>}
        <h2 style={{ fontSize: "clamp(1rem,2vw,1.4rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</h2>
      </div>
      <div
        style={{ overflow: "hidden", position: "relative" }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, zIndex: 2, background: "linear-gradient(to right, #0F1116, transparent)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, zIndex: 2, background: "linear-gradient(to left, #0F1116, transparent)", pointerEvents: "none" }} />

        <ArrowBtn side="left"  onClick={() => slideTo(CARD_STEP)}><ChevronLeft size={18} /></ArrowBtn>
        <ArrowBtn side="right" onClick={() => slideTo(-CARD_STEP)}><ChevronRight size={18} /></ArrowBtn>

        <div ref={trackRef} style={{ display: "flex", gap: 14, width: "max-content", willChange: "transform", paddingBottom: 6 }}>
          {items.map((a, i) => (
            <ArtistCard key={`${a.id}-${i}`} artist={a} followed={followed.has(a.id)} onFollow={e => { e.stopPropagation(); onFollow(a.id); }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Inner content
   ══════════════════════════════════════════════════════════════════════ */
function ArtistsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { artists, events } = useAdminData();
  const eventCountFor = (a: Artist) => upcomingEventCount(events, [a.stageName || a.name, a.name]);
  const [followed, setFollowed] = useState<Set<number>>(new Set());
  const queryParam  = searchParams.get("q")      ?? "";
  const filterParam = searchParams.get("filter") ?? "";
  const genreParam  = searchParams.get("genre")  ?? "";
  const toggleFollow = (id: number) =>
    setFollowed(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const isFiltered = !!queryParam || !!filterParam || !!genreParam;

  if (isFiltered) {
    let filtered = [...artists];
    if (filterParam === "followed")    filtered = filtered.filter(a => followed.has(a.id));
    if (filterParam === "recommended") filtered = filtered.sort((a, b) => eventCountFor(b) - eventCountFor(a));
    if (genreParam) {
      const g = genreParam.toLowerCase();
      filtered = filtered.filter(a => [...(a.genres ?? []), ...(a.subGenres ?? [])].some(x => x.toLowerCase() === g));
    }
    if (queryParam) {
      const q = queryParam.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(q) || (a.stageName ?? "").toLowerCase().includes(q) || a.role.toLowerCase().includes(q) ||
        [...(a.genres ?? []), ...(a.subGenres ?? [])].some(x => x.toLowerCase().includes(q)));
    }
    return (
      <div style={{ padding: "24px 0 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.5rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
            {queryParam ? `"${queryParam}"` : genreParam ? genreParam : filterParam === "followed" ? "Followed Talent" : "Talent"}
          </h1>
          <button onClick={() => router.push("/artists")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", background: "transparent" }}>
            <X size={10} /> Clear
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {filtered.map(a => <ArtistCard key={a.id} artist={a} followed={followed.has(a.id)} onFollow={e => { e.stopPropagation(); toggleFollow(a.id); }} />)}
        </div>
      </div>
    );
  }

  // The five Talent sections, each A to Z. Empty sections are hidden.
  const byName = (x: Artist, y: Artist) => (x.stageName || x.name).localeCompare(y.stageName || y.name);
  const rows = TALENT_CATEGORIES.map(c => ({
    title: c.name,
    subtitle: "Talent",
    data: artists.filter(a => talentCategory(a.role) === c.name).sort(byName),
  }));

  return (
    <div style={{ padding: "24px 0 64px" }}>
      {rows.map((row, i) => (
        <ArtistRow key={row.title} title={row.title} subtitle={row.subtitle} artists={row.data} followed={followed} onFollow={toggleFollow} direction={i % 2 === 0 ? "left" : "right"} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Page export
   ══════════════════════════════════════════════════════════════════════ */
export default function ArtistsPage() {
  const [preloaderPhase, setPreloaderPhase] = useState<"checking" | "idle" | "exit" | "gone">("checking");

  useIsomorphicLayoutEffect(() => {
    if (hasPreloaderShown()) setPreloaderPhase("gone");
    else { markPreloaderShown(); setPreloaderPhase("idle"); }
  }, []);

  return (
    <main className="bg-[#0F1116] relative" style={{ height: "100dvh", overflowY: "auto" }}>
      {(preloaderPhase === "idle" || preloaderPhase === "exit") && (
        <Preloader phase={preloaderPhase === "idle" ? "idle" : "exit"} setPhase={setPreloaderPhase} />
      )}
      <ParticleField />
      <div style={{ opacity: (preloaderPhase === "checking" || preloaderPhase === "idle") ? 0 : 1, transition: preloaderPhase === "gone" ? undefined : "opacity 1.2s ease" }}>
        <Navbar />
        <div style={{ paddingTop: "var(--nav-h, 64px)", position: "relative", zIndex: 10 }}>
          <StickySearchFilters />
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
            <Suspense fallback={
              <div style={{ padding: "40px 0" }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ marginBottom: 40 }}>
                    <div style={{ height: 24, width: 180, borderRadius: 8, background: "rgba(255,255,255,0.04)", marginBottom: 16 }} />
                    <div style={{ display: "flex", gap: 14 }}>
                      {[...Array(5)].map((_, j) => <div key={j} style={{ width: 230, height: 320, borderRadius: 16, background: "rgba(255,255,255,0.03)", flexShrink: 0 }} />)}
                    </div>
                  </div>
                ))}
              </div>
            }>
              <ArtistsContent />
            </Suspense>
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}
