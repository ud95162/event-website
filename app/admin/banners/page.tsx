"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useAdminData, Banner, Event } from "../../context/AdminDataContext";
import { Trash2, X, Check, ImageIcon } from "lucide-react";
import ImageUpload from "../components/ImageUpload";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 13,
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const selectStyle: React.CSSProperties = {
  ...inputStyle, background: "#0d0d12", cursor: "pointer",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)",
  letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6,
};

/* ── Editable banner card ────────────────────────────────────────── */
function BannerCard({ banner, index, events, onUpdate, onDelete }: {
  banner: Banner; index: number; events: Event[];
  onUpdate: (b: Banner) => Promise<boolean>; onDelete: (id: number) => void;
}) {
  const [title, setTitle] = useState(banner.title ?? "");
  const [description, setDescription] = useState(banner.description ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Re-sync when the server echoes back a saved value.
  useEffect(() => { setTitle(banner.title ?? ""); }, [banner.title]);
  useEffect(() => { setDescription(banner.description ?? ""); }, [banner.description]);

  const save = async (patch: Partial<Banner>) => {
    setStatus("saving");
    const ok = await onUpdate({ ...banner, title: title || null, description: description || null, ...patch });
    setStatus(ok ? "saved" : "error");
    if (ok) setTimeout(() => setStatus("idle"), 1500);
  };

  const saveText = () => {
    if ((banner.title ?? "") !== title || (banner.description ?? "") !== description) save({});
  };

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}>
      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>
        <img
          src={banner.url}
          alt="Banner"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", top: 8, left: 10, padding: "3px 10px", borderRadius: 999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Banner {index + 1}</p>
        </div>
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          {confirmDelete ? (
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => { onDelete(banner.id); setConfirmDelete(false); }} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.9)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} /></button>
              <button onClick={() => setConfirmDelete(false)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} /></button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.75)", backdropFilter: "blur(6px)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={12} /></button>
          )}
        </div>
      </div>

      {/* Editable fields */}
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={labelStyle}>Title</label>
          <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} onBlur={saveText} placeholder="Banner headline" />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, height: 64, resize: "vertical" }} value={description} onChange={e => setDescription(e.target.value)} onBlur={saveText} placeholder="Short description shown on the banner" />
        </div>
        <div>
          <label style={labelStyle}>Explore Event <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>(date &amp; venue come from it)</span></label>
          <select
            value={banner.eventId ?? ""}
            onChange={e => save({ eventId: e.target.value ? Number(e.target.value) : null })}
            style={selectStyle}
          >
            <option value="">— No event linked —</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
          </select>
        </div>

        {/* Auto-save status */}
        <div style={{ minHeight: 14 }}>
          {status === "saving" && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Saving…</span>}
          {status === "saved" && <span style={{ fontSize: 11, color: "#39BD69" }}>✓ Saved</span>}
          {status === "error" && <span style={{ fontSize: 11, color: "#f87171" }}>Couldn&apos;t save — check your connection and edit again to retry.</span>}
        </div>
      </div>
    </div>
  );
}

export default function BannersAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { banners, events, addBanner, updateBanner, deleteBanner } = useAdminData();
  const [newImage, setNewImage] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEventId, setNewEventId] = useState<string>("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/admin");
  }, [user, router]);

  const resetForm = () => { setNewImage(""); setNewTitle(""); setNewDesc(""); setNewEventId(""); };

  const handleAdd = async () => {
    if (!newImage.trim() || saving) return;
    setSaving(true);
    setError("");
    const ok = await addBanner({
      url: newImage.trim(),
      title: newTitle.trim() || null,
      description: newDesc.trim() || null,
      eventId: newEventId ? Number(newEventId) : null,
    });
    setSaving(false);
    if (ok) {
      resetForm();
      setShowAdd(false);
    } else {
      setError("Couldn't save — the server didn't respond. Your inputs are safe; please click again to retry.");
    }
  };

  if (user?.role !== "admin") return null;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Manage</p>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>Hero Banners</h1>
        </div>
        <button
          onClick={() => { setShowAdd(s => !s); resetForm(); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, background: showAdd ? "rgba(255,255,255,0.06)" : "#39BD69", border: showAdd ? "1px solid rgba(255,255,255,0.15)" : "none", color: showAdd ? "rgba(255,255,255,0.5)" : "#000", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
        >
          {showAdd ? <><X size={14} /> Cancel</> : <>+ Add Banner</>}
        </button>
      </div>

      {/* Add Banner panel */}
      {showAdd && (
        <div style={{ marginBottom: 28, padding: 24, background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>New Banner</p>
          <ImageUpload
            label="Banner Image"
            value={newImage}
            onChange={setNewImage}
            aspectRatio="wide"
            hint="Wide landscape image (16:9 recommended) · PNG, JPG, WEBP · Max 5 MB"
          />
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Banner headline" />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, height: 70, resize: "vertical" }} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Short description shown on the banner" />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Explore Event <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>(the button opens this event · date &amp; venue come from it)</span></label>
            <select value={newEventId} onChange={e => setNewEventId(e.target.value)} style={selectStyle}>
              <option value="">— No event linked —</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>
          {error && (
            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 13 }}>
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => { setShowAdd(false); resetForm(); setError(""); }} style={{ padding: "9px 20px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Cancel
            </button>
            <button type="button" onClick={handleAdd} disabled={!newImage || saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 22px", borderRadius: 8, background: (newImage && !saving) ? "#39BD69" : "rgba(57,189,105,0.3)", border: "none", color: "#000", fontSize: 12, fontWeight: 800, cursor: (newImage && !saving) ? "pointer" : "not-allowed", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <Check size={13} /> {saving ? "Saving…" : "Add Banner"}
            </button>
          </div>
        </div>
      )}

      {/* Banner grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {banners.map((banner, i) => (
          <BannerCard key={banner.id} banner={banner} index={i} events={events} onUpdate={updateBanner} onDelete={deleteBanner} />
        ))}

        {banners.length === 0 && (
          <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 56, background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, gap: 12 }}>
            <ImageIcon size={36} style={{ color: "rgba(255,255,255,0.12)" }} />
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No banners yet. Click "Add Banner" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
