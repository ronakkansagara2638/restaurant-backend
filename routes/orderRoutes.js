import express from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  addItemsToOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);
router.post("/", protect, createOrder);
router.put("/:id/items", protect, addItemsToOrder);
router.put("/:id/status", protect, updateOrderStatus);

export default router;
