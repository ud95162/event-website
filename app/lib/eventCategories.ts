// The five browse categories shown on the Events page, plus a fallback that places events which
// have no category chosen yet (picked in Admin -> Event -> Category).
export const EVENT_CATEGORIES = [
  "Music & Nightlife",
  "Arts, Stage & Culture",
  "Fun & Social",
  "Food, Lifestyle & Outdoors",
  "Learn & Connect",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const isEventCategory = (v: unknown): v is EventCategory =>
  typeof v === "string" && (EVENT_CATEGORIES as readonly string[]).includes(v);

// Checked in this order, so "CULTURAL NIGHT" lands in Arts before "night" can make it Music.
const RULES: [EventCategory, RegExp][] = [
  ["Learn & Connect", /workshop|conference|seminar|network|summit|webinar|training|course|class|talk|expo|tech|business|career|startup/i],
  ["Food, Lifestyle & Outdoors", /food|wine|brunch|dinner|tasting|market|bazaar|fitness|yoga|wellness|hike|camp|outdoor|beach|surf|fashion|lifestyle|run\b|marathon/i],
  ["Arts, Stage & Culture", /cultur|theatre|theater|drama|dance|ballet|art\b|arts|exhibit|gallery|stage|comedy|film|cinema|poetry|heritage|opera|classical/i],
  ["Fun & Social", /social|carnival|quiz|trivia|game|kids|family|bingo|meetup|picnic|sport|community|fun\b/i],
];

/** The event's category: the one chosen in the admin, else a best guess from its type/genres. */
export function eventCategory(stored: unknown, tag?: string | null, genres?: string[] | null): EventCategory {
  if (isEventCategory(stored)) return stored;
  const text = [tag ?? "", ...(genres ?? [])].join(" ");
  for (const [cat, re] of RULES) if (re.test(text)) return cat;
  return "Music & Nightlife";
}
