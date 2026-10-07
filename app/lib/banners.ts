import { getPool } from "./db";
import { imgMarker } from "./select";
import { imgUrl } from "./images";

// Banners with the linked event's text details joined in (never its image), so the Hero can show a
// slide's date/venue/title and link to the event without loading the events table.
// Used by the list endpoint AND by create/update, so every response has the same shape — a banner
// saved from the admin must carry eventTitle etc. or the hero can't tell it is linked to an event.
export async function selectBanners(id?: number | string) {
  const [rows] = await getPool().query<any[]>(
    `SELECT b.id, ${imgMarker("b.url", "url")}, b.event_id AS eventId, b.title, b.description,
            e.title       AS eventTitle,
            e.description AS eventDescription,
            e.date        AS eventDate,
            e.venue       AS eventVenue,
            e.location    AS eventLocation,
            e.tag         AS eventTag
     FROM banners b
     LEFT JOIN events e ON e.id = b.event_id
     ${id != null ? "WHERE b.id = ?" : ""}
     ORDER BY b.id`,
    id != null ? [id] : []
  );
  return rows.map((r) => ({ ...r, url: imgUrl("banners", r.id, "url", r.url) }));
}
