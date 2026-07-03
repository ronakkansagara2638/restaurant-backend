import express from "express";
import { getSummary, clearData } from "../controllers/dashboardController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, getSummary);
router.delete("/clear-data", protect, adminOnly, clearData);

export default router;
