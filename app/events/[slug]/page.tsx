"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, Calendar, Ticket, Heart, Share2, ChevronLeft } from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import { useUserLocation, haversineKm, formatDistance } from "../../context/LocationContext";
import { slugify, eventSlug, artistSlug, organizerSlug } from "../../lib/slug";
import Navbar from "../../components/Navbar";
import StickySearchFilters from "../../components/StickySearchFilters";
import ParticleField from "../../components/ParticleField";

export default function EventDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const slug     = String(params.slug);
  const { events, artists, organizers } = useAdminData();
  const event    = events.find(e => eventSlug(e) === slug) ?? null;
  const { userLocation } = useUserLocation();

  const [liked,  setLiked]  = useState(false);
  const [shared, setShared] = useState(false);

  if (!event) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#080808]">
        <p className="text-white/40 text-sm mb-4">Event not found.</p>
        <button onClick={() => router.push("/")} className="btn-outline text-xs px-8 py-3 rounded-full">
          GO HOME
        </button>
      </main>
    );
  }

  const distance = userLocation
    ? haversineKm(userLocation.lat, userLocation.lon, event.lat, event.lon)
    : null;

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: event.title, url: window.location.href });
    else navigator.clipboard?.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 1500);
  };

  const lineupArtists = event.lineup
    .map(name => artists.find(a => (a.stageName || a.name) === name || a.name === name))
    .filter(Boolean) as typeof artists;

  const organizer = organizers.find(o => o.name === event.organizer);

  return (
    <main className="bg-[#080808] relative" style={{ height: "100dvh", overflowY: "auto" }}>
      <ParticleField />
      <Navbar />
      <div className="pt-16 relative z-10">
        <StickySearchFilters />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Back button ───────────────────────────────────────────── */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/45 text-xs tracking-widest uppercase mb-8 hover:text-white transition-colors group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Events
          </button>

          {/* ══════════════════════════════════════════════════════════════
              TICKET STUB BANNER
             ══════════════════════════════════════════════════════════════ */}
          <div
            className="w-full flex rounded-3xl overflow-hidden relative"
            style={{
              background: "#0d0d1f",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              minHeight: 420,
              maxHeight: 520,
            }}
          >
            {/* ── Left: Image ─────────────────────────────────────────── */}
            <div className="relative w-[58%] flex-shrink-0">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover object-center"
                style={{ minHeight: 420, maxHeight: 520 }}
              />
              {/* Right-side fade into ticket panel */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to right, transparent 50%, #0d0d1f 100%)" }}
              />
              {/* Bottom fade */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(13,13,31,0.7) 0%, transparent 50%)" }}
              />

              {/* Badge */}
              {event.badge && (
                <div className="absolute top-5 left-5">
                  <span className="bg-white text-black text-[9px] font-black px-3 py-1.5 rounded-full tracking-[0.2em] uppercase">
                    {event.badge}
                  </span>
                </div>
              )}

              {/* Tag bottom-left */}
              <div className="absolute bottom-5 left-5">
                <span
                  className="text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }}
                >
                  {event.tag}
                </span>
              </div>
            </div>

            {/* ── Perforated tear ─────────────────────────────────────── */}
            <div className="relative flex-shrink-0 w-10 flex flex-col items-center justify-center">
              {/* Top semicircle notch */}
              <div
                className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-4 rounded-b-full"
                style={{ background: "#080808" }}
              />
              {/* Dashed line */}
              <div
                className="h-full w-px"
                style={{
                  backgroundImage: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 8px, transparent 8px, transparent 16px)",
                }}
              />
              {/* Bottom semicircle notch */}
              <div
                className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-4 rounded-t-full"
                style={{ background: "#080808" }}
              />
            </div>

            {/* ── Right: Ticket panel ─────────────────────────────────── */}
            <div className="flex-1 flex flex-col justify-between p-8">

              {/* Top: title + actions */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-5">
                  <h1 className="text-white font-black text-3xl lg:text-4xl uppercase tracking-tight leading-tight">
                    {event.title}
                  </h1>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setLiked(l => !l)}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{
                        background: liked ? "rgba(239,68,68,0.9)" : "rgba(255,255,255,0.06)",
                        border: liked ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <Heart size={13} fill={liked ? "#fff" : "none"} className="text-white" />
                    </button>
                    <button
                      onClick={handleShare}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{
                        background: shared ? "rgba(57,189,105,0.85)" : "rgba(255,255,255,0.06)",
                        border: shared ? "1px solid rgba(57,189,105,0.5)" : "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <Share2 size={13} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Meta rows */}
                <div className="flex flex-col gap-2.5 mb-6">
                  {[
                    { Icon: Calendar, label: "DATE",     value: event.date },
                    { Icon: MapPin,   label: "VENUE",    value: event.location },
                    { Icon: Ticket,   label: "PRICE",    value: event.price.replace("Starting from ", "") },
                  ].map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(57,189,105,0.12)", border: "1px solid rgba(57,189,105,0.2)" }}
                      >
                        <Icon size={11} className="text-[#39BD69]" />
                      </div>
                      <div>
                        <p className="text-white/30 text-[8px] tracking-[0.3em] uppercase leading-none mb-0.5">{label}</p>
                        <p className="text-white/80 text-xs font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
                  {distance !== null && (
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin size={10} className="text-[#39BD69]" />
                      <span className="text-[#39BD69] text-[11px] font-semibold">{formatDistance(distance)}</span>
                    </div>
                  )}
                </div>

                {/* Performing artists — names only */}
                <div>
                  <p className="text-white/30 text-[8px] tracking-[0.35em] uppercase mb-2">PERFORMING ARTISTS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {lineupArtists.map(artist => (
                      <span
                        key={artist.id}
                        className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide"
                        style={{ background: "rgba(57,189,105,0.1)", border: "1px solid rgba(57,189,105,0.25)", color: "#39BD69" }}
                      >
                        {artist.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              DETAILS BELOW
             ══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 pb-20">

            {/* Description */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div>
                <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-3">ABOUT THIS EVENT</p>
                <p className="text-white/65 text-sm leading-relaxed">{event.description}</p>
              </div>

              {/* Participating artists */}
              <div>
                <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-4">PARTICIPATING ARTISTS</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {lineupArtists.map(artist => (
                    <div
                      key={artist.id}
                      onClick={() => router.push(`/artists/${artistSlug(artist)}`)}
                      className="relative rounded-2xl overflow-hidden group cursor-pointer"
                      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <div className="relative w-full overflow-hidden" style={{ height: 200 }}>
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                        <div
                          className="absolute inset-0"
                          style={{ background: "linear-gradient(to top, #080808 0%, rgba(8,8,8,0.3) 55%, transparent 100%)" }}
                        />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(57,189,105,0.15) 0%, transparent 70%)" }}
                        />
                      </div>
                      <div className="px-3 pb-3 pt-2 text-center">
                        <p className="text-white/30 text-[8px] font-bold tracking-[0.3em] uppercase mb-0.5">{artist.role}</p>
                        <h3 className="text-white font-black text-xs uppercase tracking-wide">{artist.name}</h3>
                        <div className="flex justify-center mt-2">
                          <div className="h-[2px] w-8 rounded-full" style={{ background: "#39BD69" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Venue + view all */}
            <div className="flex flex-col gap-4">
              <div
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-white/30 text-[9px] font-bold tracking-[0.35em] uppercase mb-2">VENUE</p>
                <p className="text-white font-semibold text-sm leading-snug mb-1">{event.location}</p>
                <p className="text-white/45 text-xs leading-relaxed">{event.venue}</p>
              </div>

              {/* Organized By */}
              {organizer && (
                <div
                  onClick={() => router.push(`/organizers/${organizerSlug(organizer)}`)}
                  className="rounded-2xl p-5 cursor-pointer group transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(57,189,105,0.35)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <p className="text-white/30 text-[9px] font-bold tracking-[0.35em] uppercase mb-3">ORGANIZED BY</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
                      style={{ width: 44, height: 44, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)" }}
                    >
                      {organizer.logo ? (
                        <img src={organizer.logo} alt={organizer.name} className="w-full h-full object-cover" />
                      ) : (
                        <span style={{ fontSize: 18, fontWeight: 900, color: "#39BD69" }}>{organizer.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold text-sm leading-snug truncate group-hover:text-[#39BD69] transition-colors">{organizer.name}</p>
                      <p className="text-white/35 text-[10px] tracking-wide uppercase mt-0.5">View organizer →</p>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={() => router.push("/#events")}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs tracking-widest uppercase transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.45)" }}
              >
                VIEW ALL EVENTS
              </button>
            </div>
          </div>


        </div>
      </div>
    </main>
  );
}
