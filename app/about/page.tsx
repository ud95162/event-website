"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NewsletterSection from "../components/NewsletterSection";
import ParticleField from "../components/ParticleField";
import { ArrowRight, Music2, Users, Globe, Zap, Heart, Star, MapPin, Mail, Phone } from "lucide-react";

/* ── Count-up hook ─────────────────────────────────────────────── */
function useCountUp(target: number, duration: number, trigger: boolean) {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (!trigger) { setCount(0); return; }
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [trigger, target, duration]);
  return count;
}

/* ── Intersection observer helper ─────────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Data ──────────────────────────────────────────────────────── */
const team = [
  { name: "Ashan Perera",      role: "Founder & CEO",       img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop", bio: "Passionate about connecting Sri Lanka's music lovers with world-class events." },
  { name: "Dilani Wijesinghe", role: "Head of Events",      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&fit=crop", bio: "10+ years curating unforgettable live experiences across the island." },
  { name: "Niran Fernando",    role: "Lead Developer",      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&fit=crop", bio: "Building the tech that powers seamless event discovery and ticketing." },
  { name: "Kavya Ratnayake",   role: "Creative Director",   img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&fit=crop", bio: "Designing the visual identity that makes every event feel extraordinary." },
];

const values = [
  { icon: Music2, title: "Passion for Music",  desc: "We live and breathe music. Every event we feature is chosen with genuine love for the art." },
  { icon: Users,  title: "Community First",    desc: "We build bridges between artists, fans, and venues to create a thriving local music scene." },
  { icon: Globe,  title: "Global Reach",       desc: "Bringing international acts to Sri Lanka and putting local talent on the world stage." },
  { icon: Zap,    title: "Seamless Experience",desc: "From discovery to the last note, we make every step of your event journey effortless." },
  { icon: Heart,  title: "Authentic Moments",  desc: "We believe live music creates memories that last a lifetime. We're here to make those moments." },
  { icon: Star,   title: "Quality Curation",   desc: "Only the best events make it to our platform. Every listing is verified and quality-checked." },
];

const stats = [
  { value: 250, suffix: "+",  label: "Events Listed" },
  { value: 12,  suffix: "K+", label: "Happy Users"   },
  { value: 48,  suffix: "M+", label: "Total Reach"   },
];

function StatItem({ value, suffix, label, trigger, delay }: { value: number; suffix: string; label: string; trigger: boolean; delay: number }) {
  const [started, setStarted] = useState(false);
  const count = useCountUp(value, 2000, started);
  useEffect(() => {
    if (!trigger) { setStarted(false); return; }
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [trigger, delay]);
  return (
    <div style={{ textAlign: "center", opacity: started ? 1 : 0, transform: started ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
      <div style={{ fontSize: "clamp(3.5rem, 7vw, 6rem)", fontWeight: 900, background: "linear-gradient(180deg,#fff 0%,rgba(255,255,255,0.35) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#39BD69", boxShadow: "0 0 8px rgba(57,189,105,0.6)", margin: "10px auto 8px", transform: started ? "scale(1)" : "scale(0)", transition: "transform 0.5s ease 0.4s" }} />
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" }}>{label}</p>
    </div>
  );
}

/* ── Contact Form ──────────────────────────────────────────────── */
function ContactForm() {
  const [form, setForm]     = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent]     = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%", padding: "12px 16px", borderRadius: 12, outline: "none",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${focused === field ? "rgba(57,189,105,0.5)" : "rgba(255,255,255,0.1)"}`,
    color: "#fff", fontSize: 14, fontFamily: "inherit",
    transition: "border-color 0.2s",
    boxShadow: focused === field ? "0 0 0 3px rgba(57,189,105,0.08)" : "none",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }, 3000);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Name + Email row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>Name</p>
          <input
            type="text" required placeholder="Your name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
            style={inputStyle("name")}
          />
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>Email</p>
          <input
            type="email" required placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
            style={inputStyle("email")}
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>Subject</p>
        <input
          type="text" required placeholder="How can we help?"
          value={form.subject}
          onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
          onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)}
          style={inputStyle("subject")}
        />
      </div>

      {/* Message */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>Message</p>
        <textarea
          required placeholder="Tell us about your event, venue, or collaboration idea…"
          rows={4} value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
          style={{ ...inputStyle("message"), resize: "none" }}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        style={{
          padding: "14px 32px", borderRadius: 12, cursor: "pointer",
          background: sent ? "rgba(57,189,105,0.2)" : "linear-gradient(90deg,#39BD69,#2da857)",
          color: sent ? "#39BD69" : "#000",
          fontWeight: 800, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
          fontFamily: "inherit",
          border: sent ? "1px solid rgba(57,189,105,0.4)" : "none",
          transition: "all 0.3s",
          boxShadow: sent ? "none" : "0 0 24px rgba(57,189,105,0.2)",
        } as React.CSSProperties}
      >
        {sent ? "✓ Message Sent!" : "Send Message"}
      </button>
    </form>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function AboutPage() {
  const router  = useRouter();
  const statsV  = useInView(0.3);
  const missionV = useInView(0.15);
  const valuesV = useInView(0.1);
  const teamV   = useInView(0.1);

  const sectionStyle: React.CSSProperties = {
    height: "calc(100dvh - 64px)",
    overflowY: "auto",
    scrollbarWidth: "none",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
  };

  return (
    <div style={{ background: "#080808", color: "#fff", height: "100dvh", overflowX: "hidden" }}>
      <ParticleField />
      <Navbar />

      {/* Snap container */}
      <div className="snap-container" style={{ marginTop: 64, height: "calc(100dvh - 64px)", position: "relative", zIndex: 1 }}>

        {/* ── 1. Hero ─────────────────────────────────────────── */}
        <div className="snap-section" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "clamp(24px,5vh,80px) 24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(57,189,105,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "15%", left: "5%", width: "40vmax", height: "40vmax", borderRadius: "50%", background: "radial-gradient(circle, rgba(233,30,140,0.05) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: "#39BD69", marginBottom: "clamp(10px,2vh,20px)" }}>WHO WE ARE</p>
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 5.5rem)", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: "clamp(12px,2.5vh,28px)", maxWidth: 900 }}>
            Sri Lanka's Premier<br />
            <span style={{ background: "linear-gradient(90deg, #39BD69, #e91e8c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Event Discovery
            </span>{" "}Platform
          </h1>
          <p style={{ fontSize: "clamp(0.9rem, 1.4vw, 1.15rem)", color: "rgba(255,255,255,0.5)", maxWidth: 580, lineHeight: 1.7, marginBottom: "clamp(20px,4vh,40px)" }}>
            Events.lk was born from a simple belief — that great music and unforgettable live experiences should be accessible to everyone. We connect passionate fans with the events that move them.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => router.push("/events")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 26px", borderRadius: 999, background: "#39BD69", color: "#000", fontWeight: 800, fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", border: "none" }}>
              Explore Events <ArrowRight size={14} />
            </button>
            <button onClick={() => router.push("/artists")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 26px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
              Meet Artists
            </button>
          </div>
        </div>

        {/* ── 2. Stats ─────────────────────────────────────────── */}
        <div ref={statsV.ref} className="snap-section" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(24px,5vh,60px) clamp(24px,5vw,80px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(24px,5vh,56px)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: "#39BD69", marginBottom: 12 }}>BY THE NUMBERS</p>
            <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.8rem)", fontWeight: 900 }}>Our Impact</h2>
          </div>
          <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "clamp(24px,4vh,48px)" }}>
            {stats.map((s, i) => <StatItem key={s.label} {...s} trigger={statsV.inView} delay={i * 200} />)}
          </div>
        </div>

        {/* ── 3. Mission ───────────────────────────────────────── */}
        <div ref={missionV.ref} className="snap-section" style={{ padding: "clamp(24px,5vh,60px) clamp(24px,5vw,80px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px,5vw,80px)", alignItems: "center", height: "100%" }}>
            <div style={{ opacity: missionV.inView ? 1 : 0, transform: missionV.inView ? "translateX(0)" : "translateX(-30px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: "#39BD69", marginBottom: "clamp(8px,1.5vh,16px)" }}>OUR MISSION</p>
              <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.8rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: "clamp(12px,2vh,24px)" }}>Making Live Music<br />Accessible to All</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.8, fontSize: "clamp(0.85rem, 1.1vw, 1rem)", marginBottom: "clamp(8px,1.5vh,16px)" }}>
                We started Events.lk because we noticed a gap — amazing events happening across Sri Lanka, but no single place to discover them all. We set out to change that.
              </p>
              <p style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.8, fontSize: "clamp(0.85rem, 1.1vw, 1rem)" }}>
                Today, we partner with hundreds of venues, promoters, and artists to bring you the most comprehensive event listing platform in the country.
              </p>
            </div>
            <div style={{ position: "relative", opacity: missionV.inView ? 1 : 0, transform: missionV.inView ? "translateX(0)" : "translateX(30px)", transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s" }}>
              <div style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "4/3" }}>
                <img src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&q=80&fit=crop" alt="Live concert crowd" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }} />
              </div>
              <div style={{ position: "absolute", bottom: -16, left: -16, background: "rgba(8,8,8,0.92)", border: "1px solid rgba(57,189,105,0.3)", borderRadius: 14, padding: "14px 20px", backdropFilter: "blur(12px)" }}>
                <p style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 900, color: "#39BD69", lineHeight: 1 }}>2018</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4 }}>Founded in Colombo</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Values ────────────────────────────────────────── */}
        <div ref={valuesV.ref} className="snap-section" style={{ padding: "clamp(24px,4vh,60px) clamp(24px,5vw,80px)", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "clamp(20px,3vh,40px)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: "#39BD69", marginBottom: 10 }}>WHAT DRIVES US</p>
              <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.8rem)", fontWeight: 900 }}>Our Values</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "clamp(12px,2vh,20px)" }}>
              {values.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} style={{ padding: "clamp(16px,2vh,24px)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", opacity: valuesV.inView ? 1 : 0, transform: valuesV.inView ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s ease ${i * 70}ms, transform 0.6s ease ${i * 70}ms` }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(57,189,105,0.1)", border: "1px solid rgba(57,189,105,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "clamp(8px,1.5vh,14px)" }}>
                    <Icon size={18} color="#39BD69" />
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: "clamp(0.8rem, 1.1vw, 0.95rem)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>{title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "clamp(0.75rem, 0.9vw, 0.88rem)", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 5. Team ──────────────────────────────────────────── */}
        <div ref={teamV.ref} className="snap-section" style={{ padding: "clamp(24px,4vh,60px) clamp(24px,5vw,80px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "clamp(20px,3vh,40px)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: "#39BD69", marginBottom: 10 }}>THE PEOPLE BEHIND IT</p>
              <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.8rem)", fontWeight: 900 }}>Meet the Team</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "clamp(12px,2vw,24px)" }}>
              {team.map(({ name, role, img, bio }, i) => (
                <div key={name} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", opacity: teamV.inView ? 1 : 0, transform: teamV.inView ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.7s ease ${i * 100}ms, transform 0.7s ease ${i * 100}ms` }}>
                  <div style={{ aspectRatio: "1", overflow: "hidden" }}>
                    <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", filter: "grayscale(30%)" }} />
                  </div>
                  <div style={{ padding: "clamp(12px,1.5vh,20px)" }}>
                    <h3 style={{ fontWeight: 800, fontSize: "clamp(0.85rem, 1.1vw, 1rem)", marginBottom: 4 }}>{name}</h3>
                    <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>{role}</p>
                    <p style={{ fontSize: "clamp(0.75rem, 0.9vw, 0.85rem)", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 6. Contact (full screen) ─────────────────────────── */}
        <div className="snap-section" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(32px,5vh,64px) clamp(24px,5vw,80px)", background: "rgba(57,189,105,0.02)" }}>
            <div style={{ maxWidth: 1100, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px,5vw,80px)", alignItems: "center" }}>

              {/* Left — info */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: "#39BD69", marginBottom: 14 }}>GET IN TOUCH</p>
                <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,3rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>Let's Work Together</h2>
                <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.8, fontSize: "clamp(0.85rem,1.1vw,1rem)", maxWidth: 420, marginBottom: 32 }}>
                  Whether you're a venue, artist, or promoter — we'd love to hear from you and explore how we can bring your events to a wider audience.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { icon: Mail,   label: "hello@events.lk"      },
                    { icon: Phone,  label: "+94 11 234 5678"       },
                    { icon: MapPin, label: "Colombo 03, Sri Lanka" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(57,189,105,0.1)", border: "1px solid rgba(57,189,105,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={15} color="#39BD69" />
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(0.85rem,1vw,1rem)" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — form */}
              <ContactForm />

            </div>
        </div>

        {/* ── 7. Newsletter + Footer ───────────────────────────── */}
        <div className="snap-section flex flex-col">
          <NewsletterSection />
          <Footer />
        </div>

      </div>
    </div>
  );
}
