// Shared slug helpers — used for name-based detail-page URLs.

export function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")   // non-alphanumerics → hyphen
    .replace(/^-+|-+$/g, "");       // trim leading/trailing hyphens
}

type EventLike   = { title: string };
type ArtistLike  = { name: string; stageName?: string };
type OrganizerLike = { name: string };

export const eventSlug     = (e: EventLike)     => slugify(e.title);
export const artistSlug    = (a: ArtistLike)    => slugify(a.stageName || a.name);
export const organizerSlug = (o: OrganizerLike) => slugify(o.name);
