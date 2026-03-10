import express from "express";
import * as calendarService from "../services/calendarService.js";

const router = express.Router();

/**
 * Dátum intervallum számítása weekStart alapján.
 *
 * Feltételezés:
 * - a frontend a hét kezdőnapját küldi
 * - a weekEnd exclusive lesz
 */
function buildWeekRange(weekStart) {
  const start = new Date(weekStart);

  if (Number.isNaN(start.getTime())) {
    throw new Error("Érvénytelen weekStart dátum.");
  }

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return {
    weekStart: start,
    weekEnd: end,
  };
}

/**
 * GET /api/calendar/slots?courtId=1&weekStart=2026-03-09
 *
 * User calendar nézet:
 * - adott pálya
 * - adott hét
 * - összes event slot
 */
router.get("/slots", async (req, res) => {
  try {
    const { courtId, weekStart } = req.query;

    if (!courtId || !weekStart) {
      return res.status(400).json({
        message: "A courtId és a weekStart megadása kötelező.",
      });
    }

    const { weekStart: start, weekEnd } = buildWeekRange(weekStart);

    const slots = await calendarService.getWeeklyCalendarSlotsByCourt({
      courtId: Number(courtId),
      weekStart: start,
      weekEnd,
    });

    return res.status(200).json(slots);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * GET /api/calendar/admin/slots?courtId=1&weekStart=2026-03-09
 *
 * Admin calendar nézet:
 * - több adattal tér vissza
 *
 * Megjegyzés:
 * - ha akarod, ide később mehet adminMiddleware
 */
router.get("/admin/slots", async (req, res) => {
  try {
    const { courtId, weekStart } = req.query;

    if (!courtId || !weekStart) {
      return res.status(400).json({
        message: "A courtId és a weekStart megadása kötelező.",
      });
    }

    const { weekStart: start, weekEnd } = buildWeekRange(weekStart);

    const slots = await calendarService.getAdminWeeklySlotsByCourt({
      courtId: Number(courtId),
      weekStart: start,
      weekEnd,
    });

    return res.status(200).json(slots);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * GET /api/calendar/slot/:slotId
 *
 * Egy konkrét slot részletes lekérése a hozzá tartozó event alapadataival
 */
router.get("/slot/:slotId", async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await calendarService.getSlotWithEventBySlotId(Number(slotId));

    if (!slot) {
      return res.status(404).json({
        message: "A slot nem található.",
      });
    }

    return res.status(200).json(slot);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

export default router;