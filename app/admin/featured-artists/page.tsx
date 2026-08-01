"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "../../context/AdminDataContext";
import { Star, Search } from "lucide-react";

export default function FeaturedArtistsPage() {
  const { artists, updateArtist, loading } = useAdminData();
  const [query, setQuery] = useState("");

  const featuredCount = useMemo(() => artists.filter((a) => a.featured).length, [artists]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Featured first, then by id — makes the current selection easy to review.
    const sorted = [...artists].sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || a.id - b.id);
    if (!q) return sorted;
    return sorted.filter(
      (a) =>
        (a.stageName || a.name)?.toLowerCase().includes(q) ||
        a.role?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q)
    );
  }, [artists, query]);

  const toggle = (id: number, current: boolean) => {
    const ar = artists.find((a) => a.id === id);
    if (ar) updateArtist({ ...ar, featured: !current });
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>
          Homepage
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.01em" }}>Featured Artists</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, maxWidth: 620 }}>
          Star the artists you want highlighted in the <strong style={{ color: "rgba(255,255,255,0.65)" }}>Featured Artists</strong> section
          on the homepage. If none are starred, the first artists are shown automatically.
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0 20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 360 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artists…"
            style={{
              width: "100%", padding: "10px 12px 10px 34px", borderRadius: 9,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 999, background: "rgba(57,189,105,0.1)", border: "1px solid rgba(57,189,105,0.25)" }}>
          <Star size={13} style={{ color: "#39BD69", fill: "#39BD69" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#39BD69" }}>{featuredCount} featured</span>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>No artists found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 16 }}>
          {filtered.map((ar) => {
            const isFeatured = !!ar.featured;
            const displayName = ar.stageName || ar.name;
            return (
              <button
                key={ar.id}
                type="button"
                onClick={() => toggle(ar.id, isFeatured)}
                style={{
                  textAlign: "left", cursor: "pointer", padding: 0, overflow: "hidden",
                  borderRadius: 12, background: "#0d0d0d",
                  border: isFeatured ? "1.5px solid #39BD69" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isFeatured ? "0 0 0 3px rgba(57,189,105,0.12)" : "none",
                  transition: "all 0.15s", position: "relative", fontFamily: "inherit",
                }}
              >
                {/* Portrait (1:1) */}
                <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", overflow: "hidden", background: "#000" }}>
                  {ar.image ? (
                    <img src={ar.image} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: isFeatured ? 1 : 0.75 }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>No photo</div>
                  )}
                  <div style={{
                    position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isFeatured ? "#39BD69" : "rgba(0,0,0,0.55)",
                    border: isFeatured ? "none" : "1px solid rgba(255,255,255,0.25)",
                    backdropFilter: "blur(4px)",
                  }}>
                    <Star size={16} style={{ color: isFeatured ? "#000" : "#fff", fill: isFeatured ? "#000" : "none" }} />
                  </div>
                </div>
                {/* Meta */}
                <div style={{ padding: "12px 14px" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {displayName}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ar.role}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
