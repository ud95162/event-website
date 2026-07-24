"use client";

import { useEffect, useState } from "react";
import { Eye, MousePointerClick, CalendarDays, Building2, TrendingUp } from "lucide-react";

type Row = { entityType: string; entityId: number; name: string; views: number; clicks: number };
type Analytics = {
  totals: { views: number; clicks: number };
  events: Row[];
  organizers: Row[];
};

const card: React.CSSProperties = {
  background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12,
};

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: string }) {
  return (
    <div style={{ ...card, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${accent}18`, border: `1px solid ${accent}33`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
          {icon}
        </div>
      </div>
      <span style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{value.toLocaleString()}</span>
    </div>
  );
}

function RankTable({ title, icon, rows }: { title: string; icon: React.ReactNode; rows: Row[] }) {
  return (
    <div style={{ ...card, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#39BD69" }}>{icon}</span>
        <h2 style={{ fontSize: 13, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h2>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Name", "Views", "Clicks"].map(h => (
              <th key={h} style={{ padding: "10px 20px", textAlign: h === "Name" ? "left" : "right", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((r, i) => (
            <tr key={r.entityId} style={{ borderBottom: i < Math.min(rows.length, 10) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <td style={{ padding: "11px 20px", color: "#fff", fontWeight: 600 }}>{r.name}</td>
              <td style={{ padding: "11px 20px", textAlign: "right", color: "rgba(255,255,255,0.7)", fontVariantNumeric: "tabular-nums" }}>{r.views.toLocaleString()}</td>
              <td style={{ padding: "11px 20px", textAlign: "right", color: "#39BD69", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{r.clicks.toLocaleString()}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={3} style={{ padding: "28px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)" }}>No data yet — metrics appear as visitors browse.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then(setData).catch(() => {});
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Overview</p>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>Analytics</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>Page views and link clicks per event and organizer — measure promotion effectiveness.</p>
      </div>

      {/* Totals */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard icon={<Eye size={16} />}                label="Total Page Views" value={data?.totals.views ?? 0}  accent="#39BD69" />
        <StatCard icon={<MousePointerClick size={16} />}  label="Total Link Clicks" value={data?.totals.clicks ?? 0} accent="#60a5fa" />
        <StatCard icon={<CalendarDays size={16} />}       label="Tracked Events"    value={data?.events.length ?? 0} accent="#e879f9" />
        <StatCard icon={<Building2 size={16} />}           label="Tracked Organizers" value={data?.organizers.length ?? 0} accent="#f59e0b" />
      </div>

      {/* Ranked tables */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
        <RankTable title="Top Events" icon={<TrendingUp size={14} />} rows={data?.events ?? []} />
        <RankTable title="Top Organizers" icon={<TrendingUp size={14} />} rows={data?.organizers ?? []} />
      </div>
    </div>
  );
}
