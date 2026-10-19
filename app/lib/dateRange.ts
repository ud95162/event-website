// Human-readable form of the Events page ?date= filter (today / this-week / this-month / custom:from:to),
// using the same ranges the search API applies.
const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const parseDay = (s: string) => { const d = new Date(s); return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate()); };

export function dateRangeLabel(param: string): { name: string; range: string } | null {
  if (!param) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (param === "today") return { name: "Today", range: fmt(today) };
  if (param === "this-week") {
    const end = new Date(today); end.setDate(today.getDate() + 6);        // today + the next 6 days
    return { name: "This week", range: `${fmt(today)} – ${fmt(end)}` };
  }
  if (param === "this-month") {
    return { name: "This month", range: today.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) };
  }
  if (param.startsWith("custom:")) {
    const [, from, to] = param.split(":");
    const f = from ? parseDay(from) : null, t = to ? parseDay(to) : f;
    if (!f) return null;
    const same = !t || t.getTime() === f.getTime();
    return { name: same ? "Date" : "Date range", range: same ? fmt(f) : `${fmt(f)} – ${fmt(t!)}` };
  }
  return null;
}
