"use client";

import { Suspense, useState, useLayoutEffect, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Calendar, Ticket, Heart, Share2, ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { events, Event } from "../data/events";
import { useUserLocation, haversineKm, formatDistance } from "../context/LocationContext";
import Navbar from "../components/Navbar";
import StickySearchFilters from "../components/StickySearchFilters";
import ParticleField from "../components/ParticleField";
import Preloader from "../components/Preloader";
import { hasPreloaderShown, markPreloaderShown } from "../preloaderState";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ── Horizontal scroll row ─────────────────────────────────────── */
function EventCard({ event, liked, shared, onLike, onShare }: {
  event: Event;
  liked: boolean; shared: boolean;
  onLike: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}) {
  const router = useRouter();
  const { userLocation } = useUserLocation();
  const [hovered, setHovered] = useState(false);
  const distance = userLocation
    ? haversineKm(userLocation.lat, userLocation.lon, event.lat, event.lon)
    : null;

  return (
    <div
      onClick={() => router.push(`/events/${event.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        width: 230,
        height: 320,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        border: `1px solid ${hovered ? "rgba(57,189,105,0.4)" : "rgba(255,255,255,0.08)"}`,
        boxShadow: hovered ? "0 0 28px rgba(57,189,105,0.15)" : "none",
        transition: "border-color 0.3s, box-shadow 0.3s, transform 0.3s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        background: "#0a0a0a",
      }}
    >
      {/* Image */}
      <img
        src={event.image} alt={event.title}
        style={{
          width: "100%", height: "68%", objectFit: "cover", objectPosition: "top",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          transition: "transform 0.5s ease",
        }}
      />

      {/* Gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.1) 100%)",
      }} />

      {/* Badge */}
      {event.badge && (
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <span style={{
            background: "#fff", color: "#000",
            fontSize: 8, fontWeight: 900, letterSpacing: "0.18em",
            textTransform: "uppercase", padding: "3px 8px", borderRadius: 999,
          }}>{event.badge}</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        <button onClick={onLike} style={{
          width: 28, height: 28, borderRadius: "50%",
          background: liked ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.55)",
          border: `1px solid ${liked ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.15)"}`,
          backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <Heart size={11} strokeWidth={2.5} fill={liked ? "#fff" : "none"} style={{ color: "#fff" }} />
        </button>
        <button onClick={onShare} style={{
          width: 28, height: 28, borderRadius: "50%",
          background: shared ? "rgba(57,189,105,0.85)" : "rgba(0,0,0,0.55)",
          border: `1px solid ${shared ? "rgba(57,189,105,0.6)" : "rgba(255,255,255,0.15)"}`,
          backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <Share2 size={11} strokeWidth={2.5} style={{ color: "#fff" }} />
        </button>
      </div>

      {/* Info */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px" }}>
        <p style={{ fontSize: 8, fontWeight: 700, color: "#39BD69", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 4 }}>
          {event.tag}
        </p>
        <h3 style={{ fontSize: 12, fontWeight: 900, color: "#fff", textTransform: "uppercase", lineHeight: 1.25, marginBottom: 6, letterSpacing: "0.04em" }}>
          {event.title}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={8} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{event.date}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={8} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{event.location}</span>
            {distance !== null && (
              <span style={{ fontSize: 9, color: "#39BD69", fontWeight: 600 }}>· {formatDistance(distance)}</span>
            )}
          </div>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
            {event.price.replace("Starting from ", "")}
          </p>
        </div>
      </div>
    </div>
  );
}

function EventRow({ title, subtitle, events: rowEvents, liked, shared, onLike, onShare }: {
  title: string; subtitle?: string;
  events: Event[];
  liked: Set<number>; shared: Set<number>;
  onLike: (id: number, e: React.MouseEvent) => void;
  onShare: (id: number, title: string, e: React.MouseEvent) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -440 : 440, behavior: "smooth" });
  };

  if (!rowEvents.length) return null;

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Row header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16, paddingRight: 4 }}>
        <div>
          {subtitle && <p style={{ fontSize: 10, fontWeight: 700, color: "#39BD69", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 4 }}>{subtitle}</p>}
          <h2 style={{ fontSize: "clamp(1rem,2vw,1.4rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => scroll("left")}
            style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "#000"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
          ><ChevronLeft size={14} /></button>
          <button onClick={() => scroll("right")}
            style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "#000"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
          ><ChevronRight size={14} /></button>
        </div>
      </div>

      {/* Horizontal scroll track */}
      <div
        ref={scrollRef}
        style={{ display: "flex", gap: 14, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 6, paddingRight: 4 }}
      >
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

/* ══════════════════════════════════════════════════════════════════════
   Inner content
   ══════════════════════════════════════════════════════════════════════ */
function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userLocation } = useUserLocation();

  const [liked,  setLiked]  = useState<Set<number>>(new Set());
  const [shared, setShared] = useState<Set<number>>(new Set());

  const genreParam    = searchParams.get("genre")    ?? "";
  const dateParam     = searchParams.get("date")     ?? "";
  const queryParam    = searchParams.get("q")        ?? "";
  const categoryParam = searchParams.get("category") ?? "";

  const toggleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const handleShare = (id: number, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) navigator.share({ title, url: `${window.location.origin}/events/${id}` });
    else navigator.clipboard?.writeText(`${window.location.origin}/events/${id}`);
    setShared(prev => { const s = new Set(prev); s.add(id); return s; });
    setTimeout(() => setShared(prev => { const s = new Set(prev); s.delete(id); return s; }), 1500);
  };

  const isFiltered = !!genreParam || !!dateParam || !!queryParam;

  /* ── Filtered view ───────────────────────────────────────────── */
  if (isFiltered) {
    const filtered = events.filter(ev => {
      if (genreParam && !ev.genres.includes(genreParam)) return false;
      if (queryParam) {
        const q = queryParam.toLowerCase();
        const searchable = [ev.title, ev.tag, ev.location, ...ev.genres, ...ev.lineup].join(" ").toLowerCase();
        if (!searchable.includes(q)) return false;
        if (categoryParam === "artists" && !ev.lineup.some(a => a.toLowerCase().includes(q))) return false;
        if (categoryParam === "genres" && !ev.genres.some(g => g.toLowerCase().includes(q))) return false;
      }
      return true;
    });

    return (
      <div style={{ padding: "24px 0 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.5rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
            {queryParam ? `"${queryParam}"` : genreParam || "Filtered"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>{filtered.length} events</span>
            <button onClick={() => router.push("/events")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", background: "transparent" }}>
              <X size={10} /> Clear
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {filtered.map(ev => (
            <EventCard key={ev.id} event={ev} liked={liked.has(ev.id)} shared={shared.has(ev.id)}
              onLike={e => toggleLike(ev.id, e)} onShare={e => handleShare(ev.id, ev.title, e)} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Build categorised rows ──────────────────────────────────── */
  const featured   = events.filter(e => e.badge === "HOT" || e.badge === "NEW");
  const comingSoon = events.filter(e => e.badge === "COMING SOON");

  const nearest = userLocation
    ? [...events].sort((a, b) =>
        haversineKm(userLocation.lat, userLocation.lon, a.lat, a.lon) -
        haversineKm(userLocation.lat, userLocation.lon, b.lat, b.lon)
      ).slice(0, 8)
    : [];

  const upcoming = [...events]
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const electronic = events.filter(e => e.genres.includes("electronic"));
  const sinhala    = events.filter(e => e.genres.includes("sinhala"));
  const djNights   = events.filter(e => e.tag.toLowerCase().includes("dj"));
  const colombo    = events.filter(e => e.location === "Colombo");

  const rows = [
    { title: "Hot & Trending",      subtitle: "Don't Miss Out",       data: featured },
    ...(nearest.length ? [{ title: "Near You",         subtitle: "Based on Your Location", data: nearest }] : []),
    { title: "Upcoming Events",     subtitle: "Coming Soon",          data: upcoming },
    { title: "Electronic / EDM",    subtitle: "Genre",                data: electronic },
    { title: "Sinhala Music",       subtitle: "Genre",                data: sinhala },
    { title: "DJ Nights",           subtitle: "Night Life",           data: djNights },
    { title: "Colombo Events",      subtitle: "By City",              data: colombo },
    { title: "Coming Soon",         subtitle: "Save the Date",        data: comingSoon },
    { title: "All Events",          subtitle: "Browse Everything",    data: events },
  ];

  return (
    <div style={{ padding: "24px 0 64px" }}>
      {rows.map(row => (
        <EventRow
          key={row.title}
          title={row.title}
          subtitle={row.subtitle}
          events={row.data}
          liked={liked}
          shared={shared}
          onLike={toggleLike}
          onShare={handleShare}
        />
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
    <main className="bg-[#080808] relative" style={{ height: "100dvh", overflowY: "auto" }}>
      {(preloaderPhase === "idle" || preloaderPhase === "exit") && (
        <Preloader phase={preloaderPhase === "idle" ? "idle" : "exit"} setPhase={setPreloaderPhase} />
      )}
      <ParticleField />
      <div style={{ opacity: (preloaderPhase === "checking" || preloaderPhase === "idle") ? 0 : 1, transition: preloaderPhase === "gone" ? undefined : "opacity 1.2s ease" }}>
        <Navbar />
        <div style={{ paddingTop: 64, position: "relative", zIndex: 10 }}>
          <StickySearchFilters />
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
            <Suspense fallback={
              <div style={{ padding: "40px 0" }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ marginBottom: 40 }}>
                    <div style={{ height: 24, width: 200, borderRadius: 8, background: "rgba(255,255,255,0.04)", marginBottom: 16 }} />
                    <div style={{ display: "flex", gap: 14 }}>
                      {[...Array(5)].map((_, j) => (
                        <div key={j} style={{ width: 230, height: 320, borderRadius: 16, background: "rgba(255,255,255,0.03)", flexShrink: 0 }} />
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
      </div>
    </main>
  );
}
