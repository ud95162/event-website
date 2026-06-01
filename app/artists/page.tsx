"use client";

import { Suspense, useState, useLayoutEffect, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Music2, X } from "lucide-react";
import { artists } from "../data/artists";
import { events } from "../data/events";
import Navbar from "../components/Navbar";
import StickySearchFilters from "../components/StickySearchFilters";
import ParticleField from "../components/ParticleField";
import Preloader from "../components/Preloader";
import { hasPreloaderShown, markPreloaderShown } from "../preloaderState";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ── Event count helper ──────────────────────────────────────────────── */
const eventCountFor = (name: string) =>
  events.filter(ev => ev.lineup.includes(name)).length;

/* ══════════════════════════════════════════════════════════════════════
   Inner content — uses useSearchParams, must be inside <Suspense>
   ══════════════════════════════════════════════════════════════════════ */
function ArtistsContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [followed, setFollowed] = useState<Set<number>>(new Set());

  const filterParam = searchParams.get("filter") ?? "";

  const toggleFollow = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowed(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  /* Apply filter */
  let displayArtists = [...artists];

  if (filterParam === "recommended") {
    /* Sort by event appearances descending */
    displayArtists = displayArtists.sort(
      (a, b) => eventCountFor(b.name) - eventCountFor(a.name)
    );
  } else if (filterParam === "followed") {
    displayArtists = displayArtists.filter(a => followed.has(a.id));
  }

  const filterLabel =
    filterParam === "recommended" ? "Recommended Artists" :
    filterParam === "followed"    ? "Followed Artists"    : "";

  const isFiltered   = !!filterParam;
  const [featured, ...rest] = displayArtists;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="text-white/30 text-[10px] font-bold tracking-[0.4em] uppercase mb-2">LINEUP</p>
        <div className="flex items-end justify-between flex-wrap gap-3">
          <h1 className="text-white font-black text-4xl lg:text-5xl uppercase tracking-tight">
            {filterLabel || "All Artists"}
          </h1>
          <div className="flex items-center gap-3 pb-1">
            {isFiltered && (
              <button
                onClick={() => router.push("/artists")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)" }}
              >
                <X size={10} /> Clear filter
              </button>
            )}
            <span className="text-white/25 text-sm pb-1">{displayArtists.length} artists</span>
          </div>
        </div>
        <div className="h-px mt-4" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.1), transparent)" }} />
      </div>

      {/* ── Empty state (followed with none followed) ─────────────────── */}
      {displayArtists.length === 0 && (
        <div
          className="rounded-2xl p-16 flex flex-col items-center justify-center gap-4 mb-20"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
        >
          <Heart size={28} className="text-white/15" />
          <p className="text-white/25 text-sm tracking-wide">You haven't followed any artists yet.</p>
          <p className="text-white/15 text-xs tracking-wide">Click the heart icon on any artist to follow them.</p>
          <button
            onClick={() => router.push("/artists")}
            className="text-[11px] tracking-widest uppercase font-semibold px-6 py-2.5 rounded-full mt-2 transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)" }}
          >
            Browse All Artists
          </button>
        </div>
      )}

      {/* ── Featured spotlight ────────────────────────────────────────── */}
      {featured && (
        <div
          className="w-full rounded-3xl overflow-hidden relative mb-10 group cursor-pointer"
          onClick={() => router.push(`/artists/${featured.id}`)}
          style={{
            background: "#0d0d1f",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            height: 360,
          }}
        >
          <img
            src={featured.image}
            alt={featured.name}
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,8,8,0.0) 30%, #080808 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,0.85) 0%, transparent 55%)" }} />

          <span
            className="absolute top-5 left-5 text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 rounded-full"
            style={{ background: "rgba(57,189,105,0.15)", border: "1px solid rgba(57,189,105,0.35)", color: "#39BD69", backdropFilter: "blur(8px)" }}
          >
            {filterParam === "recommended" ? "TOP PICK" : "SPOTLIGHT"}
          </span>

          <button
            onClick={(e) => toggleFollow(featured.id, e)}
            className="absolute top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
            style={{
              background: followed.has(featured.id) ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.5)",
              border: followed.has(featured.id) ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <Heart size={11} strokeWidth={2.5} fill={followed.has(featured.id) ? "#fff" : "none"} />
            {followed.has(featured.id) ? "Following" : "Follow"}
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-7 flex items-end justify-between">
            <div>
              <p className="text-white/40 text-[9px] font-bold tracking-[0.4em] uppercase mb-1">{featured.role}</p>
              <h2 className="text-white font-black text-3xl lg:text-4xl uppercase tracking-tight leading-tight mb-2">{featured.name}</h2>
              <p className="text-white/50 text-sm max-w-md leading-relaxed">{featured.bio}</p>
            </div>
            <div className="flex-shrink-0 text-right hidden sm:block">
              <p className="text-white/25 text-[9px] tracking-[0.3em] uppercase mb-0.5">Performing in</p>
              <p className="text-white font-black text-2xl">{eventCountFor(featured.name)}</p>
              <p className="text-white/35 text-[10px] tracking-widest uppercase">events</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Artist grid ──────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 pb-20">
          {rest.map(artist => {
            const isFollowed = followed.has(artist.id);
            const eventCount = eventCountFor(artist.name);
            return (
              <div
                key={artist.id}
                onClick={() => router.push(`/artists/${artist.id}`)}
                className="rounded-2xl overflow-hidden group flex flex-col cursor-pointer"
                style={{
                  background: "#0d0d1f",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(57,189,105,0.25)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow   = "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(57,189,105,0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow   = "0 8px 32px rgba(0,0,0,0.3)";
                }}
              >
                <div className="relative w-full overflow-hidden" style={{ height: 220 }}>
                  <img src={artist.image} alt={artist.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0d0d1f 0%, rgba(13,13,31,0.15) 60%, transparent 100%)" }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(57,189,105,0.12) 0%, transparent 65%)" }} />

                  <button
                    onClick={(e) => toggleFollow(artist.id, e)}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: isFollowed ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.5)",
                      border: isFollowed ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.18)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <Heart size={11} strokeWidth={2.5} fill={isFollowed ? "#fff" : "none"} className="text-white" />
                  </button>

                  {eventCount > 0 && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(6px)" }}>
                      <Music2 size={9} className="text-[#39BD69]" />
                      <span className="text-white/70 text-[9px] font-semibold">{eventCount} event{eventCount !== 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>

                <div className="px-3 pb-4 pt-2.5 flex flex-col flex-1">
                  <p className="text-white/30 text-[8px] font-bold tracking-[0.35em] uppercase mb-0.5">{artist.role}</p>
                  <h3 className="text-white font-black text-xs uppercase tracking-wide leading-tight mb-2">{artist.name}</h3>
                  <p className="text-white/35 text-[10px] leading-relaxed flex-1 line-clamp-2">{artist.bio}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-[2px] w-6 rounded-full" style={{ background: "#39BD69" }} />
                    <div className="h-[1px] flex-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
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
   Page export
   ══════════════════════════════════════════════════════════════════════ */
export default function ArtistsPage() {
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
            <div className="grid grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl h-72" style={{ background: "rgba(255,255,255,0.03)" }} />
              ))}
            </div>
          </div>
        }>
          <ArtistsContent />
        </Suspense>
      </div>
      </div>
    </main>
  );
}
