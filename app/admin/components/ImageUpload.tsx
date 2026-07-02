"use client";

import { useRef, useState } from "react";
import { Upload, X, Link as LinkIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  aspectRatio?: "square" | "wide";
  hint?: string;
};

export default function ImageUpload({ label, value, onChange, aspectRatio = "wide", hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState(value.startsWith("http") ? value : "");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const applyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlMode(false);
    }
  };

  const previewH = aspectRatio === "square" ? 120 : 90;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => setUrlMode(m => !m)}
          style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}
        >
          <LinkIcon size={10} /> {urlMode ? "Use upload" : "Use URL"}
        </button>
      </div>

      {/* URL mode */}
      {urlMode ? (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applyUrl()}
            placeholder="https://images.unsplash.com/…"
            style={{
              flex: 1, padding: "9px 12px", borderRadius: 8,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", fontSize: 12, outline: "none", fontFamily: "inherit",
            }}
          />
          <button type="button" onClick={applyUrl} style={{ padding: "9px 16px", borderRadius: 8, background: "#39BD69", border: "none", color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Apply
          </button>
        </div>
      ) : (
        /* Upload drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragging ? "#39BD69" : "rgba(255,255,255,0.12)"}`,
            borderRadius: 10,
            background: dragging ? "rgba(57,189,105,0.05)" : "rgba(255,255,255,0.02)",
            cursor: "pointer",
            transition: "all 0.2s",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {value ? (
            /* Preview */
            <div style={{ position: "relative" }}>
              <img
                src={value}
                alt="preview"
                style={{
                  width: "100%",
                  height: previewH,
                  objectFit: "cover",
                  objectPosition: aspectRatio === "square" ? "top" : "center",
                  display: "block",
                }}
              />
              {/* Overlay on hover */}
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 6, opacity: 0, transition: "opacity 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
              >
                <Upload size={20} style={{ color: "#fff" }} />
                <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>Click to change</span>
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onChange(""); setUrlInput(""); }}
                style={{
                  position: "absolute", top: 8, right: 8,
                  width: 24, height: 24, borderRadius: "50%",
                  background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            /* Empty state */
            <div style={{ padding: "28px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(57,189,105,0.1)", border: "1px solid rgba(57,189,105,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Upload size={18} style={{ color: "#39BD69" }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600, marginBottom: 3 }}>
                  Click to upload or drag & drop
                </p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                  {hint || "PNG, JPG, WEBP · Max 5 MB"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p style={{ fontSize: 11, color: "#ef4444" }}>{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
    </div>
  );
}
