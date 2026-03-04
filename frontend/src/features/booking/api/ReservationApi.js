import { API_BASE_URL } from "../../../config";
import dayjs from "dayjs";

export default async function fetchReservations({ monday, bookedCourt }) {
  const weekStart = dayjs(monday).format("YYYY-MM-DD");

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/reservations/by-court-week?courtId=${bookedCourt}&weekStart=${weekStart}`
    );

    if (!res.ok) {
      throw new Error("Foglalások lekérése sikertelen");
    }

    const data = await res.json();

    const formatted = data.map((r) => ({
      startTime: new Date(r.booked_time),
      userId: r.user_id,
      userName: r.username || "Ismeretlen",
    }));

    return formatted;
  } catch (err) {
    console.error(err);
    throw err; // <- ezt küldöd vissza
  }
}