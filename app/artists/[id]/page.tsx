"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, ChevronLeft, MapPin, Calendar, Ticket, Music2, ArrowRight } from "lucide-react";
import { getArtistById } from "../../data/artists";
import { events } from "../../data/events";
import { useUserLocation, haversineKm, formatDistance } from "../../context/LocationContext";
import Navbar from "../../components/Navbar";
import StickySearchFilters from "../../components/StickySearchFilters";
import ParticleField from "../../components/ParticleField";

export default function ArtistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id     = Number(params.id);
  const artist = getArtistById(id);
  const { userLocation } = useUserLocation();

  const [followed, setFollowed] = useState(false);

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

  /* Events this artist is performing in */
  const artistEvents = events.filter(ev => ev.lineup.includes(artist.name));

  return (
    <main className="min-h-screen bg-[#080808] relative">
      <ParticleField />
      <Navbar />

      <div className="pt-16 relative z-10">
        <StickySearchFilters />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Back button ────────────────────────────────────────────── */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/45 text-xs tracking-widest uppercase mb-8 hover:text-white transition-colors group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Artists
          </button>

          {/* ══════════════════════════════════════════════════════════════
              HERO BANNER
             ══════════════════════════════════════════════════════════════ */}
          <div
            className="w-full rounded-3xl overflow-hidden relative mb-10"
            style={{
              height: 460,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Background image */}
            <img
              src={artist.image}
              alt={artist.name}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />

            {/* Overlays */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.4) 50%, transparent 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,8,8,0.5) 0%, transparent 60%)" }} />

            {/* Green glow behind artist */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 70% 40%, rgba(57,189,105,0.08) 0%, transparent 60%)" }}
            />

            {/* Top actions */}
            <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
              {/* Role pill */}
              <span
                className="text-[9px] font-bold tracking-[0.35em] uppercase px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}
              >
                {artist.role}
              </span>

              {/* Follow button */}
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

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
              <div>
                <p className="text-white/35 text-[10px] font-bold tracking-[0.45em] uppercase mb-2">ARTIST</p>
                <h1 className="text-white font-black text-4xl lg:text-5xl uppercase tracking-tight leading-none mb-3">
                  {artist.name}
                </h1>
                <p className="text-white/50 text-sm leading-relaxed max-w-lg">{artist.bio}</p>
              </div>

              {/* Event count stat */}
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

          {/* ══════════════════════════════════════════════════════════════
              CONTENT BELOW
             ══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">

            {/* ── Left: About + events ─────────────────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-8">

              {/* About */}
              <div>
                <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-3">ABOUT THE ARTIST</p>
                <p className="text-white/65 text-sm leading-relaxed">{artist.bio}</p>
              </div>

              {/* Performing at */}
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
                          onClick={() => router.push(`/events/${event.id}`)}
                          className="flex items-center gap-4 rounded-2xl p-4 cursor-pointer group transition-all duration-200"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)",
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLDivElement).style.background    = "rgba(57,189,105,0.05)";
                            (e.currentTarget as HTMLDivElement).style.borderColor   = "rgba(57,189,105,0.2)";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.background    = "rgba(255,255,255,0.03)";
                            (e.currentTarget as HTMLDivElement).style.borderColor   = "rgba(255,255,255,0.07)";
                          }}
                        >
                          {/* Event thumbnail */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover object-top" />
                          </div>

                          {/* Event info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[#39BD69] text-[8px] font-bold tracking-[0.3em] uppercase mb-0.5">{event.tag}</p>
                            <h3 className="text-white font-black text-sm uppercase tracking-wide leading-tight mb-1 truncate">
                              {event.title}
                            </h3>
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-1 text-white/35 text-[10px]">
                                <Calendar size={9} className="text-white/25" />
                                {event.date}
                              </div>
                              <div className="flex items-center gap-1 text-white/35 text-[10px]">
                                <MapPin size={9} className="text-white/25" />
                                {event.location}
                              </div>
                              {distance !== null && (
                                <span className="text-[#39BD69] text-[10px] font-semibold">
                                  {formatDistance(distance)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price + arrow */}
                          <div className="flex-shrink-0 text-right">
                            <p className="text-white/50 text-[11px] font-semibold mb-1">
                              {event.price.replace("Starting from ", "")}
                            </p>
                            <ArrowRight
                              size={14}
                              className="text-white/25 group-hover:text-[#39BD69] group-hover:translate-x-0.5 transition-all duration-200 ml-auto"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {artistEvents.length === 0 && (
                <div
                  className="rounded-2xl p-6 text-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <p className="text-white/25 text-sm">No upcoming events scheduled.</p>
                </div>
              )}
            </div>

            {/* ── Right: Quick stats + back button ─────────────────────── */}
            <div className="flex flex-col gap-4">

              {/* Stats card */}
              <div
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-white/30 text-[9px] font-bold tracking-[0.35em] uppercase mb-4">ARTIST INFO</p>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-white/30 text-[8px] tracking-[0.25em] uppercase mb-0.5">Genre / Style</p>
                    <p className="text-white/80 text-xs font-semibold">{artist.role}</p>
                  </div>
                  <div
                    className="h-px"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                  <div>
                    <p className="text-white/30 text-[8px] tracking-[0.25em] uppercase mb-0.5">Upcoming Events</p>
                    <p className="text-white/80 text-xs font-semibold">
                      {artistEvents.length > 0 ? `${artistEvents.length} event${artistEvents.length !== 1 ? "s" : ""}` : "None scheduled"}
                    </p>
                  </div>
                  <div
                    className="h-px"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
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
