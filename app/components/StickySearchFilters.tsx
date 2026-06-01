"use client";

import { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Search, Calendar } from "lucide-react";

/* ── Filter definitions ───────────────────────────────────────────────── */
const genres = [
  { label: "Electronic Music", color: "#39BD69", slug: "electronic" },
  { label: "Sinhala Music",    color: "#f59e0b", slug: "sinhala"    },
  { label: "Tamil Music",      color: "#a855f7", slug: "tamil"      },
  { label: "Hindi Music",      color: "#f43f5e", slug: "hindi"      },
];

const dates = [
  { label: "Today",        slug: "today"      },
  { label: "This Week",    slug: "this-week"  },
  { label: "This Month",   slug: "this-month" },
  { label: "Choose Dates", slug: "custom",    icon: true },
];

const artistFilters = [
  { label: "All Artists",      slug: ""            },
  { label: "Recommended",      slug: "recommended" },
  { label: "Followed Artists", slug: "followed"    },
];

const DATE_COLOR   = "#60a5fa";
const ARTIST_COLOR = "#e879f9";

/* ── Pill ─────────────────────────────────────────────────────────────── */
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
        fontSize:      "12px",
        lineHeight:    "100%",
        letterSpacing: "0.1em",
      }}
    >
      {icon && <Calendar size={9} strokeWidth={2} />}
      {label}
    </button>
  );
}

/* ── Filter pills (needs useSearchParams → inside Suspense) ──────────── */
function FilterPills() {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const currentGenre  = searchParams.get("genre")  ?? "";
  const currentDate   = searchParams.get("date")   ?? "";
  const currentFilter = searchParams.get("filter") ?? "";

  /* Navigate helpers — toggle off if already active */
  const goGenre = (slug: string) =>
    router.push(currentGenre === slug ? "/events" : `/events?genre=${slug}`);

  const goDate = (slug: string) =>
    router.push(currentDate === slug ? "/events" : `/events?date=${slug}`);

  const goArtist = (slug: string) =>
    router.push(slug ? `/artists?filter=${slug}` : "/artists");

  return (
    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">

      {/* Date filters → events page */}
      {dates.map(({ label, slug, icon }) => (
        <Pill
          key={label}
          label={label}
          color={DATE_COLOR}
          icon={icon}
          isActive={pathname.startsWith("/events") && currentDate === slug}
          onClick={() => goDate(slug)}
        />
      ))}

      <div className="flex-shrink-0 w-px h-4 bg-white/15 mx-1" />

      {/* Artist filters → artists page */}
      {artistFilters.map(({ label, slug }) => (
        <Pill
          key={label}
          label={label}
          color={ARTIST_COLOR}
          isActive={pathname.startsWith("/artists") && currentFilter === slug}
          onClick={() => goArtist(slug)}
        />
      ))}

      <div className="flex-shrink-0 w-px h-4 bg-white/15 mx-1" />

      {/* Genre filters → events page */}
      {genres.map(({ label, color, slug }) => (
        <Pill
          key={label}
          label={label}
          color={color}
          isActive={pathname.startsWith("/events") && currentGenre === slug}
          onClick={() => goGenre(slug)}
        />
      ))}

    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function StickySearchFilters() {
  return (
    <div className="relative z-[290] bg-[#080808]/95 backdrop-blur-md border-b border-white/10 py-4 shadow-lg">

      {/* Search bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-3">
        <div className="bg-black/60 backdrop-blur-md rounded-full flex items-center px-2 py-1.5 border border-white/12">
          <button className="flex items-center gap-2 text-white/55 text-[13px] font-semibold tracking-widest uppercase px-4 py-2 border-r border-white/10 whitespace-nowrap flex-shrink-0">
            ALL CATEGORIES <ChevronDown size={12} />
          </button>
          <div className="flex-1 flex items-center px-5">
            <input
              type="text"
              placeholder="I AM SEARCHING FOR"
              className="bg-transparent text-white/60 text-sm w-full outline-none placeholder:text-white/25 placeholder:tracking-[0.3em] placeholder:uppercase"
            />
          </div>
          <button
            className="text-[13px] font-bold tracking-[0.12em] uppercase px-6 py-2.5 rounded-r-full rounded-l-none whitespace-nowrap flex items-center gap-2 flex-shrink-0 transition-all hover:-translate-y-px active:scale-95 hover:brightness-110"
            style={{ background: "rgba(233, 24, 79, 1)", color: "#fff" }}
          >
            SEARCH CATEGORY <Search size={11} />
          </button>
        </div>
      </div>

      {/* Pill row — wrapped in Suspense because FilterPills uses useSearchParams */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="flex items-center gap-2 pb-1 overflow-hidden">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-6 w-20 rounded-full flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          }
        >
          <FilterPills />
        </Suspense>
      </div>

    </div>
  );
}
