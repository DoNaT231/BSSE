const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "secret",
  "jwt",
]);

function maskString(value) {
  if (typeof value !== "string") return value;
  if (value.length <= 4) return "****";
  return `${"*".repeat(Math.min(value.length - 4, 8))}${value.slice(-4)}`;
}

export function maskSensitiveData(value, depth = 0) {
  if (depth > 6) return "[truncated]";
  if (value == null) return value;

  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === "string") {
      return { count: value.length };
    }
    return value.map((item) => maskSensitiveData(item, depth + 1));
  }

  if (typeof value !== "object") {
    return value;
  }

  const masked = {};
  for (const [key, raw] of Object.entries(value)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      masked[key] = "****";
      continue;
    }
    if (lowerKey === "players" && Array.isArray(raw)) {
      masked[key] = { count: raw.length };
      continue;
    }
    if (
      ["address", "taxnumber", "tax_number", "billingname", "billing_name"].includes(
        lowerKey
      ) &&
      typeof raw === "string"
    ) {
      masked[key] = maskString(raw);
      continue;
    }
    masked[key] = maskSensitiveData(raw, depth + 1);
  }
  return masked;
}

export function truncateStackTrace(error, maxLines = 8) {
  if (!error?.stack) return null;
  return error.stack.split("\n").slice(0, maxLines).join("\n");
}

export function extractUserEmail(user) {
  if (!user) return null;
  return user.email ?? user.username ?? null;
}
