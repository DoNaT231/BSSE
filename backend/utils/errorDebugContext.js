import { maskSensitiveData } from "./logMasking.js";

export function maskEmail(email) {
  if (!email || typeof email !== "string") return null;
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "***";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const maskedLocal = local.length <= 1 ? "*" : `${local[0]}***`;
  return `${maskedLocal}@${domain}`;
}

function inferDebugHints(error) {
  const msg = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "").toUpperCase();
  const hints = [];

  if (
    msg.includes("unable to verify") ||
    msg.includes("certificate") ||
    msg.includes("self signed") ||
    code.includes("CERT") ||
    code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
    code === "SELF_SIGNED_CERT_IN_CHAIN" ||
    code === "DEPTH_ZERO_SELF_SIGNED_CERT"
  ) {
    hints.push(
      "SSL/TLS tanúsítvány hiba — a Brevo API kapcsolat nem jött létre."
    );
    hints.push(
      "Gyakori ok: antivirus/VPN/proxy, hiányzó CA tanúsítvány (dev gépen)."
    );
    hints.push(
      "Ez NEM azt jelenti, hogy a címzett email cím nem létezik."
    );
  }

  if (msg.includes("missing brevo_api_key")) {
    hints.push("Hiányzó BREVO_API_KEY környezeti változó.");
  }

  const httpStatus = error?.status ?? error?.statusCode ?? error?.response?.status;
  if (httpStatus === 401) {
    hints.push("Brevo API kulcs érvénytelen vagy lejárt.");
  }
  if (httpStatus === 400) {
    hints.push(
      "Hibás email payload — ellenőrizd a template ID-t és a paramétereket."
    );
  }
  if (httpStatus === 429) {
    hints.push("Brevo rate limit — túl sok kérés rövid időn belül.");
  }

  if (msg.includes("enotfound") || msg.includes("getaddrinfo")) {
    hints.push("DNS/hálózati hiba — a Brevo API host nem érhető el.");
  }

  if (msg.includes("timeout") || msg.includes("etimedout")) {
    hints.push("Időtúllépés — a Brevo API nem válaszolt időben.");
  }

  return hints;
}

export function extractErrorDebugContext(error) {
  if (!error) return {};

  const ctx = {
    errorCode: error.code ?? null,
  };

  const httpStatus =
    error.status ?? error.statusCode ?? error.response?.status ?? null;
  if (httpStatus != null) {
    ctx.httpStatus = httpStatus;
  }

  const responseBody = error.response?.body ?? error.body;
  if (responseBody != null) {
    ctx.responseBody =
      typeof responseBody === "object"
        ? maskSensitiveData(responseBody)
        : String(responseBody).slice(0, 500);
  }

  const responseText = error.response?.text;
  if (responseText && !ctx.responseBody) {
    ctx.responseText = String(responseText).slice(0, 500);
  }

  const hints = inferDebugHints(error);
  if (hints.length) {
    ctx.debugHints = hints;
  }

  return ctx;
}

export function buildEmailFailureMetadata({
  toEmail,
  provider = "brevo",
  ...rest
}) {
  return {
    provider,
    recipientMasked: maskEmail(toEmail),
    brevoApiKeyConfigured: Boolean(process.env.BREVO_API_KEY),
    nodeEnv: process.env.NODE_ENV ?? "development",
    userFlowImpact:
      "none — a fő művelet sikeres volt, csak az email küldés bukott el.",
    ...rest,
  };
}

export function enrichErrorMessage(message, { eventType, metadata } = {}) {
  if (!message) return message;

  const isEmailFailure =
    eventType?.includes("email") || Boolean(metadata?.emailType);

  if (isEmailFailure && !message.startsWith("Email küldés")) {
    const scope =
      metadata?.emailType === "reservation_confirmation"
        ? "foglalás"
        : metadata?.emailType?.startsWith("registration") ||
            metadata?.emailType?.startsWith("tournament")
          ? "versenynevezés"
          : "értesítés";
    return `Email küldés sikertelen (${scope}, Brevo): ${message}`;
  }

  return message;
}
