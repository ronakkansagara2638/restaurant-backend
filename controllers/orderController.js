import Order from "../models/Order.js";
import Table from "../models/Table.js";
import MenuItem from "../models/MenuItem.js";
import Bill from "../models/Bill.js";

// GET /api/orders?status=Pending  - list orders, optionally filtered by status
export const getOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.active === "true") {
      filter.status = { $in: ["Pending", "Preparing", "Served"] };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// POST /api/orders  - create a new order for a table
// body: { tableId, items: [{ menuItemId, quantity, notes }] }
export const createOrder = async (req, res, next) => {
  try {
    const { tableId, items } = req.body;

    if (!tableId || !items || items.length === 0) {
      return res.status(400).json({ message: "A table and at least one item are required" });
    }

    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ message: "Table not found" });

    if (table.status === "Occupied" && table.currentOrder) {
      return res.status(400).json({
        message: "This table already has an active order. Add items to the existing order instead.",
      });
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    const orderItems = items.map((i) => {
      const menuItem = menuItems.find((m) => m._id.toString() === i.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${i.menuItemId} not found`);
      if (!menuItem.isAvailable) throw new Error(`${menuItem.name} is currently unavailable`);
      return {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: i.quantity || 1,
        notes: i.notes || "",
      };
    });

    const order = new Order({
      table: table._id,
      tableNumber: table.tableNumber,
      items: orderItems,
      createdBy: req.user._id,
    });
    order.recalculateSubtotal();
    await order.save();

    table.status = "Occupied";
    table.currentOrder = order._id;
    await table.save();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id/items  - add more items to an existing (still open) order
export const addItemsToOrder = async (req, res, next) => {
  try {
    const { items } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (["Completed", "Cancelled"].includes(order.status)) {
      return res.status(400).json({ message: "Cannot add items to a closed order" });
    }

    const existingBill = await Bill.findOne({ order: order._id });
    if (existingBill) {
      return res
        .status(400)
        .json({ message: "A bill has already been generated for this order. Void it before adding more items." });
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    items.forEach((i) => {
      const menuItem = menuItems.find((m) => m._id.toString() === i.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${i.menuItemId} not found`);
      order.items.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: i.quantity || 1,
        notes: i.notes || "",
      });
    });

    order.recalculateSubtotal();
    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id/status  - move an order through Pending -> Preparing -> Served -> Completed
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    // Freeing the table happens at billing time (Completed) or on cancellation
    if (["Completed", "Cancelled"].includes(status)) {
      const table = await Table.findById(order.table);
      if (table && table.currentOrder?.toString() === order._id.toString()) {
        table.status = "Available";
        table.currentOrder = null;
        await table.save();
      }
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};
