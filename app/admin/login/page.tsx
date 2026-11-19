"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

export default function AdminLoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/admin");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await login(username, password);
    if (ok) {
      router.replace("/admin");
    } else {
      setError("That username or password doesn't look right. Please try again.");
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px", borderRadius: 12,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s, background 0.2s",
  };
  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)",
    letterSpacing: "0.15em", textTransform: "uppercase" as const, marginBottom: 8,
  };
  const focusOn = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "rgba(232,220,192,0.6)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; };
  const focusOff = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; };

  const perks = [
    "Add and manage your events in one place",
    "See how many people view and click your listings",
    "Keep your profile fresh so people can find you",
  ];

  return (
    <div className="login-shell" style={{ minHeight: "100vh", background: "#0F1116", display: "flex", fontFamily: "inherit" }}>
      <style>{`
        @keyframes login-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .login-rise { animation: login-rise 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .login-shell { flex-direction: row; }
        .login-welcome { flex: 1.1; display: flex; }
        .login-form-side { flex: 1; }
        @media (max-width: 900px) {
          .login-shell { flex-direction: column; }
          .login-welcome { flex: none; min-height: 0; padding: 24px 20px 28px !important; }
          .login-welcome .login-perks, .login-welcome .login-tagline { display: none !important; }
          .login-welcome .login-hero { margin: 20px 0 4px !important; }
          .login-form-side { padding: 28px 20px 40px !important; }
        }
      `}</style>

      {/* ── Welcome panel ─────────────────────────────────────────── */}
      <section
        className="login-welcome"
        style={{
          position: "relative", overflow: "hidden", flexDirection: "column", justifyContent: "space-between",
          padding: "clamp(28px, 5vw, 64px)",
          backgroundImage: "linear-gradient(160deg, rgba(15,17,22,0.55) 0%, rgba(15,17,22,0.9) 70%), url(/banner1.png)",
          backgroundSize: "cover", backgroundPosition: "center",
        }}
      >
        <div aria-hidden style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", left: -140, bottom: -160, background: "radial-gradient(circle, rgba(232,220,192,0.18), transparent 70%)", pointerEvents: "none" }} />
        <Link href="/" style={{ position: "relative", display: "inline-block", width: "fit-content" }}>
          <img src="/logo.png" alt="DiscoverEvents.lk" style={{ height: 46, width: "auto", display: "block" }} />
        </Link>

        <div className="login-rise login-hero" style={{ position: "relative", maxWidth: 520, margin: "32px 0" }}>
          <p style={{ fontSize: 11, color: "#E8DCC0", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>Partner Portal</p>
          <h1 style={{ margin: 0, color: "#fff", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.02em", fontSize: "clamp(2rem, 4.2vw, 3.4rem)" }}>
            Welcome back.
            <span style={{ display: "block", color: "rgba(255,255,255,0.55)" }}>Let&apos;s get your events seen.</span>
          </h1>
          <ul className="login-perks" style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "flex", flexDirection: "column", gap: 12 }}>
            {perks.map(t => (
              <li key={t} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.75)", fontSize: 15 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(232,220,192,0.15)", border: "1px solid rgba(232,220,192,0.4)", color: "#E8DCC0", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="login-tagline" style={{ position: "relative", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Sri Lanka&apos;s home for events and talent.</p>
      </section>

      {/* ── Sign-in form ──────────────────────────────────────────── */}
      <section className="login-form-side" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40, position: "relative" }}>
        <div className="login-rise" style={{ width: "100%", maxWidth: 400, animationDelay: "0.1s" }}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: 28, fontWeight: 900, letterSpacing: "-0.01em" }}>Good to see you</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "8px 0 28px", lineHeight: 1.5 }}>
            Sign in to manage your events and profile.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Username</label>
              <input
                style={inputStyle}
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Your username"
                autoComplete="username"
                required
                onFocus={focusOn}
                onBlur={focusOff}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <PasswordInput
                style={inputStyle}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                required
                onFocus={focusOn}
                onBlur={focusOff}
              />
            </div>

            {error && (
              <div role="alert" style={{
                padding: "11px 14px", borderRadius: 10,
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                fontSize: 13, color: "#f87171", lineHeight: 1.4,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px", borderRadius: 999,
                background: loading ? "rgba(232,220,192,0.5)" : "#E8DCC0",
                border: "none", color: "#000", fontSize: 13, fontFamily: "inherit",
                fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s, transform 0.2s", marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
            >
              {loading ? "Signing you in…" : "Sign in"}
            </button>
          </form>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            <span>
              Need a hand? Email{" "}
              <a href="mailto:Info@discoverevents.lk" style={{ color: "#E8DCC0", textDecoration: "none", fontWeight: 600 }}>Info@discoverevents.lk</a>
            </span>
            <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: 600 }}>← Back to DiscoverEvents.lk</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
