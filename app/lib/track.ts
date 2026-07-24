// Fire-and-forget analytics tracking (client only).
export function track(entityType: "event" | "organizer", entityId: number, metric: "view" | "link_click") {
  if (typeof window === "undefined" || !entityId) return;
  try {
    const body = JSON.stringify({ entityType, entityId, metric });
    // sendBeacon survives navigation; fall back to fetch.
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch { /* ignore */ }
}
