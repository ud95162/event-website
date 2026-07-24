"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

type Props = {
  value: string[];          // selected values
  onChange: (v: string[]) => void;
  allArtists: string[];     // all available options
  placeholder?: string;
};

export default function LineupSelector({ value, onChange, allArtists, placeholder }: Props) {
  const [query, setQuery]     = useState("");
  const [open, setOpen]       = useState(false);
  const containerRef          = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = allArtists.filter(name =>
    name.toLowerCase().includes(query.toLowerCase()) && !value.includes(name)
  );

  const add = (name: string) => {
    onChange([...value, name]);
    setQuery("");
    inputRef.current?.focus();
  };

  const remove = (name: string) => onChange(value.filter(n => n !== name));

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Selected chips + search input */}
      <div
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
        style={{
          minHeight: 42, padding: "6px 10px",
          borderRadius: 8, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${open ? "rgba(57,189,105,0.5)" : "rgba(255,255,255,0.1)"}`,
          cursor: "text", transition: "border-color 0.2s",
          boxShadow: open ? "0 0 0 3px rgba(57,189,105,0.08)" : "none",
        }}
      >
        {/* Selected chips */}
        {value.map(name => (
          <span key={name} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 8px 3px 10px", borderRadius: 999,
            background: "rgba(57,189,105,0.12)", border: "1px solid rgba(57,189,105,0.35)",
            fontSize: 11, fontWeight: 700, color: "#39BD69",
          }}>
            {name}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); remove(name); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", alignItems: "center", padding: 0, opacity: 0.7 }}
            >
              <X size={10} />
            </button>
          </span>
        ))}

        {/* Search input */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 120 }}>
          <Search size={12} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={value.length === 0 ? (placeholder ?? "Search and select artists…") : "Add more…"}
            style={{
              background: "none", border: "none", outline: "none",
              color: "#fff", fontSize: 13, fontFamily: "inherit", flex: 1,
              minWidth: 80,
            }}
          />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "rgba(12,12,18,0.98)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
          boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
          zIndex: 999, overflow: "hidden",
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "14px 16px", fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
              {query ? `No artists matching "${query}"` : "All artists already selected"}
            </div>
          ) : (
            <div style={{ maxHeight: 220, overflowY: "auto" }}>
              {filtered.map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => add(name)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "rgba(57,189,105,0.1)", border: "1px solid rgba(57,189,105,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 800, color: "#39BD69", flexShrink: 0,
                  }}>
                    {name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{name}</span>
                </button>
              ))}
            </div>
          )}

          {value.length > 0 && (
            <div style={{ padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{value.length} selected</span>
              <button type="button" onClick={() => onChange([])} style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" }}>Clear all</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
