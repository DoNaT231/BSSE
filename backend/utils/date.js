// +------------------------------------------------------------------+
// |                             date.js                              |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * date.js - Seged fuggvenyek gyujtemenye
 * =====================================================================
 *
 * Funkcio:
 * - Ujrafelhasznalhato technikai segedlogika biztositasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

export function formatHungarianDate(isoDate, options = {}) {
  if (!isoDate) return "";

  const defaultOptions = {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "long",     // január
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Date(isoDate).toLocaleString(
    "hu-HU",
    { ...defaultOptions, ...options }
  );
}