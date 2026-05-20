import { logActivity } from "../services/activityLogService.js";
import { logHttpError } from "../services/errorLogService.js";

const API_PREFIX = "/api/";

export default function requestLoggerMiddleware(req, res, next) {
  if (!req.originalUrl?.startsWith(API_PREFIX)) {
    return next();
  }

  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const status = res.statusCode;

    if (status >= 500) {
      logHttpError({
        req,
        res,
        error: new Error(`HTTP ${status} ${req.method} ${req.originalUrl}`),
        eventType: "http.error",
      });
      return;
    }

    if (status >= 400) {
      logActivity(
        {
          level: "warn",
          category: inferCategory(req.originalUrl),
          eventType: "http.client_error",
          message: `HTTP ${status} ${req.method} ${req.originalUrl}`,
          httpStatus: status,
          durationMs,
        },
        req
      );
    }
  });

  next();
}

function inferCategory(path = "") {
  if (path.includes("/reservations") || path.includes("/calendar")) {
    return "booking";
  }
  if (path.includes("/tournament")) return "tournament";
  if (path.includes("/admin")) return "admin";
  if (path.includes("/auth")) return "auth";
  return "system";
}
