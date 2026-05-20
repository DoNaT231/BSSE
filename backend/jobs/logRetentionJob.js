import * as activityLogRepository from "../repositories/activityLogRepository.js";
import * as errorLogRepository from "../repositories/errorLogRepository.js";

const RETENTION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export async function purgeOldLogs() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * DAY_MS);
  const [activityDeleted, errorDeleted] = await Promise.all([
    activityLogRepository.deleteOlderThan(cutoff),
    errorLogRepository.deleteOlderThan(cutoff),
  ]);

  console.log(
    `[logRetention] Purged activity=${activityDeleted}, errors=${errorDeleted} (older than ${RETENTION_DAYS} days)`
  );

  return { activityDeleted, errorDeleted, cutoff };
}

export function scheduleLogRetentionJob() {
  purgeOldLogs().catch((err) => {
    console.error("[logRetention] Initial purge failed:", err.message);
  });

  setInterval(() => {
    purgeOldLogs().catch((err) => {
      console.error("[logRetention] Scheduled purge failed:", err.message);
    });
  }, DAY_MS);
}
