"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, Calendar, Check, X } from "lucide-react";
import { useAdminData } from "../context/AdminDataContext";

/* ── Data ─────────────────────────────────────────────────────────────── */
const DATE_PRESETS = [
  { label: "Today",      slug: "today"      },
  { label: "This Week",  slug: "this-week"  },
  { label: "This Month", slug: "this-month" },
];

const ARTISTS = [
  "DJ Nova", "Randhir Witana", "Maya Perera", "Ashanthi Dias",
  "Kasun Silva", "Nadia Fernando", "The Beat Crew", "Hiruni De Silva",
];

const GENRES = [
  { label: "Electronic / EDM", color: "#39BD69" },
  { label: "Sinhala Music",    color: "#f59e0b" },
  { label: "Tamil Music",      color: "#a855f7" },
  { label: "Hindi Music",      color: "#f43f5e" },
  { label: "Rock & Indie",     color: "#60a5fa" },
  { label: "R&B / Soul",       color: "#fb923c" },
  { label: "Classical Fusion", color: "#e879f9" },
  { label: "Live Band",        color: "#34d399" },
];

type Tab = "date" | "artists" | "genre" | null;

/* ── Date panel content ───────────────────────────────────────────────── */
function DatePanel({ currentDate, onChange }: { currentDate: string; onChange: (v: string) => void }) {
  const [fromDate,    setFromDate]    = useState("");
  const [toDate,      setToDate]      = useState("");
  const [showCustom,  setShowCustom]  = useState(false);

  const applyCustom = () => {
    if (fromDate) onChange(`custom:${fromDate}:${toDate || fromDate}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-5">
      {/* Presets */}
      <div className="flex-1">
        <p className="text-white/30 text-[11px] font-bold tracking-[0.3em] uppercase mb-3">Quick Select</p>
        <div className="grid grid-cols-3 gap-2">
          {DATE_PRESETS.map(({ label, slug }) => {
            const active = currentDate === slug;
            return (
              <button
                key={slug}
                onClick={() => onChange(active ? "" : slug)}
                className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all"
                style={{
                  background: active ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.03)",
                  border:     `1px solid ${active ? "rgba(96,165,250,0.4)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={13} style={{ color: "#60a5fa" }} />
                  <span className="text-white text-sm font-semibold">{label}</span>
                </div>
                {active && <Check size={13} style={{ color: "#60a5fa" }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px bg-white/08" />

      {/* Custom range */}
      <div className="w-full sm:w-64">
        <p className="text-white/30 text-[11px] font-bold tracking-[0.3em] uppercase mb-3">Custom Range</p>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-white/35 text-[11px] tracking-widest uppercase mb-1.5">From</p>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="w-full bg-white/06 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#60a5fa]/50 transition-colors" />
          </div>
          <div>
            <p className="text-white/35 text-[11px] tracking-widest uppercase mb-1.5">To</p>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="w-full bg-white/06 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#60a5fa]/50 transition-colors" />
          </div>
          <button onClick={applyCustom}
            className="w-full py-2.5 rounded-xl text-sm font-bold tracking-widest uppercase transition-all hover:brightness-110"
            style={{ background: "#60a5fa", color: "#000" }}>
            Apply Range
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Artists panel content ────────────────────────────────────────────── */
function ArtistsPanel({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const [search, setSearch] = useState("");
  const filtered = ARTISTS.filter(a => a.toLowerCase().includes(search.toLowerCase()));

  const toggle = (name: string) => {
    onChange(selected.includes(name) ? selected.filter(s => s !== name) : [...selected, name]);
  };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-white/30 text-[11px] font-bold tracking-[0.3em] uppercase">Select Artists</p>
        {selected.length > 0 && (
          <button onClick={() => onChange([])} className="text-[11px] text-white/40 hover:text-white/70 tracking-widest uppercase transition-colors flex items-center gap-1">
            <X size={10} /> Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <Search size={13} className="text-white/30 flex-shrink-0" />
        <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search artists…"
          className="bg-transparent text-white text-sm w-full outline-none placeholder:text-white/25 tracking-wide" />
        {search && <button onClick={() => setSearch("")}><X size={11} className="text-white/30" /></button>}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {filtered.map(name => {
          const active = selected.includes(name);
          return (
            <button key={name} onClick={() => toggle(name)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left"
              style={{
                background: active ? "rgba(232,121,249,0.12)" : "rgba(255,255,255,0.03)",
                border:     `1px solid ${active ? "rgba(232,121,249,0.4)" : "rgba(255,255,255,0.08)"}`,
              }}>
              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: active ? "#e879f9" : "transparent", border: `1.5px solid ${active ? "#e879f9" : "rgba(255,255,255,0.2)"}` }}>
                {active && <Check size={10} strokeWidth={3} className="text-black" />}
              </div>
              <span className="text-white/80 text-sm tracking-wide truncate">{name}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-white/25 text-sm col-span-4 py-2">No artists found</p>
        )}
      </div>
    </div>
  );
}

/* ── Genre panel content ──────────────────────────────────────────────── */
function GenrePanel({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (label: string) => {
    onChange(selected.includes(label) ? selected.filter(s => s !== label) : [...selected, label]);
  };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-white/30 text-[11px] font-bold tracking-[0.3em] uppercase">Select Genres</p>
        {selected.length > 0 && (
          <button onClick={() => onChange([])} className="text-[11px] text-white/40 hover:text-white/70 tracking-widest uppercase transition-colors flex items-center gap-1">
            <X size={10} /> Clear all
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {GENRES.map(({ label, color }) => {
          const active = selected.includes(label);
          return (
            <button key={label} onClick={() => toggle(label)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left"
              style={{
                background: active ? `${color}18` : "rgba(255,255,255,0.03)",
                border:     `1px solid ${active ? color + "55" : "rgba(255,255,255,0.08)"}`,
              }}>
              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: active ? color : "transparent", border: `1.5px solid ${active ? color : "rgba(255,255,255,0.2)"}` }}>
                {active && <Check size={10} strokeWidth={3} className="text-black" />}
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-white/80 text-sm tracking-wide truncate">{label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Filter row ───────────────────────────────────────────────────────── */
function FilterRow() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(null);
  const [hoveredTab, setHoveredTab] = useState<Tab>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const currentDate    = searchParams.get("date")    ?? "";
  const currentArtists = searchParams.get("artists") ? searchParams.get("artists")!.split(",") : [];
  const currentGenres  = searchParams.get("genres")  ? searchParams.get("genres")!.split(",")  : [];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setActiveTab(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/events?${params.toString()}`);
  };

  const updateList = (key: string, values: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length) params.set(key, values.join(",")); else params.delete(key);
    router.push(`/events?${params.toString()}`);
  };

  const totalActive = (currentDate ? 1 : 0) + currentArtists.length + currentGenres.length;

  const tabs: { id: Tab; label: string; color: string; count: number }[] = [
    { id: "date",    label: "Date",    color: "#60a5fa", count: currentDate ? 1 : 0 },
    { id: "artists", label: "Artists", color: "#e879f9", count: currentArtists.length },
    { id: "genre",   label: "Genre",   color: "#39BD69", count: currentGenres.length  },
  ];

  return (
    <div ref={barRef}>
      {/* Tab pills */}
      <div className="flex items-center gap-2 pb-1" style={{ scrollbarWidth: "none" }}>
        {tabs.map(({ id, label, color, count }, i) => {
          const isActive = activeTab === id;
          const hasValue = count > 0;
          return (
            <div key={id} className="flex items-center gap-2">
              {i > 0 && <div className="w-px h-4 bg-white/15" />}
              <button
                onClick={() => setActiveTab(isActive ? null : id)}
                onMouseEnter={() => setHoveredTab(id)}
                onMouseLeave={() => setHoveredTab(null)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full transition-all active:scale-95"
                style={{
                  background:    (isActive || hasValue || hoveredTab === id) ? `${color}18` : "transparent",
                  color:         (isActive || hasValue || hoveredTab === id) ? color : "rgba(255,255,255,0.6)",
                  border:        `1px solid ${(isActive || hasValue || hoveredTab === id) ? color + "60" : "rgba(255,255,255,0.15)"}`,
                  boxShadow:     (isActive || hasValue || hoveredTab === id) ? `0 0 10px ${color}25` : "none",
                  fontSize:      "12px",
                  fontWeight:    600,
                  letterSpacing: "0.1em",
                }}
              >
                <span className="uppercase">{label}</span>
                {hasValue && (
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: color, color: "#000" }}>
                    {count}
                  </span>
                )}
                <ChevronDown size={10} strokeWidth={2.5}
                  style={{ transform: isActive ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>
            </div>
          );
        })}

        {totalActive > 0 && (
          <>
            <div className="w-px h-4 bg-white/15" />
            <button
              onClick={() => { router.push("/events"); setActiveTab(null); }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white/40 hover:text-white/70 transition-colors text-[12px] font-semibold tracking-widest uppercase border border-white/10 hover:border-white/25"
            >
              <X size={10} /> Clear
            </button>
          </>
        )}
      </div>

      {/* Full-width dropdown panel */}
      {activeTab && (
        <div
          className="mt-2 rounded-2xl border border-white/10 overflow-hidden"
          style={{
            background:    "rgba(8,8,12,0.97)",
            backdropFilter:"blur(20px)",
            boxShadow:     "0 8px 40px rgba(0,0,0,0.6)",
          }}
        >
          {activeTab === "date" && (
            <DatePanel currentDate={currentDate} onChange={v => updateParam("date", v)} />
          )}
          {activeTab === "artists" && (
            <ArtistsPanel selected={currentArtists} onChange={v => updateList("artists", v)} />
          )}
          {activeTab === "genre" && (
            <GenrePanel selected={currentGenres} onChange={v => updateList("genres", v)} />
          )}
        </div>
      )}
    </div>
  );
}

const CAT_OPTIONS = [
  { label: "Artists",    color: "#e879f9", key: "artists"    },
  { label: "Genres",     color: "#39BD69", key: "genres"     },
  { label: "Organizers", color: "#38bdf8", key: "organizers" },
];

const EXAMPLES: Record<string, string> = {
  artists:    "e.g. DJ Nova, Randhir Witana…",
  genres:     "e.g. Electronic, Rock & Indie…",
  organizers: "e.g. Rhythm Nation LK, Bass Nation…",
  default:    "e.g. Music Festival, Concert…",
};

/* ── Main component ───────────────────────────────────────────────────── */
export default function StickySearchFilters() {
  const router = useRouter();
  const { organizers, genres: dataGenres } = useAdminData();
  const [catOpen,      setCatOpen]      = useState(false);
  const [selectedCat,  setSelectedCat]  = useState<typeof CAT_OPTIONS[0] | null>(null);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [resultsOpen,  setResultsOpen]  = useState(false);
  const [dateOpen,     setDateOpen]     = useState(false);
  const [dateVal,      setDateVal]      = useState("");   // "", "today", "this-week", "this-month", "custom:from:to"
  const [customFrom,   setCustomFrom]   = useState("");
  const catRef     = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLDivElement>(null);
  const dateRef    = useRef<HTMLDivElement>(null);

  const dateLabel = (() => {
    const p = DATE_PRESETS.find(x => x.slug === dateVal);
    if (p) return p.label;
    if (dateVal.startsWith("custom:")) return "Custom";
    return "Any Date";
  })();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setDateOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) { setResultsOpen(false); setSearchQuery(""); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const applyDate = (value: string) => {
    setDateVal(value);
    setDateOpen(false);
    const params = new URLSearchParams();
    if (selectedCat) params.set("category", selectedCat.key);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (value) params.set("date", value);
    router.push(`/events?${params.toString()}`);
  };

  // Compute matching results based on category + query
  const cap = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());

  const matchedResults: { label: string; color: string; type: string; value?: string }[] = (() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const orgMatches = organizers
      .filter(o => o.name.toLowerCase().includes(q))
      .map(o => ({ label: o.name, color: "#38bdf8", type: "Organizer" }));

    // Genres come straight from the stored data keys so they always match.
    const genreMatches = dataGenres
      .filter(g => g.toLowerCase().includes(q))
      .map(g => ({ label: cap(g), color: "#39BD69", type: "Genre", value: g }));

    if (selectedCat?.key === "organizers") return orgMatches;
    if (selectedCat?.key === "genres") return genreMatches;

    if (selectedCat?.key === "artists" || !selectedCat) {
      const artists = ARTISTS
        .filter(a => a.toLowerCase().includes(q))
        .map(a => ({ label: a, color: "#e879f9", type: "Artist" }));
      if (selectedCat?.key === "artists") return artists;
      return [...artists, ...genreMatches, ...orgMatches];
    }
    return [];
  })();

  // Route a picked result to the right query param.
  const pickResult = (r: { label: string; type: string; value?: string }) => {
    if (r.type === "Genre" && r.value) {
      const params = new URLSearchParams();
      params.set("genre", r.value);
      if (dateVal) params.set("date", dateVal);
      router.push(`/events?${params.toString()}`);
      setResultsOpen(false);
      setSearchQuery(r.label);
      return;
    }
    handleSearch(r.label);
  };

  const handleSearch = (override?: string) => {
    const q = override ?? searchQuery.trim();
    if (!q && !selectedCat && !dateVal) return;
    const params = new URLSearchParams();
    if (selectedCat) params.set("category", selectedCat.key);
    if (q) params.set("q", q);
    if (dateVal) params.set("date", dateVal);
    router.push(`/events?${params.toString()}`);
    setResultsOpen(false);
    setSearchQuery(override ?? searchQuery);
  };

  return (
    <div className="relative z-[290] bg-[#080808]/95 backdrop-blur-md border-b border-white/10 py-4 shadow-lg">

      {/* Search bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-3">
        <div className="bg-black/60 backdrop-blur-md rounded-full flex items-center px-2 py-1.5 border border-white/12 relative">

          {/* Category button + dropdown */}
          <div ref={catRef} className="relative flex-shrink-0">
            <button
              onClick={() => setCatOpen(o => !o)}
              className="flex items-center gap-2 text-[13px] font-semibold tracking-widest uppercase px-4 py-2 border-r border-white/10 whitespace-nowrap transition-colors"
              style={{ color: selectedCat ? selectedCat.color : "rgba(255,255,255,0.55)" }}
            >
              {selectedCat ? (
                <>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: selectedCat.color }} />
                  {selectedCat.label}
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedCat(null); setSearchQuery(""); setResultsOpen(false); }}
                    className="ml-1 text-white/30 hover:text-white/70 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </>
              ) : (
                <>ALL CATEGORIES <ChevronDown size={12} style={{ transform: catOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} /></>
              )}
            </button>

            {catOpen && (
              <div
                className="absolute top-full mt-2 left-0 rounded-2xl border border-white/10 overflow-hidden"
                style={{
                  width: 200,
                  background: "rgba(10,10,20,0.97)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                  zIndex: 400,
                }}
              >
                <div className="px-4 pt-3 pb-1">
                  <p className="text-white/25 text-[10px] font-bold tracking-[0.35em] uppercase">Browse By</p>
                </div>
                {CAT_OPTIONS.map(opt => {
                  const active = selectedCat?.key === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => { setSelectedCat(opt); setCatOpen(false); setSearchQuery(""); setResultsOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/05 transition-colors text-left"
                      style={{ borderLeft: active ? `3px solid ${opt.color}` : "3px solid transparent" }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: opt.color }} />
                      <span className="text-sm font-semibold tracking-wide" style={{ color: active ? opt.color : "rgba(255,255,255,0.8)" }}>
                        {opt.label}
                      </span>
                      {active && <Check size={12} className="ml-auto flex-shrink-0" style={{ color: opt.color }} />}
                    </button>
                  );
                })}
                <div className="h-2" />
              </div>
            )}
          </div>

          {/* Search input + results */}
          <div ref={searchRef} className="flex-1 flex items-center px-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setResultsOpen(true); }}
              onFocus={() => setResultsOpen(true)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder={EXAMPLES[selectedCat?.key ?? "default"]}
              className="bg-transparent text-white/60 text-sm w-full outline-none placeholder:text-white/30 placeholder:italic"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setResultsOpen(false); }} className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0">
                <X size={12} />
              </button>
            )}

            {/* Live results dropdown */}
            {resultsOpen && matchedResults.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-3 rounded-2xl border border-white/10 overflow-hidden"
                style={{
                  background: "rgba(10,10,20,0.97)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
                  zIndex: 400,
                }}
              >
                <div className="px-4 pt-3 pb-1">
                  <p className="text-white/25 text-[10px] font-bold tracking-[0.35em] uppercase">
                    {matchedResults.length} result{matchedResults.length !== 1 ? "s" : ""} found
                  </p>
                </div>
                {matchedResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => pickResult(r)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/06 transition-colors text-left group"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                    <span className="flex-1 text-sm font-medium text-white/80 group-hover:text-white transition-colors">{r.label}</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: r.color + "22", color: r.color }}>
                      {r.type}
                    </span>
                  </button>
                ))}
                <div className="h-2" />
              </div>
            )}
          </div>

          {/* Date filter */}
          <div ref={dateRef} className="relative flex-shrink-0">
            <button
              onClick={() => setDateOpen(o => !o)}
              className="flex items-center gap-2 text-[13px] font-semibold tracking-widest uppercase px-4 py-2 border-l border-white/10 whitespace-nowrap transition-colors"
              style={{ color: dateVal ? "#60a5fa" : "rgba(255,255,255,0.55)" }}
            >
              <Calendar size={13} />
              <span className="hidden sm:inline">{dateLabel}</span>
              {dateVal && (
                <button
                  onClick={e => { e.stopPropagation(); setDateVal(""); applyDate(""); }}
                  className="text-white/30 hover:text-white/70 transition-colors"
                >
                  <X size={10} />
                </button>
              )}
              <ChevronDown size={12} style={{ transform: dateOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
            </button>

            {dateOpen && (
              <div
                className="absolute top-full mt-2 right-0 rounded-2xl border border-white/10 overflow-hidden"
                style={{ width: 260, background: "rgba(10,10,20,0.98)", backdropFilter: "blur(20px)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", zIndex: 400 }}
              >
                <div className="px-4 pt-3 pb-1">
                  <p className="text-white/25 text-[10px] font-bold tracking-[0.35em] uppercase">Quick Select</p>
                </div>
                {DATE_PRESETS.map(({ label, slug }) => {
                  const active = dateVal === slug;
                  return (
                    <button
                      key={slug}
                      onClick={() => applyDate(active ? "" : slug)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/05 transition-colors text-left"
                    >
                      <span className="flex items-center gap-2.5">
                        <Calendar size={13} style={{ color: "#60a5fa" }} />
                        <span className="text-sm font-medium" style={{ color: active ? "#60a5fa" : "rgba(255,255,255,0.8)" }}>{label}</span>
                      </span>
                      {active && <Check size={13} style={{ color: "#60a5fa" }} />}
                    </button>
                  );
                })}
                <div className="px-4 py-3 border-t border-white/08">
                  <p className="text-white/25 text-[10px] font-bold tracking-[0.35em] uppercase mb-2">Pick a Date</p>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={e => { setCustomFrom(e.target.value); if (e.target.value) applyDate(`custom:${e.target.value}:${e.target.value}`); }}
                    className="w-full bg-white/06 border border-white/10 rounded-lg px-2.5 py-2 text-white text-xs outline-none focus:border-[#60a5fa]/50"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleSearch()}
            className="text-[13px] font-bold tracking-[0.12em] uppercase px-6 py-2.5 rounded-r-full rounded-l-none whitespace-nowrap flex items-center gap-2 flex-shrink-0 transition-all hover:-translate-y-px active:scale-95 hover:brightness-110"
            style={{ background: "rgba(233,24,79,1)", color: "#fff" }}>
            SEARCH <Search size={11} />
          </button>
        </div>
      </div>

      {/* Filter row — hidden */}

    </div>
  );
}
