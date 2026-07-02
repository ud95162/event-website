"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useAdminData } from "../../context/AdminDataContext";
import { Trash2, X, Check, ImageIcon } from "lucide-react";
import ImageUpload from "../components/ImageUpload";

export default function BannersAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { banners, addBanner, deleteBanner } = useAdminData();
  const [newImage, setNewImage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/admin");
  }, [user, router]);

  const handleAdd = () => {
    if (newImage.trim()) {
      addBanner(newImage.trim());
      setNewImage("");
      setShowAdd(false);
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
          onClick={() => { setShowAdd(s => !s); setNewImage(""); }}
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
          <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => { setShowAdd(false); setNewImage(""); }}
              style={{ padding: "9px 20px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newImage}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 22px", borderRadius: 8, background: newImage ? "#39BD69" : "rgba(57,189,105,0.3)", border: "none", color: "#000", fontSize: 12, fontWeight: 800, cursor: newImage ? "pointer" : "not-allowed", letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              <Check size={13} /> Add Banner
            </button>
          </div>
        </div>
      )}

      {/* Banner grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {banners.map(banner => (
          <div key={banner.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", aspectRatio: "16/9" }}>
            <img
              src={banner.url}
              alt="Banner"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)" }} />

            {/* Banner index badge */}
            <div style={{ position: "absolute", top: 8, left: 10, padding: "3px 10px", borderRadius: 999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Banner {banners.findIndex(b => b.id === banner.id) + 1}</p>
            </div>

            {/* Delete button */}
            <div style={{ position: "absolute", top: 8, right: 8 }}>
              {confirmDelete === banner.id ? (
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => { deleteBanner(banner.id); setConfirmDelete(null); }} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.9)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} /></button>
                  <button onClick={() => setConfirmDelete(null)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} /></button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(banner.id)}
                  style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.75)", backdropFilter: "blur(6px)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                ><Trash2 size={12} /></button>
              )}
            </div>
          </div>
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
