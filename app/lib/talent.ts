// The five Talent sections (the Artists page) and the roles the admin picks from.
export const TALENT_CATEGORIES: { name: string; roles: string[] }[] = [
  { name: "Music Artists",            roles: ["DJ", "Producer", "Singer", "Band/Group", "Rapper", "Instrumentalist"] },
  { name: "Performers",               roles: ["Actor", "Comedian", "Dancer", "Theatre Group", "Visual Artist", "Magician"] },
  { name: "Hosts & Entertainers",     roles: ["MC/Host", "Quizmaster", "TV/Radio Personality", "Influencer", "Gamer"] },
  { name: "Creators & Specialists",   roles: ["Chef", "Mixologist", "Fashion Designer", "Fitness/Yoga Coach", "Photographer"] },
  { name: "Speakers & Experts",       roles: ["Keynote Speaker", "Trainer", "Panelist", "Founder/Industry Expert"] },
];

const norm = (s: string) => s.trim().toLowerCase();

/** Which Talent section a role belongs to. Roles typed before this list existed ("EDM / HOUSE MUSIC",
 *  "SRI LANKAN MUSICAL ARTIST") are matched by keyword and otherwise count as Music Artists. */
export function talentCategory(role: string | null | undefined): string {
  const r = norm(role ?? "");
  for (const c of TALENT_CATEGORIES) if (c.roles.some(x => norm(x) === r)) return c.name;
  const KEYWORDS: [string, RegExp][] = [
    ["Speakers & Experts",     /speaker|trainer|panel|founder|expert|coach(?!.*yoga)|mentor/],
    ["Creators & Specialists", /chef|mixolog|designer|yoga|fitness|photograph|barista/],
    ["Hosts & Entertainers",   /\bmc\b|host|quizmaster|radio|tv\b|influenc|gamer/],
    ["Performers",             /actor|comedian|dancer|theatre|theater|visual|magician/],
  ];
  for (const [name, re] of KEYWORDS) if (re.test(r)) return name;
  return "Music Artists";
}
