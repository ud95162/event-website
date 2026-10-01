"use client";

import { useEffect, useRef } from "react";
import { Star, Quote } from "lucide-react";
import { useAdminData, Review } from "../context/AdminDataContext";

/* ── Single review card ───────────────────────────────────────────────── */
function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className="flex-shrink-0 rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-md"
      style={{
        width: 340,
        background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 28px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {review.image ? (
            <img src={review.image} alt={review.name} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900 }}>{review.name.charAt(0)}</div>
          )}
          <div className="min-w-0">
            <p className="text-white font-bold text-[15px] truncate">{review.name}</p>
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} size={13} style={{ color: n <= review.rating ? "#F5B301" : "rgba(255,255,255,0.18)" }} fill={n <= review.rating ? "#F5B301" : "none"} />
              ))}
            </div>
          </div>
        </div>
        <Quote size={26} style={{ color: "rgba(255,255,255,0.12)", flexShrink: 0 }} fill="currentColor" />
      </div>
      <p
        className="text-white/60 text-sm leading-relaxed"
        style={{ display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}
      >
        {review.review}
      </p>
    </div>
  );
}

/* ── Auto-scrolling marquee row (pauses on hover) ─────────────────────── */
function MarqueeRow({ reviews, direction }: { reviews: Review[]; direction: "left" | "right" }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);
  const items = [...reviews, ...reviews];

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const speed = 0.35;
    posRef.current = direction === "right" ? -(el.scrollWidth / 2) : 0;
    const step = () => {
      if (!pausedRef.current) {
        posRef.current += direction === "left" ? -speed : speed;
        const half = el.scrollWidth / 2;
        if (direction === "left" && posRef.current <= -half) posRef.current += half;
        if (direction === "right" && posRef.current >= 0) posRef.current -= half;
        el.style.transform = `translateX(${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [direction, reviews.length]);

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-[2]" style={{ width: 80, background: "linear-gradient(to right, #0F1116, transparent)" }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-[2]" style={{ width: 80, background: "linear-gradient(to left, #0F1116, transparent)" }} />
      <div ref={trackRef} className="flex" style={{ gap: 20, width: "max-content" }}>
        {items.map((r, i) => <ReviewCard key={`${r.id}-${i}`} review={r} />)}
      </div>
    </div>
  );
}

/* ── Section ──────────────────────────────────────────────────────────── */
export default function ReviewsSection() {
  const { reviews } = useAdminData();
  if (reviews.length === 0) return null;

  // Split into two rows scrolling opposite directions when there are enough reviews.
  const mid = Math.ceil(reviews.length / 2);
  const r1 = reviews.slice(0, mid);
  const r2 = reviews.length > 3 ? reviews.slice(mid) : reviews;

  return (
    <section className="snap-section overflow-hidden flex flex-col items-center justify-evenly" style={{ gap: 24 }}>
      <div className="text-center relative z-[200] select-none flex flex-col items-center" style={{ gap: "clamp(4px, 1vh, 12px)" }}>
        <p className="text-white/30 text-[12px] font-semibold tracking-[0.4em] uppercase">
          LOVED BY FANS
        </p>
        <h2 className="text-white font-black uppercase tracking-tight" style={{ fontSize: "clamp(1.2rem, 3vw + 1vh, 2rem)" }}>
          What People Say
        </h2>
      </div>

      <div className="w-full flex flex-col" style={{ gap: 20 }}>
        <MarqueeRow reviews={r1} direction="left" />
        {reviews.length > 3 && <MarqueeRow reviews={r2} direction="right" />}
      </div>
    </section>
  );
}
