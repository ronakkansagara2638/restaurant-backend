import Table from "../models/Table.js";

// GET /api/tables
export const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find({})
      .populate({ path: "currentOrder", select: "status subtotal createdAt" })
      .sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    next(error);
  }
};

// POST /api/tables  (admin only)
export const createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity } = req.body;
    if (!tableNumber) return res.status(400).json({ message: "Table number is required" });

    const exists = await Table.findOne({ tableNumber });
    if (exists) return res.status(400).json({ message: "A table with this number already exists" });

    const table = await Table.create({ tableNumber, capacity });
    res.status(201).json(table);
  } catch (error) {
    next(error);
  }
};

// PUT /api/tables/:id  (admin only - edit capacity or manually force a status)
export const updateTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });

    if (req.body.capacity !== undefined) table.capacity = req.body.capacity;
    if (req.body.status !== undefined) table.status = req.body.status;

    await table.save();
    res.json(table);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tables/:id (admin only)
export const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });
    if (table.status === "Occupied") {
      return res.status(400).json({ message: "Cannot delete a table that currently has an active order" });
    }
    await table.deleteOne();
    res.json({ message: "Table removed" });
  } catch (error) {
    next(error);
  }
};
