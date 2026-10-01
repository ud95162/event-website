"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X, MapPin, Calendar, Ticket, ArrowRight, Music2, Search, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import ParticleField from "../components/ParticleField";
import { Event } from "../data/events";
import { useAdminData } from "../context/AdminDataContext";
import { eventSlug } from "../lib/slug";
import { fromPrice } from "../lib/price";

const DAYS   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

/* ── Day card: one clean cover + an "N events" badge; multi-event days open a
      readable list popup on click instead of stacking unreadable slivers ───── */
function DayCard({
  date, dayEvents, isToday: todayCell, onSelect,
}: {
  date: Date;
  dayEvents: Event[];
  isToday: boolean;
  onSelect: (ev: Event) => void;
}) {
  const n = dayEvents.length;
  const hasEvents = n > 0;
  const multi = n > 1;
  const cover = dayEvents[0];
  const cellRef = useRef<HTMLDivElement>(null);

  const [preview, setPreview] = useState<{ top: number; left: number } | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [listPos, setListPos] = useState<{ top: number; left: number } | null>(null);

  // Position a popup to the side of the cell, flipping/clamping to stay on screen.
  const place = (w: number, h: number) => {
    const el = cellRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    let left = r.right + 8;
    if (left + w > window.innerWidth - 8) left = r.left - w - 8;
    if (left < 8) left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
    let top = r.top;
    if (top + h > window.innerHeight - 8) top = Math.max(8, window.innerHeight - h - 8);
    return { top, left };
  };

  const onCellEnter = () => { if (!multi && hasEvents) { const p = place(240, 280); if (p) setPreview(p); } };
  const onCellLeave = () => setPreview(null);
  const onCellClick = () => {
    if (!hasEvents) return;
    if (multi) { const p = place(268, 340); if (p) { setListPos(p); setListOpen(true); } }
    else onSelect(cover);
  };

  // Close the list popup on outside click / scroll / resize.
  useEffect(() => {
    if (!listOpen) return;
    const close = () => setListOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    const t = setTimeout(() => document.addEventListener("mousedown", close), 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("mousedown", close);
    };
  }, [listOpen]);

  return (
    <div style={{ aspectRatio: "1/1", position: "relative", borderRadius: "0.75rem", overflow: "hidden" }}>
      <div
        ref={cellRef}
        onClick={onCellClick}
        onMouseEnter={onCellEnter}
        onMouseLeave={onCellLeave}
        style={{
          position: "absolute", inset: 0, borderRadius: "0.75rem", overflow: "hidden",
          border: todayCell ? "2px solid #C0C0C0" : hasEvents ? "1px solid rgba(192,192,192,0.3)" : "1px solid rgba(192,192,192,0.2)",
          background: hasEvents ? "#0a0a0a" : "rgb(26,26,30)",
          boxShadow: todayCell ? "0 0 16px rgba(192,192,192,0.2)" : "none",
          cursor: hasEvents ? "pointer" : "default",
          zIndex: 1,
        }}
      >
        {/* Cover (first event) fills the whole cell */}
        {hasEvents && (
          <>
            <img
              src={cover.image} alt={cover.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.4) 100%)" }} />
          </>
        )}

        {/* Date number */}
        <div style={{
          position: "absolute", top: 6, left: 6, zIndex: 10,
          width: 28, height: 28, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: todayCell ? "#C0C0C0" : hasEvents ? "rgba(0,0,0,0.65)" : "transparent",
          border: !todayCell && hasEvents ? "1px solid rgba(255,255,255,0.2)" : "none",
          backdropFilter: hasEvents ? "blur(6px)" : "none",
        }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: todayCell ? "#000" : hasEvents ? "#fff" : "rgba(255,255,255,0.35)" }}>
            {date.getDate()}
          </span>
        </div>

        {/* Count badge for multi-event days */}
        {multi && (
          <div style={{
            position: "absolute", top: 6, right: 6, zIndex: 10,
            padding: "3px 8px", borderRadius: 999,
            background: "rgba(255,255,255,0.92)", color: "#000",
            fontSize: 9, fontWeight: 900, letterSpacing: "0.02em",
          }}>
            {n} EVENTS
          </div>
        )}

        {/* Title (+N more) at the bottom */}
        {hasEvents && (
          <div style={{ position: "absolute", left: 8, right: 8, bottom: 7, zIndex: 10 }}>
            <p style={{
              fontSize: 10, fontWeight: 800, color: "#fff",
              textTransform: "uppercase", letterSpacing: "0.03em", lineHeight: 1.2,
              overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
            }}>
              {cover.title}
            </p>
            {multi && (
              <p style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>
                +{n - 1} more
              </p>
            )}
          </div>
        )}
      </div>

      {/* Single-event hover preview */}
      {!multi && preview && hasEvents && typeof document !== "undefined" && createPortal(
        <div style={{
          position: "fixed", top: preview.top, left: preview.left,
          width: 240, borderRadius: 16, overflow: "hidden",
          background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)", zIndex: 9999, pointerEvents: "none",
          animation: "fadeInPopup 0.18s ease",
        }}>
          <style>{`@keyframes fadeInPopup { from { opacity:0; transform:translateY(6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
          <div style={{ position: "relative", height: 120 }}>
            <img src={cover.image} alt={cover.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0a0a0a 0%, transparent 60%)" }} />
            <span style={{ position: "absolute", top: 8, left: 8, fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#000", background: "#fff", borderRadius: 999, padding: "2px 8px" }}>{cover.tag}</span>
          </div>
          <div style={{ padding: "10px 12px 12px" }}>
            <p style={{ fontSize: 13, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, lineHeight: 1.25 }}>{cover.title}</p>
            {[
              { Icon: Calendar, text: cover.date },
              { Icon: MapPin,   text: cover.location },
              { Icon: Ticket,   text: fromPrice(cover.tickets, cover.price) },
            ].map(({ Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Icon size={9} style={{ color: "#C0C0C0", flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{text}</span>
              </div>
            ))}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 9, color: "#C0C0C0", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Click to view</span>
              <ArrowRight size={8} style={{ color: "#C0C0C0" }} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Multi-event click list popup */}
      {multi && listOpen && listPos && typeof document !== "undefined" && createPortal(
        <div
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: "fixed", top: listPos.top, left: listPos.left,
            width: 268, maxHeight: 340, overflowY: "auto",
            borderRadius: 16, background: "#0b0b10", border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.75)", zIndex: 9999, padding: 8,
            animation: "fadeInPopup 0.16s ease",
          }}
        >
          <style>{`@keyframes fadeInPopup { from { opacity:0; transform:translateY(6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", padding: "4px 6px 8px" }}>
            {MONTHS[date.getMonth()].slice(0, 3)} {date.getDate()} · {n} events
          </p>
          {dayEvents.map(ev => (
            <div
              key={ev.id}
              onClick={() => { onSelect(ev); setListOpen(false); }}
              style={{ display: "flex", gap: 10, padding: 8, borderRadius: 10, cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <img src={ev.image} alt={ev.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", objectPosition: "top", flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", lineHeight: 1.2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{ev.title}</p>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={9} style={{ flexShrink: 0 }} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.location}</span>
                </p>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

function parseEventDate(dateStr: string): Date | null {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/* ── Filter Dropdown ────────────────────────────────────────────── */
function FilterDropdown({ label, icon, options, selected, onToggle, multi = true }: {
  label: string;
  icon: React.ReactNode;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  multi?: boolean;
}) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        setOpen(false); setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openDropdown = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
    setOpen(o => !o);
    setQuery("");
  };

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));
  const count = selected.length;
  const isActive = count > 0;

  return (
    <>
      <button ref={btnRef} onClick={openDropdown} style={{ width: "100%",
        display: "flex", alignItems: "center", gap: 7,
        padding: "8px 14px", borderRadius: 10, cursor: "pointer",
        background: isActive ? "rgba(192,192,192,0.12)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isActive ? "rgba(192,192,192,0.5)" : "rgba(255,255,255,0.1)"}`,
        color: isActive ? "#C0C0C0" : "rgba(255,255,255,0.55)",
        fontSize: 14, fontWeight: 700, letterSpacing: "0.05em",
        transition: "all 0.2s", backdropFilter: "blur(8px)",
        boxShadow: isActive ? "0 0 12px rgba(192,192,192,0.12)" : "none",
      }}>
        {icon}
        <span>{label}</span>
        {isActive && (
          <span style={{
            minWidth: 18, height: 18, borderRadius: 999,
            background: "#C0C0C0", color: "#000",
            fontSize: 10, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 5px",
          }}>{count}</span>
        )}
        <svg width="10" height="10" viewBox="0 0 10 10" style={{ opacity: 0.5, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {open && pos && typeof document !== "undefined" && createPortal(
        <div ref={ref} style={{
          position: "fixed", top: pos.top, left: pos.left,
          width: 260, zIndex: 9999,
          background: "rgba(12,12,18,0.98)", backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14, overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
        }}>
          {/* Search */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={13} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              style={{
                background: "none", border: "none", outline: "none",
                color: "#fff", fontSize: 12, fontFamily: "inherit", width: "100%",
              }}
            />
            {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex" }}><X size={11} /></button>}
          </div>

          {/* Options */}
          <div style={{ maxHeight: 240, overflowY: "auto", padding: "6px" }}>
            {filtered.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, padding: "10px 8px", textAlign: "center" }}>No results</p>
            ) : filtered.map(opt => {
              const active = selected.includes(opt);
              return (
                <button key={opt} onClick={() => { onToggle(opt); if (!multi) { setOpen(false); setQuery(""); } }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                    background: active ? "rgba(192,192,192,0.1)" : "transparent",
                    border: "none", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: active ? "#C0C0C0" : "rgba(255,255,255,0.7)" }}>{opt}</span>
                  {active && (
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: "#C0C0C0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1.5 4.5l2 2 4-4" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          {selected.length > 0 && (
            <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{selected.length} selected</span>
              <button onClick={() => { selected.forEach(s => onToggle(s)); }} style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" }}>Clear</button>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

// Cities for the City filter (genre/artist/organizer options come from real data).
const LOCATION_FILTERS = [
  { label: "Colombo",  value: "Colombo"  },
  { label: "Kandy",    value: "Kandy"    },
  { label: "Galle",    value: "Galle"    },
  { label: "Negombo",  value: "Negombo"  },
];

// Per-month event cache (keyed "year-month"); survives client-side navigation so
// revisiting a month doesn't refetch.
const monthCache = new Map<string, Event[]>();

export default function CalendarPage() {
  const router = useRouter();
  const today  = new Date();

  // Real filter options from the data (genres/organizers/artists), not sample values.
  const { genres, organizers, artists } = useAdminData();
  const genreOptions     = genres;
  const organizerOptions = useMemo(() => Array.from(new Set(organizers.map(o => o.name).filter(Boolean))).sort(), [organizers]);
  const artistOptions    = useMemo(() => Array.from(new Set(artists.map(a => a.stageName || a.name).filter(Boolean))).sort(), [artists]);

  const [viewDate,       setViewDate]       = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedEvent,  setSelectedEvent]  = useState<Event | null>(null);
  const [activeGenres,    setActiveGenres]    = useState<string[]>([]);
  const [activeLocations, setActiveLocations] = useState<string[]>([]);
  const [activeArtists,   setActiveArtists]   = useState<string[]>([]);
  const [activeOrganizers,setActiveOrganizers]= useState<string[]>([]);
  const [searchQuery,     setSearchQuery]     = useState("");

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Fetch only the selected month's events (not the whole table). Cached per month so
  // flipping back and forth is instant; revalidates quietly in the background.
  const monthKey = `${year}-${month}`;
  const [events, setEvents] = useState<Event[]>(() => monthCache.get(monthKey) ?? []);
  const [eventsLoading, setEventsLoading] = useState(!monthCache.has(monthKey));
  useEffect(() => {
    const cached = monthCache.get(monthKey);
    let cancelled = false;
    if (cached) { setEvents(cached); setEventsLoading(false); }
    else { setEvents([]); setEventsLoading(true); }
    fetch(`/api/events/month?year=${year}&month=${month}`)
      .then(r => (r.ok ? r.json() : []))
      .then(d => { const arr = Array.isArray(d) ? d : []; monthCache.set(monthKey, arr); if (!cancelled) { setEvents(arr); setEventsLoading(false); } })
      .catch(() => { if (!cancelled) setEventsLoading(false); });
    return () => { cancelled = true; };
  }, [year, month, monthKey]);

  const toggle = (set: string[], setFn: (v: string[]) => void, v: string) =>
    setFn(set.includes(v) ? set.filter(x => x !== v) : [...set, v]);

  const clearFilters = () => { setActiveGenres([]); setActiveLocations([]); setActiveArtists([]); setActiveOrganizers([]); setSearchQuery(""); };
  const hasFilters   = activeGenres.length > 0 || activeLocations.length > 0 || activeArtists.length > 0 || activeOrganizers.length > 0 || !!searchQuery;

  /* ── Build Monday-based day grid ───────────────────────────────── */
  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Mon = 0
    const grid: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) grid.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) grid.push(new Date(year, month, d));
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
  }, [year, month]);

  /* ── Filter events ──────────────────────────────────────────────── */
  const filteredEvents = useMemo(() => events.filter(ev => {
    const evGenres = ev.genres.map(g => g.toLowerCase());
    const evLineup = ev.lineup.map(a => a.toLowerCase());
    if (activeGenres.length > 0    && !activeGenres.some(g => evGenres.includes(g.toLowerCase()))) return false;
    if (activeLocations.length > 0 && !activeLocations.includes(ev.location)) return false;
    if (activeArtists.length > 0   && !activeArtists.some(a => evLineup.includes(a.toLowerCase()))) return false;
    if (activeOrganizers.length > 0&& !activeOrganizers.includes(ev.organizer)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const searchable = [ev.title, ev.tag, ev.location, ...ev.genres, ...ev.lineup].join(" ").toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  }), [events, activeGenres, activeLocations, activeArtists, activeOrganizers, searchQuery]);

  /* ── Map filtered events → date keys ───────────────────────────── */
  const eventsByDate = useMemo(() => {
    const map: Record<string, Event[]> = {};
    for (const ev of filteredEvents) {
      const d = parseEventDate(ev.date);
      if (!d) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      (map[key] ??= []).push(ev);
    }
    return map;
  }, [filteredEvents]);

  const getEvents = (date: Date) =>
    eventsByDate[`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`] ?? [];

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isPast = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t;
  };

  const dayKey = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  return (
    <main className="bg-[#0F1116] relative" style={{ height: "100dvh", overflow: "hidden" }}>

      <style>{`
        @keyframes cal-spin {
          to { transform: translate(-50%,-50%) rotate(360deg); }
        }
        .cal-card-img { transition: transform 0.5s ease; }
        .cal-card:hover .cal-card-img { transform: scale(1.08); }
      `}</style>

      <ParticleField />
      <Navbar />

      {/* ── Full-width layout ────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 64px)", marginTop: 64, position: "relative", zIndex: 1 }}>

        {/* ── Filter bar ─────────────────────────────────────────── */}
        <div style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(8,8,12,0.95)",
          backdropFilter: "blur(24px)",
        }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "10px 32px", display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
          {/* Global search — grows to fill space */}
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search events…"
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "8px 30px 8px 30px",
                color: "#fff", fontSize: 12, fontFamily: "inherit", outline: "none", width: "100%",
              }}
            />
            {searchQuery && <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex" }}><X size={11} /></button>}
          </div>

          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

          {/* Genre */}
          <div style={{ flex: 1 }}>
            <FilterDropdown
              label="Genre"
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>}
              options={genreOptions}
              selected={activeGenres}
              onToggle={val => toggle(activeGenres, setActiveGenres, val)}
            />
          </div>

          {/* City */}
          <div style={{ flex: 1 }}>
            <FilterDropdown
              label="City"
              icon={<MapPin size={13} />}
              options={LOCATION_FILTERS.map(l => l.label)}
              selected={activeLocations}
              onToggle={val => toggle(activeLocations, setActiveLocations, val)}
            />
          </div>

          {/* Artist */}
          <div style={{ flex: 1 }}>
            <FilterDropdown
              label="Artist"
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
              options={artistOptions}
              selected={activeArtists}
              onToggle={val => toggle(activeArtists, setActiveArtists, val)}
            />
          </div>

          {/* Organizer */}
          <div style={{ flex: 1 }}>
            <FilterDropdown
              label="Organizer"
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8l-2 4h12l-2-4z"/></svg>}
              options={organizerOptions}
              selected={activeOrganizers}
              onToggle={val => toggle(activeOrganizers, setActiveOrganizers, val)}
            />
          </div>

          {/* Clear all */}
          {hasFilters && (
            <button onClick={clearFilters} style={{
              display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
              padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontSize: 11, fontWeight: 700,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em",
            }}>
              <X size={10} /> Clear all
            </button>
          )}
        </div>{/* end inner filter container */}
        </div>{/* end filter bar */}

      {/* ── Calendar area ──────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", width: "100%" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 32px 48px", width: "100%" }}>

          {/* ── Header ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-white font-black uppercase tracking-tight"
              style={{ fontSize: "clamp(1.2rem, 2.5vw, 2rem)" }}>
              {MONTHS[month]}{" "}
              <span style={{
                background: "linear-gradient(90deg,#39BD69,#e91e8c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {year}
              </span>
            </h1>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:border-white transition-all group"
              >
                <ChevronLeft size={16} className="text-white group-hover:text-black transition-colors" />
              </button>
              <button
                onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
                className="px-5 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all hover:brightness-110"
                style={{ border: "1px solid rgba(57,189,105,0.5)", color: "#39BD69", background: "rgba(57,189,105,0.08)" }}
              >
                TODAY
              </button>
              <button
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:border-white transition-all group"
              >
                <ChevronRight size={16} className="text-white group-hover:text-black transition-colors" />
              </button>
            </div>
          </div>

          {/* ── Active filter chips ─────────────────────────────── */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {activeGenres.map(g => {
                return (
                  <span key={g} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 10px 4px 12px", borderRadius: 999,
                    background: "rgba(192,192,192,0.1)", border: "1px solid rgba(192,192,192,0.35)",
                    fontSize: 11, fontWeight: 700, color: "#C0C0C0",
                    textTransform: "capitalize",
                  }}>
                    {g}
                    <button onClick={() => toggle(activeGenres, setActiveGenres, g)} style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, opacity: 0.7 }}>
                      <X size={11} />
                    </button>
                  </span>
                );
              })}
              {activeLocations.map(loc => (
                <span key={loc} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 12px", borderRadius: 999, background: "rgba(192,192,192,0.1)", border: "1px solid rgba(192,192,192,0.35)", fontSize: 11, fontWeight: 700, color: "#C0C0C0" }}>
                  {loc}
                  <button onClick={() => toggle(activeLocations, setActiveLocations, loc)} style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, opacity: 0.7 }}><X size={11} /></button>
                </span>
              ))}
              {activeArtists.map(a => (
                <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 12px", borderRadius: 999, background: "rgba(192,192,192,0.1)", border: "1px solid rgba(192,192,192,0.35)", fontSize: 11, fontWeight: 700, color: "#C0C0C0" }}>
                  {a}
                  <button onClick={() => toggle(activeArtists, setActiveArtists, a)} style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, opacity: 0.7 }}><X size={11} /></button>
                </span>
              ))}
              {activeOrganizers.map(o => (
                <span key={o} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 12px", borderRadius: 999, background: "rgba(192,192,192,0.1)", border: "1px solid rgba(192,192,192,0.35)", fontSize: 11, fontWeight: 700, color: "#C0C0C0" }}>
                  {o}
                  <button onClick={() => toggle(activeOrganizers, setActiveOrganizers, o)} style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, opacity: 0.7 }}><X size={11} /></button>
                </span>
              ))}
              <button onClick={clearFilters} style={{
                padding: "4px 10px", borderRadius: 999, cursor: "pointer",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)",
                fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.15em", textTransform: "uppercase",
              }}>
                Clear all
              </button>
            </div>
          )}

          {/* ── Day-of-week headers ──────────────────────────────── */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {DAYS.map(d => (
              <div key={d} className="text-center text-white/25 text-[11px] font-bold tracking-[0.3em] uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* ── Calendar grid ───────────────────────────────────── */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} style={{ aspectRatio: "1/1" }} />;
              const dayEvents = getEvents(date);
              const past = isPast(date);
              // Past days with no events render as a subtle dimmed cell;
              // past days WITH events still show clickable event tiles.
              if (past && dayEvents.length === 0) return (
                <div key={`past-${i}`} style={{
                  aspectRatio: "1/1",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(192,192,192,0.14)",
                  background: "rgb(22,22,26)",
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "8px",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.22)" }}>
                    {date.getDate()}
                  </span>
                  <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    backgroundImage: "repeating-linear-gradient(135deg, rgba(100,100,110,0.06) 0px, rgba(100,100,110,0.06) 1px, transparent 1px, transparent 8px)",
                  }} />
                </div>
              );
              return (
                <div key={dayKey(date)} style={{ opacity: past ? 0.72 : 1 }}>
                  <DayCard
                    date={date}
                    dayEvents={dayEvents}
                    isToday={isToday(date)}
                    onSelect={setSelectedEvent}
                  />
                </div>
              );
            })}
          </div>

          {/* ── Legend ──────────────────────────────────────────── */}
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: "#C0C0C0" }} />
              <span className="text-white/30 text-[10px] font-bold tracking-widest uppercase">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.04)" }} />
              <span className="text-white/30 text-[10px] font-bold tracking-widest uppercase">Has Event</span>
            </div>
            <div className="flex items-center gap-2">
              <Music2 size={10} className="text-white/30" />
              <span className="text-white/30 text-[10px] font-bold tracking-widest uppercase">
                {eventsLoading ? "Loading…" : `${filteredEvents.length} events shown`}
              </span>
            </div>
          </div>

        </div>{/* end inner calendar container */}
      </div>{/* end calendar area */}
      </div>{/* end full-width layout */}

      {/* ── Event detail modal (matches the "This Week" popup styling) ─── */}
      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 500,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
            animation: "cal-twp-fade 0.25s ease",
          }}
        >
          <style>{`
            @keyframes cal-twp-fade { from { opacity: 0 } to { opacity: 1 } }
            @keyframes cal-twp-pop { from { opacity: 0; transform: translateY(14px) scale(0.98) } to { opacity: 1; transform: none } }
          `}</style>

          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 480, maxHeight: "94dvh",
              background: "#0b0b10", border: "1px solid rgba(57,189,105,0.25)", borderRadius: 24,
              boxShadow: "0 50px 110px rgba(0,0,0,0.7), 0 0 0 1px rgba(57,189,105,0.06)", overflow: "hidden",
              animation: "cal-twp-pop 0.3s ease", position: "relative",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Eyebrow header */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
                <Sparkles size={12} style={{ color: "#39BD69" }} /> Event Details
              </p>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Banner — full (uncropped) 4:5 image over a blurred backdrop */}
            <div
              onClick={() => router.push(`/events/${eventSlug(selectedEvent)}`)}
              style={{ position: "relative", aspectRatio: "4 / 5", width: "100%", minHeight: 0, flex: "1 1 auto", cursor: "pointer", overflow: "hidden" }}
            >
              <img src={selectedEvent.image} alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(26px) brightness(0.5)", transform: "scale(1.15)" }} />
              <img src={selectedEvent.image} alt={selectedEvent.title} style={{ position: "relative", width: "100%", height: "100%", objectFit: "contain" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,11,16,1) 0%, rgba(11,11,16,0.35) 45%, rgba(0,0,0,0.25) 100%)" }} />

              {/* Event info overlay */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "28px 30px" }}>
                {selectedEvent.tag && (
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.28em", textTransform: "uppercase", color: "#39BD69" }}>{selectedEvent.tag}</span>
                )}
                <h2 style={{ fontSize: 30, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1.05, margin: "8px 0 14px" }}>{selectedEvent.title}</h2>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.8)" }}><Calendar size={14} style={{ color: "#39BD69" }} /> {selectedEvent.date}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.8)" }}><MapPin size={14} style={{ color: "#39BD69" }} /> {selectedEvent.venue || selectedEvent.location}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, padding: "12px 16px 18px" }}>
              <button
                onClick={() => router.push(`/events/${eventSlug(selectedEvent)}`)}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px", borderRadius: 12, background: "#39BD69", border: "none", color: "#000", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
              >
                View Event <ArrowRight size={14} />
              </button>
              <button
                onClick={() => { setSelectedEvent(null); router.push("/events"); }}
                style={{ padding: "12px 18px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                All Events
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
