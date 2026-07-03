import express from "express";
import { getTables, createTable, updateTable, deleteTable } from "../controllers/tableController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getTables);
router.post("/", protect, adminOnly, createTable);
router.put("/:id", protect, adminOnly, updateTable);
router.delete("/:id", protect, adminOnly, deleteTable);

export default router;
