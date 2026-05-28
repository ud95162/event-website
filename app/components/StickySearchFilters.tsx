"use client";

import { useState } from "react";
import { ChevronDown, Search, Calendar } from "lucide-react";

const genres = [
  { label: "Electronic Music", color: "#39BD69" },
  { label: "Sinhala Music",    color: "#f59e0b" },
  { label: "Tamil Music",      color: "#a855f7" },
  { label: "Hindi Music",      color: "#f43f5e" },
];

const dates = [
  { label: "Today"      },
  { label: "This Week"  },
  { label: "This Month" },
  { label: "Choose Dates", icon: true },
];

const artistFilters = [
  { label: "All Artists"     },
  { label: "Recommended"     },
  { label: "Followed Artists"},
];

const DATE_COLOR   = "#60a5fa";
const ARTIST_COLOR = "#e879f9";

function Pill({
  label, color, isActive, onClick, icon,
}: {
  label: string; color: string; isActive: boolean; onClick: () => void; icon?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full transition-all active:scale-95 cursor-pointer"
      style={{
        background:    isActive ? `${color}18` : "transparent",
        color,
        border:        `1px solid ${color}60`,
        boxShadow:     isActive ? `0 0 10px ${color}25` : "none",
        fontWeight:    300,
        fontSize:      "10px",
        lineHeight:    "100%",
        letterSpacing: "0.1em",
      }}
    >
      {icon && <Calendar size={9} strokeWidth={2} />}
      {label}
    </button>
  );
}

export default function StickySearchFilters() {
  const [activeGenre,  setActiveGenre]  = useState<string | null>(null);
  const [activeDate,   setActiveDate]   = useState<string | null>(null);
  const [activeArtist, setActiveArtist] = useState<string>("All Artists");

  return (
    <div className="sticky top-16 z-[290] bg-[#080808]/95 backdrop-blur-md border-b border-white/10 py-4 transition-all duration-300 shadow-lg">

      {/* ── Search bar ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-3">
        <div className="bg-black/60 backdrop-blur-md rounded-full flex items-center px-2 py-1.5 border border-white/12">
          <button className="flex items-center gap-2 text-white/55 text-[11px] font-semibold tracking-widest uppercase px-4 py-2 border-r border-white/10 whitespace-nowrap flex-shrink-0">
            ALL CATEGORIES <ChevronDown size={12} />
          </button>
          <div className="flex-1 flex items-center px-5">
            <input
              type="text"
              placeholder="I AM SEARCHING FOR"
              className="bg-transparent text-white/60 text-xs w-full outline-none placeholder:text-white/25 placeholder:tracking-[0.3em] placeholder:uppercase"
            />
          </div>
          <button
            className="text-[10px] font-bold tracking-[0.12em] uppercase px-6 py-2.5 rounded-r-full rounded-l-none whitespace-nowrap flex items-center gap-2 flex-shrink-0 transition-all hover:-translate-y-px active:scale-95 hover:brightness-110"
            style={{ background: "rgba(233, 24, 79, 1)", color: "#fff" }}
          >
            SEARCH CATEGORY <Search size={11} />
          </button>
        </div>
      </div>

      {/* ── All filters in one row ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">

          {/* Date filters */}
          {dates.map(({ label, icon }) => (
            <Pill key={label} label={label} color={DATE_COLOR}
              isActive={activeDate === label} icon={icon}
              onClick={() => setActiveDate(prev => prev === label ? null : label)} />
          ))}

          <div className="flex-shrink-0 w-px h-4 bg-white/15 mx-1" />

          {/* Artist filters */}
          {artistFilters.map(({ label }) => (
            <Pill key={label} label={label} color={ARTIST_COLOR}
              isActive={activeArtist === label}
              onClick={() => setActiveArtist(label)} />
          ))}

          <div className="flex-shrink-0 w-px h-4 bg-white/15 mx-1" />

          {/* Genre filters */}
          {genres.map(({ label, color }) => (
            <Pill key={label} label={label} color={color}
              isActive={activeGenre === label}
              onClick={() => setActiveGenre(prev => prev === label ? null : label)} />
          ))}

        </div>
      </div>
    </div>
  );
}
