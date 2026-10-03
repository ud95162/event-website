// Event date/time helpers shared by pages that need to know whether an event is over.

/** Parses an event's date string ("27 August 2026") plus an optional "HH:MM" into a Date. */
export function toDateTime(dateStr?: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  if (timeStr && /^\d{1,2}:\d{2}/.test(timeStr)) {
    const [h, m] = timeStr.split(":").map(Number);
    d.setHours(h, m, 0, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

type EventTimes = { date: string; startTime?: string; endDate?: string; endTime?: string };

/** Start time in ms (0 if the date can't be parsed). */
export function eventStartMs(ev: EventTimes): number {
  return toDateTime(ev.date, ev.startTime)?.getTime() ?? 0;
}

/** True once the event has finished — same rule as the "Event Completed" badge on its page:
 *  it ends at its end date/time, or 23:59 on its (end) date when no time is given. */
export function isEventPast(ev: EventTimes, nowMs: number): boolean {
  const start = toDateTime(ev.date, ev.startTime);
  if (!start) return false;
  const end = toDateTime(ev.endDate || ev.date, ev.endTime || "23:59");
  const endMs = end ? end.getTime() : start.getTime() + 3 * 60 * 60 * 1000;
  return nowMs > endMs;
}
