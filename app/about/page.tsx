"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NewsletterSection from "../components/NewsletterSection";
import ParticleField from "../components/ParticleField";
import {
  ArrowRight,
  Sparkles,
  Compass,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  ChevronDown,
  CalendarCheck,
  Eye,
  Users,
  Globe,
  Share2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

/* ── Count-up hook ─────────────────────────────────────────────── */
function useCountUp(target: number, duration: number, trigger: boolean) {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!trigger) {
      setCount(0);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / duration);
      // Cubic ease-out
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [trigger, target, duration]);

  return count;
}

/* ── Intersection observer hook ────────────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ── Animated Stat Item (Client's favorite counter animation) ──── */
function AnimatedStat({
  value,
  suffix,
  label,
  sublabel,
  trigger,
  delay,
}: {
  value: number;
  suffix: string;
  label: string;
  sublabel?: string;
  trigger: boolean;
  delay: number;
}) {
  const [started, setStarted] = useState(false);
  const count = useCountUp(value, 2000, started);

  useEffect(() => {
    if (!trigger) {
      setStarted(false);
      return;
    }
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [trigger, delay]);

  return (
    <div
      style={{
        padding: "clamp(16px, 2.2vh, 24px) clamp(16px, 1.8vw, 22px)",
        borderRadius: 16,
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.07)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        opacity: started ? 1 : 0,
        transform: started ? "translateY(0)" : "translateY(22px)",
        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1), border-color 0.25s ease, background 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(232, 220, 192, 0.35)";
        e.currentTarget.style.background = "rgba(232, 220, 192, 0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "clamp(6px, 1vh, 12px)" }}>
        <div
          style={{
            fontSize: "clamp(2rem, 3.4vw, 3.2rem)",
            fontWeight: 900,
            lineHeight: 1,
            background: "linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.4) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "inherit",
          }}
        >
          {count}{suffix}
        </div>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#E8DCC0",
            boxShadow: "0 0 10px rgba(232, 220, 192, 0.8)",
            transform: started ? "scale(1)" : "scale(0)",
            transition: "transform 0.4s ease 0.3s",
            flexShrink: 0,
          }}
        />
      </div>
      <div>
        <p style={{ color: "#fff", fontSize: "clamp(0.85rem, 1vw, 0.95rem)", fontWeight: 700, letterSpacing: "0.04em", marginBottom: 4 }}>
          {label}
        </p>
        {sublabel && (
          <p style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "clamp(0.72rem, 0.85vw, 0.8rem)", lineHeight: 1.4 }}>
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── FAQ Carousel (3 Vertical Sections: General, Event Organizers, Talent) ─── */
function renderFaqAnswer(text: string) {
  if (text.includes("discovereventslk@gmail.com")) {
    return (
      <span>
        Email{" "}
        <a href="mailto:discovereventslk@gmail.com" style={{ color: "#E8DCC0", textDecoration: "underline" }}>
          discovereventslk@gmail.com
        </a>{" "}
        or call{" "}
        <a href="tel:+94765370521" style={{ color: "#E8DCC0", textDecoration: "underline" }}>
          076 537 0521
        </a>
        . We review every report and fix errors quickly.
      </span>
    );
  }
  return <span>{text}</span>;
}

function FaqList({ inView }: { inView: boolean }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [openMap, setOpenMap] = useState<Record<number, number | null>>({
    0: 0,
    1: 0,
    2: 0,
  });

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 45) {
      setSlideIndex((curr) => (curr === 0 ? faqCategories.length - 1 : curr - 1));
    } else if (deltaX < -45) {
      setSlideIndex((curr) => (curr === faqCategories.length - 1 ? 0 : curr + 1));
    }
    touchStartX.current = null;
  };

  const toggleQuestion = (catIdx: number, qIdx: number) => {
    setOpenMap((prev) => ({
      ...prev,
      [catIdx]: prev[catIdx] === qIdx ? null : qIdx,
    }));
  };

  return (
    <div style={{ maxWidth: 880, width: "100%", margin: "0 auto" }}>
      {/* Category Pills Switcher */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: "clamp(14px, 2vh, 22px)",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {faqCategories.map((cat, i) => {
          const isActive = slideIndex === i;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSlideIndex(i)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: "clamp(11px, 0.9vw, 12px)",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                background: isActive ? "rgba(232,220,192,0.18)" : "rgba(255,255,255,0.03)",
                color: isActive ? "#E8DCC0" : "rgba(255,255,255,0.6)",
                border: isActive ? "1px solid rgba(232,220,192,0.45)" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isActive ? "0 0 16px rgba(232,220,192,0.15)" : "none",
                transition: "all 0.25s ease",
              }}
            >
              <Icon size={14} color={isActive ? "#E8DCC0" : "rgba(255,255,255,0.5)"} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Carousel Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          overflow: "hidden",
          width: "100%",
          borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(255, 255, 255, 0.015)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 12px 36px rgba(0,0,0,0.3)",
          position: "relative",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
        }}
      >
        {/* Slide track */}
        <div
          style={{
            display: "flex",
            width: "100%",
            transform: `translateX(-${slideIndex * 100}%)`,
            transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {faqCategories.map((category, catIdx) => {
            const CatIcon = category.icon;
            const openQ = openMap[catIdx];

            return (
              <div
                key={category.id}
                style={{
                  flex: "0 0 100%",
                  width: "100%",
                  minWidth: "100%",
                  padding: "clamp(16px, 2.4vh, 26px) clamp(16px, 2.2vw, 26px)",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Slide Category Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "clamp(12px, 1.8vh, 16px)",
                    paddingBottom: "clamp(10px, 1.4vh, 14px)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(232, 220, 192, 0.1)",
                        border: "1px solid rgba(232, 220, 192, 0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CatIcon size={17} color="#E8DCC0" />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: "clamp(1.05rem, 1.5vw, 1.3rem)",
                          fontWeight: 900,
                          color: "#FFFFFF",
                          letterSpacing: "-0.01em",
                          lineHeight: 1.2,
                        }}
                      >
                        {category.name}
                      </h3>
                      <p style={{ color: "rgba(255, 255, 255, 0.45)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {category.tagline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* General intro banner */}
                {category.intro && (
                  <div
                    style={{
                      padding: "10px 16px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, rgba(232,220,192,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                      border: "1px solid rgba(232,220,192,0.22)",
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Sparkles size={16} color="#E8DCC0" style={{ flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#E8DCC0", display: "inline-block", marginRight: 8 }}>
                        {category.intro.title}
                      </span>
                      <span style={{ color: "#FFFFFF", fontSize: "clamp(0.82rem, 0.95vw, 0.9rem)", fontWeight: 700 }}>
                        {category.intro.text}
                      </span>
                    </div>
                  </div>
                )}

                {/* Accordion Questions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {category.items.map(({ q, a }, i) => {
                    const isOpen = openQ === i;
                    return (
                      <div
                        key={q}
                        style={{
                          borderRadius: 12,
                          overflow: "hidden",
                          border: `1px solid ${isOpen ? "rgba(232,220,192,0.3)" : "rgba(255,255,255,0.06)"}`,
                          background: isOpen ? "rgba(232,220,192,0.04)" : "rgba(255,255,255,0.02)",
                          transition: "border-color 0.2s, background 0.2s",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleQuestion(catIdx, i)}
                          aria-expanded={isOpen}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 14,
                            padding: "clamp(10px, 1.5vh, 14px) clamp(12px, 1.5vw, 18px)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                            color: "#fff",
                            fontFamily: "inherit",
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: "clamp(0.85rem, 0.95vw, 0.95rem)", lineHeight: 1.35 }}>
                            {q}
                          </span>
                          <ChevronDown
                            size={16}
                            color="#E8DCC0"
                            style={{
                              flexShrink: 0,
                              transform: isOpen ? "rotate(180deg)" : "none",
                              transition: "transform 0.25s ease",
                            }}
                          />
                        </button>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateRows: isOpen ? "1fr" : "0fr",
                            transition: "grid-template-rows 0.28s ease",
                          }}
                        >
                          <div style={{ overflow: "hidden" }}>
                            <p
                              style={{
                                padding: "0 clamp(12px, 1.5vw, 18px) clamp(10px, 1.5vh, 14px)",
                                color: "rgba(255,255,255,0.62)",
                                fontSize: "clamp(0.8rem, 0.9vw, 0.9rem)",
                                lineHeight: 1.65,
                              }}
                            >
                              {renderFaqAnswer(a)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Carousel Navigation Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "clamp(12px, 1.8vh, 16px)",
          padding: "0 6px",
        }}
      >
        {/* Prev button */}
        <button
          type="button"
          onClick={() => setSlideIndex((curr) => (curr === 0 ? faqCategories.length - 1 : curr - 1))}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.75)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(232,220,192,0.4)";
            e.currentTarget.style.color = "#E8DCC0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "rgba(255,255,255,0.75)";
          }}
        >
          <ChevronLeft size={14} /> Prev
        </button>

        {/* Dot indicators */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {faqCategories.map((cat, i) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSlideIndex(i)}
              style={{
                width: slideIndex === i ? 26 : 8,
                height: 7,
                borderRadius: 999,
                background: slideIndex === i ? "#E8DCC0" : "rgba(255,255,255,0.2)",
                boxShadow: slideIndex === i ? "0 0 8px rgba(232,220,192,0.6)" : "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              aria-label={`Go to ${cat.name}`}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={() => setSlideIndex((curr) => (curr === faqCategories.length - 1 ? 0 : curr + 1))}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.75)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(232,220,192,0.4)";
            e.currentTarget.style.color = "#E8DCC0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "rgba(255,255,255,0.75)";
          }}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Contact Form (Preserved as requested) ─────────────────────── */
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "", company: "" }); // "company" is a hidden spam trap
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    outline: "none",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${focused === field ? "rgba(232,220,192,0.5)" : "rgba(255,255,255,0.1)"}`,
    color: "#fff",
    fontSize: 14,
    fontFamily: "inherit",
    transition: "border-color 0.2s",
    boxShadow: focused === field ? "0 0 0 3px rgba(232,220,192,0.08)" : "none",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Couldn't send your message. Please try again.");
      } else {
        setSent(true);
        setTimeout(() => {
          setSent(false);
          setForm({ name: "", email: "", phone: "", subject: "", message: "", company: "" });
        }, 4000);
      }
    } catch {
      setError("Couldn't reach the server. Please check your connection and try again.");
    }
    setSending(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Spam trap: hidden from people, filled in by bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.company}
        onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      {/* Name + Email row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
            Name
          </p>
          <input
            type="text"
            required
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
            style={inputStyle("name")}
          />
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
            Email
          </p>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            style={inputStyle("email")}
          />
        </div>
      </div>

      {/* Contact number */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
          Contact Number
        </p>
        <input
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="+94 77 123 4567"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          onFocus={() => setFocused("phone")}
          onBlur={() => setFocused(null)}
          style={inputStyle("phone")}
        />
      </div>

      {/* Subject */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
          Subject
        </p>
        <input
          type="text"
          required
          placeholder="How can we help?"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          onFocus={() => setFocused("subject")}
          onBlur={() => setFocused(null)}
          style={inputStyle("subject")}
        />
      </div>

      {/* Message */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
          Message
        </p>
        <textarea
          required
          placeholder="Tell us about your event, venue, or collaboration idea…"
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          onFocus={() => setFocused("message")}
          onBlur={() => setFocused(null)}
          style={{ ...inputStyle("message"), resize: "none" }}
        />
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={sending}
        style={{
          padding: "14px 32px",
          borderRadius: 12,
          cursor: "pointer",
          background: sent ? "rgba(232,220,192,0.2)" : "#2B2E36",
          color: sent ? "#E8DCC0" : "#fff",
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontFamily: "inherit",
          border: sent ? "1px solid rgba(232,220,192,0.4)" : "1px solid rgba(255,255,255,0.18)",
          transition: "all 0.3s",
          boxShadow: sent ? "none" : "0 4px 18px rgba(0,0,0,0.35)",
        }}
      >
        {sent ? "✓ Message Sent!" : sending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

/* ── Content Data ──────────────────────────────────────────────── */
const values = [
  {
    title: "Every event counts",
    desc: "A neighborhood quiz night belongs on the guide as much as an international headliner, and every talent deserves to be found. Basic listings are free for organizers.",
    icon: CalendarCheck,
  },
  {
    title: "Clarity first",
    desc: "Anyone should understand what’s on within seconds. Clear categories, honest details and no clutter.",
    icon: Eye,
  },
  {
    title: "Trust & transparency",
    desc: "Paid placements are always labelled “Sponsored.” Categories, verification and roundup inclusion are never for sale.",
    icon: ShieldCheck,
  },
  {
    title: "Accuracy you can rely on",
    desc: "Talent profiles are approved against clear criteria, and information is kept current, so everyone can trust what they read.",
    icon: CheckCircle2,
  },
  {
    title: "Grow together",
    desc: "We succeed when organizers sell out and talent gets recognised. Every paid service comes with clear results, so partners can see the value.",
    icon: TrendingUp,
  },
  {
    title: "Local at heart",
    desc: "Built in Sri Lanka, for Sri Lanka’s scenes, from Colombo, Galle, Kandy and beyond, with respect for the culture that creates them.",
    icon: MapPin,
  },
];

const stats = [
  { value: 250, suffix: "+", label: "Events Discovered", sublabel: "Concerts, cultural gatherings & club nights" },
  { value: 150, suffix: "+", label: "Talent Profiles", sublabel: "Performers, creators, DJs & experts" },
  { value: 12, suffix: "K+", label: "Community Members", sublabel: "Active across Web, WhatsApp & digests" },
  { value: 48, suffix: "M+", label: "Total Reach", sublabel: "Audience amplified island-wide" },
];

const faqCategories = [
  {
    id: "general",
    name: "General",
    icon: Globe,
    tagline: "Discovery, tickets & community",
    intro: {
      title: "Who are we?",
      text: "We are exclusively an event & talent discovery platform.",
    },
    items: [
      {
        q: "Can I buy tickets on DiscoverEvents.lk?",
        a: "Every event page shows ticket prices and a direct link to the official ticket seller, so you always buy from a trusted source. [Confirm]",
      },
      {
        q: "How do I find events on a specific date or in my area?",
        a: "Use the date and location filters on the Events page to see what’s happening in your city, this weekend or on any day you choose.",
      },
      {
        q: "I’m travelling in Sri Lanka. How can I plan around events?",
        a: "Filter by the dates and cities on your trip to find concerts, festivals, cultural events and more. You can also join our WhatsApp community for weekly updates while you’re on the island.",
      },
      {
        q: "How do I stay updated on what’s coming up?",
        a: "Join our WhatsApp community or sign up for our newsletter. You’ll get weekly roundups, early announcements and exclusive deals.",
      },
      {
        q: "What happens if an event is postponed or cancelled?",
        a: "We update event pages as soon as organizers inform us. For refunds or ticket questions, contact the organizer or ticket seller directly.",
      },
      {
        q: "How do I report incorrect information or contact the team?",
        a: "Email discovereventslk@gmail.com or call 076 537 0521. We review every report and fix errors quickly.",
      },
    ],
  },
  {
    id: "organizers",
    name: "Event organizers",
    icon: CalendarCheck,
    tagline: "Listings, packages & promotion",
    items: [
      {
        q: "How do I list my event, and what does it cost?",
        a: "Click “List Your Event” and submit your details. A basic listing is free and includes your event page, search visibility and a place in our weekly roundups.",
      },
      {
        q: "What details do I need to submit?",
        a: "Event name, date, time, venue, poster or images, ticket prices, ticket link and lineup. The more complete your listing, the easier it is to find.",
      },
      {
        q: "How soon will my event go live?",
        a: "Most events go live within [X hours] after a quick check for accuracy. Submit early to make the most of our weekly roundups.",
      },
      {
        q: "Can I make changes after my event is published?",
        a: "Yes. Basic corrections to dates, times, venues and ticket links are free. Changes to promoted content may come at a small fee. [Confirm]",
      },
      {
        q: "Do you offer plans for recurring events?",
        a: "Yes. Organizers running weekly or monthly events can use our monthly plan for consistent promotion at better value.",
      },
      {
        q: "How do I know if promoting with you works?",
        a: "Every paid package comes with a reach report showing how many people saw and engaged with your event, so you can see exactly what you’re getting.",
      },
    ],
  },
  {
    id: "talent",
    name: "Talent",
    icon: Sparkles,
    tagline: "Performers, creators & experts",
    items: [
      {
        q: "Who can get a Talent profile?",
        a: "Performers, creators and experts who regularly appear at public events or do it professionally. Choose your main role, share proof of your work, and our team approves your profile.",
      },
      {
        q: "How do I get listed or claim my profile?",
        a: "Apply through our Talent form. If a profile already exists for you, claim it by verifying through your official social media account. Your basic profile is free.",
      },
      {
        q: "I’m appearing at an event but don’t have a profile. Will I still be shown?",
        a: "Yes. Everyone performing, hosting or speaking appears in that event’s lineup. You can apply for a full profile once you qualify.",
      },
      {
        q: "Can I update my profile?",
        a: "Yes. Basic updates to your photo, bio and links are free. Upgraded profile features will be available as paid options. [Confirm]",
      },
      {
        q: "What if I do more than one thing, like sing and act?",
        a: "Choose the role you’re best known for as your main role. You can add up to two secondary roles, so your profile shows everything you do.",
      },
      {
        q: "How does a profile help me get noticed?",
        a: "Your profile brings together who you are, what you do and every event you appear at in one place. Audiences can follow your work, and organizers can discover you for their next lineup.",
      },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════ */
export default function AboutPage() {
  const router = useRouter();

  const heroV = useInView(0.15);
  const visionMissionV = useInView(0.15);
  const storyV = useInView(0.15);
  const valuesV = useInView(0.1);
  const faqV = useInView(0.1);
  const contactV = useInView(0.1);

  return (
    <div style={{ background: "#0F1116", color: "#fff", height: "100dvh", overflowX: "hidden" }}>
      <ParticleField />
      <Navbar />

      {/* Snap container */}
      <div
        className="snap-container"
        style={{
          marginTop: "var(--nav-h, 64px)",
          height: "calc(100dvh - var(--nav-h, 64px))",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── 1. Hero / Who We Are ───────────────────────────────── */}
        <section
          ref={heroV.ref}
          className="snap-section scrollbar-hide"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "clamp(24px, 4.5vh, 60px) clamp(20px, 4vw, 40px)",
            position: "relative",
            overflowY: "auto",
          }}
        >
          {/* Subtle Ambient Backlights */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(232,220,192,0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "8%",
              width: "36vmax",
              height: "36vmax",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(233,30,140,0.04) 0%, transparent 70%)",
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: 960,
              width: "100%",
              margin: "0 auto",
              position: "relative",
              zIndex: 2,
              opacity: heroV.inView ? 1 : 0,
              transform: heroV.inView ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.8s ease, transform 0.8s ease",
            }}
          >
            {/* Eyebrow badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 18px",
                borderRadius: 999,
                background: "rgba(232, 220, 192, 0.08)",
                border: "1px solid rgba(232, 220, 192, 0.28)",
                marginBottom: "clamp(12px, 2vh, 22px)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#E8DCC0",
                  boxShadow: "0 0 10px rgba(232,220,192,0.85)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#E8DCC0",
                }}
              >
                WHO WE ARE
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(2rem, 5.2vw, 4.6rem)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.08,
                marginBottom: "clamp(14px, 2.4vh, 24px)",
              }}
            >
              Sri Lanka’s First Platform for<br />
              <span
                style={{
                  background: "linear-gradient(135deg, #FFFFFF 0%, #E8DCC0 55%, #CBB682 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block",
                }}
              >
                Events &amp; Talent
              </span>
            </h1>

            {/* Who we are description */}
            <p
              style={{
                fontSize: "clamp(0.95rem, 1.35vw, 1.2rem)",
                color: "rgba(255, 255, 255, 0.72)",
                maxWidth: 720,
                lineHeight: 1.75,
                margin: "0 auto clamp(20px, 3.5vh, 32px)",
              }}
            >
              DiscoverEvents.lk is Sri Lanka’s first platform for discovering both events and talent: one trusted home for everything happening across the island and the people who make it happen.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => router.push("/events")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "13px 30px",
                  borderRadius: 999,
                  background: "#2B2E36",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.22)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "rgba(232,220,192,0.5)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(232,220,192,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)";
                }}
              >
                Explore Events <ArrowRight size={15} />
              </button>
              <button
                type="button"
                onClick={() => router.push("/artists")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 30px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              >
                Discover Talent
              </button>
            </div>
          </div>
        </section>

        {/* ── 2. Vision & Mission ───────────────────────────────── */}
        <section
          ref={visionMissionV.ref}
          className="snap-section scrollbar-hide"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(24px, 4.5vh, 60px) clamp(20px, 4vw, 60px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(15,17,22,0.6) 100%)",
            overflowY: "auto",
          }}
        >
          <div style={{ maxWidth: 1140, width: "100%", margin: "0 auto" }}>
            {/* Section Header */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "clamp(20px, 3.5vh, 40px)",
                opacity: visionMissionV.inView ? 1 : 0,
                transform: visionMissionV.inView ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "#E8DCC0",
                  marginBottom: 8,
                }}
              >
                PURPOSE &amp; DIRECTION
              </p>
              <h2
                style={{
                  fontSize: "clamp(1.7rem, 3.4vw, 2.8rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                Vision &amp; Mission
              </h2>
            </div>

            {/* Vision & Mission Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "clamp(18px, 2.5vw, 32px)",
                alignItems: "stretch",
              }}
            >
              {/* Vision Card */}
              <div
                style={{
                  borderRadius: 22,
                  padding: "clamp(22px, 3.5vh, 36px) clamp(22px, 2.5vw, 36px)",
                  background: "linear-gradient(145deg, rgba(232, 220, 192, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
                  border: "1px solid rgba(232, 220, 192, 0.2)",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  opacity: visionMissionV.inView ? 1 : 0,
                  transform: visionMissionV.inView ? "translateX(0)" : "translateX(-30px)",
                  transition: "opacity 0.8s ease, transform 0.8s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(232,220,192,0.12) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(14px, 2vh, 22px)" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "5px 14px",
                        borderRadius: 999,
                        background: "rgba(232, 220, 192, 0.12)",
                        border: "1px solid rgba(232, 220, 192, 0.3)",
                      }}
                    >
                      <Compass size={14} color="#E8DCC0" />
                      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#E8DCC0" }}>
                        VISION
                      </span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em" }}>
                      DESTINATION #1
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "clamp(1.35rem, 2.2vw, 1.95rem)",
                      fontWeight: 900,
                      lineHeight: 1.2,
                      letterSpacing: "-0.01em",
                      color: "#FFFFFF",
                      marginBottom: "clamp(12px, 1.8vh, 18px)",
                    }}
                  >
                    Every Event Seen.<br />
                    <span style={{ color: "#E8DCC0" }}>Every Talent Known.</span>
                  </h3>

                  <p
                    style={{
                      color: "rgba(255, 255, 255, 0.65)",
                      lineHeight: 1.8,
                      fontSize: "clamp(0.9rem, 1.1vw, 1.05rem)",
                    }}
                  >
                    To be Sri Lanka’s #1 destination for discovering the events and talent that too often go unnoticed.
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "clamp(18px, 2.5vh, 28px)",
                    paddingTop: "clamp(12px, 1.5vh, 18px)",
                    borderTop: "1px solid rgba(232, 220, 192, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "rgba(255, 255, 255, 0.4)",
                    fontSize: "clamp(0.75rem, 0.9vw, 0.85rem)",
                  }}
                >
                  <Globe size={15} color="#E8DCC0" />
                  <span>Connecting 22 million citizens and global visitors to Sri Lanka’s stages.</span>
                </div>
              </div>

              {/* Mission Card */}
              <div
                style={{
                  borderRadius: 22,
                  padding: "clamp(22px, 3.5vh, 36px) clamp(22px, 2.5vw, 36px)",
                  background: "linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(233, 30, 140, 0.03) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  opacity: visionMissionV.inView ? 1 : 0,
                  transform: visionMissionV.inView ? "translateX(0)" : "translateX(30px)",
                  transition: "opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(233,30,140,0.08) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(14px, 2vh, 22px)" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "5px 14px",
                        borderRadius: 999,
                        background: "rgba(255, 255, 255, 0.07)",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                      }}
                    >
                      <Sparkles size={14} color="#E8DCC0" />
                      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#FFFFFF" }}>
                        MISSION
                      </span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em" }}>
                      AMPLIFY CULTURE
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "clamp(1.35rem, 2.2vw, 1.95rem)",
                      fontWeight: 900,
                      lineHeight: 1.2,
                      letterSpacing: "-0.01em",
                      color: "#FFFFFF",
                      marginBottom: "clamp(12px, 1.8vh, 18px)",
                    }}
                  >
                    Putting Sri Lanka’s<br />
                    <span style={{ color: "#E8DCC0" }}>Culture in the Spotlight</span>
                  </h3>

                  <p
                    style={{
                      color: "rgba(255, 255, 255, 0.65)",
                      lineHeight: 1.8,
                      fontSize: "clamp(0.9rem, 1.1vw, 1.05rem)",
                    }}
                  >
                    Sri Lanka is known for its beauty, but the events and talent that bring it to life often go unseen. We’re changing that by bringing them onto one trusted platform, amplifying events to fill stages and giving talent a home to be found and recognized.
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "clamp(18px, 2.5vh, 28px)",
                    paddingTop: "clamp(12px, 1.5vh, 18px)",
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "rgba(255, 255, 255, 0.4)",
                    fontSize: "clamp(0.75rem, 0.9vw, 0.85rem)",
                  }}
                >
                  <Users size={15} color="#E8DCC0" />
                  <span>Empowering performers, organizers, and creative minds across all 9 provinces.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Our Story & Numbers (Impact) ────────────────────── */}
        <section
          ref={storyV.ref}
          className="snap-section scrollbar-hide"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(24px, 4.5vh, 60px) clamp(20px, 4vw, 60px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.01)",
            overflowY: "auto",
          }}
        >
          <div style={{ maxWidth: 1140, width: "100%", margin: "0 auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "clamp(28px, 4.5vw, 64px)",
                alignItems: "center",
              }}
            >
              {/* Left Column: Story narrative */}
              <div
                style={{
                  opacity: storyV.inView ? 1 : 0,
                  transform: storyV.inView ? "translateX(0)" : "translateX(-28px)",
                  transition: "opacity 0.8s ease, transform 0.8s ease",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 14px",
                    borderRadius: 999,
                    background: "rgba(232, 220, 192, 0.08)",
                    border: "1px solid rgba(232, 220, 192, 0.22)",
                    marginBottom: "clamp(10px, 1.5vh, 16px)",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8DCC0" }} />
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase", color: "#E8DCC0" }}>
                    OUR STORY
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: "clamp(1.7rem, 3.2vw, 2.7rem)",
                    fontWeight: 900,
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                    marginBottom: "clamp(14px, 2vh, 22px)",
                  }}
                >
                  Uniting the Island’s<br />
                  <span style={{ color: "#E8DCC0" }}>Creative Heartbeat</span>
                </h2>

                <p
                  style={{
                    color: "rgba(255,255,255,0.68)",
                    lineHeight: 1.8,
                    fontSize: "clamp(0.88rem, 1.05vw, 1rem)",
                    marginBottom: "clamp(12px, 1.8vh, 18px)",
                  }}
                >
                  Sri Lanka is celebrated across the globe for its natural beauty and heritage, but its true magic is found in its vibrant communities — the concerts, beach festivals, cultural theater, culinary pop-ups, and gifted performers who light up our island night after night.
                </p>

                <p
                  style={{
                    color: "rgba(255,255,255,0.52)",
                    lineHeight: 1.8,
                    fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                    marginBottom: "clamp(18px, 2.8vh, 28px)",
                  }}
                >
                  We amplify events through Web, WhatsApp, email, and social media to help organizers fill their stages, and we give performers, creators, and experts a dedicated home where they can be found, followed, and recognized. In doing so, we give every traveler and Sri Lankan the chance to discover, experience, and celebrate the island’s culture.
                </p>

                {/* Amplification Channels Pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["🌐 Web Platform", "💬 WhatsApp Community", "✉️ Curated Email", "📱 Social Media"].map((ch) => (
                    <span
                      key={ch}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.75)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Animated Numbers (Client's favorite counter animations) */}
              <div
                style={{
                  opacity: storyV.inView ? 1 : 0,
                  transform: storyV.inView ? "translateX(0)" : "translateX(28px)",
                  transition: "opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "clamp(12px, 1.8vw, 18px)",
                  }}
                >
                  {stats.map((s, i) => (
                    <AnimatedStat
                      key={s.label}
                      value={s.value}
                      suffix={s.suffix}
                      label={s.label}
                      sublabel={s.sublabel}
                      trigger={storyV.inView}
                      delay={i * 180}
                    />
                  ))}
                </div>

                {/* Islandwide badge */}
                {/* <div
                  style={{
                    marginTop: "clamp(14px, 2vh, 20px)",
                    padding: "12px 18px",
                    borderRadius: 14,
                    background: "rgba(232,220,192,0.04)",
                    border: "1px solid rgba(232,220,192,0.18)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <MapPin size={16} color="#E8DCC0" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: "clamp(0.75rem, 0.9vw, 0.85rem)", color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
                    From Colombo, Galle, Kandy, Jaffna, and beyond — built with deep respect for Sri Lanka’s culture.
                  </span>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Our Values ─────────────────────────────────────── */}
        <section
          ref={valuesV.ref}
          className="snap-section scrollbar-hide"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(24px, 4.5vh, 60px) clamp(20px, 4vw, 60px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "linear-gradient(180deg, rgba(15,17,22,0.4) 0%, rgba(232,220,192,0.02) 100%)",
            overflowY: "auto",
          }}
        >
          <div style={{ maxWidth: 1140, width: "100%", margin: "0 auto" }}>
            {/* Header */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "clamp(20px, 3vh, 36px)",
                opacity: valuesV.inView ? 1 : 0,
                transform: valuesV.inView ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "#E8DCC0",
                  marginBottom: 8,
                }}
              >
                WHAT DRIVES US
              </p>
              <h2
                style={{
                  fontSize: "clamp(1.7rem, 3.4vw, 2.8rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                }}
              >
                Our Values
              </h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "clamp(0.82rem, 1vw, 0.95rem)", maxWidth: 540, margin: "0 auto" }}>
                The principles that shape how we list, curate, and champion the island’s culture.
              </p>
            </div>

            {/* Values Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
                gap: "clamp(12px, 1.8vw, 18px)",
              }}
            >
              {values.map(({ title, desc, icon: Icon }, i) => (
                <div
                  key={title}
                  style={{
                    padding: "clamp(16px, 2vh, 22px) clamp(16px, 1.8vw, 22px)",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.02)",
                    backdropFilter: "blur(10px)",
                    opacity: valuesV.inView ? 1 : 0,
                    transform: valuesV.inView ? "translateY(0)" : "translateY(22px)",
                    transition: `opacity 0.6s ease ${i * 70}ms, transform 0.6s ease ${i * 70}ms, border-color 0.25s, background 0.25s`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(232, 220, 192, 0.35)";
                    e.currentTarget.style.background = "rgba(232, 220, 192, 0.04)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ marginBottom: "clamp(8px, 1.2vh, 14px)" }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(232,220,192,0.09)",
                        border: "1px solid rgba(232,220,192,0.22)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={17} color="#E8DCC0" />
                    </div>
                  </div>

                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: "clamp(0.92rem, 1.1vw, 1.05rem)",
                      letterSpacing: "0.02em",
                      marginBottom: 8,
                      color: "#FFFFFF",
                    }}
                  >
                    {title}
                  </h3>

                  <p
                    style={{
                      color: "rgba(255,255,255,0.52)",
                      fontSize: "clamp(0.8rem, 0.95vw, 0.88rem)",
                      lineHeight: 1.65,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. FAQ (Preserved as requested) ────────────────────── */}
        <section
          ref={faqV.ref}
          className="snap-section scrollbar-hide"
          style={{
            padding: "clamp(24px,4vh,60px) clamp(24px,5vw,80px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.01)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflowY: "auto",
          }}
        >
          <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "clamp(20px,3vh,40px)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: "#E8DCC0", marginBottom: 10 }}>
                GOT QUESTIONS?
              </p>
              <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.8rem)", fontWeight: 900 }}>Frequently Asked Questions</h2>
            </div>
            <FaqList inView={faqV.inView} />
          </div>
        </section>

        {/* ── 6. Get in Touch (Preserved as requested) ───────────── */}
        <section
          ref={contactV.ref}
          className="snap-section scrollbar-hide"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(32px,5vh,64px) clamp(24px,5vw,80px)",
            background: "rgba(232,220,192,0.02)",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              width: "100%",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "clamp(32px,5vw,80px)",
              alignItems: "center",
            }}
          >
            {/* Left — info */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: "#E8DCC0", marginBottom: 14 }}>
                GET IN TOUCH
              </p>
              <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,3rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
                Let's Work Together
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.8,
                  fontSize: "clamp(0.85rem,1.1vw,1rem)",
                  maxWidth: 420,
                  marginBottom: 32,
                }}
              >
                Whether you're a venue, artist, or promoter — we'd love to hear from you and explore how we can bring your events to a wider audience.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { icon: Mail, label: "discovereventslk@gmail.com", href: "mailto:discovereventslk@gmail.com" },
                  { icon: Phone, label: "076 537 0521", href: "tel:+94765370521" },
                  { icon: MapPin, label: "Colombo, Sri Lanka" },
                ].map(({ icon: Icon, label, href }: { icon: typeof Mail; label: string; href?: string }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(232,220,192,0.1)",
                        border: "1px solid rgba(232,220,192,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} color="#E8DCC0" />
                    </div>
                    {href ? (
                      <a href={href} style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(0.85rem,1vw,1rem)", textDecoration: "none" }}>
                        {label}
                      </a>
                    ) : (
                      <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(0.85rem,1vw,1rem)" }}>{label}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <ContactForm />
          </div>
        </section>

        {/* ── 7. Newsletter + Footer ─────────────────────────────── */}
        <div className="snap-section flex flex-col scrollbar-hide" style={{ overflowY: "auto" }}>
          <NewsletterSection />
          <Footer />
        </div>
      </div>
    </div>
  );
}
