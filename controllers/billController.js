import Bill from "../models/Bill.js";
import Order from "../models/Order.js";
import Table from "../models/Table.js";
import Settings from "../models/Settings.js";

const generateBillNumber = () => {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${stamp}-${rand}`;
};

// POST /api/bills  - generate a bill from an order
// body: { orderId, discountAmount, taxPercent, paymentMethod }
export const generateBill = async (req, res, next) => {
  try {
    const { orderId, discountAmount = 0, taxPercent, paymentMethod = "Cash" } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.items.length === 0) {
      return res.status(400).json({ message: "Cannot bill an order with no items" });
    }

    const existingBill = await Bill.findOne({ order: order._id });
    if (existingBill) {
      return res.status(400).json({ message: "A bill already exists for this order", bill: existingBill });
    }

    const settings = (await Settings.findOne({})) || { defaultTaxPercent: 5 };
    const effectiveTaxPercent = taxPercent !== undefined ? taxPercent : settings.defaultTaxPercent;

    const subtotal = order.recalculateSubtotal();
    const taxAmount = Math.round(((subtotal - discountAmount) * effectiveTaxPercent) / 100 * 100) / 100;
    const grandTotal = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;

    const bill = await Bill.create({
      order: order._id,
      tableNumber: order.tableNumber,
      items: order.items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
      subtotal,
      taxPercent: effectiveTaxPercent,
      taxAmount,
      discountAmount,
      grandTotal,
      paymentMethod,
      paymentStatus: "Unpaid",
      generatedBy: req.user._id,
      billNumber: generateBillNumber(),
    });

    // Mark the order as served-and-billed but don't free the table until payment is confirmed
    order.status = "Served";
    await order.save();

    res.status(201).json(bill);
  } catch (error) {
    next(error);
  }
};

// PUT /api/bills/:id/pay  - mark a bill as paid, free up the table, complete the order
export const markBillPaid = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    bill.paymentStatus = "Paid";
    bill.paidAt = new Date();
    if (paymentMethod) bill.paymentMethod = paymentMethod;
    await bill.save();

    const order = await Order.findById(bill.order);
    if (order) {
      order.status = "Completed";
      await order.save();

      const table = await Table.findById(order.table);
      if (table) {
        table.status = "Available";
        table.currentOrder = null;
        await table.save();
      }
    }

    res.json(bill);
  } catch (error) {
    next(error);
  }
};

// GET /api/bills?status=Unpaid&from=...&to=...
export const getBills = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.paymentStatus = req.query.status;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }
    const bills = await Bill.find(filter).sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    next(error);
  }
};

// GET /api/bills/:id
export const getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (error) {
    next(error);
  }
};
