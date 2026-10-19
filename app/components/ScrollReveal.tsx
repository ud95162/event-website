"use client";

import { useEffect } from "react";

// Fades + lifts any element marked data-reveal into view as it scrolls on screen (once).
// Elements already on screen when first seen are left alone, so nothing flashes at page load.
// Optional: data-reveal-delay="0.15" (seconds) to stagger siblings. The look lives in globals.css
// ([data-rv]); this only flips the state, so it works with nested scroll containers too.
export default function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.dataset.rv = "shown";
        io.unobserve(el);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) return;   // already visible
        const d = parseFloat(el.dataset.revealDelay ?? "0");
        if (d) el.style.setProperty("--rv-delay", `${d}s`);
        el.dataset.rv = "hidden";
        io.observe(el);
      });
    };

    scan();
    let raf = 0;
    const mo = new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(scan); });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { mo.disconnect(); io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return null;
}
