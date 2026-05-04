import express from "express";
import { handleContactMessage } from "../services/contactService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const result = await handleContactMessage(req.body);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Contact route error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 400
          ? error.message
          : "Szerverhiba történt az üzenet küldése közben.",
    });
  }
});

export default router;