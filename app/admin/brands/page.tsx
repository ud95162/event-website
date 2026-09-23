"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useAdminData } from "../../context/AdminDataContext";
import { Trash2, X, Check, Building2 } from "lucide-react";
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

export default function BrandsAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { brands, addBrand, deleteBrand } = useAdminData();
  const [newName, setNewName] = useState("");
  const [newLogo, setNewLogo] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/admin");
  }, [user, router]);

  const resetForm = () => { setNewName(""); setNewLogo(""); setError(""); };

  const handleAdd = async () => {
    if (!newName.trim() || !newLogo || saving) return;
    setSaving(true);
    setError("");
    const ok = await addBrand({ name: newName.trim(), logo: newLogo });
    setSaving(false);
    if (ok) { resetForm(); setShowAdd(false); }
    else setError("Couldn't save — the server didn't respond. Please try again.");
  };

  if (user?.role !== "admin") return null;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Manage</p>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>Brands &amp; Sponsors</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>Logos shown in the home &ldquo;Trusted By&rdquo; marquee.</p>
        </div>
        <button
          onClick={() => { setShowAdd(s => !s); resetForm(); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, background: showAdd ? "rgba(255,255,255,0.06)" : "#39BD69", border: showAdd ? "1px solid rgba(255,255,255,0.15)" : "none", color: showAdd ? "rgba(255,255,255,0.5)" : "#000", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
        >
          {showAdd ? <><X size={14} /> Cancel</> : <>+ Add Brand</>}
        </button>
      </div>

      {/* Add Brand panel */}
      {showAdd && (
        <div style={{ marginBottom: 28, padding: 24, background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>New Brand</p>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 20 }}>
            <ImageUpload
              label="Logo"
              value={newLogo}
              onChange={setNewLogo}
              aspectRatio="square"
              hint="Transparent PNG works best · Square · Max 5 MB"
            />
            <div>
              <label style={labelStyle}>Brand Name *</label>
              <input style={inputStyle} value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Red Bull" />
            </div>
          </div>
          {error && (
            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 13 }}>{error}</div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => { setShowAdd(false); resetForm(); }} style={{ padding: "9px 20px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <button type="button" onClick={handleAdd} disabled={!newName || !newLogo || saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 22px", borderRadius: 8, background: (newName && newLogo && !saving) ? "#39BD69" : "rgba(57,189,105,0.3)", border: "none", color: "#000", fontSize: 12, fontWeight: 800, cursor: (newName && newLogo && !saving) ? "pointer" : "not-allowed", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <Check size={13} /> {saving ? "Saving…" : "Add Brand"}
            </button>
          </div>
        </div>
      )}

      {/* Brand grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
        {brands.map(brand => (
          <div key={brand.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(255,255,255,0.02)" }}>
              {brand.logo ? (
                <img src={brand.logo} alt={brand.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              ) : (
                <Building2 size={32} style={{ color: "rgba(255,255,255,0.15)" }} />
              )}
            </div>
            <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{brand.name}</span>
              {confirmDelete === brand.id ? (
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => { deleteBrand(brand.id); setConfirmDelete(null); }} style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(239,68,68,0.9)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} /></button>
                  <button onClick={() => setConfirmDelete(null)} style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} /></button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(brand.id)} style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={12} /></button>
              )}
            </div>
          </div>
        ))}

        {brands.length === 0 && (
          <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 56, background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, gap: 12 }}>
            <Building2 size={36} style={{ color: "rgba(255,255,255,0.12)" }} />
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No brands yet. Click &ldquo;Add Brand&rdquo; to add sponsor logos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
