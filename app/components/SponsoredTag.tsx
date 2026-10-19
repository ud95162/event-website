// Small "Sponsored" pill shown on paid / promoted events, artists and banners.
// Position it with the wrapper you place it in (usually absolute, top-left of a picture).
export default function SponsoredTag({ size = "sm" }: { size?: "sm" | "md" }) {
  const md = size === "md";
  return (
    <span
      style={{
        display: "inline-block",
        padding: md ? "5px 12px" : "3px 9px",
        borderRadius: 999,
        fontSize: md ? 10.5 : 9,
        fontWeight: 800,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        color: "#E8DCC0",
        background: "rgba(15,17,22,0.72)",
        border: "1px solid rgba(232,220,192,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      Sponsored
    </span>
  );
}
