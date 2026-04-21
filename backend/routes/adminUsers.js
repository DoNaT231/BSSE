// +------------------------------------------------------------------+
// |                          adminUsers.js                           |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * adminUsers.js - HTTP route definiciok
 * =====================================================================
 *
 * Funkcio:
 * - Endpointok regisztralasa es middleware lanc osszeallitasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

import express from "express";
import * as usersService from "../services/usersService.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Összes user listázása
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("router")
    const users = await usersService.getAllUsers(req.user);
    console.log("router", users)

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
router.get("/:id", authMiddleware, async (req, res) => {
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
 * Csütörtöki pontok módosítása (delta: +N / −N, minimum 0)
 */
router.patch("/:id/thursday-points",authMiddleware, async (req, res) => {
    try {
      const delta = req.body?.delta;

      const updatedUser = await usersService.adminAdjustThursdayPoints(
        req.user,
        Number(req.params.id),
        delta
      );

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
);

/**
 * User módosítása admin által
 */
router.patch("/:id", authMiddleware, async (req, res) => {
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
router.patch("/:id/deactivate", authMiddleware, async (req, res) => {
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
router.patch("/:id/activate", authMiddleware, async (req, res) => {
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
router.delete("/:id", authMiddleware, async (req, res) => {
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