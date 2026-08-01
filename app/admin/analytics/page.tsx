"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, MousePointerClick, TrendingUp, CalendarDays, Percent, Building2, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAdminData } from "../../context/AdminDataContext";

type Row = { entityType: string; entityId: number; name: string; views: number; clicks: number };
type Analytics = {
  totals: { views: number; clicks: number };
  events: Row[];
  organizers: Row[];
};

const card: React.CSSProperties = {
  background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12,
};

const ctr = (clicks: number, views: number) => (views > 0 ? (clicks / views) * 100 : 0);

function StatCard({ icon, label, value, accent, suffix }: { icon: React.ReactNode; label: string; value: string; accent: string; suffix?: string }) {
  return (
    <div style={{ ...card, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${accent}18`, border: `1px solid ${accent}33`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
          {icon}
        </div>
      </div>
      <span style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
        {value}
        {suffix && <span style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginLeft: 4 }}>{suffix}</span>}
      </span>
    </div>
  );
}

export default function AdminAnalytics() {
  const { user } = useAuth();
  const { events, organizers, loading } = useAdminData();
  const [data, setData] = useState<Analytics | null>(null);
  const [orgFilter, setOrgFilter] = useState<string>("all");

  const isOrganizer = user?.role === "organizer";
  const scopedOrgName = isOrganizer ? user?.orgName : orgFilter === "all" ? null : orgFilter;

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then(setData).catch(() => {});
  }, []);

  // eventId -> counts, and organizer-name -> counts (organizer public-page views)
  const eventCounts = useMemo(() => {
    const m = new Map<number, { views: number; clicks: number }>();
    for (const r of data?.events ?? []) m.set(r.entityId, { views: r.views, clicks: r.clicks });
    return m;
  }, [data]);

  const orgCounts = useMemo(() => {
    const m = new Map<string, { views: number; clicks: number }>();
    for (const r of data?.organizers ?? []) m.set(r.name, { views: r.views, clicks: r.clicks });
    return m;
  }, [data]);

  // Events belonging to the scoped organizer (or all, for admin viewing "all").
  const scopedEvents = useMemo(() => {
    const belongs = (ev: typeof events[number]) =>
      !scopedOrgName || ev.organizer === scopedOrgName || (ev.coOrganizers ?? []).includes(scopedOrgName);
    return events
      .filter(belongs)
      .map(ev => {
        const c = eventCounts.get(ev.id) ?? { views: 0, clicks: 0 };
        return { ...ev, views: c.views, clicks: c.clicks };
      })
      .sort((a, b) => b.views - a.views || b.clicks - a.clicks);
  }, [events, eventCounts, scopedOrgName]);

  const totals = useMemo(() => {
    const views = scopedEvents.reduce((s, e) => s + e.views, 0);
    const clicks = scopedEvents.reduce((s, e) => s + e.clicks, 0);
    const profileViews = scopedOrgName ? (orgCounts.get(scopedOrgName)?.views ?? 0) : null;
    return { views, clicks, profileViews };
  }, [scopedEvents, orgCounts, scopedOrgName]);

  const orgOptions = useMemo(
    () => [...organizers].map(o => o.name).sort((a, b) => a.localeCompare(b)),
    [organizers]
  );

  // Per-organizer rollup (admin overview): totals across every event they host.
  const orgRollup = useMemo(() => {
    return organizers
      .map(o => {
        const evs = events.filter(ev => ev.organizer === o.name || (ev.coOrganizers ?? []).includes(o.name));
        const views = evs.reduce((s, ev) => s + (eventCounts.get(ev.id)?.views ?? 0), 0);
        const clicks = evs.reduce((s, ev) => s + (eventCounts.get(ev.id)?.clicks ?? 0), 0);
        return { id: o.id, name: o.name, events: evs.length, views, clicks, profileViews: orgCounts.get(o.name)?.views ?? 0 };
      })
      .sort((a, b) => b.views - a.views || b.clicks - a.clicks);
  }, [organizers, events, eventCounts, orgCounts]);

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>
            {isOrganizer ? "Your Performance" : "Overview"}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>Analytics</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 8, maxWidth: 620 }}>
            {isOrganizer
              ? <>Page views and ticket-link clicks for events by <strong style={{ color: "#39BD69" }}>{user?.orgName}</strong> — measure how well your promotion is converting.</>
              : "Page views and ticket-link clicks per event — filter by organizer to measure promotion effectiveness."}
          </p>
        </div>

        {/* Admin-only organizer filter */}
        {!isOrganizer && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Organizer</label>
            <select
              value={orgFilter}
              onChange={e => setOrgFilter(e.target.value)}
              style={{
                padding: "9px 14px", borderRadius: 9, minWidth: 220,
                background: "#0d0d12", border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer",
              }}
            >
              <option value="all">All organizers</option>
              {orgOptions.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
        <StatCard icon={<Eye size={16} />} label="Page Views" value={totals.views.toLocaleString()} accent="#39BD69" />
        <StatCard icon={<MousePointerClick size={16} />} label="Ticket / Link Clicks" value={totals.clicks.toLocaleString()} accent="#60a5fa" />
        <StatCard icon={<Percent size={16} />} label="Click-through Rate" value={ctr(totals.clicks, totals.views).toFixed(1)} suffix="%" accent="#e879f9" />
        {scopedOrgName
          ? <StatCard icon={<Building2 size={16} />} label="Profile Views" value={(totals.profileViews ?? 0).toLocaleString()} accent="#f59e0b" />
          : <StatCard icon={<CalendarDays size={16} />} label="Events Tracked" value={scopedEvents.length.toLocaleString()} accent="#f59e0b" />}
      </div>

      {/* Ticket-sales note (no checkout integration yet) */}
      <div style={{ ...card, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 24, background: "rgba(96,165,250,0.05)", borderColor: "rgba(96,165,250,0.2)" }}>
        <Info size={15} style={{ color: "#60a5fa", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
          <strong style={{ color: "#fff" }}>Ticket / Link Clicks</strong> counts every tap on an event&apos;s ticket / external-link button — your best live proxy for buying intent.
          Exact <strong style={{ color: "#fff" }}>ticket-sales</strong> figures become available once a checkout / payment provider is connected.
        </p>
      </div>

      {/* Per-organizer rollup (admin overview) — the report to hand each organizer */}
      {!isOrganizer && (
        <div style={{ ...card, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#39BD69" }}><Building2 size={14} /></span>
            <h2 style={{ fontSize: 13, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Organizers — Reach Summary</h2>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>Click a row to see that organizer&apos;s events</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Organizer", "Events", "Page Views", "Ticket Clicks", "CTR"].map((h, i) => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: i === 0 ? "left" : "right", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orgRollup.map((o, i) => {
                  const active = orgFilter === o.name;
                  return (
                    <tr
                      key={o.id}
                      onClick={() => setOrgFilter(active ? "all" : o.name)}
                      style={{
                        borderBottom: i < orgRollup.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        cursor: "pointer",
                        background: active ? "rgba(57,189,105,0.08)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "12px 20px", color: "#fff", fontWeight: 600 }}>
                        <span style={{ color: active ? "#39BD69" : "#fff" }}>{o.name}</span>
                      </td>
                      <td style={{ padding: "12px 20px", textAlign: "right", color: "rgba(255,255,255,0.55)", fontVariantNumeric: "tabular-nums" }}>{o.events}</td>
                      <td style={{ padding: "12px 20px", textAlign: "right", color: "rgba(255,255,255,0.85)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{o.views.toLocaleString()}</td>
                      <td style={{ padding: "12px 20px", textAlign: "right", color: "#60a5fa", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{o.clicks.toLocaleString()}</td>
                      <td style={{ padding: "12px 20px", textAlign: "right", color: "#39BD69", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{ctr(o.clicks, o.views).toFixed(1)}%</td>
                    </tr>
                  );
                })}
                {orgRollup.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: "28px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)" }}>No organizers yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Per-event table */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#39BD69" }}><TrendingUp size={14} /></span>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {isOrganizer ? "Your Events" : "Events by Performance"}
          </h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Event", ...(isOrganizer ? [] : ["Organizer"]), "Views", "Clicks", "CTR"].map((h, i) => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: i === 0 || (h === "Organizer") ? "left" : "right", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scopedEvents.map((ev, i) => (
                <tr key={ev.id} style={{ borderBottom: i < scopedEvents.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <td style={{ padding: "11px 20px", color: "#fff", fontWeight: 600 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {ev.image
                        ? <img src={ev.image} alt="" style={{ width: 30, height: 38, borderRadius: 5, objectFit: "cover", flexShrink: 0, background: "#000" }} />
                        : <div style={{ width: 30, height: 38, borderRadius: 5, background: "rgba(255,255,255,0.05)", flexShrink: 0 }} />}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>{ev.title || "Untitled"}</span>
                    </div>
                  </td>
                  {!isOrganizer && (
                    <td style={{ padding: "11px 20px", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>{ev.organizer || "—"}</td>
                  )}
                  <td style={{ padding: "11px 20px", textAlign: "right", color: "rgba(255,255,255,0.75)", fontVariantNumeric: "tabular-nums" }}>{ev.views.toLocaleString()}</td>
                  <td style={{ padding: "11px 20px", textAlign: "right", color: "#60a5fa", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{ev.clicks.toLocaleString()}</td>
                  <td style={{ padding: "11px 20px", textAlign: "right", color: "#39BD69", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{ctr(ev.clicks, ev.views).toFixed(1)}%</td>
                </tr>
              ))}
              {!loading && scopedEvents.length === 0 && (
                <tr><td colSpan={isOrganizer ? 4 : 5} style={{ padding: "28px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)" }}>
                  {isOrganizer ? "No events assigned to your organizer account yet." : "No events match this filter."}
                </td></tr>
              )}
              {loading && (
                <tr><td colSpan={isOrganizer ? 4 : 5} style={{ padding: "28px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)" }}>Loading…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
