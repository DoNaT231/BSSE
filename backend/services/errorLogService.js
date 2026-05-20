import * as errorLogRepository from "../repositories/errorLogRepository.js";
import {
  enrichErrorMessage,
  extractErrorDebugContext,
} from "../utils/errorDebugContext.js";
import {
  extractUserEmail,
  maskSensitiveData,
  truncateStackTrace,
} from "../utils/logMasking.js";

function buildContext(req) {
  if (!req) return {};
  return {
    httpMethod: req.method ?? null,
    httpPath: req.originalUrl ?? req.url ?? null,
    userId: req.user?.id ?? null,
    requestBody: req.body ? maskSensitiveData(req.body) : null,
    requestQuery: req.query ? maskSensitiveData(req.query) : null,
  };
}

export function logError(payload, req = null) {
  const context = buildContext(req);
  const error = payload.error;
  const debugContext = extractErrorDebugContext(error);
  const metadata = {
    ...debugContext,
    ...(payload.metadata ?? {}),
  };
  const eventType = payload.eventType ?? null;
  const rawMessage = payload.message ?? error?.message ?? "Ismeretlen hiba";
  const entry = {
    severity: payload.severity ?? "error",
    category: payload.category ?? "system",
    eventType,
    message: enrichErrorMessage(rawMessage, { eventType, metadata }),
    errorName: payload.errorName ?? error?.name ?? null,
    stackTrace: payload.stackTrace ?? truncateStackTrace(error),
    userId: payload.userId ?? context.userId,
    httpMethod: payload.httpMethod ?? context.httpMethod,
    httpPath: payload.httpPath ?? context.httpPath,
    httpStatus: payload.httpStatus ?? debugContext.httpStatus ?? null,
    requestBody: payload.requestBody ?? context.requestBody,
    requestQuery: payload.requestQuery ?? context.requestQuery,
    metadata: Object.keys(metadata).length ? metadata : null,
  };

  errorLogRepository.insertErrorLog(entry).catch((err) => {
    console.error("errorLogService.insert failed:", err.message);
  });
}

export function logHttpError({ req, res, error, eventType = "http.error" }) {
  const status = error?.status ?? res?.statusCode ?? 500;
  logError(
    {
      category: inferCategoryFromPath(req?.originalUrl ?? req?.url),
      eventType,
      message: error?.message ?? `HTTP ${status}`,
      error,
      httpStatus: status,
      userEmail: extractUserEmail(req?.user),
    },
    req
  );
}

function inferCategoryFromPath(path = "") {
  if (path.includes("/reservations") || path.includes("/calendar")) {
    return "booking";
  }
  if (
    path.includes("/tournament") ||
    path.includes("/tournament-registrations")
  ) {
    return "tournament";
  }
  if (path.includes("/admin")) return "admin";
  if (path.includes("/auth")) return "auth";
  return "system";
}

export async function listErrorLogs(filters) {
  return errorLogRepository.findErrorLogs(filters);
}

export async function getErrorLogById(id) {
  return errorLogRepository.findErrorLogById(id);
}

export async function resolveErrorLog(id, { resolvedBy, resolvedNote }) {
  return errorLogRepository.resolveErrorLog(id, { resolvedBy, resolvedNote });
}
