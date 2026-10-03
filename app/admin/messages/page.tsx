"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Trash2, X, Check, Mail, MailOpen, Search, Reply } from "lucide-react";

type Message = { id: number; name: string; email: string; subject: string; message: string; isRead: boolean; createdAt: string };

// Messages sent from the About page "Get in touch" form.
export default function MessagesAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const token = user?.token;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/admin");
  }, [user, router]);

  const headers = useCallback((): Record<string, string> => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/contact", { headers: headers(), cache: "no-store" })
      .then(async r => {
        if (r.status === 401) { setAuthError(true); return []; }
        setAuthError(false);
        return r.ok ? r.json() : [];
      })
      .then(d => setMessages(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, headers]);

  useEffect(() => { load(); }, [load]);

  const setRead = (id: number, isRead: boolean) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, isRead } : m)));
    fetch(`/api/contact/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...headers() }, body: JSON.stringify({ isRead }) }).catch(() => {});
  };

  const toggleOpen = (m: Message) => {
    const next = openId === m.id ? null : m.id;
    setOpenId(next);
    if (next !== null && !m.isRead) setRead(m.id, true);   // opening a message marks it read
  };

  const remove = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    setConfirmDelete(null);
    fetch(`/api/contact/${id}`, { method: "DELETE", headers: headers() }).catch(() => {});
  };

  const fmt = (d: string) => {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (user?.role !== "admin") return null;

  const q = query.trim().toLowerCase();
  const shown = messages.filter(m =>
    (!unreadOnly || !m.isRead) &&
    (!q || `${m.name} ${m.email} ${m.subject} ${m.message}`.toLowerCase().includes(q))
  );
  const unread = messages.filter(m => !m.isRead).length;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 10, color: "#E8DCC0", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Inbox</p>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>Messages</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
          {loading ? "Loading…" : `${messages.length} message${messages.length !== 1 ? "s" : ""} from the About page contact form${unread ? ` · ${unread} unread` : ""}.`}
        </p>
      </div>

      {authError && (
        <div style={{ marginBottom: 18, padding: "12px 16px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 13 }}>
          Your admin session has expired or is out of date. Please log out and sign in again to view messages.
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 220, maxWidth: 380, padding: "9px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <Search size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search messages…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, fontFamily: "inherit" }} />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex" }}><X size={13} /></button>}
        </div>
        <button
          onClick={() => setUnreadOnly(u => !u)}
          style={{ padding: "9px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", background: unreadOnly ? "#2B2E36" : "rgba(255,255,255,0.04)", border: `1px solid ${unreadOnly ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)"}`, color: unreadOnly ? "#fff" : "rgba(255,255,255,0.55)" }}
        >
          Unread only{unread ? ` (${unread})` : ""}
        </button>
      </div>

      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
        {shown.map((m, i) => {
          const isOpen = openId === m.id;
          return (
            <div key={m.id} style={{ borderBottom: i < shown.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: isOpen ? "rgba(255,255,255,0.03)" : !m.isRead ? "rgba(232,220,192,0.04)" : "transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px" }}>
                <button onClick={() => toggleOpen(m)} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer", textAlign: "left", color: "#fff", fontFamily: "inherit", padding: 0 }}>
                  <span title={m.isRead ? "Read" : "Unread"} style={{ width: 9, height: 9, borderRadius: "50%", flexShrink: 0, background: m.isRead ? "transparent" : "#E8DCC0", border: m.isRead ? "1px solid rgba(255,255,255,0.2)" : "none" }} />
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: m.isRead ? 600 : 800 }}>{m.name}</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{m.email}</span>
                    </span>
                    <span style={{ display: "block", fontSize: 13, color: m.isRead ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.8)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <strong style={{ fontWeight: 700 }}>{m.subject}</strong>{isOpen ? "" : ` — ${m.message}`}
                    </span>
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{fmt(m.createdAt)}</span>
                </button>
                {confirmDelete === m.id ? (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => remove(m.id)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.9)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={13} /></button>
                    <button onClick={() => setConfirmDelete(null)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(m.id)} title="Delete" style={{ width: 30, height: 30, borderRadius: 6, flexShrink: 0, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={13} /></button>
                )}
              </div>

              {isOpen && (
                <div style={{ padding: "0 18px 18px 39px" }}>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: 14 }}>{m.message}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#2B2E36", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}
                    ><Reply size={13} /> Reply by email</a>
                    <button
                      onClick={() => setRead(m.id, !m.isRead)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >{m.isRead ? <><Mail size={13} /> Mark as unread</> : <><MailOpen size={13} /> Mark as read</>}</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!loading && shown.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 56, gap: 12 }}>
            <Mail size={36} style={{ color: "rgba(255,255,255,0.12)" }} />
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
              {messages.length === 0 ? "No messages yet." : "No messages match."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
