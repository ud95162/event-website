// Store flag on window so it survives client-side navigation but resets on hard refresh.
// Falls back to module-level for SSR safety.
let _ssrFallback = false;

export function hasPreloaderShown(): boolean {
  if (typeof window === "undefined") return _ssrFallback;
  return !!(window as any).__preloaderShown;
}

export function markPreloaderShown(): void {
  _ssrFallback = true;
  if (typeof window !== "undefined") {
    (window as any).__preloaderShown = true;
  }
}
