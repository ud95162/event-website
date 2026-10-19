"use client";

import { Suspense, useState, useLayoutEffect, useEffect, useRef } from "react";
import { genreColor, genreChipStyle } from "../lib/genres";
import { thumb } from "../lib/images";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MapPin, Calendar, Ticket, Heart, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import EventShare from "../components/EventShare";
import SponsoredTag from "../components/SponsoredTag";
import EventCard from "../components/EventCard";
import { dateRangeLabel } from "../lib/dateRange";
import { EVENT_CATEGORIES } from "../lib/eventCategories";
import { Event, statusColor } from "../data/events";
import { useAdminData } from "../context/AdminDataContext";
import { useUserLocation, haversineKm, formatDistance } from "../context/LocationContext";
import { eventSlug, organizerSlug } from "../lib/slug";
import { ticketPrices } from "../lib/price";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StickySearchFilters from "../components/StickySearchFilters";
import ParticleField from "../components/ParticleField";
import Preloader from "../components/Preloader";
import { hasPreloaderShown, markPreloaderShown } from "../preloaderState";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ── In-memory cache for /events data ──────────────────────────────
   Survives client-side navigation (the module stays loaded), so returning to the
   events page shows the last data instantly instead of refetching from scratch.
   Cleared on a full page reload; the HTTP Cache-Control on these endpoints covers
   that case. We still revalidate in the background after serving the cached copy. */
const eventsCache = new Map<string, unknown>();
const getCache = <T,>(key: string): T | undefined => eventsCache.get(key) as T | undefined;
const setCache = (key: string, val: unknown) => { eventsCache.set(key, val); };

/* ── Horizontal scroll row ─────────────────────────────────────── */
function EventRow({ title, subtitle, events: rowEvents, liked, shared, onLike, onShare, direction = "left" }: {
  title: string; subtitle?: string;
  events: Event[];
  liked: Set<number>; shared: Set<number>;
  onLike: (id: number, e: React.MouseEvent) => void;
  onShare: (id: number, title: string, e: React.MouseEvent) => void;
  direction?: "left" | "right";
}) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const animating = useRef(false);
  const posRef    = useRef(0);
  const rafRef    = useRef<number>(0);
  const CARD_STEP = 284 * 3; // 3 cards (card 270 + gap 14)

  // A row with only a few events just sits still — a scrolling loop of one or two repeated cards
  // looks broken.
  const isStatic = rowEvents.length <= 3;
  const items = isStatic ? rowEvents : [...rowEvents, ...rowEvents];

  useEffect(() => {
    const el = trackRef.current;
    if (!el || isStatic) return;
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
  }, [direction, rowEvents.length, isStatic]);

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

  if (!rowEvents.length) return null;

  if (isStatic) {
    return (
      <div data-reveal style={{ marginBottom: 40 }}>
        <div style={{ marginBottom: 16 }}>
          {subtitle && <p style={{ fontSize: 10, fontWeight: 700, color: "#E8DCC0", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 4 }}>{subtitle}</p>}
          <h2 style={{ fontSize: "clamp(1rem,2vw,1.4rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</h2>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, paddingBottom: 6 }}>
          {rowEvents.map(ev => (
            <EventCard
              key={ev.id} event={ev}
              liked={liked.has(ev.id)} shared={shared.has(ev.id)}
              onLike={e => onLike(ev.id, e)}
              onShare={e => onShare(ev.id, ev.title, e)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-reveal style={{ marginBottom: 40 }}>
      <div style={{ marginBottom: 16 }}>
        {subtitle && <p style={{ fontSize: 10, fontWeight: 700, color: "#E8DCC0", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 4 }}>{subtitle}</p>}
        <h2 style={{ fontSize: "clamp(1rem,2vw,1.4rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</h2>
      </div>

      <div
        style={{ overflow: "hidden", position: "relative" }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        {/* Fade edges */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, zIndex: 2, background: "linear-gradient(to right, #0F1116, transparent)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, zIndex: 2, background: "linear-gradient(to left, #0F1116, transparent)", pointerEvents: "none" }} />

        {/* Centered arrow buttons */}
        <button onClick={() => slideTo(CARD_STEP)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 40, height: 40, borderRadius: "50%", cursor: "pointer", background: "rgba(10,10,14,0.85)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.8)", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#fff"; (e.currentTarget as HTMLElement).style.color="#000"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="rgba(10,10,14,0.85)"; (e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.8)"; }}><ChevronLeft size={18} /></button>
        <button onClick={() => slideTo(-CARD_STEP)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 40, height: 40, borderRadius: "50%", cursor: "pointer", background: "rgba(10,10,14,0.85)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.8)", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#fff"; (e.currentTarget as HTMLElement).style.color="#000"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="rgba(10,10,14,0.85)"; (e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.8)"; }}><ChevronRight size={18} /></button>

        <div ref={trackRef} style={{ display: "flex", gap: 14, width: "max-content", willChange: "transform", paddingBottom: 6 }}>
          {items.map((ev, i) => (
            <EventCard
              key={`${ev.id}-${i}`} event={ev}
              liked={liked.has(ev.id)} shared={shared.has(ev.id)}
              onLike={e => onLike(ev.id, e)}
              onShare={e => onShare(ev.id, ev.title, e)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Inner content
   ══════════════════════════════════════════════════════════════════════ */
/* ── Skeleton row shown while category data loads ─────────────────── */
function SkeletonRow() {
  return (
    <div style={{ margin: "0 0 40px" }}>
      <style>{`@keyframes evt-skel { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
      <div style={{ padding: "0 56px", marginBottom: 16 }}>
        <div style={{ width: 90, height: 9, borderRadius: 4, background: "rgba(255,255,255,0.06)", marginBottom: 10 }} />
        <div style={{ width: 220, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.08)" }} />
      </div>
      <div style={{ display: "flex", gap: 20, padding: "0 56px", overflow: "hidden" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ flexShrink: 0, width: 270, height: 400, borderRadius: 16, overflow: "hidden", background: "#0d0d12", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(110deg, #0d0d12 30%, #16161f 50%, #0d0d12 70%)", backgroundSize: "200% 100%", animation: "evt-skel 1.3s ease-in-out infinite" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── "All Events" — paginated grid (loads 6 at a time) ────────────── */
function CategoryRow({ title, subtitle, endpoint, direction, liked, shared, onLike, onShare, emptyMessage, fallback }: {
  title: string;
  subtitle: string;
  endpoint: string;
  direction: "left" | "right";
  liked: Set<number>;
  shared: Set<number>;
  onLike: (id: number, e: React.MouseEvent) => void;
  onShare: (id: number, title: string, e: React.MouseEvent) => void;
  emptyMessage?: string;   // shown instead of hiding the row when it has no events
  // If this row is empty, load this instead (e.g. the nearest upcoming events anywhere).
  fallback?: { endpoint: string; title: string; subtitle: string };
}) {
  // Hydrate instantly from cache (if we've loaded this row before this session).
  const [data, setData] = useState<Event[] | null>(() => getCache<Event[]>(endpoint) ?? null);

  const [fallbackData, setFallbackData] = useState<Event[] | null>(null);
  const fallbackEndpoint = fallback?.endpoint;
  useEffect(() => {
    // Only look for the fallback once the main row has loaded and turned out empty.
    if (!fallbackEndpoint || !data || data.length > 0) { setFallbackData(null); return; }
    let cancelled = false;
    const cached = getCache<Event[]>(fallbackEndpoint);
    if (cached) setFallbackData(cached);
    fetch(fallbackEndpoint)
      .then(r => (r.ok ? r.json() : []))
      .then(d => { const arr = Array.isArray(d) ? d : []; setCache(fallbackEndpoint, arr); if (!cancelled) setFallbackData(arr); })
      .catch(() => { if (!cancelled && !cached) setFallbackData([]); });
    return () => { cancelled = true; };
  }, [fallbackEndpoint, data]);

  useEffect(() => {
    let cancelled = false;
    const cached = getCache<Event[]>(endpoint);
    setData(cached ?? null); // show cached rows immediately, or skeleton on first load
    // Fetch fresh and update the cache (background revalidate when already cached).
    fetch(endpoint)
      .then(r => (r.ok ? r.json() : []))
      .then(d => { const arr = Array.isArray(d) ? d : []; setCache(endpoint, arr); if (!cancelled) setData(arr); })
      .catch(() => { if (!cancelled && !cached) setData([]); });
    return () => { cancelled = true; };
  }, [endpoint]);

  // Loaded but empty → render nothing (keeps empty categories off the page), unless the row
  // has a message to show (e.g. "no events near you").
  if (data && data.length === 0) {
    // Nothing in range: show the closest upcoming events anywhere, clearly labelled.
    if (fallback && fallbackData === null) return <SkeletonRow />;
    if (fallback && fallbackData && fallbackData.length > 0) {
      return (
        <EventRow title={fallback.title} subtitle={fallback.subtitle} events={fallbackData}
          liked={liked} shared={shared} onLike={onLike} onShare={onShare} direction={direction} />
      );
    }
    return emptyMessage ? (
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>{subtitle}</p>
        <h2 style={{ fontSize: "clamp(1.2rem,2.2vw,1.75rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 14 }}>{title}</h2>
        <div style={{ padding: "22px 20px", borderRadius: 14, border: "1px dashed rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>{emptyMessage}</div>
      </div>
    ) : null;
  }

  return data === null ? (
    <SkeletonRow />
  ) : (
    <EventRow title={title} subtitle={subtitle} events={data}
      liked={liked} shared={shared} onLike={onLike} onShare={onShare} direction={direction} />
  );
}

const NEAR_RADIUS_KM = 50;

function EventsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userLocation, setUserLocation } = useUserLocation();

  const [liked,  setLiked]  = useState<Set<number>>(new Set());
  const [shared, setShared] = useState<Set<number>>(new Set());

  const genreParam    = searchParams.get("genre")    ?? "";
  const dateParam     = searchParams.get("date")     ?? "";
  const queryParam    = searchParams.get("q")        ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const isFiltered = !!genreParam || !!dateParam || !!queryParam;
  const dateInfo = dateRangeLabel(dateParam);

  // Search results for the filtered view. (The default view's category rows each fetch
  // themselves lazily via <CategoryRow>, so the page never downloads the whole table.)
  const [results, setResults] = useState<Event[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  const toggleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const handleShare = (_id: number, _title: string, _e: React.MouseEvent) => {};

  // Filtered view: fetch server-side search results for the active filters.
  useEffect(() => {
    if (!isFiltered) return;
    let cancelled = false;
    const sp = new URLSearchParams();
    if (genreParam) sp.set("genre", genreParam);
    if (dateParam) sp.set("date", dateParam);
    if (queryParam) sp.set("q", queryParam);
    if (categoryParam) sp.set("category", categoryParam);
    const url = `/api/events/search?${sp.toString()}`;
    // Show cached results for this exact query immediately, then revalidate.
    const cached = getCache<Event[]>(url);
    if (cached) { setResults(cached); setResultsLoading(false); } else { setResults([]); setResultsLoading(true); }
    fetch(url)
      .then(r => (r.ok ? r.json() : []))
      .then(d => { const arr = Array.isArray(d) ? d : []; setCache(url, arr); if (!cancelled) setResults(arr); })
      .catch(() => { if (!cancelled && !cached) setResults([]); })
      .finally(() => { if (!cancelled) setResultsLoading(false); });
    return () => { cancelled = true; };
  }, [isFiltered, genreParam, dateParam, queryParam, categoryParam]);

  /* ── Filtered view ───────────────────────────────────────────── */
  if (isFiltered) {
    return (
      <div style={{ padding: "24px 0 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.5rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
            {queryParam ? `"${queryParam}"` : genreParam || "Filtered"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
              {resultsLoading ? "Searching…" : `${results.length} events`}
            </span>
            <button onClick={() => router.push(pathname === "/search" ? "/" : "/events")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", background: "transparent" }}>
              <X size={10} /> Clear
            </button>
          </div>
        </div>
        {dateInfo && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "7px 14px", borderRadius: 999, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.35)" }}>
            <Calendar size={14} style={{ color: "#60a5fa", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
              {dateInfo.name}: <strong style={{ color: "#fff" }}>{dateInfo.range}</strong>
            </span>
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {results.map(ev => (
            <EventCard key={ev.id} event={ev} liked={liked.has(ev.id)} shared={shared.has(ev.id)}
              onLike={e => toggleLike(ev.id, e)} onShare={e => handleShare(ev.id, ev.title, e)} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Default view: each category row loads itself lazily ──────────── */
  // The Events page sections: upcoming events (this week / this month), then the five categories.
  // Every row is upcoming events only, soonest first.
  const rowDefs: { title: string; subtitle: string; type: string; value?: string }[] = [
    { title: "This Week",  subtitle: "Upcoming Events", type: "week" },
    { title: "This Month", subtitle: "Upcoming Events", type: "month" },
    ...EVENT_CATEGORIES.map(c => ({ title: c, subtitle: "Browse by category", type: "category", value: c })),
  ];

  const buildUrl = (def: { type: string; value?: string }) => {
    const p = new URLSearchParams({ type: def.type });
    if (def.value) p.set("value", def.value);
    if (userLocation) {
      p.set("lat", String(userLocation.lat));
      p.set("lon", String(userLocation.lon));
      if (def.type === "near-you") p.set("radius", String(NEAR_RADIUS_KM));
      else p.set("within", String(NEAR_RADIUS_KM));   // a chosen city limits every row to events near it
    }
    return `/api/events/category?${p.toString()}`;
  };

  return (
    <div style={{ padding: "24px 0 64px" }}>
      {userLocation && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20, padding: "10px 16px", borderRadius: 12, background: "rgba(232,220,192,0.08)", border: "1px solid rgba(232,220,192,0.25)" }}>
          <MapPin size={15} style={{ color: "#E8DCC0", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>Showing only events within {NEAR_RADIUS_KM} km of <strong style={{ color: "#fff" }}>{userLocation.city}</strong></span>
          <button
            onClick={() => setUserLocation(null)}
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
          >
            <X size={10} /> Clear location
          </button>
        </div>
      )}
      {rowDefs.map((def, i) => (
        <div key={def.title}>
        <CategoryRow
          emptyMessage={def.type === "near-you" ? `No upcoming events within ${NEAR_RADIUS_KM} km of ${userLocation?.city} yet. Clear the location to see events everywhere.` : undefined}
          title={def.title}
          subtitle={def.subtitle}
          endpoint={buildUrl(def)}
          direction={i % 2 === 0 ? "left" : "right"}
          liked={liked}
          shared={shared}
          onLike={toggleLike}
          onShare={handleShare}
        />
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Page export
   ══════════════════════════════════════════════════════════════════════ */
export default function EventsPage() {
  const [preloaderPhase, setPreloaderPhase] = useState<"checking" | "idle" | "exit" | "gone">("checking");

  useIsomorphicLayoutEffect(() => {
    if (hasPreloaderShown()) {
      setPreloaderPhase("gone");
    } else {
      markPreloaderShown();
      setPreloaderPhase("idle");
    }
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
                    <div style={{ height: 24, width: 200, borderRadius: 8, background: "rgba(255,255,255,0.04)", marginBottom: 16 }} />
                    <div style={{ display: "flex", gap: 14 }}>
                      {[...Array(5)].map((_, j) => (
                        <div key={j} style={{ width: 270, height: 400, borderRadius: 16, background: "rgba(255,255,255,0.03)", flexShrink: 0 }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            }>
              <EventsContent />
            </Suspense>
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}
