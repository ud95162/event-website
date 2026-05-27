"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

const GREEN  = "green";
const BLUE   = "blue";
const PURPLE = "purple";
const RED    = "red";

const GROUP_COLOR: Record<string, string> = {
  green:  "#39BD69", // Swapped general green with brand theme green for ultimate styling cohesiveness!
  blue:   "#60a5fa",
  purple: "#a855f7",
  red:    "#f43f5e",
};

const categories = [
  { label: "Music",            group: GREEN  },
  { label: "Concerts",         group: GREEN  },
  { label: "DJ Night",         group: GREEN  },
  { label: "Festivals",        group: GREEN  },
  { label: "Business",         group: BLUE   },
  { label: "Workshops",        group: BLUE   },
  { label: "Tech Events",      group: PURPLE },
  { label: "Sports",           group: PURPLE },
  { label: "Food & Drinks",    group: PURPLE },
  { label: "Networking",       group: RED    },
  { label: "Family Events",    group: RED    },
  { label: "Community Events", group: RED    },
];

export default function StickySearchFilters() {
  const [activeByGroup, setActiveByGroup] = useState<Record<string, string>>({ green: "Music" });

  return (
    <div className="sticky top-16 z-40 bg-[#080808]/95 backdrop-blur-md border-b border-white/10 py-4 transition-all duration-300 shadow-lg">
      {/* ── Search bar ──────────────────────────────────────────── */}
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

      {/* ── Category tag pills ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-3">
          {categories.map(({ label, group }) => {
            const color    = GROUP_COLOR[group];
            const isActive = activeByGroup[group] === label;
            return (
              <button
                key={label}
                onClick={() =>
                  setActiveByGroup((prev) => {
                    if (prev[group] === label) { const n = { ...prev }; delete n[group]; return n; }
                    return { ...prev, [group]: label };
                  })
                }
                className="flex-shrink-0 px-3 py-1 rounded-full transition-all active:scale-95"
                style={{
                  background: isActive ? `${color}18` : "transparent",
                  color:      color,
                  border:     group === "green"
                    ? "1px solid rgba(57, 189, 105, 0.5)"
                    : `1px solid ${color}60`,
                  boxShadow:  isActive ? `0 0 10px ${color}25` : "none",
                  fontWeight: 300,
                  fontSize:   "10px",
                  lineHeight: "100%",
                  letterSpacing: "0.1em",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
