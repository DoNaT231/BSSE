import * as activityLogRepository from "../repositories/activityLogRepository.js";
import * as errorLogRepository from "../repositories/errorLogRepository.js";
import { extractUserEmail } from "../utils/logMasking.js";

function buildContext(req) {
  if (!req) return {};
  return {
    httpMethod: req.method ?? null,
    httpPath: req.originalUrl ?? req.url ?? null,
    ipAddress: req.ip ?? null,
    userAgent: req.get?.("user-agent") ?? null,
    userId: req.user?.id ?? null,
    userEmail: extractUserEmail(req.user),
  };
}

export function logActivity(payload, req = null) {
  const context = buildContext(req);
  const entry = {
    level: payload.level ?? "info",
    category: payload.category,
    eventType: payload.eventType,
    message: payload.message,
    userId: payload.userId ?? context.userId,
    userEmail: payload.userEmail ?? context.userEmail,
    httpMethod: payload.httpMethod ?? context.httpMethod,
    httpPath: payload.httpPath ?? context.httpPath,
    httpStatus: payload.httpStatus ?? null,
    durationMs: payload.durationMs ?? null,
    entityType: payload.entityType ?? null,
    entityId: payload.entityId != null ? String(payload.entityId) : null,
    metadata: payload.metadata ?? null,
    ipAddress: payload.ipAddress ?? context.ipAddress,
    userAgent: payload.userAgent ?? context.userAgent,
  };

  activityLogRepository.insertActivityLog(entry).catch((err) => {
    console.error("activityLogService.insert failed:", err.message);
  });
}

export async function listActivityLogs(filters) {
  return activityLogRepository.findActivityLogs(filters);
}

export async function getActivityLogById(id) {
  return activityLogRepository.findActivityLogById(id);
}

export async function getLogsSummary() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [activityRows, unresolvedCount, recentErrors] = await Promise.all([
    activityLogRepository.getActivitySummarySince(startOfDay),
    errorLogRepository.countUnresolvedSince(startOfDay),
    errorLogRepository.findRecentUnresolved(5),
  ]);

  const counts = Object.fromEntries(
    activityRows.map((row) => [row.event_type, row.count])
  );

  const topRejections = await activityLogRepository.findActivityLogs({
    from: startOfDay.toISOString(),
    page: 1,
    limit: 100,
  });

  const rejectionReasons = {};
  for (const item of topRejections.items) {
    if (!item.eventType?.includes("rejected")) continue;
    rejectionReasons[item.message] = (rejectionReasons[item.message] ?? 0) + 1;
  }

  const topRejectionList = Object.entries(rejectionReasons)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([message, count]) => ({ message, count }));

  return {
    today: {
      bookingSyncSuccess: counts["booking.sync.success"] ?? 0,
      bookingSyncRejected: counts["booking.sync.rejected"] ?? 0,
      tournamentRegisterSuccess: counts["tournament.register.success"] ?? 0,
      tournamentRegisterRejected: counts["tournament.register.rejected"] ?? 0,
      unresolvedErrors: unresolvedCount,
    },
    topRejections: topRejectionList,
    recentErrors,
  };
}
