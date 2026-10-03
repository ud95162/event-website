"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Trash2, X, Check, Mail, Download } from "lucide-react";

type Subscriber = { id: number; email: string; createdAt: string };

export default function SubscribersAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/admin");
  }, [user, router]);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/subscribers")
      .then(r => (r.ok ? r.json() : []))
      .then(d => setSubs(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = (id: number) => {
    setSubs(prev => prev.filter(s => s.id !== id));
    setConfirmDelete(null);
    fetch(`/api/subscribers/${id}`, { method: "DELETE" }).catch(() => {});
  };

  const exportCsv = () => {
    const rows = ["email,subscribed_at", ...subs.map(s => `${s.email},${s.createdAt ?? ""}`)].join("\n");
    const url = URL.createObjectURL(new Blob([rows], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (d: string) => {
    if (!d) return "";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (user?.role !== "admin") return null;

  const filtered = subs.filter(s => s.email.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 10, color: "#E8DCC0", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Manage</p>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>Newsletter Subscribers</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
            {loading ? "Loading…" : `${subs.length} subscriber${subs.length !== 1 ? "s" : ""} from the home newsletter form.`}
          </p>
        </div>
        {subs.length > 0 && (
          <button onClick={exportCsv}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
            <Download size={14} /> Export CSV
          </button>
        )}
      </div>

      {/* Search */}
      {subs.length > 0 && (
        <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 8, maxWidth: 360, padding: "9px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <Mail size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by email…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, fontFamily: "inherit" }} />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex" }}><X size={13} /></button>}
        </div>
      )}

      {/* List */}
      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
        {filtered.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", background: i % 2 ? "rgba(255,255,255,0.015)" : "transparent", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "rgba(232,220,192,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail size={15} style={{ color: "#E8DCC0" }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{fmt(s.createdAt)}</p>
              </div>
            </div>
            {confirmDelete === s.id ? (
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => remove(s.id)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.9)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={13} /></button>
                <button onClick={() => setConfirmDelete(null)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(s.id)} style={{ width: 30, height: 30, borderRadius: 6, flexShrink: 0, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={13} /></button>
            )}
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 56, gap: 12 }}>
            <Mail size={36} style={{ color: "rgba(255,255,255,0.12)" }} />
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
              {subs.length === 0 ? "No subscribers yet." : "No subscribers match your search."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
