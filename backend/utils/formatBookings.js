import dayjs from "dayjs";
import hu from "dayjs/locale/hu.js";
import db from "../db.js";

dayjs.locale(hu);

export async function formatBookings(bookings) {
  if (!bookings || bookings.length === 0) return "Nincs foglalás.";

  const courtId = bookings[0].Court_id;

  const courtResult = await db.query(
    "SELECT number, name FROM courts WHERE id = $1",
    [courtId]
  );

  if (courtResult.rows.length === 0) return "Ismeretlen pálya";

  const { number, name } = courtResult.rows[0];

  const sorted = [...bookings].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );

  const lines = sorted.map((b) => {
    const start = dayjs(b.startTime);

    // Ha van endTime, akkor tól–ig, különben csak start
    if (b.endTime) {
      const end = dayjs(b.endTime);
      return `🗓️ ${start.format("YYYY. MMMM D. (dddd)")} – ${start.format("HH:mm")}–${end.format("HH:mm")}`;
    }

    return `🗓️ ${start.format("YYYY. MMMM D. (dddd)")} – ${start.format("HH:mm")}`;
  });

  return `📍 Pálya neve: ${name} (${number}. pálya)\n\n${lines.join("\n")}`;
}