"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useAdminData, Artist } from "../../context/AdminDataContext";
import { Plus, Pencil, Trash2, X, Check, Star, List, LayoutGrid, MapPin } from "lucide-react";

export default function ArtistsAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { artists, deleteArtist } = useAdminData();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "grid">("list");

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/admin");
  }, [user, router]);

  if (user?.role !== "admin") return null;

  const displayName = (a: Artist) => a.stageName || a.name;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Manage</p>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>Artists</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* View toggle */}
          <div style={{ display: "flex", gap: 2, padding: 3, borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {([["list", List], ["grid", LayoutGrid]] as const).map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                title={mode === "list" ? "List view" : "Grid view"}
                style={{
                  width: 30, height: 28, borderRadius: 6, cursor: "pointer", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: view === mode ? "rgba(57,189,105,0.15)" : "transparent",
                  color: view === mode ? "#39BD69" : "rgba(255,255,255,0.4)",
                  transition: "all 0.15s",
                }}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
          <button
            onClick={() => router.push("/admin/artists/new")}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, background: "#39BD69", border: "none", color: "#000", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
          >
            <Plus size={14} /> Add Artist
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === "grid" && (
        artists.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "rgba(255,255,255,0.25)", background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 }}>
            No artists yet. <button onClick={() => router.push("/admin/artists/new")} style={{ color: "#39BD69", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Add the first one →</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {artists.map(a => (
              <div key={a.id} style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", height: 160 }}>
                  <img src={a.image} alt={displayName(a)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,13,0.9) 0%, transparent 55%)" }} />
                  {a.rating != null && a.rating > 0 && (
                    <span style={{ position: "absolute", top: 8, right: 8, display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: "#f59e0b", background: "rgba(0,0,0,0.6)", borderRadius: 999, padding: "2px 8px" }}>
                      <Star size={10} fill="#f59e0b" /> {a.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{displayName(a)}</h3>
                  <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{a.role}</p>
                  {a.city && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.4)", flex: 1 }}>
                      <MapPin size={11} /> {a.city}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button
                      onClick={() => router.push(`/admin/artists/new?id=${a.id}`)}
                      style={{ flex: 1, height: 32, borderRadius: 6, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11, fontWeight: 600 }}
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    {confirmDelete === a.id ? (
                      <>
                        <button onClick={() => { deleteArtist(a.id); setConfirmDelete(null); }} style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} /></button>
                        <button onClick={() => setConfirmDelete(null)} style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} /></button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete(a.id)} style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={12} /></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Table (list view) */}
      {view === "list" && (
      <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Image", "Stage Name", "Role", "City", "Rating", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {artists.map((a, i) => (
              <tr
                key={a.id}
                style={{ borderBottom: i < artists.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "12px 16px" }}>
                  <img src={a.image} alt={displayName(a)} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                </td>
                <td style={{ padding: "12px 16px", color: "#fff", fontWeight: 600 }}>{displayName(a)}</td>
                <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.4)" }}>{a.role}</td>
                <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.4)" }}>{a.city || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  {a.rating != null && a.rating > 0 ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#f59e0b", fontSize: 12, fontWeight: 700 }}>
                      <Star size={11} fill="#f59e0b" /> {a.rating.toFixed(1)}
                    </span>
                  ) : <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => router.push(`/admin/artists/new?id=${a.id}`)}
                      style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Pencil size={12} />
                    </button>
                    {confirmDelete === a.id ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => { deleteArtist(a.id); setConfirmDelete(null); }} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Check size={12} />
                        </button>
                        <button onClick={() => setConfirmDelete(null)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(a.id)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {artists.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "32px 16px", textAlign: "center", color: "rgba(255,255,255,0.25)" }}>
                  No artists yet. <button onClick={() => router.push("/admin/artists/new")} style={{ color: "#39BD69", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Add the first one →</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
