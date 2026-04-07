/**
 * tournamentDateUtils
 * -----------------------------------------------------------------------------
 * Fontos:
 * - Ez a fájl a tournament feature dátumformázó segédfüggvényeit tartalmazza.
 * - Csak tiszta utility függvények legyenek itt.
 * - Ne legyen benne React hook, state vagy API hívás.
 *
 * Mire használjuk:
 * - backendből kapott ISO dátum átalakítása datetime-local inputhoz
 * - datetime-local input érték átalakítása backend-kompatibilis stringgé
 *
 * Megjegyzés:
 * - A datetime-local input nem timezone-aware mező.
 * - Ezért különösen fontos, hogy a frontend és backend ugyanazt a formátumot várja.
 */
export function toDatetimeLocalValue(isoStringOrNull) {
    if (!isoStringOrNull) return "";
  
    const d = new Date(isoStringOrNull);
    if (Number.isNaN(d.getTime())) return "";
  
    const pad = (n) => String(n).padStart(2, "0");
  
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  
  export function datetimeLocalToString(value) {
    if (!value) return null;
  
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
      console.warn("Invalid datetime-local value:", value);
      return null;
    }
  
    return `${value}:00`;
  }