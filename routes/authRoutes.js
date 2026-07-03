import express from "express";
import { loginUser, createStaff, getStaff, updateStaffStatus, getMe } from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/staff", protect, adminOnly, createStaff);
router.get("/staff", protect, adminOnly, getStaff);
router.put("/staff/:id", protect, adminOnly, updateStaffStatus);

export default router;
