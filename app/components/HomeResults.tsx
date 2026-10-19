"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, X } from "lucide-react";
import EventCard from "./EventCard";
import ArtistCard from "./ArtistCard";
import { Event } from "../data/events";
import { Artist } from "../data/artists";
import { dateRangeLabel } from "../lib/dateRange";

// Search / filter results shown on the home page itself (instead of jumping to another page):
// the events and the artists that match, side by side as two groups.
//   ?q=night            events + artists matching "night"
//   ?genre=electronic   events + artists of that genre
//   ?date=today …       events on those dates (artists have no dates, so none are shown)
//   &category=artists   artists only · organizers / genres narrow the events the same way the Events page does

let artistsCache: Artist[] | null = null;

const grid: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 14 };
const h2: React.CSSProperties = { fontSize: "clamp(1.1rem,2.2vw,1.6rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em" };

export default function HomeResults({ params }: { params: string }) {
  const router = useRouter();
  const sp = new URLSearchParams(params);
  const q = (sp.get("q") ?? "").trim();
  const genre = sp.get("genre") ?? "";
  const date = sp.get("date") ?? "";
  const category = sp.get("category") ?? "";

  const wantEvents = category !== "artists";
  const wantArtists = !date && category !== "organizers";

  const [events, setEvents] = useState<Event[] | null>(null);
  const [artists, setArtists] = useState<Artist[] | null>(artistsCache);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [followed, setFollowed] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!wantEvents) { setEvents([]); return; }
    let cancelled = false;
    setEvents(null);
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (genre) p.set("genre", genre);
    if (date) p.set("date", date);
    if (category) p.set("category", category);
    fetch(`/api/events/search?${p.toString()}`)
      .then(r => (r.ok ? r.json() : []))
      .then(d => { if (!cancelled) setEvents(Array.isArray(d) ? d : []); })
      .catch(() => { if (!cancelled) setEvents([]); });
    return () => { cancelled = true; };
  }, [q, genre, date, category, wantEvents]);

  useEffect(() => {
    if (!wantArtists || artistsCache) return;
    let cancelled = false;
    fetch("/api/artists")
      .then(r => (r.ok ? r.json() : []))
      .then(d => { artistsCache = Array.isArray(d) ? d : []; if (!cancelled) setArtists(artistsCache); })
      .catch(() => { if (!cancelled) setArtists([]); });
    return () => { cancelled = true; };
  }, [wantArtists]);

  const ql = q.toLowerCase();
  const matchedArtists = !wantArtists || !artists ? [] : artists.filter(a => {
    const genres = [...(a.genres ?? []), ...(a.subGenres ?? [])].map(g => g.toLowerCase());
    if (genre && !genres.includes(genre.toLowerCase())) return false;
    if (!ql) return true;
    if (category === "genres") return genres.some(g => g.includes(ql) || ql.includes(g));
    const names = [a.name, a.stageName ?? ""].some(n => n.toLowerCase().includes(ql));
    if (category === "artists") return names;
    return names || a.role.toLowerCase().includes(ql) || genres.some(g => g.includes(ql));
  });

  const loading = (wantEvents && events === null) || (wantArtists && artists === null);
  const eventList = events ?? [];
  const dateInfo = dateRangeLabel(date);
  const title = q ? `"${q}"` : genre || "Results";

  return (
    <div style={{ padding: "24px 0 56px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.5rem)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.01em" }}>{title}</h1>
        <button onClick={() => router.push("/")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", background: "transparent" }}>
          <X size={10} /> Clear
        </button>
      </div>

      {dateInfo && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "7px 14px", borderRadius: 999, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.35)" }}>
          <Calendar size={14} style={{ color: "#60a5fa", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{dateInfo.name}: <strong style={{ color: "#fff" }}>{dateInfo.range}</strong></span>
        </div>
      )}

      {loading && <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Searching…</p>}

      {!loading && wantEvents && eventList.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...h2, marginBottom: 16 }}>Events <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>({eventList.length})</span></h2>
          <div style={grid}>
            {eventList.map(ev => (
              <EventCard key={ev.id} event={ev} liked={liked.has(ev.id)} shared={false}
                onLike={e => { e.stopPropagation(); setLiked(prev => { const s = new Set(prev); s.has(ev.id) ? s.delete(ev.id) : s.add(ev.id); return s; }); }}
                onShare={() => {}} />
            ))}
          </div>
        </section>
      )}

      {!loading && wantArtists && matchedArtists.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...h2, marginBottom: 16 }}>Talent <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>({matchedArtists.length})</span></h2>
          <div style={grid}>
            {matchedArtists.map(a => (
              <ArtistCard key={a.id} artist={a} followed={followed.has(a.id)}
                onFollow={e => { e.stopPropagation(); setFollowed(prev => { const s = new Set(prev); s.has(a.id) ? s.delete(a.id) : s.add(a.id); return s; }); }} />
            ))}
          </div>
        </section>
      )}

      {!loading && eventList.length === 0 && matchedArtists.length === 0 && (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 14, border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 14 }}>
          Nothing matches {q ? `“${q}”` : "that search"}. Try another word, or clear the search to see everything.
        </div>
      )}
    </div>
  );
}
