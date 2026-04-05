import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminOnly.js";
import * as tournamentRegistrationService from "../services/tournamentRegistrationService.js";

const router = express.Router();

/**
 * POST /api/tournament-registrations
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    const registration =
      await tournamentRegistrationService.registerToTournament({
        tournamentId: Number(req.body.tournamentId ?? req.body.tournament_id),
        userId: Number(userId),
        teamName: req.body.teamName ?? req.body.team_name,
        telNumber: req.body.telNumber ?? req.body.tel_number,
        contactEmail: req.body.contactEmail ?? req.body.contact_email,
        players: req.body.players ?? [],
      });

    return res.status(201).json(registration);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/tournament-registrations/my
 */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    const rows =
      await tournamentRegistrationService.getMyTournamentRegistrations(
        Number(userId)
      );

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/tournament-registrations/:id
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated =
      await tournamentRegistrationService.updateOwnTournamentRegistration({
        registrationId: Number(req.params.id),
        userId: Number(req.user?.id),
        teamName: req.body.teamName ?? req.body.team_name,
        telNumber: req.body.telNumber ?? req.body.tel_number,
        contactEmail: req.body.contactEmail ?? req.body.contact_email,
        players: req.body.players,
      });

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/tournament-registrations/:id
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted =
      await tournamentRegistrationService.deleteOwnTournamentRegistration({
        registrationId: Number(req.params.id),
        userId: Number(req.user?.id),
      });

    return res.status(200).json({
      message: "Törölve.",
      deleted,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/tournament-registrations/admin/by-tournament/:tournamentId
 */
router.get(
  "/admin/by-tournament/:tournamentId",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const result =
        await tournamentRegistrationService.getTournamentRegistrations(
          Number(req.params.tournamentId)
        );

      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }
);

/**
 * PATCH /api/tournament-registrations/admin/:id/status
 * Body: { status: "CONFIRMED" | "WAITLISTED" }
 */
router.patch(
  "/admin/:id/status",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const updated =
        await tournamentRegistrationService.updateRegistrationStatusByAdmin({
          registrationId: Number(req.params.id),
          status: req.body?.status,
        });

      return res.status(200).json(updated);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }
);

/**
 * PATCH /api/tournament-registrations/admin/:id/paid
 * Body: { paid: boolean }
 */
router.patch(
  "/admin/:id/paid",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const updated =
        await tournamentRegistrationService.updateRegistrationPaidByAdmin({
          registrationId: Number(req.params.id),
          paid: req.body?.paid,
        });

      return res.status(200).json(updated);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }
);

export default router;