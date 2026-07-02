"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X, MapPin, Calendar, Ticket, ArrowRight, Music2, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import ParticleField from "../components/ParticleField";
import { events, Event } from "../data/events";
import { eventSlug } from "../lib/slug";

const DAYS   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

/* ── Day card with horizontal tiles ─────────────────────────────── */
function DayCard({
  date, dayEvents, isToday: todayCell, onSelect,
}: {
  date: Date;
  dayEvents: Event[];
  isToday: boolean;
  onSelect: (ev: Event) => void;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [popupPos,   setPopupPos]   = useState<{ top: number; left: number } | null>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasEvents = dayEvents.length > 0;
  const n = dayEvents.length;

  // Font size scales down as more events are added
  const titleFontSize = n <= 1 ? 10 : n === 2 ? 9 : 8;

  const handleTileEnter = (idx: number, el: HTMLDivElement) => {
    setHoveredIdx(idx);
    const r = el.getBoundingClientRect();
    const popupW = 240, popupH = 260;
    let left = r.right + 8;
    if (left + popupW > window.innerWidth - 8) left = r.left - popupW - 8;
    let top = r.top;
    if (top + popupH > window.innerHeight - 8) top = window.innerHeight - popupH - 8;
    setPopupPos({ top, left });
  };

  const hoveredEvent = hoveredIdx !== null ? dayEvents[hoveredIdx] : null;

  return (
    <div style={{ aspectRatio: "1/1", position: "relative", borderRadius: "0.75rem", overflow: "hidden" }}>
      {/* Outer border */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "0.75rem", overflow: "hidden",
        border: todayCell ? "2px solid #C0C0C0" : hasEvents ? "1px solid rgba(192,192,192,0.3)" : "1px solid rgba(192,192,192,0.2)",
        background: hasEvents ? "#0a0a0a" : "rgb(26,26,30)",
        boxShadow: todayCell ? "0 0 16px rgba(192,192,192,0.2)" : "none",
        display: "flex", flexDirection: "column",
        zIndex: 1,
      }}>
        {/* Date number — overlaid top-left */}
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

        {/* Event tiles — stacked, equal height */}
        {hasEvents ? dayEvents.map((ev, idx) => {
          const isHov = hoveredIdx === idx;
          return (
            <div
              key={ev.id}
              ref={el => { tileRefs.current[idx] = el; }}
              onClick={() => onSelect(ev)}
              onMouseEnter={() => handleTileEnter(idx, tileRefs.current[idx]!)}
              onMouseLeave={() => { setHoveredIdx(null); setPopupPos(null); }}
              style={{
                flex: 1, position: "relative", overflow: "hidden",
                cursor: "pointer",
                borderTop: idx > 0 ? "1px solid rgba(0,0,0,0.4)" : "none",
                transition: "flex 0.3s ease",
              }}
            >
              {/* Image */}
              <img
                src={ev.image} alt={ev.title}
                style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "top",
                  transform: isHov ? "scale(1.06)" : "scale(1)",
                  transition: "transform 0.4s ease",
                }}
              />
              {/* Gradient */}
              <div style={{
                position: "absolute", inset: 0,
                background: isHov
                  ? "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 100%)"
                  : "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 100%)",
                transition: "background 0.3s",
              }} />
              {/* Title — left-aligned, only when tall enough */}
              {n <= 4 && (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center",
                  paddingLeft: idx === 0 ? 36 : 8, paddingRight: 6,
                }}>
                  <p style={{
                    fontSize: titleFontSize, fontWeight: 800, color: "#fff",
                    textTransform: "uppercase", letterSpacing: "0.04em",
                    lineHeight: 1.2, overflow: "hidden",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                  }}>
                    {ev.title}
                  </p>
                </div>
              )}
            </div>
          );
        }) : (
          // Empty cell spacer
          <div style={{ flex: 1 }} />
        )}
      </div>

      {/* Hover popup */}
      {hoveredEvent && popupPos && typeof document !== "undefined" && createPortal(
        <div style={{
          position: "fixed", top: popupPos.top, left: popupPos.left,
          width: 240, borderRadius: 16, overflow: "hidden",
          background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)", zIndex: 9999, pointerEvents: "none",
          animation: "fadeInPopup 0.18s ease",
        }}>
          <style>{`@keyframes fadeInPopup { from { opacity:0; transform:translateY(6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
          <div style={{ position: "relative", height: 120 }}>
            <img src={hoveredEvent.image} alt={hoveredEvent.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0a0a0a 0%, transparent 60%)" }} />
            <span style={{ position: "absolute", top: 8, left: 8, fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff", background: "#39BD69", borderRadius: 999, padding: "2px 8px" }}>{hoveredEvent.tag}</span>
            {n > 1 && <span style={{ position: "absolute", top: 8, right: 8, fontSize: 8, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.55)", borderRadius: 999, padding: "2px 7px" }}>{hoveredIdx! + 1}/{n}</span>}
          </div>
          <div style={{ padding: "10px 12px 12px" }}>
            <p style={{ fontSize: 13, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, lineHeight: 1.25 }}>{hoveredEvent.title}</p>
            {[
              { Icon: Calendar, text: hoveredEvent.date },
              { Icon: MapPin,   text: hoveredEvent.location },
              { Icon: Ticket,   text: hoveredEvent.price.replace("Starting from ", "") },
            ].map(({ Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Icon size={9} style={{ color: "#39BD69", flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{text}</span>
              </div>
            ))}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 9, color: "#39BD69", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Click to view</span>
              <ArrowRight size={8} style={{ color: "#39BD69" }} />
            </div>
          </div>
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

const GENRE_FILTERS = [
  { label: "Electronic", value: "electronic", color: "#39BD69" },
  { label: "Sinhala",    value: "sinhala",    color: "#f59e0b" },
  { label: "Tamil",      value: "tamil",      color: "#a855f7" },
  { label: "Hindi",      value: "hindi",      color: "#f43f5e" },
];

const LOCATION_FILTERS = [
  { label: "Colombo",  value: "Colombo"  },
  { label: "Kandy",    value: "Kandy"    },
  { label: "Galle",    value: "Galle"    },
  { label: "Negombo",  value: "Negombo"  },
];

const ARTIST_FILTERS = [
  "DJ Nova", "Randhir Witana", "Maya Perera", "Ashanthi Dias",
  "Kasun Silva", "Nadia Fernando", "The Beat Crew", "Hiruni De Silva",
];

const ORGANIZER_FILTERS = [
  "Rhythm Nation LK", "Colombo Live Events", "Stage One Entertainment",
  "Bass Nation LK", "Eventide Productions", "Sunset Events",
];

export default function CalendarPage() {
  const router = useRouter();
  const today  = new Date();

  const [viewDate,       setViewDate]       = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedEvent,  setSelectedEvent]  = useState<Event | null>(null);
  const [activeGenres,    setActiveGenres]    = useState<string[]>([]);
  const [activeLocations, setActiveLocations] = useState<string[]>([]);
  const [activeArtists,   setActiveArtists]   = useState<string[]>([]);
  const [activeOrganizers,setActiveOrganizers]= useState<string[]>([]);
  const [searchQuery,     setSearchQuery]     = useState("");

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

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
    if (activeGenres.length > 0    && !activeGenres.some(g => ev.genres.includes(g))) return false;
    if (activeLocations.length > 0 && !activeLocations.includes(ev.location)) return false;
    if (activeArtists.length > 0   && !activeArtists.some(a => ev.lineup.includes(a))) return false;
    if (activeOrganizers.length > 0&& !activeOrganizers.includes(ev.organizer)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const searchable = [ev.title, ev.tag, ev.location, ...ev.genres, ...ev.lineup].join(" ").toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  }), [activeGenres, activeLocations, activeArtists, activeOrganizers, searchQuery]);

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
    <main className="bg-[#080808] relative" style={{ height: "100dvh", overflow: "hidden" }}>

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
              options={GENRE_FILTERS.map(g => g.label)}
              selected={activeGenres.map(v => GENRE_FILTERS.find(g => g.value === v)?.label ?? v)}
              onToggle={label => { const g = GENRE_FILTERS.find(f => f.label === label); if (g) toggle(activeGenres, setActiveGenres, g.value); }}
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
              options={ARTIST_FILTERS}
              selected={activeArtists}
              onToggle={val => toggle(activeArtists, setActiveArtists, val)}
            />
          </div>

          {/* Organizer */}
          <div style={{ flex: 1 }}>
            <FilterDropdown
              label="Organizer"
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8l-2 4h12l-2-4z"/></svg>}
              options={ORGANIZER_FILTERS}
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
                const genre = GENRE_FILTERS.find(f => f.value === g);
                return (
                  <span key={g} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 10px 4px 12px", borderRadius: 999,
                    background: "rgba(192,192,192,0.1)", border: "1px solid rgba(192,192,192,0.35)",
                    fontSize: 11, fontWeight: 700, color: "#C0C0C0",
                  }}>
                    {genre?.label ?? g}
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
              if (isPast(date)) return (
                <div key={`past-${i}`} style={{
                  aspectRatio: "1/1",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(192,192,192,0.2)",
                  background: "rgb(26,26,30)",
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "8px",
                  cursor: "not-allowed",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)" }}>
                    {date.getDate()}
                  </span>
                  {/* Subtle diagonal lines for disabled feel */}
                  <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    backgroundImage: "repeating-linear-gradient(135deg, rgba(100,100,110,0.06) 0px, rgba(100,100,110,0.06) 1px, transparent 1px, transparent 8px)",
                  }} />
                </div>
              );
              const dayEvents = getEvents(date);
              return (
                <DayCard
                  key={dayKey(date)}
                  date={date}
                  dayEvents={dayEvents}
                  isToday={isToday(date)}
                  onSelect={setSelectedEvent}
                />
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
                {filteredEvents.length} events shown
              </span>
            </div>
          </div>

        </div>{/* end inner calendar container */}
      </div>{/* end calendar area */}
      </div>{/* end full-width layout */}

      {/* ── Event detail modal ───────────────────────────────────── */}
      {selectedEvent && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 500, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)" }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="rounded-3xl overflow-hidden"
            style={{
              width: "min(520px, 90vw)",
              background: "#0d0d1a",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(57,189,105,0.08)",
            }}
          >
            {/* Image */}
            <div className="relative" style={{ height: 220 }}>
              <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0d0d1a 0%, transparent 60%)" }} />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-all"
                style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
              >
                <X size={13} className="text-white hover:text-black" />
              </button>
              <span
                className="absolute top-4 left-4 text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 rounded-full"
                style={{ background: "rgba(57,189,105,0.15)", border: "1px solid rgba(57,189,105,0.4)", color: "#39BD69", backdropFilter: "blur(8px)" }}
              >
                {selectedEvent.tag}
              </span>
            </div>

            {/* Info */}
            <div className="p-6">
              <h2 className="text-white font-black text-xl uppercase tracking-tight mb-4 leading-tight">
                {selectedEvent.title}
              </h2>
              <div className="flex flex-col gap-2.5 mb-5">
                {[
                  { Icon: Calendar, text: selectedEvent.date },
                  { Icon: MapPin,   text: selectedEvent.venue },
                  { Icon: Ticket,   text: selectedEvent.price },
                ].map(({ Icon, text }) => (
                  <div key={text} className="flex items-start gap-2.5">
                    <Icon size={12} className="text-[#39BD69] flex-shrink-0 mt-0.5" />
                    <span className="text-white/50 text-sm leading-snug">{text}</span>
                  </div>
                ))}
              </div>

              {/* Lineup */}
              {selectedEvent.lineup?.length > 0 && (
                <div className="mb-5">
                  <p className="text-white/25 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">Lineup</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEvent.lineup.map(name => (
                      <span key={name}
                        className="text-[10px] font-semibold px-3 py-1 rounded-full"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => router.push(`/events/${eventSlug(selectedEvent)}`)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all hover:brightness-110 active:scale-95"
                style={{ background: "linear-gradient(90deg,#39BD69,#2da857)", color: "#000" }}
              >
                VIEW FULL EVENT <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
