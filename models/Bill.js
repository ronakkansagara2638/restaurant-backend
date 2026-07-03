import mongoose from "mongoose";

const billItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    tableNumber: { type: Number, required: true },
    items: { type: [billItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    taxPercent: { type: Number, required: true, default: 5 },
    taxAmount: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Other"],
      default: "Cash",
    },
    paymentStatus: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    paidAt: { type: Date, default: null },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    billNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("Bill", billSchema);
