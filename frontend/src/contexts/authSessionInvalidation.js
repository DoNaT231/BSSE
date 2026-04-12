/**
 * 401 (érvénytelen / lejárt token) esetén a fetch interceptor hívja.
 * Az AuthProvider regisztrálja a tényleges kijelentkezést + üzenetet.
 */

let handler = null;
let notifyLock = false;

export const DEFAULT_SESSION_INVALID_MESSAGE =
  "A munkameneted lejárt, vagy a belépés érvénytelen. Kérjük, jelentkezz be újra.";

export function registerAuthSessionInvalidationHandler(fn) {
  handler = typeof fn === "function" ? fn : null;
}

export function notifyAuthSessionInvalidated(message) {
  if (notifyLock || !handler) return;
  notifyLock = true;
  try {
    handler(message || DEFAULT_SESSION_INVALID_MESSAGE);
  } finally {
    window.setTimeout(() => {
      notifyLock = false;
    }, 800);
  }
}
