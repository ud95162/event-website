"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useAdminData } from "../../context/AdminDataContext";
import { Plus, Trash2, X, Check } from "lucide-react";
import { GENRE_PALETTE, NEUTRAL_GENRE_COLOR, genreColor, genreChipStyle, withAlpha } from "../../lib/genres";

export default function GenresAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { genres, genreColors, setGenreColor, addGenre, deleteGenre } = useAdminData();
  const [pickerFor, setPickerFor] = useState<string | null>(null);
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
        <p style={{ fontSize: 10, color: "#E8DCC0", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Manage</p>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>Genres</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
          These genres appear when creating events and artists. Click a genre&apos;s colour dot to give it its own colour, so people can recognise it at a glance.
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
        <button type="submit" style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: "#2B2E36", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <Plus size={14} /> Add
        </button>
      </form>

      {/* Genre chips */}
      <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
          {genres.length} Genre{genres.length !== 1 ? "s" : ""}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {genres.map(g => {
            const color = genreColor(genreColors, g);
            const chosen = !!genreColors[g.toLowerCase()];
            const cs = genreChipStyle(color);
            return (
            <div
              key={g}
              style={{
                position: "relative",
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 8px 8px 10px", borderRadius: 999,
                background: cs.background, border: cs.border,
              }}
            >
              {/* Colour dot — opens the picker */}
              <button
                type="button"
                onClick={() => setPickerFor(pickerFor === g ? null : g)}
                title={chosen ? "Change colour" : "Choose a colour"}
                aria-label={`Colour for ${g}`}
                style={{ width: 18, height: 18, borderRadius: "50%", background: chosen ? color : "transparent", border: chosen ? `2px solid ${withAlpha(color, 0.35)}` : "1.5px dashed rgba(255,255,255,0.4)", cursor: "pointer", padding: 0, flexShrink: 0, boxShadow: chosen ? `0 0 8px ${withAlpha(color, 0.6)}` : "none" }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: chosen ? color : "#fff", textTransform: "capitalize" }}>{g}</span>
              {confirmDelete === g ? (
                <span style={{ display: "flex", gap: 3 }}>
                  <button onClick={() => { deleteGenre(g); setConfirmDelete(null); }} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(239,68,68,0.85)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={11} /></button>
                  <button onClick={() => setConfirmDelete(null)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={11} /></button>
                </span>
              ) : (
                <button onClick={() => setConfirmDelete(g)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={11} /></button>
              )}

              {pickerFor === g && (
                <div
                  style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 30, width: 236, padding: 14, borderRadius: 12, background: "#141418", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 20px 50px rgba(0,0,0,0.7)" }}
                >
                  <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>Colour for {g}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8, marginBottom: 12 }}>
                    {GENRE_PALETTE.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setGenreColor(g, c); setPickerFor(null); }}
                        aria-label={c}
                        style={{ width: 20, height: 20, borderRadius: "50%", background: c, cursor: "pointer", padding: 0, border: color.toLowerCase() === c.toLowerCase() && chosen ? "2px solid #fff" : "2px solid transparent" }}
                      />
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
                      <input
                        type="color"
                        value={chosen ? color : NEUTRAL_GENRE_COLOR}
                        onChange={e => setGenreColor(g, e.target.value)}
                        style={{ width: 26, height: 26, padding: 0, border: "none", background: "none", cursor: "pointer" }}
                      />
                      Custom
                    </label>
                    <button
                      type="button"
                      onClick={() => { setGenreColor(g, ""); setPickerFor(null); }}
                      style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerFor(null)}
                      style={{ fontSize: 11, color: "#fff", background: "#2B2E36", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
            );
          })}
          {genres.length === 0 && (
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No genres yet. Add one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
