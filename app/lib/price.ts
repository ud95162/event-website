import type { TicketType } from "../data/events";

// Formats a single stored price value for display.
// Numbers stored as "3,000" → "LKR 3,000"; legacy "LKR 4,500" kept as-is.
export function displayPrice(raw: string | undefined | null): string {
  const v = (raw || "").replace(/^starting from\s*/i, "").trim();
  if (!v) return "";
  return /^[\d,]+$/.test(v) ? `LKR ${v}` : v;
}

const validTickets = (tickets?: TicketType[]) =>
  (tickets ?? []).filter(t => t.price && t.price.trim());

// All ticket prices joined for compact display, e.g. "LKR 3,000 | LKR 8,000".
export function ticketPrices(tickets?: TicketType[], fallback?: string): string {
  const t = validTickets(tickets);
  if (t.length === 0) return displayPrice(fallback);
  return t.map(x => displayPrice(x.price)).join("  |  ");
}

// Lowest ticket price, prefixed with "From" — good for tight spaces.
export function fromPrice(tickets?: TicketType[], fallback?: string): string {
  const t = validTickets(tickets);
  if (t.length === 0) return displayPrice(fallback);
  const min = t.reduce((lo, x) => {
    const n = Number((x.price || "").replace(/\D/g, "")) || Infinity;
    return n < lo.n ? { n, price: x.price } : lo;
  }, { n: Infinity, price: t[0].price });
  return `From ${displayPrice(min.price)}`;
}
