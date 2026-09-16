"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useAdminData } from "../../context/AdminDataContext";
import { Check, Search, MonitorPlay, Eye, EyeOff } from "lucide-react";

const card: React.CSSProperties = {
  background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)",
  letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6,
};

export default function PopupAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { events, updateEvent, popupSettings, updatePopupSettings, loading } = useAdminData();

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(popupSettings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/admin/analytics");
  }, [user, router]);

  // Keep the local draft in sync once settings load in.
  useEffect(() => { setDraft(popupSettings); }, [popupSettings]);

  const selectedCount = useMemo(() => events.filter(e => e.popup).length, [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...events].sort((a, b) => Number(!!b.popup) - Number(!!a.popup) || a.id - b.id);
    if (!q) return sorted;
    return sorted.filter(e =>
      e.title?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q) ||
      e.venue?.toLowerCase().includes(q) ||
      e.date?.toLowerCase().includes(q)
    );
  }, [events, query]);

  const toggle = (id: number, current: boolean) => {
    const ev = events.find(e => e.id === id);
    if (ev) updateEvent({ ...ev, popup: !current });
  };

  const saveSettings = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    const ok = await updatePopupSettings(draft);
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } else {
      setError("Couldn't save — the server didn't respond. Please try again.");
    }
  };

  if (user?.role !== "admin") return null;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Homepage</p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.01em" }}>“This Week” Popup</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, maxWidth: 640 }}>
          The popup that appears after the homepage preloader. Turn it on or off, edit its heading, and choose whether it
          shows this week&apos;s events automatically or a hand-picked set.
        </p>
      </div>

      {/* Settings card */}
      <div style={{ ...card, padding: 24, marginBottom: 24 }}>
        {/* Enable toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Show the popup</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>When off, no popup appears on the homepage.</p>
          </div>
          <button
            type="button"
            onClick={() => setDraft(d => ({ ...d, enabled: !d.enabled }))}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 999, cursor: "pointer",
              background: draft.enabled ? "rgba(57,189,105,0.12)" : "rgba(255,255,255,0.04)",
              border: draft.enabled ? "1px solid rgba(57,189,105,0.35)" : "1px solid rgba(255,255,255,0.12)",
              color: draft.enabled ? "#39BD69" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, fontFamily: "inherit",
            }}
          >
            {draft.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
            {draft.enabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Popup Heading</label>
          <input style={inputStyle} value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder="Happening This Week" />
        </div>

        {/* Mode */}
        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>Which events to show</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {([
              { key: "auto", title: "Automatic", desc: "Events happening in the next 7 days" },
              { key: "manual", title: "Hand-picked", desc: "Only the events you select below" },
            ] as const).map(opt => {
              const active = draft.mode === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setDraft(d => ({ ...d, mode: opt.key }))}
                  style={{
                    textAlign: "left", padding: "14px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                    background: active ? "rgba(57,189,105,0.08)" : "rgba(255,255,255,0.02)",
                    border: active ? "1.5px solid #39BD69" : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 700, color: active ? "#39BD69" : "#fff", marginBottom: 3 }}>{opt.title}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14 }}>
          {error && <span style={{ fontSize: 12, color: "#f87171" }}>{error}</span>}
          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 8, background: saving ? "rgba(57,189,105,0.5)" : "#39BD69", border: "none", color: "#000", fontSize: 13, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}
          >
            <Check size={14} /> {saving ? "Saving…" : saved ? "Saved" : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Event picker */}
      <div style={{ ...card, overflow: "hidden", opacity: draft.mode === "manual" ? 1 : 0.55 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ color: "#39BD69" }}><MonitorPlay size={15} /></span>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Select Events for the Popup</h2>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, background: "rgba(57,189,105,0.1)", border: "1px solid rgba(57,189,105,0.25)", fontSize: 11, fontWeight: 700, color: "#39BD69" }}>
            {selectedCount} selected
          </span>
        </div>

        <div style={{ padding: 16 }}>
          {draft.mode === "auto" && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.15)" }}>
              Mode is set to <strong style={{ color: "#fff" }}>Automatic</strong> — the popup shows this week&apos;s events. Switch to
              <strong style={{ color: "#fff" }}> Hand-picked</strong> above to use the selection below.
            </p>
          )}

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 14, maxWidth: 380 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search events by name, venue, date…" style={{ ...inputStyle, paddingLeft: 34 }} />
          </div>

          {loading ? (
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, padding: "16px 0" }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, padding: "16px 0" }}>No events found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 460, overflowY: "auto" }}>
              {filtered.map(ev => {
                const on = !!ev.popup;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => toggle(ev.id, on)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                      textAlign: "left", fontFamily: "inherit",
                      background: on ? "rgba(57,189,105,0.07)" : "rgba(255,255,255,0.02)",
                      border: on ? "1.5px solid #39BD69" : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {ev.image
                      ? <img src={ev.image} alt="" style={{ width: 40, height: 50, borderRadius: 6, objectFit: "cover", flexShrink: 0, background: "#000" }} />
                      : <div style={{ width: 40, height: 50, borderRadius: 6, background: "rgba(255,255,255,0.05)", flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title || "Untitled"}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.date}{ev.location ? ` · ${ev.location}` : ""}</p>
                    </div>
                    <div style={{
                      width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: on ? "#39BD69" : "transparent",
                      border: on ? "none" : "1px solid rgba(255,255,255,0.2)",
                    }}>
                      {on && <Check size={15} style={{ color: "#000" }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
