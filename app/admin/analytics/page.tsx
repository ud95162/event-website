"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, MousePointerClick, TrendingUp, CalendarDays, Percent, Building2, Info, Music2, X, Search } from "lucide-react";
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
  const { events, organizers, artists, loading } = useAdminData();
  const [data, setData] = useState<Analytics | null>(null);
  // One search box + one type filter (Events / Organizers / Talent). They work independently:
  // search alone looks across all three; the type alone shows that kind of report; together the search is limited to that type.
  const [typeFilter, setTypeFilter] = useState<"all" | "events" | "organizers" | "talent">("all");
  const [search, setSearch] = useState("");
  const [item, setItem] = useState("all");   // a specific event id / organizer / talent picked from the second dropdown
  const changeType = (t: typeof typeFilter) => { setTypeFilter(t); setItem("all"); };
  const q = search.trim().toLowerCase();
  const has = (v?: string | null) => !!v && v.toLowerCase().includes(q);

  const isOrganizer = user?.role === "organizer";
  const myOrg = user?.orgName ?? "";

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

  // An organizer signed in only ever sees their own events; admins see everything the search / type lets through.
  const scopedEvents = (() => {
    const hit = (v?: string | null) => !!v && v.toLowerCase().includes(q);
    // Does an event match the search, within the chosen type?
    const matchEvent = (ev: typeof events[number]) => {
      if (!q) return true;
      const byTitle = hit(ev.title);
      const byOrg = hit(ev.organizer) || (ev.coOrganizers ?? []).some(n => hit(n));
      const byTalent = (ev.lineup ?? []).some(n => hit(n));
      switch (typeFilter) {
        case "events": return byTitle;
        case "organizers": return byOrg;
        case "talent": return byTalent;
        default: return byTitle || byOrg || byTalent;
      }
    };
    // The specific item picked from the dropdown (if any), within the chosen type.
    const picked = (ev: typeof events[number]) => {
      if (item === "all") return true;
      if (typeFilter === "events") return String(ev.id) === item;
      if (typeFilter === "organizers") return ev.organizer === item || (ev.coOrganizers ?? []).includes(item);
      if (typeFilter === "talent") return (ev.lineup ?? []).includes(item);
      return true;
    };
    const own = (ev: typeof events[number]) =>
      ev.organizer === myOrg || (ev.coOrganizers ?? []).includes(myOrg);
    return events
      .filter(ev => (isOrganizer ? own(ev) : matchEvent(ev) && picked(ev)))
      .map(ev => {
        const c = eventCounts.get(ev.id) ?? { views: 0, clicks: 0 };
        return { ...ev, views: c.views, clicks: c.clicks };
      })
      .sort((x, y) => y.views - x.views || y.clicks - x.clicks);
  })();

  // When the search points at exactly one organizer, show that organizer's profile views too.
  const orgSearchHits = organizers.filter(o => !!q && o.name.toLowerCase().includes(q));
  const scopedOrgName: string | null = isOrganizer
    ? (myOrg || null)
    : typeFilter === "organizers" && item !== "all" ? item
    : (typeFilter === "all" || typeFilter === "organizers") && orgSearchHits.length === 1 ? orgSearchHits[0].name : null;

  const totals = {
    views: scopedEvents.reduce((sum, e) => sum + e.views, 0),
    clicks: scopedEvents.reduce((sum, e) => sum + e.clicks, 0),
    profileViews: scopedOrgName ? (orgCounts.get(scopedOrgName)?.views ?? 0) : null,
  };

  const anyFilter = typeFilter !== "all" || !!q;
  const clearFilters = () => { setTypeFilter("all"); setItem("all"); setSearch(""); };

  // Items offered in the second dropdown, for the chosen type.
  const itemOptions = useMemo(() => {
    if (typeFilter === "events") return [...events].sort((a, b) => (a.title || "").localeCompare(b.title || "")).map(e => ({ value: String(e.id), label: e.title || "Untitled" }));
    if (typeFilter === "organizers") return organizers.map(o => o.name).filter(Boolean).sort((a, b) => a.localeCompare(b)).map(n => ({ value: n, label: n }));
    if (typeFilter === "talent") return Array.from(new Set(artists.map(a => a.stageName || a.name).filter(Boolean))).sort((a, b) => a.localeCompare(b)).map(n => ({ value: n, label: n }));
    return [];
  }, [typeFilter, events, organizers, artists]);

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

  // Per-talent rollup: totals across every event the artist performs in.
  const talentRollup = useMemo(() => {
    return artists
      .map(a => {
        const name = a.stageName || a.name;
        const evs = events.filter(ev => (ev.lineup ?? []).includes(name));
        const views = evs.reduce((sum, ev) => sum + (eventCounts.get(ev.id)?.views ?? 0), 0);
        const clicks = evs.reduce((sum, ev) => sum + (eventCounts.get(ev.id)?.clicks ?? 0), 0);
        return { id: a.id, name, events: evs.length, views, clicks };
      })
      .filter(t => t.name)
      .sort((a, b) => b.views - a.views || b.clicks - a.clicks || b.events - a.events);
  }, [artists, events, eventCounts]);

  const orgRows = orgRollup.filter(o => (!q || has(o.name)) && (typeFilter !== "organizers" || item === "all" || o.name === item));
  const talentRows = talentRollup.filter(t => (!q || has(t.name)) && (typeFilter !== "talent" || item === "all" || t.name === item));
  const showOrgTable = !isOrganizer && (typeFilter === "organizers" || (typeFilter === "all" && (!q || orgRows.length > 0)));
  const showTalentTable = !isOrganizer && typeFilter === "talent";

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, color: "#E8DCC0", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>
            {isOrganizer ? "Your Performance" : "Overview"}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>Analytics</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 8, maxWidth: 620 }}>
            {isOrganizer
              ? <>Page views and ticket-link clicks for events by <strong style={{ color: "#E8DCC0" }}>{user?.orgName}</strong> — measure how well your promotion is converting.</>
              : "Page views and ticket-link clicks per event — search by event, organizer or talent to measure promotion effectiveness."}
          </p>
        </div>

        {/* Admin-only: one search bar + one type filter (Events / Organizers / Talent) */}
        {!isOrganizer && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Search</label>
              <div style={{ position: "relative", width: 300, maxWidth: "100%" }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={typeFilter === "events" ? "Search events…" : typeFilter === "organizers" ? "Search organizers…" : typeFilter === "talent" ? "Search talent…" : "Search events, organizers or talent…"}
                  style={{
                    width: "100%", padding: "9px 14px 9px 34px", borderRadius: 9,
                    background: "#0d0d12", border: `1px solid ${q ? "rgba(232,220,192,0.5)" : "rgba(255,255,255,0.12)"}`,
                    color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit",
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Filter</label>
              <select
                value={typeFilter}
                onChange={e => changeType(e.target.value as typeof typeFilter)}
                style={{
                  padding: "9px 14px", borderRadius: 9, width: 180, maxWidth: "100%",
                  background: "#0d0d12", border: `1px solid ${typeFilter !== "all" ? "rgba(232,220,192,0.5)" : "rgba(255,255,255,0.12)"}`,
                  color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer",
                }}
              >
                <option value="all">All</option>
                <option value="events">Events</option>
                <option value="organizers">Organizers</option>
                <option value="talent">Talent</option>
              </select>
            </div>
            {typeFilter !== "all" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                  {typeFilter === "events" ? "Event" : typeFilter === "organizers" ? "Organizer" : "Talent"}
                </label>
                <select
                  value={item}
                  onChange={e => setItem(e.target.value)}
                  style={{
                    padding: "9px 14px", borderRadius: 9, width: 240, maxWidth: "100%",
                    background: "#0d0d12", border: `1px solid ${item !== "all" ? "rgba(232,220,192,0.5)" : "rgba(255,255,255,0.12)"}`,
                    color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer",
                  }}
                >
                  <option value="all">{typeFilter === "events" ? "All events" : typeFilter === "organizers" ? "All organizers" : "All talent"}</option>
                  {itemOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            )}
            {anyFilter && (
              <button
                onClick={clearFilters}
                style={{ display: "flex", alignItems: "center", gap: 5, height: 38, padding: "0 14px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16, marginBottom: 16 }}>
        <StatCard icon={<Eye size={16} />} label="Page Views" value={totals.views.toLocaleString()} accent="#E8DCC0" />
        <StatCard icon={<MousePointerClick size={16} />} label="Ticket / Link Clicks" value={totals.clicks.toLocaleString()} accent="#60a5fa" />
        <StatCard icon={<Percent size={16} />} label="Click-through Rate" value={ctr(totals.clicks, totals.views).toFixed(1)} suffix="%" accent="#e879f9" />
        {scopedOrgName
          ? <StatCard icon={<Building2 size={16} />} label="Profile Views" value={(totals.profileViews ?? 0).toLocaleString()} accent="#f59e0b" />
          : <StatCard icon={<CalendarDays size={16} />} label="Events Tracked" value={scopedEvents.length.toLocaleString()} accent="#f59e0b" />}
        {/* Admin: how much has been added to the site overall (not affected by the filters) */}
        {!isOrganizer && (
          <>
            <StatCard icon={<CalendarDays size={16} />} label="Total Events" value={events.length.toLocaleString()} accent="#38bdf8" />
            <StatCard icon={<Music2 size={16} />} label="Total Artists" value={artists.length.toLocaleString()} accent="#f472b6" />
            <StatCard icon={<Building2 size={16} />} label="Total Organizers" value={organizers.length.toLocaleString()} accent="#a78bfa" />
          </>
        )}
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
      {showOrgTable && (
        <div style={{ ...card, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#E8DCC0" }}><Building2 size={14} /></span>
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
                {orgRows.map((o, i) => {
                  const active = typeFilter === "organizers" && item === o.name;
                  return (
                    <tr
                      key={o.id}
                      onClick={() => { if (active) setItem("all"); else { setTypeFilter("organizers"); setItem(o.name); } }}
                      style={{
                        borderBottom: i < orgRows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        cursor: "pointer",
                        background: active ? "rgba(232,220,192,0.08)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "12px 20px", color: "#fff", fontWeight: 600 }}>
                        <span style={{ color: active ? "#E8DCC0" : "#fff" }}>{o.name}</span>
                      </td>
                      <td style={{ padding: "12px 20px", textAlign: "right", color: "rgba(255,255,255,0.55)", fontVariantNumeric: "tabular-nums" }}>{o.events}</td>
                      <td style={{ padding: "12px 20px", textAlign: "right", color: "rgba(255,255,255,0.85)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{o.views.toLocaleString()}</td>
                      <td style={{ padding: "12px 20px", textAlign: "right", color: "#60a5fa", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{o.clicks.toLocaleString()}</td>
                      <td style={{ padding: "12px 20px", textAlign: "right", color: "#E8DCC0", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{ctr(o.clicks, o.views).toFixed(1)}%</td>
                    </tr>
                  );
                })}
                {orgRows.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: "28px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)" }}>{q ? "No organizers match this search." : "No organizers yet."}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Per-talent rollup — totals across every event the artist performs in */}
      {showTalentTable && (
        <div style={{ ...card, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#E8DCC0" }}><Music2 size={14} /></span>
            <h2 style={{ fontSize: 13, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Talent — Reach Summary</h2>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>Click a row to see that talent&apos;s events</span>
          </div>
          <div style={{ overflowX: "auto", maxHeight: 420, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Talent", "Events", "Page Views", "Ticket Clicks", "CTR"].map((h, i) => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: i === 0 ? "left" : "right", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {talentRows.map((t, i) => {
                  const active = item === t.name;
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setItem(active ? "all" : t.name)}
                      style={{ borderBottom: i < talentRows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer", background: active ? "rgba(232,220,192,0.08)" : "transparent" }}
                    >
                      <td style={{ padding: "12px 20px", color: active ? "#E8DCC0" : "#fff", fontWeight: 600 }}>{t.name}</td>
                      <td style={{ padding: "12px 20px", textAlign: "right", color: "rgba(255,255,255,0.55)", fontVariantNumeric: "tabular-nums" }}>{t.events}</td>
                      <td style={{ padding: "12px 20px", textAlign: "right", color: "rgba(255,255,255,0.85)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{t.views.toLocaleString()}</td>
                      <td style={{ padding: "12px 20px", textAlign: "right", color: "#60a5fa", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{t.clicks.toLocaleString()}</td>
                      <td style={{ padding: "12px 20px", textAlign: "right", color: "#E8DCC0", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{ctr(t.clicks, t.views).toFixed(1)}%</td>
                    </tr>
                  );
                })}
                {talentRows.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: "28px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)" }}>{q ? "No talent match this search." : "No talent yet."}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Per-event table */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#E8DCC0" }}><TrendingUp size={14} /></span>
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
                  <td style={{ padding: "11px 20px", textAlign: "right", color: "#E8DCC0", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{ctr(ev.clicks, ev.views).toFixed(1)}%</td>
                </tr>
              ))}
              {!loading && scopedEvents.length === 0 && (
                <tr><td colSpan={isOrganizer ? 4 : 5} style={{ padding: "28px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)" }}>
                  {isOrganizer ? "No events assigned to your organizer account yet." : "No events match this search."}
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
