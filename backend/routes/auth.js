import express from "express";
import * as authService from "../services/authService.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateAccessToken } from "../utils/jwt.js";

function loginResponse(res, user) {
  const token = generateAccessToken(user);
  console.log(token + " " + res + " " + user)
  res.json({
    token,
    user
  });
}

const router = express.Router();

router.post("/start", async (req, res) => {
  try {
    const { email } = req.body;

    const result = await authService.startAuthFlow(email);
    console.log("waaaaaa", result)
    if (result.action === "LOGIN_WITHOUT_PASSWORD") {
      const token = generateAccessToken(result.user);

      return res.status(200).json({
        action: result.action,
        token,
        user: result.user,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * Új user létrehozása
 */
router.post("/register", async (req, res) => {
  try {
    const { email, username, isLocal, phone } = req.body;

    const user = await authService.registerUser({
      email,
      username,
      isLocal,
      phone,
    });
    console.log("elkeszult user: ",user)

    loginResponse(res, user)

  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * Belépés jelszó nélkül
 */
router.post("/login-without-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await authService.loginWithoutPassword(email);

    loginResponse(res, user)

  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * Belépés jelszóval
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await authService.loginWithPassword(email, password);

    loginResponse(res, user);
  
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * Jelszó beállítása
 */
router.post("/set-password", authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;

    const user = await authService.setPassword(req.user.id, password);

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * Saját jelszó módosítása
 */
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await authService.changePassword({
      userId: req.user.id,
      currentPassword,
      newPassword,
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

export default router;