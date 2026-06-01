// Module-level flag: resets on hard refresh, survives client-side navigation.
let preloaderShown = false;

export function hasPreloaderShown() {
  return preloaderShown;
}

export function markPreloaderShown() {
  preloaderShown = true;
}
