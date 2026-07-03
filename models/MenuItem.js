import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      trim: true,
      default: "Main Course",
    },
    foodType: {
      type: String,
      enum: ["Veg", "Non-Veg", "Vegan", "Egg"],
      default: "Veg",
    },
    isAvailable: { type: Boolean, default: true },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);
