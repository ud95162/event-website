"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MapPin, Calendar, Ticket, Heart, Share2, ChevronLeft, ShieldAlert, Users, Building2, ExternalLink, Play } from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import { useUserLocation, haversineKm, formatDistance } from "../../context/LocationContext";
import { slugify, eventSlug, artistSlug, organizerSlug } from "../../lib/slug";
import { track } from "../../lib/track";
import { statusColor } from "../../data/events";
import Navbar from "../../components/Navbar";
import StickySearchFilters from "../../components/StickySearchFilters";
import ParticleField from "../../components/ParticleField";

export default function EventDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const slug     = String(params.slug);
  const { events, artists, organizers, loading } = useAdminData();
  const event    = events.find(e => eventSlug(e) === slug) ?? null;
  const { userLocation } = useUserLocation();

  const [liked,  setLiked]  = useState(false);
  const [shared, setShared] = useState(false);

  // Track a page view once per event load.
  useEffect(() => {
    if (event?.id) track("event", event.id, "view");
  }, [event?.id]);

  if (loading && !event) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#080808]">
        <div className="w-8 h-8 rounded-full border-2 border-white/15 border-t-[#39BD69] animate-spin mb-4" />
        <p className="text-white/30 text-xs tracking-widest uppercase">Loading event…</p>
      </main>
    );
  }

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

  // Google Maps: use coordinates if set, else search by venue/location text.
  const mapQuery = (event.lat && event.lon)
    ? `${event.lat},${event.lon}`
    : [event.venue, event.location].filter(Boolean).join(", ");
  const mapUrl   = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  const mapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;

  // Human-readable date/time, with optional end date/time.
  const whenText = (() => {
    let s = event.date;
    if (event.startTime) s += ` · ${event.startTime}`;
    if (event.endDate && event.endDate !== event.date) {
      s += ` → ${event.endDate}`;
      if (event.endTime) s += ` ${event.endTime}`;
    } else if (event.endTime) {
      s += ` – ${event.endTime}`;
    }
    return s;
  })();

  // Video trailer embed: detect YouTube / Vimeo, else treat as a direct video file.
  const trailer = (event.videoTrailer || "").trim();
  const ytMatch = trailer.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  const vimeoMatch = trailer.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const trailerEmbed = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}`
    : vimeoMatch ? `https://player.vimeo.com/video/${vimeoMatch[1]}`
    : "";

  // Co-organizers resolved to organizer records (for logo + link).
  const coOrgs = (event.coOrganizers ?? [])
    .map(name => organizers.find(o => o.name === name))
    .filter(Boolean) as typeof organizers;

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

                {/* Status */}
                {event.status && (
                  <div className="mb-5 -mt-2">
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full tracking-[0.18em] uppercase"
                      style={{ background: `${statusColor(event.status)}22`, color: statusColor(event.status), border: `1px solid ${statusColor(event.status)}66` }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor(event.status) }} />
                      {event.status}
                    </span>
                  </div>
                )}

                {/* Meta rows */}
                <div className="flex flex-col gap-2.5 mb-6">
                  {[
                    { Icon: Calendar, label: "WHEN",  value: whenText },
                    { Icon: MapPin,   label: "VENUE", value: event.location },
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

                {/* Ticket types */}
                {(event.tickets ?? []).filter(t => t.name || t.price).length > 0 && (
                  <div className="mb-6">
                    <p className="text-white/30 text-[8px] tracking-[0.35em] uppercase mb-2.5">TICKETS</p>
                    <div className="flex flex-col gap-2">
                      {(event.tickets ?? []).filter(t => t.name || t.price).map((t, i) => (
                        <div
                          key={i}
                          className="rounded-xl px-3.5 py-2.5"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Ticket size={12} className="text-[#39BD69] flex-shrink-0" />
                              <span className="text-white/85 text-xs font-semibold truncate">{t.name || "Ticket"}</span>
                            </div>
                            <span className="text-[#39BD69] text-xs font-bold flex-shrink-0 ml-3">{/^[\d,]+$/.test(t.price) ? `LKR ${t.price}` : t.price}</span>
                          </div>
                          {t.desc && <p className="text-white/40 text-[10px] leading-snug mt-1.5 pl-[22px]">{t.desc}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

              {/* Genres */}
              {event.genres.length > 0 && (
                <div>
                  <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-3">GENRES</p>
                  <div className="flex flex-wrap gap-2">
                    {event.genres.map(g => (
                      <span
                        key={g}
                        className="text-[10px] font-bold tracking-wide uppercase px-3 py-1.5 rounded-full"
                        style={{ background: "rgba(57,189,105,0.1)", border: "1px solid rgba(57,189,105,0.25)", color: "#39BD69" }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Event info — age, capacity, setting */}
              {(event.ageRestriction || event.capacity || event.venueType || event.externalLink) && (
                <div>
                  <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-3">EVENT INFO</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {event.ageRestriction && (
                      <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <p className="flex items-center gap-1.5 text-white/30 text-[8px] tracking-[0.25em] uppercase mb-1"><ShieldAlert size={11} className="text-[#39BD69]" /> Age</p>
                        <p className="text-white/85 text-sm font-semibold">{event.ageRestriction}</p>
                      </div>
                    )}
                    {event.capacity != null && event.capacity > 0 && (
                      <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <p className="flex items-center gap-1.5 text-white/30 text-[8px] tracking-[0.25em] uppercase mb-1"><Users size={11} className="text-[#39BD69]" /> Capacity</p>
                        <p className="text-white/85 text-sm font-semibold">{event.capacity.toLocaleString()} max</p>
                      </div>
                    )}
                    {event.venueType && (
                      <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <p className="flex items-center gap-1.5 text-white/30 text-[8px] tracking-[0.25em] uppercase mb-1"><Building2 size={11} className="text-[#39BD69]" /> Setting</p>
                        <p className="text-white/85 text-sm font-semibold">{event.venueType}</p>
                      </div>
                    )}
                  </div>
                  {event.externalLink && (
                    <a
                      href={event.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track("event", event.id, "link_click")}
                      className="inline-flex items-center gap-2 mt-4 py-2.5 px-4 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-all"
                      style={{ background: "rgba(57,189,105,0.1)", border: "1px solid rgba(57,189,105,0.3)", color: "#39BD69" }}
                    >
                      <ExternalLink size={13} /> Event Website / More Info
                    </a>
                  )}
                </div>
              )}

              {/* Video trailer */}
              {trailer && (
                <div>
                  <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-4 flex items-center gap-1.5"><Play size={11} /> TRAILER</p>
                  <div className="rounded-2xl overflow-hidden w-full" style={{ aspectRatio: "16 / 9", border: "1px solid rgba(255,255,255,0.1)", background: "#000" }}>
                    {trailerEmbed ? (
                      <iframe src={trailerEmbed} title="Event trailer" width="100%" height="100%" style={{ border: 0 }} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
                    ) : (
                      <video src={trailer} controls playsInline className="w-full h-full object-contain" />
                    )}
                  </div>
                </div>
              )}

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
                className="rounded-2xl p-5 block group transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  onMouseEnter={e => { (e.currentTarget.closest('div') as HTMLElement).style.borderColor = "rgba(57,189,105,0.35)"; }}
                  onMouseLeave={e => { (e.currentTarget.closest('div') as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <p className="text-white/30 text-[9px] font-bold tracking-[0.35em] uppercase mb-2">VENUE</p>
                  <p className="text-white font-semibold text-sm leading-snug mb-1">{event.location}</p>
                  <p className="text-white/45 text-xs leading-relaxed mb-3">{event.venue}</p>
                </a>

                {/* Embedded map preview */}
                <div className="rounded-xl overflow-hidden mb-3" style={{ border: "1px solid rgba(255,255,255,0.1)", height: 170 }}>
                  <iframe
                    title={`Map of ${event.venue || event.location}`}
                    src={mapEmbed}
                    width="100%"
                    height="100%"
                    loading="lazy"
                    style={{ border: 0, filter: "grayscale(0.15) contrast(1.05)" }}
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#39BD69] hover:gap-2.5 transition-all"
                >
                  <MapPin size={11} /> Open in Google Maps
                </a>
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

              {/* Co-organizers */}
              {coOrgs.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-white/30 text-[9px] font-bold tracking-[0.35em] uppercase mb-3">CO-HOSTED BY</p>
                  <div className="flex flex-col gap-2.5">
                    {coOrgs.map(co => (
                      <div
                        key={co.id}
                        onClick={() => router.push(`/organizers/${organizerSlug(co)}`)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center" style={{ width: 34, height: 34, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)" }}>
                          {co.logo ? <img src={co.logo} alt={co.name} className="w-full h-full object-cover" /> : <span style={{ fontSize: 13, fontWeight: 800, color: "#39BD69" }}>{co.name.charAt(0)}</span>}
                        </div>
                        <p className="text-white/80 text-xs font-semibold truncate group-hover:text-[#39BD69] transition-colors">{co.name}</p>
                      </div>
                    ))}
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
