"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Plus, Check, ChevronDown } from "lucide-react";

type Props = {
  value: string;                  // current selected value ("" = none)
  options: string[];              // available options
  onChange: (val: string) => void;
  onCreate: (val: string) => void; // called to persist a new option
  placeholder?: string;
  allowNone?: boolean;            // show a "None" option
};

export default function CreatableSelect({ value, options, onChange, onCreate, placeholder = "Select…", allowNone = true }: Props) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) { setOpen(false); setQuery(""); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));
  const exactExists = options.some(o => o.toLowerCase() === query.trim().toLowerCase());
  const canCreate = query.trim().length > 0 && !exactExists;

  const pick = (val: string) => { onChange(val); setOpen(false); setQuery(""); };
  const create = () => {
    const v = query.trim();
    onCreate(v);
    onChange(v.toUpperCase());
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", borderRadius: 8,
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${open ? "rgba(57,189,105,0.5)" : "rgba(255,255,255,0.1)"}`,
          color: value ? "#fff" : "rgba(255,255,255,0.35)", fontSize: 13,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {value || placeholder}
        <ChevronDown size={14} style={{ opacity: 0.5, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 999,
          background: "rgba(12,12,18,0.98)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
          boxShadow: "0 16px 40px rgba(0,0,0,0.6)", overflow: "hidden",
        }}>
          {/* Search */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && canCreate) { e.preventDefault(); create(); } }}
              placeholder="Search or create…"
              style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: 12, width: "100%", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ maxHeight: 200, overflowY: "auto", padding: 6 }}>
            {allowNone && !query && (
              <button type="button" onClick={() => pick("")} style={optBtn(value === "")}>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>None</span>
                {value === "" && <Check size={13} style={{ color: "#39BD69" }} />}
              </button>
            )}
            {filtered.map(opt => (
              <button key={opt} type="button" onClick={() => pick(opt)} style={optBtn(value === opt)}>
                <span style={{ color: value === opt ? "#39BD69" : "rgba(255,255,255,0.8)", fontWeight: 600 }}>{opt}</span>
                {value === opt && <Check size={13} style={{ color: "#39BD69" }} />}
              </button>
            ))}
            {canCreate && (
              <button type="button" onClick={create} style={{ ...optBtn(false), color: "#39BD69" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#39BD69", fontWeight: 700 }}>
                  <Plus size={12} /> Create &ldquo;{query.trim().toUpperCase()}&rdquo;
                </span>
              </button>
            )}
            {filtered.length === 0 && !canCreate && (
              <p style={{ padding: "10px 8px", fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const optBtn = (active: boolean): React.CSSProperties => ({
  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "8px 10px", borderRadius: 7, cursor: "pointer", textAlign: "left",
  background: active ? "rgba(57,189,105,0.1)" : "transparent",
  border: "none", fontSize: 12, fontFamily: "inherit",
});
