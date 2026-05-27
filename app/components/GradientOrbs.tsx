"use client";

export default function GradientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Top-left white glow */}
      <div
        className="absolute rounded-full blur-[160px] opacity-[0.07] animate-orb-1"
        style={{
          width: 700, height: 700,
          top: "-15%", left: "-10%",
          background: "radial-gradient(circle, #ffffff 0%, transparent 70%)",
        }}
      />
      {/* Right white glow */}
      <div
        className="absolute rounded-full blur-[180px] opacity-[0.05] animate-orb-2"
        style={{
          width: 800, height: 800,
          top: "15%", right: "-20%",
          background: "radial-gradient(circle, #ffffff 0%, transparent 70%)",
        }}
      />
      {/* Bottom-center subtle glow */}
      <div
        className="absolute rounded-full blur-[120px] opacity-[0.06] animate-orb-3"
        style={{
          width: 500, height: 500,
          bottom: "5%", left: "35%",
          background: "radial-gradient(circle, #cccccc 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
