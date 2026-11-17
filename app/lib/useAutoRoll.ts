"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Makes a horizontally scrollable row drift continuously from left to right (cards move right).
 * The row must render its cards twice back to back (see `looped`), so the wrap-around is seamless.
 * Pauses on hover, touch and after manual scrolling / arrow clicks, then carries on.
 *
 * @param period width of ONE copy of the cards (count * (cardWidth + gap)).
 * @returns how many times the card list must be repeated to make one seamless group wider than the row
 *          (0 = don't roll). Render the repeated group three times back to back.
 */
export const ROLL_SPEED = 0.6; // px per frame (~36px/s)

export function useAutoRoll(ref: RefObject<HTMLDivElement | null>, period: number, count: number): number {
  const [reps, setReps] = useState(0);

  // A short row repeats its cards until one group is wider than the row.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const check = () => setReps(reduce || count < 2 || period <= 0 ? 0 : Math.max(1, Math.ceil((el.clientWidth + 1) / period)));
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, period, count]);

  useEffect(() => {
    const el = ref.current;
    if (!el || reps === 0) return;
    const groupW = period * reps;

    let raf = 0;
    let hover = false;
    let pausedUntil = 0;
    let pos = groupW;
    el.scrollLeft = pos;

    const pause = (ms = 2500) => { pausedUntil = performance.now() + ms; };
    const onEnter = () => { hover = true; };
    const onLeave = () => { hover = false; };
    const onUser = () => pause();

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onUser, { passive: true });
    el.addEventListener("wheel", onUser, { passive: true });
    el.parentElement?.addEventListener("click", onUser);

    const step = () => {
      if (hover || performance.now() < pausedUntil) {
        pos = el.scrollLeft; // follow wherever the user took it
      } else {
        pos -= ROLL_SPEED;
        el.scrollLeft = pos;
      }
      // Keep within the middle copies so it never runs out of cards on either side.
      if (el.scrollLeft <= 0) { pos = el.scrollLeft + groupW; el.scrollLeft = pos; }
      else if (el.scrollLeft >= groupW * 2) { pos = el.scrollLeft - groupW; el.scrollLeft = pos; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onUser);
      el.removeEventListener("wheel", onUser);
      el.parentElement?.removeEventListener("click", onUser);
    };
  }, [ref, period, reps]);

  return reps;
}
