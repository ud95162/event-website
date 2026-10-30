"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Ticket, Heart, ArrowRight } from "lucide-react";
import EventShare from "./EventShare";
import SponsoredTag from "./SponsoredTag";
import { genreColor, genreChipStyle } from "../lib/genres";
import { thumb } from "../lib/images";
import { Event, statusColor } from "../data/events";
import { useAdminData } from "../context/AdminDataContext";
import { useUserLocation, haversineKm, formatDistance } from "../context/LocationContext";
import { eventSlug, organizerSlug } from "../lib/slug";
import { cardPrice } from "../lib/price";

// Cards in the same row share one title height: as tall as the longest title in that row (1 or 2
// lines), so a row where every title fits on one line has no gap, while a row with any two-line
// title keeps the space so genres, dates and prices still line up. "Same row" = same top edge, so
// it also works for rows that wrap. Runs once per frame per container, however many cards ask.
const pending = new WeakSet<Element>();
function alignTitles(container: Element) {
  if (pending.has(container)) return;
  pending.add(container);
  requestAnimationFrame(() => {
    pending.delete(container);
    const cards = Array.from(container.children).filter((c): c is HTMLElement => c instanceof HTMLElement && c.hasAttribute("data-event-card"));
    const titles = cards.map(c => c.querySelector<HTMLElement>("[data-title]"));
    titles.forEach(t => { if (t) t.style.minHeight = "0"; });
    const rows = new Map<number, number>();   // row top → tallest title
    cards.forEach((c, i) => { const t = titles[i]; if (t) rows.set(c.offsetTop, Math.max(rows.get(c.offsetTop) ?? 0, t.offsetHeight)); });
    cards.forEach((c, i) => { const t = titles[i]; if (t) t.style.minHeight = `${rows.get(c.offsetTop) ?? 0}px`; });

    // Genre chips: if no card in the row has any, drop their slot (and its gap) from the whole row.
    const slots = cards.map(c => c.querySelector<HTMLElement>("[data-genres]"));
    const rowHasGenres = new Map<number, boolean>();
    cards.forEach((c, i) => { if (slots[i]?.dataset.has === "1") rowHasGenres.set(c.offsetTop, true); });
    cards.forEach((c, i) => {
      const sl = slots[i];
      if (!sl) return;
      const has = rowHasGenres.get(c.offsetTop) ?? false;
      sl.style.minHeight = has ? "22px" : "0px";
      sl.style.marginBottom = has ? "8px" : "0px";
    });
  });
}

// The event card used on the Events page and in the home page's search results.
// Flyers are 4:5 (admin panel), so the image area matches that ratio and nothing is cropped.
const CARD_W = 270;
const IMG_H = Math.round(CARD_W * 1.25);
const CARD_H = IMG_H + 230;

export default function EventCard({ event, liked, shared, onLike, onShare }: {
  event: Event;
  liked: boolean; shared: boolean;
  onLike: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}) {
  const router = useRouter();
  const { userLocation } = useUserLocation();
  const { organizers, genreColors } = useAdminData();
  const [hovered, setHovered] = useState(false);
  const [orgHovered, setOrgHovered] = useState(false);
  const organizer = organizers.find(o => o.name === event.organizer);
  const distance = userLocation
    ? haversineKm(userLocation.lat, userLocation.lon, event.lat, event.lon)
    : null;

  // ── Enlarged hover preview (rendered in a portal so it escapes the row's overflow) ──
  const cardRef = useRef<HTMLDivElement>(null);

  // Keep this card's title height in step with the other cards in its row.
  useLayoutEffect(() => {
    const parent = cardRef.current?.parentElement;
    if (!parent) return;
    const run = () => alignTitles(parent);
    run();
    window.addEventListener("resize", run);
    document.fonts?.ready.then(run);
    return () => window.removeEventListener("resize", run);
  }, [event.title, event.genres.length]);

  const [preview, setPreview] = useState<{ top: number; left: number } | null>(null);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const PREVIEW_W = 330;
  const PREVIEW_H = 490;

  const openPreview = () => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Centre the enlarged card right on top of the one being hovered.
    let left = r.left + r.width / 2 - PREVIEW_W / 2;
    left = Math.min(Math.max(8, left), window.innerWidth - PREVIEW_W - 8);
    let top = r.top + r.height / 2 - PREVIEW_H / 2;
    top = Math.min(Math.max(8, top), window.innerHeight - PREVIEW_H - 8);
    setPreview({ top, left });
  };

  const cancelHide = () => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  };
  // Delay closing so the cursor can cross the gap into the preview without it vanishing.
  const scheduleHide = () => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => { setPreview(null); setHovered(false); }, 180);
  };

  const enter = () => {
    setHovered(true);
    cancelHide();
    if (showTimer.current) clearTimeout(showTimer.current);
    showTimer.current = window.setTimeout(openPreview, 320);
  };
  const leave = () => {
    if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
    scheduleHide();
  };

  // Keep the preview open while the cursor is over it; close when it leaves.
  const previewEnter = () => { cancelHide(); setHovered(true); };
  const previewLeave = () => scheduleHide();

  useEffect(() => () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  // Hide the preview if anything scrolls or the window resizes (its anchor would drift).
  useEffect(() => {
    if (!preview) return;
    const hide = () => setPreview(null);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => { window.removeEventListener("scroll", hide, true); window.removeEventListener("resize", hide); };
  }, [preview]);

  return (
    <>
    <div
      ref={cardRef}
      data-event-card=""
      onClick={() => router.push(`/events/${eventSlug(event)}`)}
      onMouseEnter={enter}
      onMouseLeave={leave}
      style={{
        flexShrink: 0,
        width: CARD_W,
        height: CARD_H,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        border: `1px solid ${hovered ? "rgba(232,220,192,0.4)" : "rgba(255,255,255,0.08)"}`,
        boxShadow: hovered ? "0 0 28px rgba(232,220,192,0.15)" : "none",
        transition: "border-color 0.3s, box-shadow 0.3s, transform 0.3s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        background: "#0a0a0a",
      }}
    >
      {/* Image */}
      <img
        src={thumb(event.image, 520)} alt={event.title}
        loading="lazy" decoding="async"
        style={{
          width: "100%", height: IMG_H, objectFit: "cover", objectPosition: "top",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          transition: "transform 0.5s ease",
        }}
      />

      {event.sponsored && (
        <div style={{ position: "absolute", top: event.badge ? 42 : 10, left: 10 }}><SponsoredTag /></div>
      )}

      {/* Badge */}
      {event.badge && (
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <span style={{
            background: "#fff", color: "#000",
            fontSize: 10, fontWeight: 900, letterSpacing: "0.18em",
            textTransform: "uppercase", padding: "4px 10px", borderRadius: 999,
          }}>{event.badge}</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        <button onClick={onLike} style={{
          width: 32, height: 32, borderRadius: "50%",
          background: liked ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.55)",
          border: `1px solid ${liked ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.15)"}`,
          backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <Heart size={13} strokeWidth={2.5} fill={liked ? "#fff" : "none"} style={{ color: "#fff" }} />
        </button>
        <EventShare event={event} />
      </div>

      {/* Info — sits in the black area below the flyer; every row has a fixed slot (2-line title, genre row) and starts at the same height, so
          type, title, genres, date, location and price line up across cards whatever their content. */}
      <div style={{ position: "absolute", top: IMG_H, bottom: 0, left: 0, right: 0, padding: "14px 14px 14px", display: "flex", flexDirection: "column" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#E8DCC0", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {event.tag}
        </p>
        <h3 data-title="" style={{ fontSize: 15, fontWeight: 900, color: "#fff", textTransform: "uppercase", lineHeight: 1.25, minHeight: "2.5em", marginBottom: 8, letterSpacing: "0.03em", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {event.title}
        </h3>
        <div data-genres="" data-has={event.genres.length > 0 ? "1" : "0"} style={{ minHeight: 22, marginBottom: 8 }}>
        {event.genres.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {event.genres.slice(0, 3).map(g => (
              <span key={g} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 999, ...genreChipStyle(genreColor(genreColors, g)) }}>
                {g}
              </span>
            ))}
          </div>
        )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={12} style={{ color: "rgba(255,255,255,0.55)", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{event.date}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={12} style={{ color: "rgba(255,255,255,0.55)", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{event.location}</span>
            {distance !== null && (
              <span style={{ fontSize: 12, color: "#E8DCC0", fontWeight: 600 }}>· {formatDistance(distance)}</span>
            )}
          </div>
          {cardPrice(event.tickets, event.price) && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.92)", fontWeight: 700 }}>
              {cardPrice(event.tickets, event.price)}
            </p>
          )}

          {/* Organized by */}
          {organizer && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize: 10, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Organized by</span>
              <div
                style={{ position: "relative", display: "flex", alignItems: "center" }}
                onMouseEnter={() => setOrgHovered(true)}
                onMouseLeave={() => setOrgHovered(false)}
                onClick={(e) => { e.stopPropagation(); router.push(`/organizers/${organizerSlug(organizer)}`); }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                  border: `1px solid ${orgHovered ? "#E8DCC0" : "rgba(255,255,255,0.2)"}`, background: "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  transition: "border-color 0.2s",
                }}>
                  {organizer.logo ? (
                    <img src={thumb(organizer.logo, 128)} alt={organizer.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#E8DCC0" }}>{organizer.name.charAt(0)}</span>
                  )}
                </div>
                {/* Hover tooltip with name */}
                {orgHovered && (
                  <div style={{
                    position: "absolute", bottom: "calc(100% + 6px)", left: 0, zIndex: 20,
                    whiteSpace: "nowrap", padding: "4px 9px", borderRadius: 6,
                    background: "rgba(0,0,0,0.92)", border: "1px solid rgba(232,220,192,0.4)",
                    fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.03em",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.5)", pointerEvents: "none",
                  }}>
                    {organizer.name}
                  </div>
                )}
              </div>

              {/* Status — inline, right after the organizer */}
              {event.status && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4, marginLeft: "auto",
                  background: `${statusColor(event.status)}22`, color: statusColor(event.status),
                  border: `1px solid ${statusColor(event.status)}66`,
                  fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
                  textTransform: "uppercase", padding: "4px 9px", borderRadius: 999,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor(event.status) }} />
                  {event.status}
                </span>
              )}
            </div>
          )}

          {/* Status (when no organizer) */}
          {event.status && !organizer && (
            <div style={{ marginTop: "auto" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: `${statusColor(event.status)}22`, color: statusColor(event.status),
                border: `1px solid ${statusColor(event.status)}66`,
                fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
                textTransform: "uppercase", padding: "4px 9px", borderRadius: 999,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor(event.status) }} />
                {event.status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* ── Enlarged preview popup, rendered in a portal ───────────── */}
    {preview && typeof document !== "undefined" && createPortal(
      <div
        onMouseEnter={previewEnter}
        onMouseLeave={previewLeave}
        onClick={() => router.push(`/events/${eventSlug(event)}`)}
        style={{
          position: "fixed", top: preview.top, left: preview.left,
          width: PREVIEW_W, zIndex: 9999, pointerEvents: "auto", cursor: "pointer",
          borderRadius: 18, overflow: "hidden",
          background: "#0b0b10", border: "1px solid rgba(232,220,192,0.35)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,220,192,0.05)",
          animation: "hp-in 0.2s ease",
        }}
      >
        {/* Poster */}
        <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
          <img src={event.image} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0b0b10 0%, rgba(11,11,16,0.25) 55%, transparent 100%)" }} />
          {event.badge && (
            <span style={{ position: "absolute", top: 12, left: 12, background: "#fff", color: "#000", fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999 }}>{event.badge}</span>
          )}
          {event.status && (
            <span style={{
              position: "absolute", top: 12, right: 12, display: "inline-flex", alignItems: "center", gap: 5,
              background: `${statusColor(event.status)}22`, color: statusColor(event.status),
              border: `1px solid ${statusColor(event.status)}66`, fontSize: 8, fontWeight: 800, letterSpacing: "0.12em",
              textTransform: "uppercase", padding: "4px 8px", borderRadius: 999, backdropFilter: "blur(4px)",
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor(event.status) }} />
              {event.status}
            </span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "4px 18px 18px", marginTop: -6 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "#E8DCC0", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 6 }}>{event.tag}</p>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", textTransform: "uppercase", lineHeight: 1.15, letterSpacing: "0.01em", marginBottom: 10 }}>{event.title}</h3>

          {event.genres.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
              {event.genres.slice(0, 4).map(g => (
                <span key={g} style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 999, ...genreChipStyle(genreColor(genreColors, g)) }}>{g}</span>
              ))}
            </div>
          )}

          {event.description && (
            <p style={{ fontSize: 11, lineHeight: 1.55, color: "rgba(255,255,255,0.5)", marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{event.description}</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Calendar size={12} style={{ color: "#E8DCC0", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{event.date}{event.startTime ? ` · ${event.startTime}` : ""}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <MapPin size={12} style={{ color: "#E8DCC0", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{event.venue ? `${event.venue}, ` : ""}{event.location}{distance !== null ? ` · ${formatDistance(distance)}` : ""}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Ticket size={12} style={{ color: "#E8DCC0", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{cardPrice(event.tickets, event.price)}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{organizer ? `By ${organizer.name}` : ""}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 800, color: "#E8DCC0", letterSpacing: "0.1em", textTransform: "uppercase" }}>View Details <ArrowRight size={12} /></span>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
