"use client";

import { useState } from "react";

const tags = [
  "Music","Comedy","DJ Night","Theatre","Business","Workshop",
  "Food Events","Sports","Trade & Other","Technology","Summer Events","Community Events",
];

export default function CategoryTags() {
  const [active, setActive] = useState("Music");

  return (
    <section className="py-4 border-b border-white/10 bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActive(tag)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-all ${
                active === tag
                  ? "text-white"
                  : "bg-transparent text-white/50 hover:text-white border border-white/15 hover:border-white/40"
              }`}
              style={active === tag ? { background: "#e91e8c" } : undefined}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
