"use client";

import { Suspense, useState, useLayoutEffect, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Calendar, Ticket, Heart, Share2, ArrowRight, X } from "lucide-react";
import { events } from "../data/events";
import { useUserLocation, haversineKm, formatDistance } from "../context/LocationContext";
import Navbar from "../components/Navbar";
import StickySearchFilters from "../components/StickySearchFilters";
import ParticleField from "../components/ParticleField";
import Preloader from "../components/Preloader";
import { hasPreloaderShown, markPreloaderShown } from "../preloaderState";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ── Genre / date label maps ─────────────────────────────────────────── */
const GENRE_LABELS: Record<string, string> = {
  electronic: "Electronic Music",
  sinhala:    "Sinhala Music",
  tamil:      "Tamil Music",
  hindi:      "Hindi Music",
};

const DATE_LABELS: Record<string, string> = {
  today:      "Today",
  "this-week":  "This Week",
  "this-month": "This Month",
};

/* ── Date filtering helper ───────────────────────────────────────────── */
function matchesDate(dateStr: string, filter: string): boolean {
  const eventDate = new Date(dateStr);
  if (isNaN(eventDate.getTime())) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (filter) {
    case "today": {
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
      return eventDate >= today && eventDate < tomorrow;
    }
    case "this-week": {
      const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
      return eventDate >= today && eventDate < nextWeek;
    }
    case "this-month":
      return eventDate.getMonth() === today.getMonth() &&
             eventDate.getFullYear() === today.getFullYear();
    default: {
      // Exact date from calendar picker e.g. "2026-06-15"
      if (/^\d{4}-\d{2}-\d{2}$/.test(filter)) {
        const pick = new Date(filter);
        return eventDate.getFullYear() === pick.getFullYear() &&
               eventDate.getMonth()    === pick.getMonth()    &&
               eventDate.getDate()     === pick.getDate();
      }
      return true;
    }
  }
}

/* ══════════════════════════════════════════════════════════════════════
   Inner content — uses useSearchParams, must be inside <Suspense>
   ══════════════════════════════════════════════════════════════════════ */
function EventsContent() {
  const router       = useRouter();
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

  /* Filter events */
  const filtered = events.filter(ev => {
    if (genreParam && !ev.genres.includes(genreParam)) return false;
    if (dateParam  && !matchesDate(ev.date, dateParam)) return false;
    if (queryParam) {
      const q = queryParam.toLowerCase();
      // Match against title, tag, location, genres, artists
      const searchable = [
        ev.title, ev.tag, ev.location,
        ...(ev.genres ?? []),
        ...(ev.artists ?? []),
      ].join(" ").toLowerCase();
      if (!searchable.includes(q)) return false;
      // If category is artists, also check artists specifically
      if (categoryParam === "artists" && !(ev.artists ?? []).some((a: string) => a.toLowerCase().includes(q))) return false;
      // If category is genres, check genres specifically
      if (categoryParam === "genres" && !(ev.genres ?? []).some((g: string) => g.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const activeLabel =
    queryParam    ? `"${queryParam}"` :
    genreParam    ? GENRE_LABELS[genreParam] :
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? `Events on ${new Date(dateParam).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`
      : dateParam ? DATE_LABELS[dateParam] : "";

  const isFiltered = !!genreParam || !!dateParam || !!queryParam;

  /* Split featured + grid only when unfiltered and there are events */
  const featured = !isFiltered && filtered.length > 0 ? filtered[0] : null;
  const gridEvents = !isFiltered && featured ? filtered.slice(1) : filtered;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="text-white/30 text-[10px] font-bold tracking-[0.4em] uppercase mb-2">BROWSE</p>
        <div className="flex items-end justify-between flex-wrap gap-3">
          <h1 className="text-white font-black text-4xl lg:text-5xl uppercase tracking-tight">
            {activeLabel ? activeLabel : "All Events"}
          </h1>
          <div className="flex items-center gap-3 pb-1">
            {isFiltered && (
              <button
                onClick={() => router.push("/events")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)" }}
              >
                <X size={10} /> Clear filter
              </button>
            )}
            <span className="text-white/25 text-sm">
              {filtered.length} {filtered.length === 1 ? "event" : "events"}
            </span>
          </div>
        </div>
        <div className="h-px mt-4" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.1), transparent)" }} />
      </div>

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div
          className="rounded-2xl p-16 flex flex-col items-center justify-center gap-4 mb-20"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
        >
          <p className="text-white/25 text-sm tracking-wide">No events found for this filter.</p>
          <button
            onClick={() => router.push("/events")}
            className="text-[11px] tracking-widest uppercase font-semibold px-6 py-2.5 rounded-full transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)" }}
          >
            View All Events
          </button>
        </div>
      )}

      {/* ── Featured card (only when not filtered) ───────────────────── */}
      {featured && (
        <div
          className="w-full rounded-3xl overflow-hidden flex relative mb-8 cursor-pointer group"
          onClick={() => router.push(`/events/${featured.id}`)}
          style={{
            background: "#0d0d1f",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            height: 300,
          }}
        >
          <div className="relative w-[52%] flex-shrink-0">
            <img src={featured.image} alt={featured.title} className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 45%, #0d0d1f 100%)" }} />
            {featured.badge && (
              <span className="absolute top-4 left-4 bg-white text-black text-[9px] font-black px-3 py-1.5 rounded-full tracking-[0.2em] uppercase">
                {featured.badge}
              </span>
            )}
            <span
              className="absolute bottom-4 left-4 text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 rounded-full"
              style={{ background: "rgba(57,189,105,0.15)", border: "1px solid rgba(57,189,105,0.35)", color: "#39BD69", backdropFilter: "blur(8px)" }}
            >
              FEATURED
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 lg:px-10">
            <p className="text-[#39BD69] text-[9px] font-bold tracking-[0.4em] uppercase mb-3">{featured.tag}</p>
            <h2 className="text-white font-black text-2xl lg:text-3xl uppercase tracking-tight leading-tight mb-4">{featured.title}</h2>
            <div className="flex flex-col gap-1.5 mb-5">
              {[
                { Icon: Calendar, text: featured.date },
                { Icon: MapPin,   text: featured.location },
                { Icon: Ticket,   text: featured.price.replace("Starting from ", "") },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-white/45 text-xs">
                  <Icon size={11} className="text-[#39BD69] flex-shrink-0" />
                  {text}
                </div>
              ))}
              {userLocation && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin size={10} className="text-[#39BD69]" />
                  <span className="text-[#39BD69] text-[11px] font-semibold">
                    {formatDistance(haversineKm(userLocation.lat, userLocation.lon, featured.lat, featured.lon))}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-[11px] tracking-widest uppercase font-semibold group-hover:text-white transition-colors duration-300">View Details</span>
              <ArrowRight size={13} className="text-white/35 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={(e) => toggleLike(featured.id, e)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: liked.has(featured.id) ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.5)",
                border: liked.has(featured.id) ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Heart size={12} strokeWidth={2.5} fill={liked.has(featured.id) ? "#fff" : "none"} className="text-white" />
            </button>
            <button
              onClick={(e) => handleShare(featured.id, featured.title, e)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: shared.has(featured.id) ? "rgba(57,189,105,0.85)" : "rgba(0,0,0,0.5)",
                border: shared.has(featured.id) ? "1px solid rgba(57,189,105,0.6)" : "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Share2 size={12} strokeWidth={2.5} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* ── Events grid ──────────────────────────────────────────────── */}
      {gridEvents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
          {gridEvents.map(event => {
            const distance = userLocation ? haversineKm(userLocation.lat, userLocation.lon, event.lat, event.lon) : null;
            const isLiked  = liked.has(event.id);
            const isShared = shared.has(event.id);
            return (
              <div
                key={event.id}
                onClick={() => router.push(`/events/${event.id}`)}
                className="rounded-2xl overflow-hidden cursor-pointer group flex flex-col"
                style={{ background: "#0d0d1f", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", transition: "border-color 0.3s, box-shadow 0.3s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.5)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)"; }}
              >
                <div className="relative w-full overflow-hidden flex-shrink-0" style={{ height: 200 }}>
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0d0d1f 0%, rgba(13,13,31,0.2) 55%, transparent 100%)" }} />
                  {event.badge && (
                    <span className="absolute top-3 left-3 bg-white text-black text-[8px] font-black px-2.5 py-1 rounded-full tracking-[0.18em] uppercase">
                      {event.badge}
                    </span>
                  )}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <button onClick={(e) => toggleLike(event.id, e)} className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200" style={{ background: isLiked ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.45)", border: isLiked ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(6px)" }}>
                      <Heart size={10} strokeWidth={2.5} fill={isLiked ? "#fff" : "none"} className="text-white" />
                    </button>
                    <button onClick={(e) => handleShare(event.id, event.title, e)} className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200" style={{ background: isShared ? "rgba(57,189,105,0.85)" : "rgba(0,0,0,0.45)", border: isShared ? "1px solid rgba(57,189,105,0.6)" : "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(6px)" }}>
                      <Share2 size={10} strokeWidth={2.5} className="text-white" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col flex-1 p-4">
                  <p className="text-[#39BD69] text-[9px] font-bold tracking-[0.3em] uppercase mb-1.5">{event.tag}</p>
                  <h3 className="text-white font-black text-sm uppercase tracking-wide leading-tight mb-3">{event.title}</h3>
                  <div className="flex flex-col gap-1.5 mb-3 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={10} className="text-white/30 flex-shrink-0" />
                      <span className="text-white/40 text-[11px]">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={10} className="text-white/30 flex-shrink-0" />
                      <span className="text-white/40 text-[11px]">{event.location}</span>
                      {distance !== null && (
                        <span className="text-[#39BD69] text-[10px] font-semibold">· {formatDistance(distance)}</span>
                      )}
                    </div>
                  </div>
                  {/* Genre tags */}
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {event.genres.map(g => (
                      <span key={g} className="text-[8px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }}>
                        {g}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="text-white/55 text-[11px] font-semibold">{event.price.replace("Starting from ", "")}</span>
                    <div className="flex items-center gap-1 text-white/30 group-hover:text-[#39BD69] transition-colors duration-300">
                      <span className="text-[10px] tracking-widest uppercase font-semibold">Details</span>
                      <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Page export — wraps content in Suspense for useSearchParams
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
    <main className="min-h-screen bg-[#080808] relative">
      {(preloaderPhase === "idle" || preloaderPhase === "exit") && (
        <Preloader phase={preloaderPhase === "idle" ? "idle" : "exit"} setPhase={setPreloaderPhase} />
      )}
      <ParticleField />
      <div
        style={{
          opacity: (preloaderPhase === "checking" || preloaderPhase === "idle") ? 0 : 1,
          transition: preloaderPhase === "gone" ? undefined : "opacity 1.2s ease",
        }}
      >
      <Navbar />
      <div className="pt-16 relative z-10">
        <StickySearchFilters />
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="h-12 w-48 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.04)" }} />
            <div className="grid grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl h-72" style={{ background: "rgba(255,255,255,0.03)" }} />
              ))}
            </div>
          </div>
        }>
          <EventsContent />
        </Suspense>
      </div>
      </div>
    </main>
  );
}
