"use client";

import { useEffect, useRef, useState } from "react";

const upcomingEvents = [
  {
    id: 1, tag: "MUSIC FESTIVAL", title: "Sunset Music Festival",
    date: "12 SEP 2027 - COLOMBO",
    bio: "Known for electrifying performances and festival energy across Asia.",
    image: "/upcomming/1.png",
  },
  {
    id: 2, tag: "DANCE CHAMPIONSHIP", title: "Street Dance Championship",
    date: "22 SEP 2027 - KANDY",
    bio: "Known for electrifying performances and festival energy across Asia.",
    image: "/upcomming/2.png",
  },
  {
    id: 3, tag: "DJ PARTY", title: "DJ Party",
    date: "15 DEC 2027 - COLOMBO",
    bio: "Award-winning vocalist with soulful live performances.",
    image: "/upcomming/3.png",
  },
  {
    id: 4, tag: "MUSIC FESTIVAL", title: "Digital Sound Sphere",
    date: "05 JAN 2028 - NEGOMBO",
    bio: "An energetic fusion bringing modern and classic hits together.",
    image: "/upcomming/1.png",
  },
  {
    id: 5, tag: "DANCE CHAMPIONSHIP", title: "Rhythm Wave",
    date: "20 JAN 2028 - GALLE",
    bio: "High-octane choreography and street style battles in the heart of Galle.",
    image: "/upcomming/2.png",
  },
  {
    id: 6, tag: "DJ NIGHT", title: "Neon Horizon",
    date: "10 FEB 2028 - BENTOTA",
    bio: "A tropical beach party with premium visual projections and top local DJs.",
    image: "/upcomming/3.png",
  },
];

const N          = upcomingEvents.length;
const SCROLL_PX  = 2000;
const STICKY_TOP = 130;

export default function UpcomingEvents() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const top = sectionRef.current.getBoundingClientRect().top;
      const range = sectionRef.current.offsetHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, -top / range));
      setProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Map scroll progress to a floating active index (0 → N-1)
  const floatIdx = progress * (N - 1);

  return (
    <section
      id="upcoming"
      ref={sectionRef}
      style={{ height: SCROLL_PX + 800 }}
    >
      <div
        className="sticky flex flex-col items-center justify-center overflow-hidden"
        style={{ top: STICKY_TOP, height: `calc(100vh - ${STICKY_TOP}px)` }}
      >
        {/* Header */}
        <div className="text-center mb-5 relative z-[200] select-none">
          <p className="text-white/30 text-[10px] font-semibold tracking-[0.4em] uppercase mb-2">
            UPCOMING EVENTS
          </p>
          <h2 className="text-white font-black text-4xl uppercase tracking-tight">
            Upcoming Experiences
          </h2>
        </div>

        {/* 3D Coverflow stage */}
        <div
          className="relative w-full"
          style={{ perspective: 1200, height: 400, maxWidth: 1200, margin: "0 auto" }}
        >
          {upcomingEvents.map((event, i) => {
            // Continuous offset from the scroll-driven active position
            const offset = i - floatIdx;
            const absOffset = Math.abs(offset);

            // Only render cards within visible range
            if (absOffset > 3) return null;

            const isCenter = absOffset < 0.15;

            // Transforms — driven smoothly by scroll
            const translateX = offset * 260;
            const rotateY    = offset * -35;
            const translateZ = isCenter ? 80 : -absOffset * 100;
            const scale      = isCenter ? 1 : Math.max(0.65, 1 - absOffset * 0.15);
            const opacity    = isCenter ? 1 : Math.max(0.3, 1 - absOffset * 0.3);
            const zIndex     = Math.round(100 - absOffset * 10);
            const brightness = isCenter ? 1.05 : Math.max(0.35, 1 - absOffset * 0.25);

            return (
              <div
                key={event.id}
                className="absolute rounded-2xl overflow-hidden"
                style={{
                  width: 300,
                  height: 400,
                  left: "50%",
                  top: "50%",
                  marginLeft: -150,
                  marginTop: -200,
                  background: "#0a0a2e",
                  border: isCenter ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.06)",
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  transformStyle: "preserve-3d",
                  opacity,
                  filter: `brightness(${brightness})`,
                  zIndex,
                  transition: "transform 0.15s linear, opacity 0.15s linear, filter 0.15s linear, box-shadow 0.3s ease, border 0.3s ease",
                  boxShadow: isCenter
                    ? "0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(57,189,105,0.1)"
                    : "0 10px 30px rgba(0,0,0,0.4)",
                }}
              >
                {/* Image — top portion */}
                <div className="relative w-full" style={{ height: "62%" }}>
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover object-top"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to top, #0a0a2e 0%, rgba(10,10,46,0.3) 40%, transparent 100%)",
                    }}
                  />
                </div>

                {/* Text area */}
                <div className="px-5 pb-4 pt-1 text-center" style={{ height: "38%" }}>
                  <p className="text-white/40 text-[9px] font-bold tracking-[0.25em] uppercase mb-1.5">
                    {event.date}
                  </p>
                  <h3 className="text-white font-black text-base uppercase mb-2 tracking-wide leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-white/40 text-xs leading-relaxed">
                    {event.bio}
                  </p>
                </div>

                {/* Green accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: isCenter ? "50%" : "20%",
                      marginLeft: isCenter ? "25%" : "40%",
                      background: "linear-gradient(90deg, #39BD69, #2ecc71)",
                      boxShadow: isCenter ? "0 0 12px rgba(57,189,105,0.6)" : "none",
                      transition: "width 0.3s ease, margin-left 0.3s ease, box-shadow 0.3s ease",
                    }}
                  />
                </div>

                {/* Reflection glow on center card */}
                {isCenter && (
                  <div
                    className="absolute inset-0 pointer-events-none rounded-2xl"
                    style={{
                      background: "radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.04) 0%, transparent 60%)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Dot indicators */}
        <div className="flex gap-2 mt-8 relative z-[200]">
          {upcomingEvents.map((_, i) => {
            const active = Math.abs(i - floatIdx) < 0.5;
            return (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: active ? 28 : 6,
                  height: 6,
                  background: active ? "#39BD69" : "rgba(255,255,255,0.2)",
                }}
              />
            );
          })}
        </div>

        <p className="text-white/20 text-[9px] tracking-[0.3em] uppercase mt-3 select-none relative z-[200]">
          SCROLL TO EXPLORE
        </p>
      </div>
    </section>
  );
}
