import { logHttpError } from "../services/errorLogService.js";

export default function errorHandlerMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status ?? err.statusCode ?? 500;

  if (status >= 500) {
    logHttpError({ req, res, error: err, eventType: "http.error" });
  }

  res.status(status).json({
    message: err.message || "Szerver hiba történt.",
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
