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

// Matched against the event's type (tag) only, in this order, so "CULTURAL NIGHT" lands in Arts before "night"
// can make it Music. Genres are NOT used: music genres like "Tech House" would otherwise read as "tech".
const RULES: [EventCategory, RegExp][] = [
  ["Learn & Connect", /workshop|conference|seminar|networking|summit|webinar|training|course|masterclass|business|career|startup|fintech|tech (talk|event|meetup|expo)|\btalk\b|\bexpo\b/i],
  ["Food, Lifestyle & Outdoors", /food|wine|brunch|dinner|tasting|market|bazaar|fitness|yoga|wellness|hike|camp|outdoor|beach|surf|fashion|lifestyle|marathon|\brun\b/i],
  ["Arts, Stage & Culture", /cultur|theatre|theater|drama|dance|ballet|\bart\b|\barts\b|exhibit|gallery|stage|comedy|film|cinema|poetry|heritage|opera|classical/i],
  ["Fun & Social", /social|carnival|quiz|trivia|game|kids|family|bingo|meetup|picnic|sport|community|\bfun\b/i],
];

/** The event's category: the one chosen in the admin, else a best guess from its type/genres. */
export function eventCategory(stored: unknown, tag?: string | null, _genres?: string[] | null): EventCategory {
  if (isEventCategory(stored)) return stored;
  const text = tag ?? "";
  for (const [cat, re] of RULES) if (re.test(text)) return cat;
  return "Music & Nightlife";
}
