"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = login(username, password);
    if (ok) {
      router.replace("/admin");
    } else {
      setError("Invalid username or password");
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 8,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff", fontSize: 14, outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080808",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 60px),
                          repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 60px)`,
      }} />

      <div style={{
        width: "100%", maxWidth: 400, padding: 40,
        background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16, position: "relative",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>Admin Panel</p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" }}>EVENTS.LK</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
              Username
            </label>
            <input
              style={inputStyle}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(57,189,105,0.5)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
              Password
            </label>
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(57,189,105,0.5)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              fontSize: 13, color: "#ef4444",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px", borderRadius: 8,
              background: loading ? "rgba(57,189,105,0.5)" : "#39BD69",
              border: "none", color: "#000", fontSize: 13,
              fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s", marginTop: 4,
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
