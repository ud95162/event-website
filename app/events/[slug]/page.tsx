"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { MapPin, Calendar, Ticket, Heart, Share2, ChevronLeft, ShieldAlert, Users, Building2, ExternalLink, Clock, CheckCircle2, Radio, Volume2, VolumeX, Mail, Link2, Check } from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import { useUserLocation, haversineKm, formatDistance } from "../../context/LocationContext";
import { artistSlug, organizerSlug } from "../../lib/slug";
import { track } from "../../lib/track";
import { statusColor, Event } from "../../data/events";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import StickySearchFilters from "../../components/StickySearchFilters";
import ParticleField from "../../components/ParticleField";

// Build a Google Calendar "create event" link pre-filled from the event. Dates are sent
// as naive wall-clock times with ctz=Asia/Colombo so they land correctly in any viewer's
// calendar. Events without a start time are added as all-day.
function buildGoogleCalUrl(ev: {
  title: string; date: string; startTime?: string; endDate?: string; endTime?: string;
  venue?: string; location?: string; description?: string;
}): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date, withTime: boolean) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    (withTime ? `T${pad(d.getHours())}${pad(d.getMinutes())}00` : "");
  const parse = (dateStr: string, timeStr?: string): Date | null => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    if (timeStr) { const [h, m] = timeStr.split(":").map(Number); d.setHours(h || 0, m || 0, 0, 0); }
    else d.setHours(0, 0, 0, 0);
    return d;
  };

  const start = parse(ev.date, ev.startTime);
  const hasTime = !!ev.startTime;
  let dates = "";
  if (start) {
    if (hasTime) {
      let end = parse(ev.endDate || ev.date, ev.endTime || ev.startTime);
      if (!end || end <= start) end = new Date(start.getTime() + 3 * 3600 * 1000);
      dates = `${fmt(start, true)}/${fmt(end, true)}`;
    } else {
      // All-day: Google treats the end date as exclusive, so add a day.
      const base = parse(ev.endDate || ev.date) || start;
      const endDay = new Date(base.getTime() + 24 * 3600 * 1000);
      dates = `${fmt(start, false)}/${fmt(endDay, false)}`;
    }
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    details: ev.description || "",
    location: [ev.venue, ev.location].filter(Boolean).join(", "),
    ctz: "Asia/Colombo",
  });
  if (dates) params.set("dates", dates);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* Small brand icons for the share menu (lucide dropped brand glyphs). */
const IgWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"/><path d="M12.04 2A9.94 9.94 0 0 0 2.1 11.94c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.78 1.22h.01A9.94 9.94 0 0 0 22 11.94 9.94 9.94 0 0 0 12.04 2zm0 18.1h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38 8.26 8.26 0 0 1 8.25-8.24 8.25 8.25 0 0 1 8.24 8.25 8.26 8.26 0 0 1-8.25 8.24z"/></svg>
);
const IgFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const IgX = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

export default function EventDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const slug     = String(params.slug);
  // Lineup artists and organizers still come from context; the event itself is fetched
  // by slug so this page never loads the whole events table just to find one.
  const { artists, organizers } = useAdminData();
  const { userLocation } = useUserLocation();

  const [event,   setEvent]   = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked,  setLiked]  = useState(false);
  const [shared, setShared] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Close the share menu on any outside click.
  useEffect(() => {
    if (!shareOpen) return;
    const close = () => setShareOpen(false);
    const t = setTimeout(() => document.addEventListener("click", close), 0);
    return () => { clearTimeout(t); document.removeEventListener("click", close); };
  }, [shareOpen]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/events/by-slug/${encodeURIComponent(slug)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!cancelled) setEvent(d && d.id ? (d as Event) : null); })
      .catch(() => { if (!cancelled) setEvent(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  // Track a page view once per event load.
  useEffect(() => {
    if (event?.id) track("event", event.id, "view");
  }, [event?.id]);

  if (loading && !event) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#0F1116]">
        <div className="w-8 h-8 rounded-full border-2 border-white/15 border-t-[#ffffff] animate-spin mb-4" />
        <p className="text-white/30 text-xs tracking-widest uppercase">Loading event…</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#0F1116]">
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

  // Raw trailer URL (the media slider builds the right embed / plays the file).
  const trailer = (event.videoTrailer || "").trim();
  // Instagram reels are vertical, so the media panel needs extra height to show the
  // full video instead of the usual ~16:9 crop.
  const trailerIsInstagram = /instagram\.com\/(?:p|reel|reels|tv)\//i.test(trailer);

  // Co-organizers resolved to organizer records (for logo + link).
  const coOrgs = (event.coOrganizers ?? [])
    .map(name => organizers.find(o => o.name === name))
    .filter(Boolean) as typeof organizers;

  // Event details composed into shareable text.
  const buildShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const lines = [
      event.title,
      // Emojis built at runtime from code points via String.fromCodePoint — stays a
      // numeric call in the bundle (no multibyte bytes in the served JS), so it can't be
      // mangled into replacement characters regardless of the server's charset.
      whenText && `${String.fromCodePoint(0x1f4c5)} ${whenText}`,
      (event.venue || event.location) && `${String.fromCodePoint(0x1f4cd)} ${event.venue || event.location}`,
      (event.price || "").trim() && `${String.fromCodePoint(0x1f39f, 0xfe0f)} ${event.price}`,
    ].filter(Boolean) as string[];
    const text = lines.join("\n");
    return { url, text, full: `${text}\n\n${url}` };
  };

  const doShare = (kind: "whatsapp" | "facebook" | "x" | "email" | "copy" | "native") => {
    const { url, text, full } = buildShare();
    const enc = encodeURIComponent;
    if (kind === "copy") {
      navigator.clipboard?.writeText(full);
      setShared(true);
      setTimeout(() => setShared(false), 1500);
      setShareOpen(false);
      return;
    }
    if (kind === "native") {
      if (navigator.share) navigator.share({ title: event.title, text, url }).catch(() => {});
      setShareOpen(false);
      return;
    }
    const hrefs: Record<string, string> = {
      // api.whatsapp.com/send preserves emoji; the wa.me shortener mangles 4-byte
      // emojis into replacement characters during its redirect.
      whatsapp: `https://api.whatsapp.com/send?text=${enc(full)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      x: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
      email: `mailto:?subject=${enc(event.title)}&body=${enc(full)}`,
    };
    window.open(hrefs[kind], "_blank", "noopener,noreferrer");
    track("event", event.id, "link_click");
    setShareOpen(false);
  };

  const lineupArtists = event.lineup
    .map(name => artists.find(a => (a.stageName || a.name) === name || a.name === name))
    .filter(Boolean) as typeof artists;

  const organizer = organizers.find(o => o.name === event.organizer);

  return (
    <main className="bg-[#0F1116] relative" style={{ height: "100dvh", overflowY: "auto" }}>
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
            className="w-full flex items-stretch rounded-3xl overflow-hidden relative"
            style={{
              background: "#18181b",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* ── Left: media panel — trailer plays at exact 16:9 (YouTube size);
                   taller for vertical Instagram reels so the full video is visible ── */}
            <div
              className="relative flex-shrink-0 overflow-hidden"
              style={{ width: "62%", ...(trailerIsInstagram ? { minHeight: "min(680px, 82vh)" } : {}) }}
            >
              {/* Ambient blurred backdrop fills the whole panel behind the media */}
              <img
                src={event.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "blur(30px) brightness(0.4)", transform: "scale(1.2)" }}
              />

              {/* Flyer → (after 5s) video slider — keyed so it resets per event */}
              <EventMedia key={event.id} image={event.image} title={event.title} trailer={trailer} />

              {/* Right-side fade blends the panel edge into the ticket */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(to right, transparent 78%, #18181b 100%)" }}
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
              <div className="absolute bottom-5 left-5 z-20">
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
                style={{ background: "#0F1116" }}
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
                style={{ background: "#0F1116" }}
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
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShareOpen(o => !o); }}
                        aria-label="Share event"
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                        style={{
                          background: shareOpen || shared ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.06)",
                          border: shareOpen || shared ? "1px solid rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.12)",
                        }}
                      >
                        <Share2 size={13} className={shareOpen || shared ? "text-black" : "text-white"} />
                      </button>

                      {shareOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 50,
                            width: 210, borderRadius: 14, overflow: "hidden",
                            background: "#141418", border: "1px solid rgba(255,255,255,0.12)",
                            boxShadow: "0 24px 60px rgba(0,0,0,0.7)", padding: 6,
                            animation: "fadeInShare 0.16s ease",
                          }}
                        >
                          <style>{`@keyframes fadeInShare { from { opacity:0; transform:translateY(-6px) scale(0.98); } to { opacity:1; transform:none; } }`}</style>
                          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", padding: "6px 8px 8px" }}>Share this event</p>
                          {[
                            { key: "whatsapp", label: "WhatsApp", icon: <IgWhatsApp /> },
                            { key: "facebook", label: "Facebook", icon: <IgFacebook /> },
                            { key: "x",        label: "X (Twitter)", icon: <IgX /> },
                            { key: "email",    label: "Email", icon: <Mail size={15} /> },
                            { key: "copy",     label: shared ? "Copied!" : "Copy link", icon: shared ? <Check size={15} /> : <Link2 size={15} /> },
                          ].map(opt => (
                            <button
                              key={opt.key}
                              onClick={() => doShare(opt.key as "whatsapp" | "facebook" | "x" | "email" | "copy")}
                              style={{
                                display: "flex", alignItems: "center", gap: 11, width: "100%",
                                padding: "9px 10px", borderRadius: 9, cursor: "pointer",
                                background: "transparent", border: "none", color: "rgba(255,255,255,0.85)",
                                fontSize: 12.5, fontWeight: 600, textAlign: "left", transition: "background 0.15s",
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                            >
                              <span style={{ width: 18, display: "flex", justifyContent: "center", color: "rgba(255,255,255,0.7)" }}>{opt.icon}</span>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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

                {/* Countdown (upcoming) / Completed (past) */}
                <EventCountdown date={event.date} startTime={event.startTime} endDate={event.endDate} endTime={event.endTime} />

                {/* Meta rows */}
                <div className="flex flex-col gap-2.5 mb-6">
                  {[
                    { Icon: Calendar, label: "WHEN",  value: whenText },
                    { Icon: MapPin,   label: "VENUE", value: event.location },
                  ].map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
                      >
                        <Icon size={11} className="text-[#ffffff]" />
                      </div>
                      <div>
                        <p className="text-white/30 text-[8px] tracking-[0.3em] uppercase leading-none mb-0.5">{label}</p>
                        <p className="text-white/80 text-xs font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
                  {distance !== null && (
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin size={10} className="text-[#ffffff]" />
                      <span className="text-[#ffffff] text-[11px] font-semibold">{formatDistance(distance)}</span>
                    </div>
                  )}
                </div>

                {/* Add to Google Calendar */}
                <a
                  href={buildGoogleCalUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("event", event.id, "link_click")}
                  className="flex items-center justify-center gap-2 w-full mb-6 rounded-xl py-3 text-xs font-bold tracking-widest uppercase transition-all hover:brightness-90 active:scale-[0.98]"
                  style={{ background: "#ffffff", color: "#000" }}
                >
                  <Calendar size={14} /> Add to Calendar
                </a>

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
                              <Ticket size={12} className="text-[#ffffff] flex-shrink-0" />
                              <span className="text-white/85 text-xs font-semibold truncate">{t.name || "Ticket"}</span>
                            </div>
                            <span className="text-[#ffffff] text-xs font-bold flex-shrink-0 ml-3">{/^[\d,]+$/.test(t.price) ? `LKR ${t.price}` : t.price}</span>
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
                        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", color: "#ffffff" }}
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
                  <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-3">EVENT TYPE</p>
                  <div className="flex flex-wrap gap-2">
                    {event.genres.map(g => (
                      <span
                        key={g}
                        className="text-[10px] font-bold tracking-wide uppercase px-3 py-1.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", color: "#ffffff" }}
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
                        <p className="flex items-center gap-1.5 text-white/30 text-[8px] tracking-[0.25em] uppercase mb-1"><ShieldAlert size={11} className="text-[#ffffff]" /> Age</p>
                        <p className="text-white/85 text-sm font-semibold">{event.ageRestriction}</p>
                      </div>
                    )}
                    {event.capacity != null && event.capacity > 0 && (
                      <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <p className="flex items-center gap-1.5 text-white/30 text-[8px] tracking-[0.25em] uppercase mb-1"><Users size={11} className="text-[#ffffff]" /> Capacity</p>
                        <p className="text-white/85 text-sm font-semibold">{event.capacity.toLocaleString()} max</p>
                      </div>
                    )}
                    {event.venueType && (
                      <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <p className="flex items-center gap-1.5 text-white/30 text-[8px] tracking-[0.25em] uppercase mb-1"><Building2 size={11} className="text-[#ffffff]" /> Setting</p>
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
                      style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "#ffffff" }}
                    >
                      <ExternalLink size={13} /> Event Website / More Info
                    </a>
                  )}
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
                          style={{ background: "linear-gradient(to top, #0F1116 0%, rgba(8,8,8,0.3) 55%, transparent 100%)" }}
                        />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.15) 0%, transparent 70%)" }}
                        />
                      </div>
                      <div className="px-3 pb-3 pt-2 text-center">
                        <p className="text-white/30 text-[8px] font-bold tracking-[0.3em] uppercase mb-0.5">{artist.role}</p>
                        <h3 className="text-white font-black text-xs uppercase tracking-wide">{artist.name}</h3>
                        <div className="flex justify-center mt-2">
                          <div className="h-[2px] w-8 rounded-full" style={{ background: "#ffffff" }} />
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
                  onMouseEnter={e => { (e.currentTarget.closest('div') as HTMLElement).style.borderColor = "rgba(255,255,255,0.35)"; }}
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
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#ffffff] hover:gap-2.5 transition-all"
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
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.35)"; }}
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
                        <span style={{ fontSize: 18, fontWeight: 900, color: "#ffffff" }}>{organizer.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold text-sm leading-snug truncate group-hover:text-[#ffffff] transition-colors">{organizer.name}</p>
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
                          {co.logo ? <img src={co.logo} alt={co.name} className="w-full h-full object-cover" /> : <span style={{ fontSize: 13, fontWeight: 800, color: "#ffffff" }}>{co.name.charAt(0)}</span>}
                        </div>
                        <p className="text-white/80 text-xs font-semibold truncate group-hover:text-[#ffffff] transition-colors">{co.name}</p>
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
      <Footer />
    </main>
  );
}

/* ── Flyer → video slider (auto-switches to the trailer after 5s) ──── */
function EventMedia({ image, title, trailer }: { image: string; title: string; trailer: string }) {
  const yt    = trailer.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  const vimeo = trailer.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const instaM = trailer.match(/instagram\.com\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  // Instagram embeds via its own iframe player (no autoplay/sound control); reels are vertical.
  const insta = instaM ? { type: instaM[1] === "reels" ? "reel" : instaM[1], code: instaM[2] } : null;
  const hasVideo = !!trailer;

  const [slide, setSlide] = useState(0);   // 0 = flyer, 1 = video
  // Play with sound by default. (Browsers may still block unmuted autoplay when the user
  // hasn't interacted with the page — the effects below fall back to muted if so.)
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytRef = useRef<HTMLIFrameElement>(null);

  // Auto-advance from the flyer to the video 5 seconds after the page loads.
  useEffect(() => {
    if (!hasVideo) return;
    const t = setTimeout(() => setSlide(1), 5000);
    return () => clearTimeout(t);
  }, [hasVideo]);

  // For a direct-file trailer, drive playback / mute imperatively.
  useEffect(() => {
    if (slide === 1 && videoRef.current) {
      const v = videoRef.current;
      v.muted = muted;
      v.play().catch(() => {
        // Browser blocked unmuted autoplay — retry muted so it at least plays.
        if (!muted) { v.muted = true; setMuted(true); v.play().catch(() => {}); }
      });
    }
  }, [slide, muted]);

  const showVideo = hasVideo && slide === 1;

  // YouTube / Vimeo embed with autoplay + sound (mute toggled by state).
  // vq=hd1080 asks YouTube to start in 1080p (a hint — YouTube may still adapt to
  // bandwidth / player size); the IFrame API call below reinforces it.
  const embed = yt
    ? `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=${muted ? 1 : 0}&controls=1&rel=0&playsinline=1&enablejsapi=1&vq=hd1080&hd=1`
    : vimeo
    ? `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=${muted ? 1 : 0}&playsinline=1&quality=1080p`
    : "";

  // Once the YouTube player is ready, request 1080p and (if unmuted) turn the sound on.
  const applyYtPrefs = () => {
    const w = ytRef.current?.contentWindow;
    if (!w) return;
    const cmd = (func: string, args: unknown[] = []) =>
      w.postMessage(JSON.stringify({ event: "command", func, args }), "*");
    cmd("setPlaybackQualityRange", ["hd1080", "hd1080"]);
    cmd("setPlaybackQuality", ["hd1080"]);
    if (!muted) { cmd("unMute"); cmd("setVolume", [100]); }
    cmd("playVideo");
  };

  useEffect(() => {
    if (!showVideo || !yt) return;
    // The player isn't ready the instant the iframe loads — nudge it a few times.
    const timers = [400, 1200, 2500].map(ms => window.setTimeout(applyYtPrefs, ms));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showVideo, muted]);

  return (
    <>
      {/* Flyer */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
        style={{ opacity: showVideo ? 0 : 1 }}
      />

      {/* Instagram reel/post — embedded in Instagram's own vertical player */}
      {showVideo && insta && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ padding: 12 }}>
          <iframe
            src={`https://www.instagram.com/${insta.type}/${insta.code}/embed`}
            title="Event trailer"
            className="h-full"
            style={{ border: 0, width: "min(100%, 400px)", borderRadius: 12, background: "#000" }}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            scrolling="no"
          />
        </div>
      )}

      {/* Video (16:9, autoplays with sound when it becomes active) */}
      {showVideo && !insta && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
            {embed ? (
              <iframe
                key={muted ? "m" : "u"}
                ref={ytRef}
                src={embed}
                title="Event trailer"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                onLoad={applyYtPrefs}
              />
            ) : (
              <video
                ref={videoRef}
                src={trailer}
                autoPlay
                playsInline
                controls
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      )}

      {/* Sound toggle — prominent "tap for sound" while muted (not for Instagram, which
          has its own in-player controls) */}
      {showVideo && !insta && (
        <button
          onClick={() => setMuted(m => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute top-5 right-5 z-30 flex items-center gap-2 rounded-full transition-all"
          style={{
            padding: muted ? "7px 12px" : "0",
            width: muted ? "auto" : 36,
            height: 36,
            justifyContent: "center",
            background: muted ? "#ffffff" : "rgba(0,0,0,0.55)",
            border: muted ? "none" : "1px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(6px)",
          }}
        >
          {muted ? (
            <>
              <VolumeX size={15} className="text-black" />
              <span className="text-black text-[11px] font-bold tracking-wide">Tap for sound</span>
            </>
          ) : (
            <Volume2 size={15} className="text-white" />
          )}
        </button>
      )}

      {/* Slider dots (flyer / video) */}
      {hasVideo && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
          {[0, 1].map(i => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={i === 0 ? "Show flyer" : "Play trailer"}
              className="rounded-full transition-all"
              style={{
                width: slide === i ? 40 : 13,
                height: 13,
                background: slide === i ? "#ffffff" : "rgba(255,255,255,0.45)",
                boxShadow: slide === i ? "0 0 12px rgba(255,255,255,0.5)" : "none",
                border: "1px solid rgba(0,0,0,0.25)",
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

/* ── Event countdown / completed indicator ─────────────────────────── */
function toDateTime(dateStr?: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  if (timeStr && /^\d{1,2}:\d{2}/.test(timeStr)) {
    const [h, m] = timeStr.split(":").map(Number);
    d.setHours(h, m, 0, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

function EventCountdown({ date, startTime, endDate, endTime }: {
  date: string; startTime?: string; endDate?: string; endTime?: string;
}) {
  const [now, setNow] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const start = toDateTime(date, startTime);
  if (!mounted || !start) return null;                     // avoid hydration mismatch / unparseable dates

  const startMs = start.getTime();
  const end = toDateTime(endDate || date, endTime || "23:59");
  const endMs = end ? end.getTime() : startMs + 3 * 60 * 60 * 1000; // assume ~3h if no end given

  const nowD = new Date(now);
  const sameDay =
    start.getFullYear() === nowD.getFullYear() &&
    start.getMonth() === nowD.getMonth() &&
    start.getDate() === nowD.getDate();

  // ── Completed ──
  if (now > endMs) {
    return (
      <div className="mb-6 flex items-center gap-2.5 rounded-xl px-4 py-3"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <CheckCircle2 size={16} style={{ color: "rgba(255,255,255,0.55)" }} />
        <span className="text-[12px] font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.6)" }}>
          Event Completed
        </span>
      </div>
    );
  }

  // ── Happening now — the event is currently active: either an all-day event today, or
  //     a timed event within its start–end window (red) ──
  if (now >= startMs && now <= endMs) {
    return (
      <div className="mb-6 flex items-center gap-2.5 rounded-xl px-4 py-3"
        style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)" }}>
        <Radio size={16} className="animate-pulse" style={{ color: "#f87171" }} />
        <span className="text-[12px] font-bold tracking-[0.18em] uppercase" style={{ color: "#f87171" }}>
          Happening Now
        </span>
      </div>
    );
  }

  // ── Live countdown to the start (shown for upcoming events and for today's events
  //     that haven't started yet) ──
  const diff  = Math.max(0, startMs - now);
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  const secs  = Math.floor((diff % 60000) / 1000);
  const boxes = [
    { v: days,  l: "Days" },
    { v: hours, l: "Hrs"  },
    { v: mins,  l: "Min"  },
    { v: secs,  l: "Sec"  },
  ];
  const countdownBox = (
    <div className="rounded-xl p-4"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)" }}>
      <p className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#ffffff" }}>
        <Clock size={11} /> Starts In
      </p>
      <div className="grid grid-cols-4 gap-2">
        {boxes.map(b => (
          <div key={b.l} className="flex flex-col items-center rounded-lg py-2"
            style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-white font-black text-xl leading-none tabular-nums">{String(b.v).padStart(2, "0")}</span>
            <span className="text-white/35 text-[8px] font-bold tracking-[0.15em] uppercase mt-1">{b.l}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Happening today — event is today but not in its active time window (green).
  //     Also show the countdown when it hasn't started yet. ──
  if (sameDay) {
    return (
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-2.5 rounded-xl px-4 py-3"
          style={{ background: "rgba(57,189,105,0.12)", border: "1px solid rgba(57,189,105,0.35)" }}>
          <Radio size={16} className="animate-pulse" style={{ color: "#39BD69" }} />
          <span className="text-[12px] font-bold tracking-[0.18em] uppercase" style={{ color: "#39BD69" }}>
            Happening Today
          </span>
        </div>
        {now < startMs && countdownBox}
      </div>
    );
  }

  // ── Upcoming — live countdown ──
  return <div className="mb-6">{countdownBox}</div>;
}
