"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import SponsoredTag from "./SponsoredTag";
import { thumb } from "../lib/images";
import { Artist } from "../data/artists";
import { useAdminData } from "../context/AdminDataContext";
import { artistSlug } from "../lib/slug";
import { isEventPast } from "../lib/eventTime";

// Number of UPCOMING events an artist is performing in (finished events don't count).
// Matches on the stage name or the real name, like the artist's own page does.
export function upcomingEventCount(events: { lineup: string[]; date: string; startTime?: string; endDate?: string; endTime?: string }[], names: string[]): number {
  const now = Date.now();
  return events.filter(ev => ev.lineup.some(n => names.includes(n)) && !isEventPast(ev, now)).length;
}


/* ── Artist Card ────────────────────────────────────────────────── */
export default function ArtistCard({ artist, followed, onFollow }: {
  artist: Artist;
  followed: boolean;
  onFollow: (e: React.MouseEvent) => void;
}) {
  const router = useRouter();
  const { events } = useAdminData();
  const [hovered, setHovered] = useState(false);
  const eventCount = upcomingEventCount(events, [artist.stageName || artist.name, artist.name]);

  return (
    <div
      onClick={() => router.push(`/artists/${artistSlug(artist)}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0, width: 230, height: 320,
        borderRadius: 16, overflow: "hidden", position: "relative",
        cursor: "pointer",
        border: `1px solid ${hovered ? "rgba(227,184,115,0.6)" : "rgba(227,184,115,0.14)"}`,
        boxShadow: hovered ? "0 14px 40px rgba(0,0,0,0.5), 0 0 34px rgba(227,184,115,0.26)" : "0 6px 20px rgba(0,0,0,0.3)",
        transition: "border-color 0.3s, box-shadow 0.3s, transform 0.3s",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        background: "#0b0a08",
      }}
    >
      <img src={thumb(artist.image, 600)} alt={artist.name} style={{
        width: "100%", height: "65%", objectFit: "cover", objectPosition: "top",
        transform: hovered ? "scale(1.06)" : "scale(1)",
        filter: hovered ? "grayscale(0%)" : "grayscale(30%)",
        transition: "transform 0.5s ease, filter 0.5s ease",
      }} />

      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.05) 100%)" }} />

      {artist.sponsored && (
        <div style={{ position: "absolute", top: 10, left: 10 }}><SponsoredTag /></div>
      )}

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
        <div title={`${eventCount} upcoming event${eventCount !== 1 ? "s" : ""}`} style={{
          position: "absolute", top: 10, left: 10,
          display: "flex", alignItems: "center", gap: 6,
          padding: "4px 10px", borderRadius: 999,
          background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(6px)",
        }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{eventCount}</span>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#E8DCC0" }}>Upcoming</span>
        </div>
      )}

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px", textAlign: "center" }}>
        <p style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 5 }}>{artist.role}</p>
        <h3 style={{ fontSize: 12, fontWeight: 900, color: "#fff", textTransform: "uppercase", lineHeight: 1.25, letterSpacing: "0.04em", marginBottom: 6 }}>{artist.name}</h3>
        <div style={{ height: 2, borderRadius: 999, margin: "0 auto", width: hovered ? "62%" : "32%", background: "linear-gradient(90deg, rgba(227,184,115,0), #f5ecd0 35%, #C9A24B 65%, rgba(227,184,115,0))", transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

/* ── Artist Row ─────────────────────────────────────────────────── */
