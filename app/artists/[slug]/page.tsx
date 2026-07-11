"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Heart, ChevronLeft, MapPin, Calendar, Music2, ArrowRight,
  Star, Mail,
} from "lucide-react";

/* ── Brand icons ───────────────────────────────────────────────────────────── */
const BrandIcon = ({ name, size = 14 }: { name: string; size?: number }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor" };
  switch (name) {
    case "soundcloud":
      return <svg {...p}><path d="M1 14.5a.5.5 0 0 1 1 0v2a.5.5 0 0 1-1 0v-2Zm2-1.5a.5.5 0 0 1 1 0v4a.5.5 0 0 1-1 0v-4Zm2-1a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0v-6Zm2-1a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7Zm2-1a.5.5 0 0 1 1 0v8a.5.5 0 0 1-1 0V9.5Zm2-1.5a.5.5 0 0 1 1 0v9.5a.5.5 0 0 1-1 0V8Zm3-1c.28 0 .5.22.5.5v10a.5.5 0 0 1-.5.5H13a.5.5 0 0 1-.5-.5V7.5a.5.5 0 0 1 .5-.5h2Zm3 2a3.5 3.5 0 0 1 0 7h-1V9c.32-.1.65-.15 1-.15.34 0 .68.05 1 .15Z"/></svg>;
    case "spotify":
      return <svg {...p}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.5 14.4a.62.62 0 0 1-.86.21c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 1 1-.28-1.22c3.81-.87 7.08-.5 9.72 1.11.3.18.39.57.21.86Zm1.2-2.67a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.17a.78.78 0 1 1-.45-1.5c3.63-1.09 8.15-.56 11.24 1.34.37.22.48.7.25 1.07Zm.1-2.78c-3.23-1.92-8.55-2.1-11.63-1.16a.94.94 0 1 1-.54-1.8c3.54-1.07 9.42-.86 13.13 1.34a.94.94 0 0 1-.96 1.62Z"/></svg>;
    case "beatport":
      return <svg {...p}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 14.5a3.5 3.5 0 0 1 0-7c.7 0 1.36.21 1.9.56l2.3-3.56 1.4.9-2.3 3.57c.44.6.7 1.34.7 2.03a3.5 3.5 0 0 1-4 3.5Zm1-2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/></svg>;
    case "instagram":
      return <svg {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
    case "tiktok":
      return <svg {...p}><path d="M16.5 2h-3v13.2a2.7 2.7 0 1 1-2-2.6V9.5a5.7 5.7 0 1 0 5 5.65V8.6a6.8 6.8 0 0 0 3.5.96V6.5a3.8 3.8 0 0 1-3.5-3.7V2Z"/></svg>;
    case "youtube":
      return <svg {...p}><path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 5 12 5 12 5s-7 0-8.9.4A3 3 0 0 0 1 7.5 31 31 0 0 0 .6 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1C5 19 12 19 12 19s7 0 8.9-.4a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-4.5 31 31 0 0 0-.4-4.5ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z"/></svg>;
    default:
      return null;
  }
};
import { useAdminData } from "../../context/AdminDataContext";
import { useUserLocation, haversineKm, formatDistance } from "../../context/LocationContext";
import { eventSlug, artistSlug } from "../../lib/slug";
import { fromPrice } from "../../lib/price";
import Navbar from "../../components/Navbar";
import StickySearchFilters from "../../components/StickySearchFilters";
import ParticleField from "../../components/ParticleField";

/* ── Small helpers ─────────────────────────────────────────────────────────── */

function Chip({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        background: accent ? "rgba(57,189,105,0.12)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${accent ? "rgba(57,189,105,0.3)" : "rgba(255,255,255,0.1)"}`,
        color: accent ? "#39BD69" : "rgba(255,255,255,0.6)",
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      {label}
    </span>
  );
}

function StreamBtn({ href, label, color, icon }: { href: string; label: string; color: string; icon: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "8px 16px", borderRadius: 8, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none",
        background: `${color}18`, border: `1px solid ${color}40`, color,
        transition: "opacity 0.15s",
      }}
    >
      <BrandIcon name={icon} size={14} /> {label}
    </a>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={14}
          fill={i <= Math.round(rating) ? "#f59e0b" : "none"}
          stroke={i <= Math.round(rating) ? "#f59e0b" : "rgba(255,255,255,0.2)"}
        />
      ))}
      <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginLeft: 4 }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function ArtistDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const slug    = String(params.slug);
  const { artists, events, loading } = useAdminData();
  const artist  = artists.find(a => artistSlug(a) === slug) ?? null;
  const { userLocation } = useUserLocation();

  const [followed, setFollowed] = useState(false);

  if (loading && !artist) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#080808]">
        <div className="w-8 h-8 rounded-full border-2 border-white/15 border-t-[#39BD69] animate-spin mb-4" />
        <p className="text-white/30 text-xs tracking-widest uppercase">Loading artist…</p>
      </main>
    );
  }

  if (!artist) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#080808]">
        <p className="text-white/40 text-sm mb-4">Artist not found.</p>
        <button onClick={() => router.push("/artists")} className="btn-outline text-xs px-8 py-3 rounded-full">
          GO BACK
        </button>
      </main>
    );
  }

  const displayName = artist.stageName || artist.name;

  /* Events this artist is performing in */
  const artistEvents = events.filter(ev =>
    ev.lineup.includes(displayName) || ev.lineup.includes(artist.name)
  );

  const hasBanner    = !!(artist.bannerImage);
  const hasStreaming = !!(artist.soundcloudUrl || artist.spotifyUrl || artist.beatportUrl);
  const hasSocial    = !!(artist.instagramUrl  || artist.tiktokUrl  || artist.youtubeUrl);
  const hasGenres    = !!(artist.genres?.length || artist.subGenres?.length);
  const hasBPM       = !!(artist.isDJ && (artist.bpmMin != null || artist.bpmMax != null));

  return (
    <main className="bg-[#080808] relative" style={{ height: "100dvh", overflowY: "auto" }}>
      <ParticleField />
      <Navbar />

      <div className="pt-16 relative z-10">
        <StickySearchFilters />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/45 text-xs tracking-widest uppercase mb-8 hover:text-white transition-colors group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Artists
          </button>

          {/* ── HERO BANNER ─────────────────────────────────────────────── */}
          <div
            className="w-full rounded-3xl overflow-hidden relative mb-10"
            style={{
              height: 420,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Background = banner image from admin (falls back to profile photo) */}
            <img
              src={hasBanner ? artist.bannerImage : artist.image}
              alt={`${displayName} banner`}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.55) 45%, rgba(8,8,8,0.25) 100%)" }} />
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 70% 40%, rgba(57,189,105,0.08) 0%, transparent 60%)" }} />

            {/* Top row */}
            <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
              <span
                className="text-[9px] font-bold tracking-[0.35em] uppercase px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}
              >
                {artist.role}
              </span>
              <button
                onClick={() => setFollowed(f => !f)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
                style={{
                  background: followed ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.55)",
                  border: followed ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  backdropFilter: "blur(10px)",
                  boxShadow: followed ? "0 0 20px rgba(239,68,68,0.3)" : "none",
                }}
              >
                <Heart size={12} strokeWidth={2.5} fill={followed ? "#fff" : "none"} />
                {followed ? "Following" : "Follow Artist"}
              </button>
            </div>

            {/* Bottom info — profile photo avatar beside the name */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between gap-6">
              <div className="flex items-end gap-5 min-w-0">
                {/* Profile photo inside the banner */}
                <div
                  className="flex-shrink-0 rounded-2xl overflow-hidden"
                  style={{
                    width: 130, height: 130,
                    border: "3px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                  }}
                >
                  <img
                    src={artist.image}
                    alt={displayName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="min-w-0 pb-1">
                  <p className="text-white/35 text-[10px] font-bold tracking-[0.45em] uppercase mb-2">ARTIST</p>
                  <h1 className="text-white font-black text-4xl lg:text-5xl uppercase tracking-tight leading-none mb-2">
                    {displayName}
                  </h1>
                  {artist.city && (
                    <p className="flex items-center gap-1.5 text-white/40 text-xs mb-2">
                      <MapPin size={11} /> {artist.city}
                      {artist.touringRegion && <span className="text-white/25"> · {artist.touringRegion}</span>}
                    </p>
                  )}
                  {artist.rating != null && artist.rating > 0 && (
                    <div><StarRating rating={artist.rating} /></div>
                  )}
                </div>
              </div>

              {artistEvents.length > 0 && (
                <div
                  className="flex-shrink-0 text-center px-6 py-4 rounded-2xl hidden sm:block"
                  style={{ background: "rgba(57,189,105,0.1)", border: "1px solid rgba(57,189,105,0.2)", backdropFilter: "blur(10px)" }}
                >
                  <Music2 size={18} className="text-[#39BD69] mx-auto mb-1" />
                  <p className="text-white font-black text-3xl leading-none">{artistEvents.length}</p>
                  <p className="text-white/40 text-[9px] tracking-[0.3em] uppercase mt-1">
                    Upcoming {artistEvents.length === 1 ? "Event" : "Events"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── CONTENT ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">

            {/* Left column */}
            <div className="lg:col-span-2 flex flex-col gap-8">

              {/* About */}
              <div>
                <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-3">ABOUT THE ARTIST</p>
                <p className="text-white/65 text-sm leading-relaxed">{artist.bio}</p>
              </div>

              {/* Genres & Sub-genres */}
              {hasGenres && (
                <div>
                  <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-3">GENRES</p>
                  <div>
                    {(artist.genres ?? []).map(g => <Chip key={g} label={g} accent />)}
                    {(artist.subGenres ?? []).map(g => <Chip key={g} label={g} />)}
                  </div>
                </div>
              )}

              {/* BPM Range */}
              {hasBPM && (
                <div
                  className="rounded-2xl p-4 flex items-center gap-6"
                  style={{ background: "rgba(57,189,105,0.06)", border: "1px solid rgba(57,189,105,0.15)" }}
                >
                  <div>
                    <p className="text-white/30 text-[9px] tracking-[0.25em] uppercase mb-1">BPM Range</p>
                    <p className="text-[#39BD69] font-black text-2xl">
                      {artist.bpmMin ?? "?"} – {artist.bpmMax ?? "?"}
                    </p>
                  </div>
                  <p className="text-white/25 text-xs">Typical set tempo for DJ performances</p>
                </div>
              )}

              {/* Streaming Links */}
              {hasStreaming && (
                <div>
                  <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-3">STREAMING</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {artist.soundcloudUrl && <StreamBtn href={artist.soundcloudUrl} label="SoundCloud" color="#ff5500" icon="soundcloud" />}
                    {artist.spotifyUrl    && <StreamBtn href={artist.spotifyUrl}    label="Spotify"    color="#1DB954" icon="spotify" />}
                    {artist.beatportUrl   && <StreamBtn href={artist.beatportUrl}   label="Beatport"   color="#00c4a3" icon="beatport" />}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {hasSocial && (
                <div>
                  <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-3">SOCIAL</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {artist.instagramUrl && <StreamBtn href={artist.instagramUrl} label="Instagram" color="#e1306c" icon="instagram" />}
                    {artist.tiktokUrl    && <StreamBtn href={artist.tiktokUrl}    label="TikTok"    color="#69c9d0" icon="tiktok" />}
                    {artist.youtubeUrl   && <StreamBtn href={artist.youtubeUrl}   label="YouTube"   color="#ff0000" icon="youtube" />}
                  </div>
                </div>
              )}

              {/* Booking Contact */}
              {artist.bookingContact && (
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <p className="text-white/30 text-[9px] font-bold tracking-[0.3em] uppercase mb-3">BOOK THIS ARTIST</p>
                  <div className="flex items-center gap-3">
                    <div
                      style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(57,189,105,0.12)", border: "1px solid rgba(57,189,105,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Mail size={15} style={{ color: "#39BD69" }} />
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Booking Contact</p>
                      <p className="text-white/85 text-sm font-semibold">{artist.bookingContact}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Similar Artists */}
              {(artist.similarArtists ?? []).length > 0 && (
                <div>
                  <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-3">SIMILAR ARTISTS</p>
                  <div>
                    {(artist.similarArtists ?? []).map(name => (
                      <button
                        key={name}
                        onClick={() => router.push(`/artists?q=${encodeURIComponent(name)}`)}
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: 99,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.55)",
                          marginRight: 6,
                          marginBottom: 6,
                          cursor: "pointer",
                          transition: "color 0.15s, border-color 0.15s",
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)";
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Performing At */}
              {artistEvents.length > 0 && (
                <div>
                  <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-4">PERFORMING AT</p>
                  <div className="flex flex-col gap-3">
                    {artistEvents.map(event => {
                      const distance = userLocation
                        ? haversineKm(userLocation.lat, userLocation.lon, event.lat, event.lon)
                        : null;
                      return (
                        <div
                          key={event.id}
                          onClick={() => router.push(`/events/${eventSlug(event)}`)}
                          className="flex items-center gap-4 rounded-2xl p-4 cursor-pointer group transition-all duration-200"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLDivElement).style.background   = "rgba(57,189,105,0.05)";
                            (e.currentTarget as HTMLDivElement).style.borderColor  = "rgba(57,189,105,0.2)";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.background   = "rgba(255,255,255,0.03)";
                            (e.currentTarget as HTMLDivElement).style.borderColor  = "rgba(255,255,255,0.07)";
                          }}
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover object-top" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#39BD69] text-[8px] font-bold tracking-[0.3em] uppercase mb-0.5">{event.tag}</p>
                            <h3 className="text-white font-black text-sm uppercase tracking-wide leading-tight mb-1 truncate">{event.title}</h3>
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-1 text-white/35 text-[10px]">
                                <Calendar size={9} className="text-white/25" /> {event.date}
                              </div>
                              <div className="flex items-center gap-1 text-white/35 text-[10px]">
                                <MapPin size={9} className="text-white/25" /> {event.location}
                              </div>
                              {distance !== null && (
                                <span className="text-[#39BD69] text-[10px] font-semibold">{formatDistance(distance)}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-white/50 text-[11px] font-semibold mb-1">{fromPrice(event.tickets, event.price)}</p>
                            <ArrowRight size={14} className="text-white/25 group-hover:text-[#39BD69] group-hover:translate-x-0.5 transition-all duration-200 ml-auto" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {artistEvents.length === 0 && (
                <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-white/25 text-sm">No upcoming events scheduled.</p>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="flex flex-col gap-4">

              {/* Artist Info card */}
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {/* Profile photo + name */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="flex-shrink-0 rounded-xl overflow-hidden"
                    style={{ width: 52, height: 52, border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <img src={artist.image} alt={displayName} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">{displayName}</p>
                    <p className="text-white/35 text-[10px] uppercase tracking-wider truncate">{artist.role}</p>
                  </div>
                </div>
                <p className="text-white/30 text-[9px] font-bold tracking-[0.35em] uppercase mb-4">ARTIST INFO</p>
                <div className="flex flex-col gap-3">

                  <div>
                    <p className="text-white/30 text-[8px] tracking-[0.25em] uppercase mb-0.5">Genre / Style</p>
                    <p className="text-white/80 text-xs font-semibold">{artist.role}</p>
                  </div>

                  {artist.city && (
                    <>
                      <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                      <div>
                        <p className="text-white/30 text-[8px] tracking-[0.25em] uppercase mb-0.5">Based In</p>
                        <p className="text-white/80 text-xs font-semibold">{artist.city}</p>
                      </div>
                    </>
                  )}

                  {artist.touringRegion && (
                    <>
                      <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                      <div>
                        <p className="text-white/30 text-[8px] tracking-[0.25em] uppercase mb-0.5">Touring Region</p>
                        <p className="text-white/80 text-xs font-semibold">{artist.touringRegion}</p>
                      </div>
                    </>
                  )}

                  {hasBPM && (
                    <>
                      <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                      <div>
                        <p className="text-white/30 text-[8px] tracking-[0.25em] uppercase mb-0.5">BPM Range</p>
                        <p className="text-[#39BD69] text-xs font-bold">{artist.bpmMin} – {artist.bpmMax} BPM</p>
                      </div>
                    </>
                  )}

                  {artist.rating != null && artist.rating > 0 && (
                    <>
                      <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                      <div>
                        <p className="text-white/30 text-[8px] tracking-[0.25em] uppercase mb-1">Rating</p>
                        <StarRating rating={artist.rating} />
                      </div>
                    </>
                  )}

                  <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <div>
                    <p className="text-white/30 text-[8px] tracking-[0.25em] uppercase mb-0.5">Upcoming Events</p>
                    <p className="text-white/80 text-xs font-semibold">
                      {artistEvents.length > 0 ? `${artistEvents.length} event${artistEvents.length !== 1 ? "s" : ""}` : "None scheduled"}
                    </p>
                  </div>

                  <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <div>
                    <p className="text-white/30 text-[8px] tracking-[0.25em] uppercase mb-1">Follow for Updates</p>
                    <button
                      onClick={() => setFollowed(f => !f)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200"
                      style={{
                        background: followed ? "rgba(239,68,68,0.15)" : "rgba(57,189,105,0.1)",
                        border: followed ? "1px solid rgba(239,68,68,0.35)" : "1px solid rgba(57,189,105,0.3)",
                        color: followed ? "#f87171" : "#39BD69",
                      }}
                    >
                      <Heart size={11} strokeWidth={2.5} fill={followed ? "currentColor" : "none"} />
                      {followed ? "Following" : "Follow Artist"}
                    </button>
                  </div>
                </div>
              </div>

              {/* View all artists */}
              <button
                onClick={() => router.push("/artists")}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs tracking-widest uppercase transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.45)" }}
              >
                VIEW ALL ARTISTS
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
