"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  alpha: number;
  color: string;
  glow: string;
}

const COUNT       = 140;
const LINK_DIST   = 150;
const MOUSE_RADIUS = 130;

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse     = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    let   raf: number;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = Array.from({ length: COUNT }, () => {
      const rnd = Math.random();
      const isGreen = rnd < 0.22;
      const isPink  = rnd < 0.38 && !isGreen;
      return {
        x:     Math.random() * window.innerWidth,
        y:     Math.random() * window.innerHeight,
        vx:    (Math.random() - 0.5) * 0.4,
        vy:    (Math.random() - 0.5) * 0.4,
        r:     Math.random() * 3.5 + 1.8,
        alpha: Math.random() * 0.45 + 0.2,
        color: isGreen ? "#39BD69" : isPink ? "#e91e8c" : "#ffffff",
        glow:  isGreen ? "rgba(57,189,105,0.9)" : isPink ? "rgba(233,30,140,0.9)" : "rgba(255,255,255,0.8)",
      };
    });

    const onMove  = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        const dx   = p.x - mouse.current.x;
        const dy   = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.7;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.4) { p.vx *= 1.4 / speed; p.vy *= 1.4 / speed; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0)  p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0)  p.y = H; if (p.y > H) p.y = 0;
      }

      /* dots */
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.glow;
        ctx.shadowBlur  = 18;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
