"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { Event } from "../../context/AdminDataContext";
import { eventSlug } from "../../lib/slug";
import { statusColor } from "../../data/events";
import { Search, Calendar, MapPin, ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";

const PER_PAGE_OPTIONS = [10, 25, 50];

const selectStyle: React.CSSProperties = {
  padding: "9px 12px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff", fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "inherit",
};

// Read-only list of the events published by the signed-in organizer.
export default function MyEventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  // The organizer's current name comes from the server (their record may have been renamed since
  // they signed in); the session's copy is only the fallback.
  const [freshName, setFreshName] = useState("");
  useEffect(() => {
    if (!user?.token) return;
    fetch("/api/organizers/me", { headers: { Authorization: `Bearer ${user.token}` }, cache: "no-store" })
      .then(r => (r.ok ? r.json() : null))
      .then(o => { if (o?.name) setFreshName(o.name); })
      .catch(() => {});
  }, [user?.token]);
  const orgName = freshName || user?.orgName || "";

  // Admins manage events from the Events page.
  useEffect(() => {
    if (user && user.role !== "organizer") router.replace("/admin/events");
  }, [user, router]);

  const [data, setData] = useState<{ events: Event[]; total: number; page: number; totalPages: number }>(
    { events: [], total: 0, page: 1, totalPages: 1 }
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const reqId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => { setPage(1); }, [debounced, perPage]);

  const load = useCallback(async () => {
    if (!orgName) return;
    const id = ++reqId.current;
    const params = new URLSearchParams({ page: String(page), limit: String(perPage), organizer: orgName, sort: "desc" });
    if (debounced) params.set("q", debounced);
    try {
      const res = await fetch(`/api/events/admin?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const d = await res.json();
      if (id === reqId.current) { setData(d); setLoading(false); }
    } catch {
      if (id === reqId.current) setLoading(false);
    }
  }, [orgName, page, perPage, debounced]);
  useEffect(() => { load(); }, [load]);

  if (user?.role !== "organizer") return null;

  const { events, total, totalPages } = data;
  const currentPage = data.page;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, color: "#E8DCC0", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>{orgName}</p>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>My Events</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>Events published under your organizer account.</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your events…"
            style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex" }}><X size={13} /></button>
          )}
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{total} event{total !== 1 ? "s" : ""}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Show</span>
          <select value={perPage} onChange={e => setPerPage(Number(e.target.value))} style={{ ...selectStyle, padding: "8px 10px" }}>
            {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      {events.length === 0 ? (
        <div style={{ padding: "40px 16px", textAlign: "center", color: "rgba(255,255,255,0.25)", background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 }}>
          {loading ? "Loading events…" : debounced ? "No events match your search." : "You haven't published any events yet."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {events.map(ev => (
            <div key={ev.id} style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", height: 140 }}>
                <img src={ev.image} alt={ev.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,13,0.9) 0%, transparent 60%)" }} />
                {ev.badge && (
                  <span style={{ position: "absolute", top: 8, left: 8, fontSize: 8, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 999, background: "rgba(232,220,192,0.9)", color: "#000" }}>{ev.badge}</span>
                )}
                {ev.status && (
                  <span style={{ position: "absolute", top: 8, right: 8, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 999, background: `${statusColor(ev.status)}22`, color: statusColor(ev.status), border: `1px solid ${statusColor(ev.status)}66`, backdropFilter: "blur(4px)" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor(ev.status) }} />{ev.status}
                  </span>
                )}
              </div>
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{ev.title}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                    <Calendar size={11} /> {ev.date}{ev.startTime ? ` · ${ev.startTime}` : ""}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                    <MapPin size={11} /> {ev.venue ? `${ev.venue}, ` : ""}{ev.location}
                  </div>
                </div>
                <Link
                  href={`/events/${eventSlug(ev)}`}
                  target="_blank"
                  style={{ marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, height: 32, borderRadius: 6, background: "rgba(232,220,192,0.1)", border: "1px solid rgba(232,220,192,0.25)", color: "#E8DCC0", fontSize: 11, fontWeight: 700, textDecoration: "none", letterSpacing: "0.05em" }}
                >
                  <ExternalLink size={12} /> View on site
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > perPage && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, total)} of {total}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: currentPage === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, cursor: currentPage === 1 ? "default" : "pointer" }}>
              <ChevronLeft size={13} /> Prev
            </button>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", padding: "0 8px" }}>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: currentPage === totalPages ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, cursor: currentPage === totalPages ? "default" : "pointer" }}>
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
