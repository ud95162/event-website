"use client";

import { Suspense, useState, useLayoutEffect, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Music2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { artists, Artist } from "../data/artists";
import { events } from "../data/events";
import Navbar from "../components/Navbar";
import StickySearchFilters from "../components/StickySearchFilters";
import ParticleField from "../components/ParticleField";
import Preloader from "../components/Preloader";
import { hasPreloaderShown, markPreloaderShown } from "../preloaderState";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const eventCountFor = (name: string) =>
  events.filter(ev => ev.lineup.includes(name)).length;

/* ── Artist Card ────────────────────────────────────────────────── */
function ArtistCard({ artist, followed, onFollow }: {
  artist: Artist;
  followed: boolean;
  onFollow: (e: React.MouseEvent) => void;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const eventCount = eventCountFor(artist.name);

  return (
    <div
      onClick={() => router.push(`/artists/${artist.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0, width: 230, height: 320,
        borderRadius: 16, overflow: "hidden", position: "relative",
        cursor: "pointer",
        border: `1px solid ${hovered ? "rgba(57,189,105,0.4)" : "rgba(255,255,255,0.08)"}`,
        boxShadow: hovered ? "0 0 28px rgba(57,189,105,0.15)" : "none",
        transition: "border-color 0.3s, box-shadow 0.3s, transform 0.3s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        background: "#0a0a0a",
      }}
    >
      <img src={artist.image} alt={artist.name} style={{
        width: "100%", height: "65%", objectFit: "cover", objectPosition: "top",
        transform: hovered ? "scale(1.06)" : "scale(1)",
        filter: hovered ? "grayscale(0%)" : "grayscale(30%)",
        transition: "transform 0.5s ease, filter 0.5s ease",
      }} />

      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.05) 100%)" }} />

      <button onClick={onFollow} style={{
        position: "absolute", top: 10, right: 10,
        width: 28, height: 28, borderRadius: "50%",
        background: followed ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.55)",
        border: `1px solid ${followed ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.15)"}`,
        backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
      }}>
        <Heart size={11} strokeWidth={2.5} fill={followed ? "#fff" : "none"} style={{ color: "#fff" }} />
      </button>

      {eventCount > 0 && (
        <div style={{
          position: "absolute", top: 10, left: 10,
          display: "flex", alignItems: "center", gap: 4,
          padding: "3px 8px", borderRadius: 999,
          background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(6px)",
        }}>
          <Music2 size={8} style={{ color: "#39BD69" }} />
          <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{eventCount}</span>
        </div>
      )}

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px", textAlign: "center" }}>
        <p style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 5 }}>{artist.role}</p>
        <h3 style={{ fontSize: 12, fontWeight: 900, color: "#fff", textTransform: "uppercase", lineHeight: 1.25, letterSpacing: "0.04em", marginBottom: 6 }}>{artist.name}</h3>
        <div style={{ height: 2, borderRadius: 999, margin: "0 auto", width: hovered ? "60%" : "30%", background: "linear-gradient(90deg,#39BD69,#2ecc71)", transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

/* ── Artist Row ─────────────────────────────────────────────────── */
function ArtistRow({ title, subtitle, artists: rowArtists, followed, onFollow }: {
  title: string; subtitle?: string;
  artists: Artist[];
  followed: Set<number>;
  onFollow: (id: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -420 : 420, behavior: "smooth" });
  };
  if (!rowArtists.length) return null;

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          {subtitle && <p style={{ fontSize: 10, fontWeight: 700, color: "#39BD69", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 4 }}>{subtitle}</p>}
          <h2 style={{ fontSize: "clamp(1rem,2vw,1.4rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["left", "right"] as const).map(dir => (
            <button key={dir} onClick={() => scroll(dir)}
              style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "#000"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
            >{dir === "left" ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}</button>
          ))}
        </div>
      </div>
      <div ref={scrollRef} style={{ display: "flex", gap: 14, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 6 }}>
        {rowArtists.map(a => (
          <ArtistCard key={a.id} artist={a} followed={followed.has(a.id)} onFollow={e => { e.stopPropagation(); onFollow(a.id); }} />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Inner content
   ══════════════════════════════════════════════════════════════════════ */
function ArtistsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [followed, setFollowed] = useState<Set<number>>(new Set());
  const queryParam  = searchParams.get("q")      ?? "";
  const filterParam = searchParams.get("filter") ?? "";
  const toggleFollow = (id: number) =>
    setFollowed(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const isFiltered = !!queryParam || !!filterParam;

  if (isFiltered) {
    let filtered = [...artists];
    if (filterParam === "followed")    filtered = filtered.filter(a => followed.has(a.id));
    if (filterParam === "recommended") filtered = filtered.sort((a, b) => eventCountFor(b.name) - eventCountFor(a.name));
    if (queryParam) {
      const q = queryParam.toLowerCase();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q));
    }
    return (
      <div style={{ padding: "24px 0 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.5rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
            {queryParam ? `"${queryParam}"` : filterParam === "followed" ? "Followed Artists" : "Artists"}
          </h1>
          <button onClick={() => router.push("/artists")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", background: "transparent" }}>
            <X size={10} /> Clear
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {filtered.map(a => <ArtistCard key={a.id} artist={a} followed={followed.has(a.id)} onFollow={e => { e.stopPropagation(); toggleFollow(a.id); }} />)}
        </div>
      </div>
    );
  }

  const topPicks    = [...artists].sort((a, b) => eventCountFor(b.name) - eventCountFor(a.name));
  const edm         = artists.filter(a => a.role.includes("EDM") || a.role.includes("HOUSE"));
  const sriLankan   = artists.filter(a => a.role.includes("SRI LANKAN"));
  const rbSoulPop   = artists.filter(a => a.role.includes("R&B") || a.role.includes("SOUL") || a.role.includes("POP"));
  const rockClassic = artists.filter(a => a.role.includes("CLASSICAL") || a.role.includes("ROCK") || a.role.includes("INDIE"));
  const liveActs    = artists.filter(a => a.role.includes("BAND") || a.role.includes("LIVE"));
  const followedList = artists.filter(a => followed.has(a.id));

  const rows = [
    { title: "Top Picks",              subtitle: "Most Active",          data: topPicks    },
    { title: "Electronic & EDM",       subtitle: "Genre",                data: edm         },
    { title: "Sri Lankan Artists",     subtitle: "Local Talent",         data: sriLankan   },
    { title: "R&B, Pop & Soul",        subtitle: "Vibes",                data: rbSoulPop   },
    { title: "Rock, Indie & Classical",subtitle: "Genre",                data: rockClassic },
    { title: "Bands & Live Acts",      subtitle: "Live Experience",      data: liveActs    },
    ...(followedList.length ? [{ title: "Your Follows", subtitle: "Artists You Follow", data: followedList }] : []),
    { title: "All Artists",            subtitle: "Full Lineup",          data: artists     },
  ];

  return (
    <div style={{ padding: "24px 0 64px" }}>
      {rows.map(row => (
        <ArtistRow key={row.title} title={row.title} subtitle={row.subtitle} artists={row.data} followed={followed} onFollow={toggleFollow} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Page export
   ══════════════════════════════════════════════════════════════════════ */
export default function ArtistsPage() {
  const [preloaderPhase, setPreloaderPhase] = useState<"checking" | "idle" | "exit" | "gone">("checking");

  useIsomorphicLayoutEffect(() => {
    if (hasPreloaderShown()) setPreloaderPhase("gone");
    else { markPreloaderShown(); setPreloaderPhase("idle"); }
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
                    <div style={{ height: 24, width: 180, borderRadius: 8, background: "rgba(255,255,255,0.04)", marginBottom: 16 }} />
                    <div style={{ display: "flex", gap: 14 }}>
                      {[...Array(5)].map((_, j) => <div key={j} style={{ width: 230, height: 320, borderRadius: 16, background: "rgba(255,255,255,0.03)", flexShrink: 0 }} />)}
                    </div>
                  </div>
                ))}
              </div>
            }>
              <ArtistsContent />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
