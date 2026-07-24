"use client";

import { Suspense, useState, useLayoutEffect, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Calendar, Ticket, Heart, Share2, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Event, statusColor } from "../data/events";
import { useAdminData } from "../context/AdminDataContext";
import { useUserLocation, haversineKm, formatDistance } from "../context/LocationContext";
import { eventSlug, organizerSlug } from "../lib/slug";
import { ticketPrices } from "../lib/price";
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
  const { organizers } = useAdminData();
  const [hovered, setHovered] = useState(false);
  const [orgHovered, setOrgHovered] = useState(false);
  const organizer = organizers.find(o => o.name === event.organizer);
  const distance = userLocation
    ? haversineKm(userLocation.lat, userLocation.lon, event.lat, event.lon)
    : null;

  return (
    <div
      onClick={() => router.push(`/events/${eventSlug(event)}`)}
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
        {event.genres.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
            {event.genres.slice(0, 3).map(g => (
              <span key={g} style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 6px", borderRadius: 999, background: "rgba(57,189,105,0.12)", border: "1px solid rgba(57,189,105,0.25)", color: "#39BD69" }}>
                {g}
              </span>
            ))}
          </div>
        )}
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
            {ticketPrices(event.tickets, event.price)}
          </p>

          {/* Organized by */}
          {organizer && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize: 8, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Organized by</span>
              <div
                style={{ position: "relative", display: "flex", alignItems: "center" }}
                onMouseEnter={() => setOrgHovered(true)}
                onMouseLeave={() => setOrgHovered(false)}
                onClick={(e) => { e.stopPropagation(); router.push(`/organizers/${organizerSlug(organizer)}`); }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                  border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  transition: "border-color 0.2s",
                  ...(orgHovered ? { borderColor: "#39BD69" } : {}),
                }}>
                  {organizer.logo ? (
                    <img src={organizer.logo} alt={organizer.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#39BD69" }}>{organizer.name.charAt(0)}</span>
                  )}
                </div>
                {/* Hover tooltip with name */}
                {orgHovered && (
                  <div style={{
                    position: "absolute", bottom: "calc(100% + 6px)", left: 0, zIndex: 20,
                    whiteSpace: "nowrap", padding: "4px 9px", borderRadius: 6,
                    background: "rgba(0,0,0,0.92)", border: "1px solid rgba(57,189,105,0.4)",
                    fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: "0.03em",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.5)", pointerEvents: "none",
                  }}>
                    {organizer.name}
                  </div>
                )}
              </div>

              {/* Status — inline, right after the organizer */}
              {event.status && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4, marginLeft: "auto",
                  background: `${statusColor(event.status)}22`, color: statusColor(event.status),
                  border: `1px solid ${statusColor(event.status)}66`,
                  fontSize: 8, fontWeight: 800, letterSpacing: "0.12em",
                  textTransform: "uppercase", padding: "3px 7px", borderRadius: 999,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor(event.status) }} />
                  {event.status}
                </span>
              )}
            </div>
          )}

          {/* Status (when no organizer) */}
          {event.status && !organizer && (
            <div style={{ marginTop: 7 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: `${statusColor(event.status)}22`, color: statusColor(event.status),
                border: `1px solid ${statusColor(event.status)}66`,
                fontSize: 8, fontWeight: 800, letterSpacing: "0.12em",
                textTransform: "uppercase", padding: "3px 7px", borderRadius: 999,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor(event.status) }} />
                {event.status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const CARD_STEP = 244 * 3; // 3 cards

  const items = [...rowEvents, ...rowEvents];

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
  }, [direction, rowEvents.length]);

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

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ marginBottom: 16 }}>
        {subtitle && <p style={{ fontSize: 10, fontWeight: 700, color: "#39BD69", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 4 }}>{subtitle}</p>}
        <h2 style={{ fontSize: "clamp(1rem,2vw,1.4rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</h2>
      </div>

      <div
        style={{ overflow: "hidden", position: "relative" }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        {/* Fade edges */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, zIndex: 2, background: "linear-gradient(to right, #080808, transparent)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, zIndex: 2, background: "linear-gradient(to left, #080808, transparent)", pointerEvents: "none" }} />

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
function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userLocation } = useUserLocation();
  const { events } = useAdminData();

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

  /* ── Date matcher ─────────────────────────────────────────────── */
  const matchesDate = (evDateStr: string): boolean => {
    if (!dateParam) return true;
    const d = new Date(evDateStr);
    if (isNaN(d.getTime())) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (dateParam === "today") return dOnly.getTime() === today.getTime();
    if (dateParam === "this-week") {
      const end = new Date(today); end.setDate(today.getDate() + 7);
      return dOnly >= today && dOnly < end;
    }
    if (dateParam === "this-month") {
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
    }
    if (dateParam.startsWith("custom:")) {
      const [, from, to] = dateParam.split(":");
      const f = from ? new Date(from) : null;
      const t = to ? new Date(to) : f;
      if (f && dOnly < new Date(f.getFullYear(), f.getMonth(), f.getDate())) return false;
      if (t && dOnly > new Date(t.getFullYear(), t.getMonth(), t.getDate())) return false;
      return true;
    }
    return true;
  };

  /* ── Filtered view ───────────────────────────────────────────── */
  if (isFiltered) {
    const filtered = events.filter(ev => {
      if (genreParam && !ev.genres.some(g => g.toLowerCase() === genreParam.toLowerCase())) return false;
      if (!matchesDate(ev.date)) return false;
      if (queryParam) {
        const q = queryParam.toLowerCase();
        // For the genres category, match against genres only (skip the general searchable check).
        if (categoryParam === "genres") {
          if (!ev.genres.some(g => g.toLowerCase().includes(q) || q.includes(g.toLowerCase()))) return false;
        } else {
          const searchable = [ev.title, ev.tag, ev.location, ev.organizer, ...ev.genres, ...ev.lineup].join(" ").toLowerCase();
          if (!searchable.includes(q)) return false;
          if (categoryParam === "artists"    && !ev.lineup.some(a => a.toLowerCase().includes(q))) return false;
          if (categoryParam === "organizers" && !(ev.organizer || "").toLowerCase().includes(q)) return false;
        }
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
      {rows.map((row, i) => (
        <EventRow
          key={row.title}
          title={row.title}
          subtitle={row.subtitle}
          events={row.data}
          liked={liked}
          shared={shared}
          onLike={toggleLike}
          onShare={handleShare}
          direction={i % 2 === 0 ? "left" : "right"}
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
