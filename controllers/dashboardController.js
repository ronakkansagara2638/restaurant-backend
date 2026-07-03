import Bill from "../models/Bill.js";
import Order from "../models/Order.js";
import Table from "../models/Table.js";

// GET /api/dashboard/summary - today's revenue, order counts, table occupancy, top sellers
export const getSummary = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [todaysPaidBills, activeOrdersCount, tables, topItemsAgg] = await Promise.all([
      Bill.find({ paymentStatus: "Paid", paidAt: { $gte: startOfDay } }),
      Order.countDocuments({ status: { $in: ["Pending", "Preparing", "Served"] } }),
      Table.find({}),
      Bill.aggregate([
        { $match: { paymentStatus: "Paid", paidAt: { $gte: startOfDay } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            quantity: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { quantity: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const todaysRevenue = todaysPaidBills.reduce((sum, b) => sum + b.grandTotal, 0);
    const occupiedTables = tables.filter((t) => t.status === "Occupied").length;

    res.json({
      todaysRevenue,
      todaysBillCount: todaysPaidBills.length,
      activeOrdersCount,
      totalTables: tables.length,
      occupiedTables,
      availableTables: tables.length - occupiedTables,
      topItems: topItemsAgg,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/dashboard/clear-data  (admin only)
// Wipes all orders and bills, resets every table to Available.
// Menu, staff accounts, tables and settings are kept intact.
// No transaction needed — each operation is independently atomic
// and works on standalone MongoDB (no replica set required).
export const clearData = async (req, res, next) => {
  try {
    // Count first so the response can report what was removed
    const [orderCount, billCount] = await Promise.all([
      Order.countDocuments(),
      Bill.countDocuments(),
    ]);

    await Promise.all([
      Order.deleteMany({}),
      Bill.deleteMany({}),
      Table.updateMany({}, { $set: { status: "Available", currentOrder: null } }),
    ]);

    res.json({
      message: "All orders and bills have been cleared. Tables have been reset to Available.",
      deletedOrders: orderCount,
      deletedBills: billCount,
    });
  } catch (error) {
    next(error);
  }
};
