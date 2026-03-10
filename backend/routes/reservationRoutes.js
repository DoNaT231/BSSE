import express from "express";
import * as reservationService from "../services/reservationService.js";

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
 * GET /api/reservations/my-weekly?courtId=1&weekStart=2026-03-09
 *
 * A bejelentkezett user saját heti reservationjei egy adott pályán.
 *
 * Megjegyzés:
 * - authMiddleware szükséges
 * - req.user.id-t feltételez
 */
router.get("/my-weekly", async (req, res) => {
  try {
    const { courtId, weekStart } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Nincs bejelentkezett user.",
      });
    }

    if (!courtId || !weekStart) {
      return res.status(400).json({
        message: "A courtId és a weekStart megadása kötelező.",
      });
    }

    const { weekStart: start, weekEnd } = buildWeekRange(weekStart);

    const reservations = await reservationService.getOwnWeeklyReservations({
      userId: Number(userId),
      courtId: Number(courtId),
      weekStart: start,
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
 * POST /api/reservations/sync
 *
 * A frontend beküldi az adott hét végső állapotát egy adott pályára.
 * A backend ehhez igazítja a DB-ben lévő saját reservationöket.
 *
 * Body példa:
 * {
 *   "courtId": 1,
 *   "weekStart": "2026-03-09",
 *   "slots": [
 *     {
 *       "startTime": "2026-03-09T10:00:00.000Z",
 *       "endTime": "2026-03-09T11:00:00.000Z"
 *     },
 *     {
 *       "startTime": "2026-03-10T14:00:00.000Z",
 *       "endTime": "2026-03-10T15:00:00.000Z"
 *     }
 *   ]
 * }
 *
 * Megjegyzés:
 * - authMiddleware szükséges
 * - csak a user saját reservationjeit módosítja
 */
router.post("/sync", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courtId, weekStart, slots } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Nincs bejelentkezett user.",
      });
}

    if (!courtId || !weekStart || !Array.isArray(slots)) {
      return res.status(400).json({
        message: "A courtId, weekStart és slots mezők megadása kötelező.",
      });
    }

    const { weekStart: start, weekEnd } = buildWeekRange(weekStart);

    const result = await reservationService.syncWeeklyReservations({
      userId: Number(userId),
      courtId: Number(courtId),
      weekStart: start,
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
 * DELETE /api/reservations/:slotId
 *
 * A bejelentkezett user saját reservationjének törlése slot alapján.
 *
 * Megjegyzés:
 * - authMiddleware szükséges
 */
router.delete("/:slotId", async (req, res) => {
  try {
    const { slotId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Nincs bejelentkezett user.",
      });
    }

    const deletedEvent = await reservationService.deleteOwnReservationBySlotId({
      slotId: Number(slotId),
      userId: Number(userId),
    });

    return res.status(200).json({
      message: "Foglalás sikeresen törölve.",
      deletedEvent,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

export default router;