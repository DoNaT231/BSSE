import express from "express";
import * as tournamentRegistrationService from "../services/tournamentRegistrationService.js";
import * as tournamentService from "../services/tournamentService.js";

const router = express.Router();

/**
 * POST /api/tournaments
 *
 * Új tournament létrehozása
 *
 * Body példa:
 * {
 *   "title": "BSSE Strandröpi Kupa",
 *   "description": "Nyári amatőr torna",
 *   "organizerName": "BSSE",
 *   "organizerEmail": "info@bsse.hu",
 *   "organizerLogoUrl": "https://...",
 *   "registrationDeadline": "2026-07-10T18:00:00.000Z",
 *   "maxTeams": 16,
 *   "format": "2v2",
 *   "notes": "Nevezési díj a helyszínen",
 *   "slots": [
 *     {
 *       "courtId": 1,
 *       "startTime": "2026-07-12T10:00:00.000Z",
 *       "endTime": "2026-07-12T18:00:00.000Z"
 *     }
 *   ]
 * }
 */
router.post("/tournaments", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Nincs bejelentkezett user.",
      });
    }

    const {
      title,
      description,
      organizerName,
      organizerEmail,
      organizerLogoUrl,
      registrationDeadline,
      maxTeams,
      format,
      notes,
      slots,
    } = req.body;

    if (!title || !organizerName || !organizerEmail || !Array.isArray(slots)) {
      return res.status(400).json({
        message:
          "A title, organizerName, organizerEmail és slots mezők megadása kötelező.",
      });
    }

    const result = await tournamentService.createTournament({
      title,
      description,
      createdByUserId: Number(userId),
      organizerName,
      organizerEmail,
      organizerLogoUrl,
      registrationDeadline,
      maxTeams,
      format,
      notes,
      slots,
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * GET /api/tournaments
 *
 * Összes tournament listázása
 */
router.get("/tournaments", async (req, res) => {
  try {
    const tournaments = await tournamentService.getAllTournaments();
    return res.status(200).json(tournaments);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * GET /api/tournaments/:id
 *
 * Egy tournament részletes lekérése
 */
router.get("/tournaments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const tournament = await tournamentService.getTournamentById(Number(id));

    return res.status(200).json(tournament);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
});

/**
 * PUT /api/tournaments/:id
 *
 * Tournament adatainak módosítása
 *
 * Jelenleg:
 * - a tournament saját mezőit frissíti
 * - nem módosít slotokat
 * - nem módosít event title/description mezőket
 */
router.put("/tournaments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTournament = await tournamentService.updateTournamentFully(
      Number(id),
      req.body
    );

    return res.status(200).json(updatedTournament);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * DELETE /api/tournaments/:id
 *
 * Tournament teljes törlése
 */
router.delete("/tournaments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await tournamentService.deleteTournamentById(Number(id));

    return res.status(200).json({
      message: "Tournament sikeresen törölve.",
      deleted,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * POST /api/tournaments/:id/register
 *
 * Tournamentre jelentkezés
 *
 * Body példa:
 * {
 *   "teamName": "Homokharcosok",
 *   "telNumber": "06301234567",
 *   "contactEmail": "team@email.com",
 *   "players": ["Játékos 1", "Játékos 2"]
 * }
 *
 * Megjegyzés:
 * - authMiddleware ajánlott
 * - userId a tokenből jön
 */
router.post("/tournaments/:id/register", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id ?? null;

    const {
      teamName,
      telNumber,
      contactEmail,
      players = [],
    } = req.body;

    const registration =
      await tournamentRegistrationService.registerToTournament({
        tournamentId: Number(id),
        userId: userId ? Number(userId) : null,
        teamName,
        telNumber,
        contactEmail,
        players,
      });

    return res.status(201).json(registration);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * GET /api/tournaments/:id/registrations
 *
 * Egy tournament összes nevezése
 *
 * Megjegyzés:
 * - ezt érdemes adminMiddleware mögé rakni
 */
router.get("/:id/registrations", async (req, res) => {
  try {
    const { id } = req.params;

    const registrations =
      await tournamentRegistrationService.getTournamentRegistrations(
        Number(id)
      );

    return res.status(200).json(registrations);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
});

/**
 * PUT /api/tournament-registrations/:id
 *
 * A bejelentkezett user saját tournament jelentkezésének módosítása
 *
 * Body példa:
 * {
 *   "teamName": "Új csapatnév",
 *   "telNumber": "06301234567",
 *   "contactEmail": "uj@email.com",
 *   "players": ["Játékos 1", "Játékos 2"]
 * }
 *
 * Megjegyzés:
 * - authMiddleware szükséges
 */
router.put("/tournament-registrations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Nincs bejelentkezett user.",
      });
    }

    const updatedRegistration =
      await tournamentRegistrationService.updateOwnTournamentRegistration({
        registrationId: Number(id),
        userId: Number(userId),
        teamName: req.body.teamName,
        telNumber: req.body.telNumber,
        contactEmail: req.body.contactEmail,
        players: req.body.players,
      });

    return res.status(200).json(updatedRegistration);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * DELETE /api/tournament-registrations/:id
 *
 * A bejelentkezett user saját tournament jelentkezésének törlése
 *
 * Megjegyzés:
 * - authMiddleware szükséges
 */
router.delete("/tournament-registrations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Nincs bejelentkezett user.",
      });
    }

    const deletedRegistration =
      await tournamentRegistrationService.deleteOwnTournamentRegistration({
        registrationId: Number(id),
        userId: Number(userId),
      });

    return res.status(200).json({
      message: "A jelentkezés sikeresen törölve.",
      deletedRegistration,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

export default router;