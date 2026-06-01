"use client";

export default function WaveBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      <style>{`
        @keyframes floatA {
          0%   { transform: translate(0%, 0%) scale(1); }
          25%  { transform: translate(15%, -20%) scale(1.1); }
          50%  { transform: translate(30%, 10%) scale(0.95); }
          75%  { transform: translate(10%, 25%) scale(1.05); }
          100% { transform: translate(0%, 0%) scale(1); }
        }
        @keyframes floatB {
          0%   { transform: translate(0%, 0%) scale(1.05); }
          25%  { transform: translate(-20%, 15%) scale(0.95); }
          50%  { transform: translate(-10%, -25%) scale(1.1); }
          75%  { transform: translate(20%, -10%) scale(1); }
          100% { transform: translate(0%, 0%) scale(1.05); }
        }
        @keyframes floatC {
          0%   { transform: translate(0%, 0%) scale(0.95); }
          33%  { transform: translate(-25%, -15%) scale(1.1); }
          66%  { transform: translate(20%, 20%) scale(0.9); }
          100% { transform: translate(0%, 0%) scale(0.95); }
        }
      `}</style>

      {/* Blob A — top-left drifting */}
      <div style={{
        position: "absolute",
        top: "-10%",
        left: "-10%",
        width: "70vw",
        height: "70vw",
        borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
        background: "radial-gradient(ellipse at 50% 50%, rgba(57,189,105,0.07) 0%, rgba(20,80,45,0.04) 45%, transparent 70%)",
        animation: "floatA 18s ease-in-out infinite",
        willChange: "transform",
        filter: "blur(40px)",
      }} />

      {/* Blob B — bottom-right drifting */}
      <div style={{
        position: "absolute",
        top: "40%",
        left: "40%",
        width: "75vw",
        height: "75vw",
        borderRadius: "45% 55% 40% 60% / 60% 40% 55% 45%",
        background: "radial-gradient(ellipse at 50% 50%, rgba(57,189,105,0.06) 0%, rgba(15,70,40,0.03) 45%, transparent 70%)",
        animation: "floatB 24s ease-in-out infinite",
        willChange: "transform",
        filter: "blur(50px)",
      }} />

      {/* Blob C — center-right drifting */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: "50%",
        width: "60vw",
        height: "60vw",
        borderRadius: "50% 50% 45% 55% / 55% 45% 50% 50%",
        background: "radial-gradient(ellipse at 50% 50%, rgba(40,160,85,0.05) 0%, rgba(10,60,30,0.03) 45%, transparent 70%)",
        animation: "floatC 20s ease-in-out infinite",
        willChange: "transform",
        filter: "blur(45px)",
      }} />
    </div>
  );
}
