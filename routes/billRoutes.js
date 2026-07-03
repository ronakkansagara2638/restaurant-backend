import express from "express";
import { generateBill, markBillPaid, getBills, getBillById } from "../controllers/billController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getBills);
router.get("/:id", protect, getBillById);
router.post("/", protect, generateBill);
router.put("/:id/pay", protect, markBillPaid);

export default router;
