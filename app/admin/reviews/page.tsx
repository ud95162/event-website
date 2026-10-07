"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useAdminData, Review } from "../../context/AdminDataContext";
import { Trash2, X, Check, Star, Pencil, MessageSquareQuote } from "lucide-react";
import ImageUpload from "../components/ImageUpload";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 13,
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)",
  letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6,
};

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star`}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
          <Star size={22} style={{ color: n <= value ? "#F5B301" : "rgba(255,255,255,0.2)" }} fill={n <= value ? "#F5B301" : "none"} />
        </button>
      ))}
    </div>
  );
}

const EMPTY = { name: "", title: "", image: "", review: "", rating: 5 };

export default function ReviewsAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { reviews, addReview, updateReview, deleteReview } = useAdminData();

  const [form, setForm] = useState<{ name: string; title: string; image: string; review: string; rating: number }>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/admin");
  }, [user, router]);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setError(""); setShowForm(true); };
  const openEdit = (r: Review) => {
    setForm({ name: r.name, title: r.title ?? "", image: r.image ?? "", review: r.review, rating: r.rating });
    setEditId(r.id); setError(""); setShowForm(true);
  };
  const close = () => { setShowForm(false); setForm(EMPTY); setEditId(null); setError(""); };

  const canSave = !!form.name.trim() && !!form.review.trim() && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError("");
    const payload = { name: form.name.trim(), title: form.title.trim() || null, image: form.image || null, review: form.review.trim(), rating: form.rating };
    const ok = editId != null
      ? await updateReview({ id: editId, ...payload })
      : await addReview(payload);
    setSaving(false);
    if (ok) close();
    else setError("Couldn't save — the server didn't respond. Please try again.");
  };

  if (user?.role !== "admin") return null;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, color: "#E8DCC0", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Manage</p>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>Customer Reviews</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>Shown in the home &ldquo;What People Say&rdquo; section.</p>
        </div>
        <button
          onClick={() => (showForm ? close() : openAdd())}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, background: showForm ? "rgba(255,255,255,0.06)" : "#E8DCC0", border: showForm ? "1px solid rgba(255,255,255,0.15)" : "none", color: showForm ? "rgba(255,255,255,0.5)" : "#000", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
        >
          {showForm ? <><X size={14} /> Cancel</> : <>+ Add Review</>}
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div style={{ marginBottom: 28, padding: 24, background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>{editId != null ? "Edit Review" : "New Review"}</p>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 20 }}>
            <ImageUpload
              label="Photo"
              value={form.image}
              onChange={(v) => setForm(f => ({ ...f, image: v }))}
              aspectRatio="square"
              hint="Reviewer photo · Square · Max 5 MB"
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Nimal Perera" />
              </div>
              <div>
                <label style={labelStyle}>Title <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>(optional — shown by the name)</span></label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. DJ & Producer, Event Organizer" maxLength={255} />
              </div>
              <div>
                <label style={labelStyle}>Rating</label>
                <StarPicker value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} />
              </div>
              <div>
                <label style={labelStyle}>Review *</label>
                <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={form.review} onChange={e => setForm(f => ({ ...f, review: e.target.value }))} placeholder="What the customer said…" />
              </div>
            </div>
          </div>
          {error && (
            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 13 }}>{error}</div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
            <button type="button" onClick={close} style={{ padding: "9px 20px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <button type="button" onClick={handleSave} disabled={!canSave} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 22px", borderRadius: 8, background: canSave ? "#2B2E36" : "rgba(43,46,54,0.5)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 12, fontWeight: 800, cursor: canSave ? "pointer" : "not-allowed", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <Check size={13} /> {saving ? "Saving…" : editId != null ? "Save Changes" : "Add Review"}
            </button>
          </div>
        </div>
      )}

      {/* Review list */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {reviews.map(r => (
          <div key={r.id} style={{ position: "relative", borderRadius: 12, padding: 18, background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {r.image ? (
                <img src={r.image} alt={r.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: "rgba(232,220,192,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#E8DCC0", fontWeight: 900 }}>{r.name.charAt(0)}</div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</p>
                {r.title && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{r.title}</p>}
                <div style={{ display: "flex", gap: 1, marginTop: 3 }}>
                  {[1, 2, 3, 4, 5].map(n => <Star key={n} size={12} style={{ color: n <= r.rating ? "#F5B301" : "rgba(255,255,255,0.18)" }} fill={n <= r.rating ? "#F5B301" : "none"} />)}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>{r.review}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 2 }}>
              <button onClick={() => openEdit(r)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Pencil size={13} /></button>
              {confirmDelete === r.id ? (
                <>
                  <button onClick={() => { deleteReview(r.id); setConfirmDelete(null); }} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.9)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={13} /></button>
                  <button onClick={() => setConfirmDelete(null)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
                </>
              ) : (
                <button onClick={() => setConfirmDelete(r.id)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={13} /></button>
              )}
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 56, background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, gap: 12 }}>
            <MessageSquareQuote size={36} style={{ color: "rgba(255,255,255,0.12)" }} />
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No reviews yet. Click &ldquo;Add Review&rdquo; to add customer reviews.</p>
          </div>
        )}
      </div>
    </div>
  );
}
