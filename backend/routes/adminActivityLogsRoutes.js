import express from "express";
import * as activityLogService from "../services/activityLogService.js";
import * as errorLogService from "../services/errorLogService.js";

const router = express.Router();

router.get("/summary", async (req, res, next) => {
  try {
    const summary = await activityLogService.getLogsSummary();
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
});

router.get("/activity", async (req, res, next) => {
  try {
    const result = await activityLogService.listActivityLogs({
      from: req.query.from,
      to: req.query.to,
      category: req.query.category,
      eventType: req.query.eventType,
      userId: req.query.userId,
      page: req.query.page,
      limit: req.query.limit,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/activity/:id", async (req, res, next) => {
  try {
    const item = await activityLogService.getActivityLogById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Naplóbejegyzés nem található." });
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

router.get("/errors", async (req, res, next) => {
  try {
    const result = await errorLogService.listErrorLogs({
      from: req.query.from,
      to: req.query.to,
      category: req.query.category,
      severity: req.query.severity,
      resolved: req.query.resolved,
      page: req.query.page,
      limit: req.query.limit,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/errors/:id", async (req, res, next) => {
  try {
    const item = await errorLogService.getErrorLogById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Hibanapló nem található." });
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

router.patch("/errors/:id/resolve", async (req, res, next) => {
  try {
    const updated = await errorLogService.resolveErrorLog(req.params.id, {
      resolvedBy: req.user?.id,
      resolvedNote: req.body?.resolvedNote ?? req.body?.note ?? null,
    });

    if (!updated) {
      return res.status(404).json({ message: "Hibanapló nem található." });
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
