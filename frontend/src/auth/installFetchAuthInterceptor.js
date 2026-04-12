import { API_BASE_URL } from "../config";
import { notifyAuthSessionInvalidated } from "../contexts/authSessionInvalidation";

/**
 * Ezeken az utakon a 401 tipikusan rossz jelszó / regisztrációs hiba, nem lejárt session.
 */
const AUTH_PATH_SUBSTRINGS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/start",
  /** 401 = rossz régi jelszó is lehet, nem feltétlen lejárt token */
  "/api/auth/change-password",
];

function isExcludedAuthPath(urlString) {
  return AUTH_PATH_SUBSTRINGS.some((fragment) => urlString.includes(fragment));
}

function resolveUrlString(input) {
  if (typeof input === "string") return input;
  if (typeof input === "object" && input !== null && typeof input.url === "string") {
    return input.url;
  }
  return "";
}

function isOurApiRequest(urlString) {
  if (!urlString) return false;
  if (urlString.startsWith(API_BASE_URL)) return true;
  if (API_BASE_URL.includes("localhost:5000") && urlString.includes("localhost:5000")) {
    return true;
  }
  return false;
}

function getAuthorizationHeader(input, init) {
  try {
    if (typeof Request !== "undefined" && input instanceof Request) {
      return (
        input.headers.get("Authorization") ||
        input.headers.get("authorization") ||
        ""
      );
    }
  } catch {
    /* ignore */
  }

  const headers = init?.headers;
  if (!headers) return "";

  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    return headers.get("Authorization") || headers.get("authorization") || "";
  }

  if (Array.isArray(headers)) {
    const row = headers.find(
      ([k]) => String(k).toLowerCase() === "authorization"
    );
    return row ? String(row[1] || "") : "";
  }

  return String(headers.Authorization || headers.authorization || "");
}

function requestSentBearerToken(input, init) {
  const auth = getAuthorizationHeader(input, init).trim();
  return auth.startsWith("Bearer ") && auth.length > "Bearer ".length;
}

async function readSessionMessage(response) {
  try {
    const clone = response.clone();
    const ct = clone.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    const data = await clone.json();
    if (data && typeof data.message === "string" && data.message.trim()) {
      return data.message.trim();
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Minden window.fetch hívást becsomagol: API + Bearer + 401 → session invalidáció.
 */
export function installFetchAuthInterceptor() {
  if (typeof window === "undefined" || window.__bsseFetchAuthInterceptor) return;
  window.__bsseFetchAuthInterceptor = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init);

    if (response.status !== 401) {
      return response;
    }

    const urlString = resolveUrlString(input);
    if (!isOurApiRequest(urlString) || isExcludedAuthPath(urlString)) {
      return response;
    }

    if (!requestSentBearerToken(input, init)) {
      return response;
    }

    const backendMessage = await readSessionMessage(response);
    notifyAuthSessionInvalidated(backendMessage || undefined);

    return response;
  };
}
