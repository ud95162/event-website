"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Calendar, MapPin, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminData } from "../context/AdminDataContext";
import { eventSlug } from "../lib/slug";

export default function ThisWeekPopup() {
  const router = useRouter();
  const { events, loading } = useAdminData();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // Events happening in the next 7 days
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
  const weekEvents = events
    .filter(ev => { const d = new Date(ev.date); return !isNaN(d.getTime()) && d >= now && d < weekEnd; })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  useEffect(() => {
    if (loading) return;
    if (weekEvents.length === 0) return;
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, weekEvents.length]);

  const count = weekEvents.length;
  const prev = () => setIndex(i => (i - 1 + count) % count);
  const next = () => setIndex(i => (i + 1) % count);

  // Keyboard arrows + Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, count]);

  const close = () => setOpen(false);
  const go = (ev: typeof events[number]) => { close(); router.push(`/events/${eventSlug(ev)}`); };

  if (!open || count === 0) return null;
  const ev = weekEvents[Math.min(index, count - 1)];

  return (
    <div
      onClick={close}
      style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        animation: "twp-fade 0.25s ease",
      }}
    >
      <style>{`
        @keyframes twp-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes twp-pop { from { opacity: 0; transform: translateY(14px) scale(0.98) } to { opacity: 1; transform: none } }
        @keyframes twp-slide { from { opacity: 0.3; transform: scale(1.02) } to { opacity: 1; transform: none } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 720,
          background: "#0b0b10", border: "1px solid rgba(57,189,105,0.25)", borderRadius: 24,
          boxShadow: "0 50px 110px rgba(0,0,0,0.7), 0 0 0 1px rgba(57,189,105,0.06)", overflow: "hidden",
          animation: "twp-pop 0.3s ease", position: "relative",
        }}
      >
        {/* Eyebrow header */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
            <Sparkles size={12} style={{ color: "#39BD69" }} /> Happening This Week
          </p>
          <button
            onClick={close}
            style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Banner carousel */}
        <div
          onClick={() => go(ev)}
          style={{ position: "relative", height: 420, cursor: "pointer", overflow: "hidden" }}
        >
          <img key={ev.id} src={ev.image} alt={ev.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", animation: "twp-slide 0.35s ease" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,11,16,1) 0%, rgba(11,11,16,0.35) 45%, rgba(0,0,0,0.25) 100%)" }} />

          {/* Event info overlay */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "28px 30px" }}>
            {ev.tag && (
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.28em", textTransform: "uppercase", color: "#39BD69" }}>{ev.tag}</span>
            )}
            <h2 style={{ fontSize: 34, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1.05, margin: "8px 0 14px" }}>{ev.title}</h2>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.8)" }}><Calendar size={14} style={{ color: "#39BD69" }} /> {ev.date}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.8)" }}><MapPin size={14} style={{ color: "#39BD69" }} /> {ev.location}</span>
            </div>
          </div>

          {/* Arrows */}
          {count > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev(); }}
                aria-label="Previous event"
                style={arrowStyle("left")}
              ><ChevronLeft size={18} /></button>
              <button
                onClick={e => { e.stopPropagation(); next(); }}
                aria-label="Next event"
                style={arrowStyle("right")}
              ><ChevronRight size={18} /></button>
            </>
          )}
        </div>

        {/* Dots + counter */}
        {count > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 0 4px" }}>
            {weekEvents.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to event ${i + 1}`}
                style={{
                  height: 6, borderRadius: 999, border: "none", cursor: "pointer",
                  width: i === index ? 20 : 6,
                  background: i === index ? "#39BD69" : "rgba(255,255,255,0.25)",
                  transition: "all 0.25s ease",
                }}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, padding: "10px 16px 18px" }}>
          <button
            onClick={() => go(ev)}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px", borderRadius: 12, background: "#39BD69", border: "none", color: "#000", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
          >
            View Event <ArrowRight size={14} />
          </button>
          <button
            onClick={() => { close(); router.push("/events"); }}
            style={{ padding: "12px 18px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            All Events
          </button>
        </div>
      </div>
    </div>
  );
}

const arrowStyle = (side: "left" | "right"): React.CSSProperties => ({
  position: "absolute", top: "38%", [side]: 16, transform: "translateY(-50%)",
  width: 44, height: 44, borderRadius: "50%", cursor: "pointer", zIndex: 2,
  background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.25)",
  backdropFilter: "blur(8px)", color: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center",
});
