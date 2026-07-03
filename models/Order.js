import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
    tableNumber: { type: Number, required: true },
    items: { type: [orderItemSchema], default: [] },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Served", "Completed", "Cancelled"],
      default: "Pending",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subtotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);

orderSchema.methods.recalculateSubtotal = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return this.subtotal;
};

export default mongoose.model("Order", orderSchema);
