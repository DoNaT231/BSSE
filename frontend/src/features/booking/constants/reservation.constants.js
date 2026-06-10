export const DAYS = [
  "Hétfő",
  "Kedd",
  "Szerda",
  "Csütörtök",
  "Péntek",
  "Szombat",
  "Vasárnap",
];

/** Első foglalható óra (8:00) */
export const BOOKING_FIRST_HOUR = 8;

/** Utolsó foglalható óra kezdete (21:00–22:00 slot) */
export const BOOKING_LAST_START_HOUR = 21;

export const HOURS = Array.from(
  { length: BOOKING_LAST_START_HOUR - BOOKING_FIRST_HOUR + 1 },
  (_, i) => BOOKING_FIRST_HOUR + i
);
