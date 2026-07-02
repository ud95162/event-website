"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useAdminData } from "../../context/AdminDataContext";
import { Plus, Trash2, X, Check, Tag } from "lucide-react";

export default function GenresAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { genres, addGenre, deleteGenre } = useAdminData();
  const [newGenre, setNewGenre] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/admin");
  }, [user, router]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGenre.trim()) {
      addGenre(newGenre.trim());
      setNewGenre("");
    }
  };

  if (user?.role !== "admin") return null;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Manage</p>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>Genres</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
          These genres appear when creating events and artists.
        </p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 10, marginBottom: 28, maxWidth: 480 }}>
        <input
          value={newGenre}
          onChange={e => setNewGenre(e.target.value)}
          placeholder="New genre name (e.g. Techno)"
          style={{ flex: 1, padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit" }}
        />
        <button type="submit" style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: "#39BD69", border: "none", color: "#000", fontSize: 12, fontWeight: 800, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <Plus size={14} /> Add
        </button>
      </form>

      {/* Genre chips */}
      <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
          {genres.length} Genre{genres.length !== 1 ? "s" : ""}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {genres.map(g => (
            <div
              key={g}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 8px 8px 14px", borderRadius: 999,
                background: "rgba(57,189,105,0.08)", border: "1px solid rgba(57,189,105,0.25)",
              }}
            >
              <Tag size={11} style={{ color: "#39BD69" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", textTransform: "capitalize" }}>{g}</span>
              {confirmDelete === g ? (
                <span style={{ display: "flex", gap: 3 }}>
                  <button onClick={() => { deleteGenre(g); setConfirmDelete(null); }} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(239,68,68,0.85)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={11} /></button>
                  <button onClick={() => setConfirmDelete(null)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={11} /></button>
                </span>
              ) : (
                <button onClick={() => setConfirmDelete(g)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={11} /></button>
              )}
            </div>
          ))}
          {genres.length === 0 && (
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No genres yet. Add one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
