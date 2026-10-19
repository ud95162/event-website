"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Share2, Mail, Link2, Check } from "lucide-react";
import { eventSlug } from "../lib/slug";
import { track } from "../lib/track";

// Same share menu as the event detail page, usable from event cards. The menu is rendered in a
// portal (fixed position) so a card's overflow:hidden can't clip it.
type ShareEvent = {
  id: number; title: string; date: string; startTime?: string; endDate?: string; endTime?: string;
  venue?: string; location?: string; price?: string;
};

const IgWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"/><path d="M12.04 2A9.94 9.94 0 0 0 2.1 11.94c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.78 1.22h.01A9.94 9.94 0 0 0 22 11.94 9.94 9.94 0 0 0 12.04 2zm0 18.1h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38 8.26 8.26 0 0 1 8.25-8.24 8.25 8.25 0 0 1 8.24 8.25 8.26 8.26 0 0 1-8.25 8.24z"/></svg>
);
const IgFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const IgX = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

const MENU_W = 210;

export default function EventShare({ event, size = 32, iconSize = 13 }: { event: ShareEvent; size?: number; iconSize?: number }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const open = pos !== null;

  // Close on any outside click / scroll / resize.
  useEffect(() => {
    if (!open) return;
    const close = () => setPos(null);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (open) return setPos(null);
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const left = Math.max(8, Math.min(window.innerWidth - MENU_W - 8, r.right - MENU_W));
    const top = r.bottom + 10 + 260 > window.innerHeight ? Math.max(8, r.top - 10 - 260) : r.bottom + 10;
    setPos({ top, left });
  };

  const share = (kind: "whatsapp" | "facebook" | "x" | "email" | "copy") => {
    const url = `${window.location.origin}/events/${eventSlug(event)}`;
    let when = event.date;
    if (event.startTime) when += ` · ${event.startTime}`;
    if (event.endDate && event.endDate !== event.date) {
      when += ` → ${event.endDate}`;
      if (event.endTime) when += ` ${event.endTime}`;
    } else if (event.endTime) when += ` – ${event.endTime}`;
    const where = event.venue || event.location;
    const text = [
      event.title,
      when && `${String.fromCodePoint(0x1f4c5)} ${when}`,
      where && `${String.fromCodePoint(0x1f4cd)} ${where}`,
      (event.price || "").trim() && `${String.fromCodePoint(0x1f39f, 0xfe0f)} ${event.price}`,
    ].filter(Boolean).join("\n");
    const full = `${text}\n\n${url}`;
    const enc = encodeURIComponent;

    if (kind === "copy") {
      navigator.clipboard?.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      setPos(null);
      return;
    }
    const hrefs = {
      whatsapp: `https://api.whatsapp.com/send?text=${enc(full)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      x: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
      email: `mailto:?subject=${enc(event.title)}&body=${enc(full)}`,
    };
    window.open(hrefs[kind], "_blank", "noopener,noreferrer");
    track("event", event.id, "link_click");
    setPos(null);
  };

  const active = open || copied;
  const opts = [
    { key: "whatsapp", label: "WhatsApp", icon: <IgWhatsApp /> },
    { key: "facebook", label: "Facebook", icon: <IgFacebook /> },
    { key: "x", label: "X (Twitter)", icon: <IgX /> },
    { key: "email", label: "Email", icon: <Mail size={15} /> },
    { key: "copy", label: copied ? "Copied!" : "Copy link", icon: copied ? <Check size={15} /> : <Link2 size={15} /> },
  ] as const;

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        aria-label="Share event"
        style={{
          width: size, height: size, borderRadius: "50%", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: active ? "rgba(232,220,192,0.85)" : "rgba(0,0,0,0.55)",
          border: `1px solid ${active ? "rgba(232,220,192,0.6)" : "rgba(255,255,255,0.15)"}`,
          backdropFilter: "blur(6px)", transition: "all 0.2s",
        }}
      >
        <Share2 size={iconSize} strokeWidth={2.5} style={{ color: "#fff" }} />
      </button>

      {open && pos && createPortal(
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed", top: pos.top, left: pos.left, zIndex: 100000, width: MENU_W,
            borderRadius: 14, overflow: "hidden", padding: 6,
            background: "#141418", border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
          }}
        >
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", padding: "6px 8px 8px" }}>Share this event</p>
          {opts.map(opt => (
            <button
              key={opt.key}
              onClick={() => share(opt.key)}
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
        </div>,
        document.body
      )}
    </>
  );
}
