"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useAdminData, Organizer } from "../../context/AdminDataContext";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import ImageUpload from "../components/ImageUpload";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700,
  color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em",
  textTransform: "uppercase", marginBottom: 6,
};

type FormState = { name: string; logo: string; description: string; banner: string };
const EMPTY: FormState = { name: "", logo: "", description: "", banner: "" };

export default function OrganizersAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { organizers, addOrganizer, updateOrganizer, deleteOrganizer } = useAdminData();

  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/admin");
  }, [user, router]);

  if (user?.role !== "admin") return null;

  const set = (key: keyof FormState, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (o: Organizer) => {
    setEditingId(o.id);
    setForm({
      name: o.name,
      logo: o.logo ?? "",
      description: o.description ?? "",
      banner: o.banner ?? "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    const payload = {
      name,
      logo: form.logo || undefined,
      description: form.description || undefined,
      banner: form.banner || undefined,
    };
    if (editingId != null) {
      updateOrganizer({ id: editingId, ...payload });
    } else {
      addOrganizer(payload);
    }
    closeForm();
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Manage</p>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>Organizers</h1>
        </div>
        <button
          onClick={openAdd}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, background: "#39BD69", border: "none", color: "#000", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
        >
          <Plus size={14} /> Add Organizer
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 28, padding: 24, background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: "#39BD69", letterSpacing: "0.3em", textTransform: "uppercase" }}>
              {editingId != null ? "Edit Organizer" : "New Organizer"}
            </p>
            <button type="button" onClick={closeForm} style={{ width: 32, height: 32, borderRadius: 7, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={14} />
            </button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Name *</label>
            <input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Organizer name" required autoFocus />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, marginBottom: 20 }}>
            <ImageUpload
              label="Logo"
              value={form.logo}
              onChange={val => set("logo", val)}
              aspectRatio="square"
              hint="Square 1:1 · Recommended 400 × 400 px · PNG, JPG, WEBP · Max 5 MB"
            />
            <ImageUpload
              label="Banner Image"
              value={form.banner}
              onChange={val => set("banner", val)}
              aspectRatio="wide"
              hint="Wide banner 16:5 · Recommended 1600 × 500 px · PNG, JPG, WEBP · Max 5 MB"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, height: 90, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Short description of the organizer…" />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={closeForm} style={{ padding: "10px 22px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 26px", borderRadius: 8, background: "#39BD69", border: "none", color: "#000", fontSize: 13, fontWeight: 800, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Check size={14} /> {editingId != null ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {organizers.map(org => (
          <div key={org.id} style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
            {org.banner ? (
              <img src={org.banner} alt="" style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ height: 90, background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }} />
            )}
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                {org.logo ? (
                  <img src={org.logo} alt={org.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(57,189,105,0.1)", border: "1px solid rgba(57,189,105,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "#39BD69" }}>{org.name[0]}</span>
                  </div>
                )}
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{org.name}</span>
              </div>
              {org.description && (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {org.description}
                </p>
              )}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => openEdit(org)}
                  style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Pencil size={12} />
                </button>
                {confirmDelete === org.id ? (
                  <>
                    <button onClick={() => { deleteOrganizer(org.id); setConfirmDelete(null); }} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} /></button>
                    <button onClick={() => setConfirmDelete(null)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} /></button>
                  </>
                ) : (
                  <button onClick={() => setConfirmDelete(org.id)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {organizers.length === 0 && (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13, background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 }}>
          No organizers yet.
        </div>
      )}
    </div>
  );
}
