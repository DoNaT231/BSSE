import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminOnly.js";
import * as reservationsService from "../services/reservationsService.js";

const router = express.Router();

/**
 * User heti foglalásainak szinkronizálása adott pályára
 *
 * body:
 * {
 *   courtId,
 *   weekStart,
 *   weekEnd,
 *   slots: [
 *     { startTime, endTime }
 *   ]
 * }
 */
router.post("/sync-week", authMiddleware, async (req, res) => {
  try {
    const { courtId, weekStart, weekEnd, slots } = req.body;

    const result = await reservationsService.syncWeeklyReservations(req.user, {
      courtId,
      weekStart,
      weekEnd,
      slots,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * Heti foglalások lekérése adott pályára
 *
 * query:
 * /week?courtId=1&weekStart=2026-03-09T00:00:00.000Z&weekEnd=2026-03-16T00:00:00.000Z
 */
router.get("/week", async (req, res) => {
  try {
    const { courtId, weekStart, weekEnd } = req.query;

    const reservations =
      await reservationsService.getReservationsByWeekAndCourt({
        courtId: Number(courtId),
        weekStart,
        weekEnd,
      });

    return res.status(200).json(reservations);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * Admin: egy foglalás részletes adatainak lekérése
 */
router.get("/:eventId", authMiddleware, adminOnly, async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);

    const reservation = await reservationsService.getReservationAdminDetails(
      req.user,
      eventId
    );

    return res.status(200).json(reservation);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
});

/**
 * Admin: foglalás cancelálása
 */
router.patch("/:eventId/cancel", authMiddleware, adminOnly, async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);

    const result = await reservationsService.adminCancelReservation(
      req.user,
      eventId
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

export default router;