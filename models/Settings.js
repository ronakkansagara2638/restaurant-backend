import mongoose from "mongoose";

// Singleton-style collection: there will only ever be one document here,
// holding the restaurant's own branding/tax details used on printed bills.
const settingsSchema = new mongoose.Schema(
  {
    restaurantName: { type: String, default: "My Restaurant" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    defaultTaxPercent: { type: Number, default: 5 },
    currencySymbol: { type: String, default: "₹" },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
