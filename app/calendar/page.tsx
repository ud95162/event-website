"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X, MapPin, Calendar, Ticket, ArrowRight, Music2 } from "lucide-react";
import Navbar from "../components/Navbar";
import ParticleField from "../components/ParticleField";
import { events, Event } from "../data/events";

const DAYS   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

/* ── Day card with mini carousel ────────────────────────────────── */
function DayCard({
  date, dayEvents, isToday: todayCell, onSelect,
}: {
  date: Date;
  dayEvents: Event[];
  isToday: boolean;
  onSelect: (ev: Event) => void;
}) {
  const [activeIdx,  setActiveIdx]  = useState(0);
  const [hovered,    setHovered]    = useState(false);
  const [popupPos,   setPopupPos]   = useState<{ top: number; left: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasEvents  = dayEvents.length > 0;
  const isMulti    = dayEvents.length > 1;
  const current    = dayEvents[activeIdx] ?? dayEvents[0];

  // Auto-rotate for multi-event days
  useEffect(() => {
    if (!isMulti) return;
    timerRef.current = setInterval(() => {
      setActiveIdx(i => (i + 1) % dayEvents.length);
    }, 2500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isMulti, dayEvents.length]);

  const handleMouseEnter = () => {
    if (!hasEvents || !cardRef.current) return;
    setHovered(true);
    const r = cardRef.current.getBoundingClientRect();
    const popupW = 240;
    const popupH = 280;
    // Try right side first, fall back to left
    let left = r.right + 8;
    if (left + popupW > window.innerWidth - 8) left = r.left - popupW - 8;
    // Try above if below would overflow
    let top = r.top;
    if (top + popupH > window.innerHeight - 8) top = window.innerHeight - popupH - 8;
    setPopupPos({ top, left });
  };

  return (
    <div
      ref={cardRef}
      className="cal-card"
      onClick={() => hasEvents && onSelect(current)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => { setHovered(false); setPopupPos(null); }}
      style={{ aspectRatio: "1/1", position: "relative", borderRadius: "0.75rem", overflow: "hidden", cursor: hasEvents ? "pointer" : "default" }}
    >
      {/* Animated border for today */}
      {todayCell && (
        <div style={{
          position: "absolute", width: "200%", height: "500%",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          background: "conic-gradient(#39BD69, #e91e8c, #39BD69)",
          animation: "cal-spin 2.5s linear infinite",
          zIndex: 0,
        }} />
      )}

      {/* Inner card */}
      <div style={{
        position: "absolute",
        inset: todayCell ? "2px" : "0",
        borderRadius: todayCell ? "calc(0.75rem - 2px)" : "0.75rem",
        overflow: "hidden",
        border: !todayCell
          ? hasEvents
            ? `1px solid ${hovered ? "rgba(57,189,105,0.45)" : "rgba(255,255,255,0.1)"}`
            : "1px solid rgba(255,255,255,0.05)"
          : "none",
        background: "#0a0a0a",
        boxShadow: hovered ? "0 0 24px rgba(57,189,105,0.2)" : "none",
        transition: "border-color 0.3s, box-shadow 0.3s",
        zIndex: 1,
      }}>

        {/* Carousel slides */}
        {hasEvents && dayEvents.map((ev, idx) => (
          <div
            key={ev.id}
            style={{
              position: "absolute", inset: 0, overflow: "hidden",
              opacity: idx === activeIdx ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          >
            <img
              src={ev.image}
              alt={ev.title}
              className="cal-card-img w-full h-full object-cover object-top"
              style={{ transform: idx === activeIdx && hovered ? "scale(1.08)" : "scale(1)" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.15) 100%)",
            }} />
            {hovered && (
              <div style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at 50% 100%, rgba(57,189,105,0.15) 0%, transparent 70%)",
              }} />
            )}
          </div>
        ))}

        {/* Content overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 2,
          display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "8px",
        }}>
          {/* Top row: date + arrows */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Date circle */}
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: todayCell ? "#39BD69" : hasEvents ? "rgba(0,0,0,0.55)" : "transparent",
              border: !todayCell && hasEvents ? "1px solid rgba(255,255,255,0.25)" : "none",
              backdropFilter: hasEvents ? "blur(4px)" : "none",
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: 10, fontWeight: 900,
                color: todayCell ? "#000" : hasEvents ? "#fff" : "rgba(255,255,255,0.2)",
              }}>
                {date.getDate()}
              </span>
            </div>

            {/* Prev / Next arrows — only for multi-event days */}
            {isMulti && (
              <div style={{ display: "flex", gap: 3 }}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setActiveIdx(i => (i - 1 + dayEvents.length) % dayEvents.length);
                  }}
                  style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.25)",
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#fff",
                  }}
                >
                  <ChevronLeft size={10} />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setActiveIdx(i => (i + 1) % dayEvents.length);
                  }}
                  style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.25)",
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#fff",
                  }}
                >
                  <ChevronRight size={10} />
                </button>
              </div>
            )}
          </div>

          {/* Bottom info */}
          {hasEvents && (
            <div>
              {/* Carousel dots */}
              {isMulti && (
                <div style={{ display: "flex", gap: 3, marginBottom: 5 }}>
                  {dayEvents.map((_, i) => (
                    <div
                      key={i}
                      onClick={e => { e.stopPropagation(); setActiveIdx(i); }}
                      style={{
                        height: 3,
                        width: i === activeIdx ? 14 : 5,
                        borderRadius: 999,
                        background: i === activeIdx ? "#39BD69" : "rgba(255,255,255,0.35)",
                        transition: "width 0.3s ease, background 0.3s ease",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              )}
              <p style={{
                fontSize: 9, fontWeight: 900, color: "#fff",
                textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1.3,
              }}>
                {current.title.length > 16 ? current.title.slice(0, 16) + "…" : current.title}
              </p>
              <p style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                {current.location}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hover popup — portalled to body */}
      {hovered && popupPos && hasEvents && typeof document !== "undefined" && createPortal(
        <div style={{
          position: "fixed",
          top: popupPos.top,
          left: popupPos.left,
          width: 240,
          borderRadius: 16,
          overflow: "hidden",
          background: "#000000",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
          zIndex: 9999,
          pointerEvents: "none",
          animation: "fadeInPopup 0.18s ease",
        }}>
          <style>{`@keyframes fadeInPopup { from { opacity:0; transform:translateY(6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
          {/* Banner */}
          <div style={{ position: "relative", height: 130 }}>
            <img src={current.image} alt={current.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #000000 0%, transparent 60%)" }} />
            <span style={{
              position: "absolute", top: 8, left: 8,
              fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#fff", background: "#39BD69",
              borderRadius: 999, padding: "2px 8px",
            }}>{current.tag}</span>
            {isMulti && (
              <span style={{
                position: "absolute", top: 8, right: 8,
                fontSize: 8, fontWeight: 800, color: "#fff",
                background: "rgba(0,0,0,0.5)",
                borderRadius: 999, padding: "2px 6px",
              }}>{activeIdx + 1}/{dayEvents.length}</span>
            )}
          </div>
          {/* Info */}
          <div style={{ padding: "10px 12px 12px" }}>
            <p style={{ fontSize: 14, fontWeight: 900, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, lineHeight: 1.25 }}>
              {current.title}
            </p>
            {[
              { Icon: Calendar, text: current.date },
              { Icon: MapPin,   text: current.location },
              { Icon: Ticket,   text: current.price.replace("Starting from ", "") },
            ].map(({ Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <Icon size={10} style={{ color: "#39BD69", flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600, lineHeight: 1.3 }}>{text}</span>
              </div>
            ))}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 9, color: "#39BD69", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Click to view details</span>
              <ArrowRight size={9} style={{ color: "#39BD69" }} />
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

export default function CalendarPage() {
  const router = useRouter();
  const today  = new Date();

  const [viewDate,       setViewDate]       = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedEvent,  setSelectedEvent]  = useState<Event | null>(null);
  const [activeGenres,   setActiveGenres]   = useState<string[]>([]);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [activeArtist,   setActiveArtist]   = useState<string | null>(null);
  const [sidebarOpen,    setSidebarOpen]    = useState(false);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const toggleGenre = (v: string) =>
    setActiveGenres(prev => prev.includes(v) ? prev.filter(g => g !== v) : [...prev, v]);

  const clearFilters = () => { setActiveGenres([]); setActiveLocation(null); setActiveArtist(null); };
  const hasFilters   = activeGenres.length > 0 || !!activeLocation || !!activeArtist;

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
    if (activeGenres.length > 0 && !activeGenres.some(g => ev.genres.includes(g))) return false;
    if (activeLocation && ev.location !== activeLocation) return false;
    if (activeArtist && !ev.lineup.includes(activeArtist)) return false;
    return true;
  }), [activeGenres, activeLocation, activeArtist]);

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

      {/* ── Full-screen split layout ─────────────────────────────── */}
      <div style={{ display: "flex", height: "calc(100dvh - 64px)", marginTop: 64, position: "relative", zIndex: 1 }}>

      {/* ── LEFT: Sidebar ───────────────────────────────────────── */}
      <div style={{
        width: 260, flexShrink: 0,
        background: "rgba(8,8,12,0.95)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}>
        {/* Sidebar header */}
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>Filter Events</p>
          {hasFilters
            ? <p style={{ fontSize: 11, color: "#39BD69", fontWeight: 600 }}>{activeGenres.length + (activeLocation ? 1 : 0) + (activeArtist ? 1 : 0)} filter{activeGenres.length + (activeLocation ? 1 : 0) + (activeArtist ? 1 : 0) > 1 ? "s" : ""} active</p>
            : <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>No filters applied</p>
          }
        </div>

        <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Genre */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>Genre</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {GENRE_FILTERS.map(({ label, value, color }) => {
                const active = activeGenres.includes(value);
                return (
                  <button key={value} onClick={() => toggleGenre(value)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                      background: active ? `${color}18` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${active ? color + "60" : "rgba(255,255,255,0.07)"}`,
                      transition: "all 0.2s",
                    }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                      background: active ? color : "transparent",
                      border: `2px solid ${active ? color : "rgba(255,255,255,0.2)"}`,
                      transition: "all 0.2s",
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: active ? color : "rgba(255,255,255,0.6)" }}>{label}</span>
                    {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: color }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* City */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>City</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {LOCATION_FILTERS.map(({ label, value }) => {
                const active = activeLocation === value;
                return (
                  <button key={value} onClick={() => setActiveLocation(active ? null : value)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                      background: active ? "rgba(233,30,140,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${active ? "rgba(233,30,140,0.5)" : "rgba(255,255,255,0.07)"}`,
                      transition: "all 0.2s",
                    }}>
                    <MapPin size={12} style={{ color: active ? "#e91e8c" : "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#e91e8c" : "rgba(255,255,255,0.6)" }}>{label}</span>
                    {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#e91e8c" }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Artists */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>Artist</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ARTIST_FILTERS.map(name => {
                const active = activeArtist === name;
                return (
                  <button key={name} onClick={() => setActiveArtist(active ? null : name)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                      background: active ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${active ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.07)"}`,
                      transition: "all 0.2s",
                    }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: active ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${active ? "rgba(96,165,250,0.4)" : "rgba(255,255,255,0.1)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 800, color: active ? "#60a5fa" : "rgba(255,255,255,0.4)",
                    }}>
                      {name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? "#60a5fa" : "rgba(255,255,255,0.6)", lineHeight: 1.3 }}>{name}</span>
                    {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#60a5fa" }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clear button */}
        {hasFilters && (
          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <button onClick={clearFilters}
              style={{
                width: "100%", padding: "10px", borderRadius: 12, cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase",
              }}>
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT: Calendar area ────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 32px 48px" }}>

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
                  border: "1px solid rgba(120,120,130,0.2)",
                  background: "rgba(60,60,70,0.25)",
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "8px",
                  cursor: "not-allowed",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(150,150,160,0.5)" }}>
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
              <div className="w-3 h-3 rounded-full" style={{ background: "#39BD69" }} />
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

      </div>{/* end right calendar area */}
      </div>{/* end flex split row */}

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
                onClick={() => router.push(`/events/${selectedEvent.id}`)}
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
