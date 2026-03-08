import express from "express";
import * as usersService from "../services/usersService.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

function adminGuard(req, res, next) {
  if (!req.user || req.user.user_type !== "ADMIN") {
    return res.status(403).json({
      message: "Nincs jogosultság ehhez a művelethez.",
    });
  }

  next();
}

/**
 * Összes user listázása
 */
router.get("/", authMiddleware, adminGuard, async (req, res) => {
  try {
    const users = await usersService.getAllUsers(req.user);

    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * Egy user lekérése admin nézetre
 */
router.get("/:id", authMiddleware, adminGuard, async (req, res) => {
  try {
    const user = await usersService.getUserByIdForAdmin(
      req.user,
      Number(req.params.id)
    );

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
});

/**
 * User módosítása admin által
 */
router.patch("/:id", authMiddleware, adminGuard, async (req, res) => {
  try {
    const { username, email, userType, isLocal, phone, isActive } = req.body;

    const updatedUser = await usersService.adminUpdateUser(
      req.user,
      Number(req.params.id),
      {
        username,
        email,
        userType,
        isLocal,
        phone,
        isActive,
      }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * User deaktiválása admin által
 */
router.patch("/:id/deactivate", authMiddleware, adminGuard, async (req, res) => {
  try {
    const updatedUser = await usersService.adminDeactivateUser(
      req.user,
      Number(req.params.id)
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * User aktiválása admin által
 */
router.patch("/:id/activate", authMiddleware, adminGuard, async (req, res) => {
  try {
    const updatedUser = await usersService.adminActivateUser(
      req.user,
      Number(req.params.id)
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * User végleges törlése admin által
 */
router.delete("/:id", authMiddleware, adminGuard, async (req, res) => {
  try {
    const deletedUser = await usersService.adminDeleteUser(
      req.user,
      Number(req.params.id)
    );

    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

export default router;