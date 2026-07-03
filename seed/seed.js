// Run with: npm run seed
// Creates the first admin login, a starter set of tables and a sample menu
// so the restaurant has something to look at immediately after setup.
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Table from "../models/Table.js";
import MenuItem from "../models/MenuItem.js";
import Settings from "../models/Settings.js";

dotenv.config();

const run = async () => {
  await connectDB();

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@restaurant.com").toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: process.env.SEED_ADMIN_NAME || "Restaurant Owner",
      email: adminEmail,
      password: process.env.SEED_ADMIN_PASSWORD || "changeme123",
      role: "admin",
    });
    console.log(`Admin account created -> email: ${adminEmail}`);
  } else {
    console.log("Admin account already exists, skipping.");
  }

  const tableCount = await Table.countDocuments();
  if (tableCount === 0) {
    const tables = Array.from({ length: 10 }, (_, i) => ({
      tableNumber: i + 1,
      capacity: i % 3 === 0 ? 6 : 4,
    }));
    await Table.insertMany(tables);
    console.log("Created 10 sample tables.");
  } else {
    console.log("Tables already exist, skipping.");
  }

  const menuCount = await MenuItem.countDocuments();
  if (menuCount === 0) {
    await MenuItem.insertMany([
      { name: "Paneer Tikka", category: "Starters", price: 220, foodType: "Veg", description: "Char-grilled cottage cheese, smoked masala" },
      { name: "Chicken 65", category: "Starters", price: 260, foodType: "Non-Veg", description: "Spicy deep-fried chicken, curry leaf tempering" },
      { name: "Veg Spring Rolls", category: "Starters", price: 180, foodType: "Veg", description: "Crisp rolls with stir-fried vegetables" },
      { name: "Butter Chicken", category: "Main Course", price: 340, foodType: "Non-Veg", description: "Tandoori chicken in a rich tomato-butter gravy" },
      { name: "Paneer Butter Masala", category: "Main Course", price: 300, foodType: "Veg", description: "Cottage cheese in a creamy tomato gravy" },
      { name: "Dal Makhani", category: "Main Course", price: 240, foodType: "Veg", description: "Slow-cooked black lentils, finished with cream" },
      { name: "Veg Biryani", category: "Main Course", price: 260, foodType: "Veg", description: "Basmati rice layered with spiced vegetables" },
      { name: "Butter Naan", category: "Breads", price: 60, foodType: "Veg", description: "Tandoor-baked leavened bread" },
      { name: "Tandoori Roti", category: "Breads", price: 40, foodType: "Veg", description: "Whole-wheat tandoor bread" },
      { name: "Gulab Jamun", category: "Desserts", price: 120, foodType: "Veg", description: "Milk dumplings in cardamom sugar syrup" },
      { name: "Masala Chai", category: "Beverages", price: 50, foodType: "Veg", description: "Spiced Indian tea" },
      { name: "Fresh Lime Soda", category: "Beverages", price: 80, foodType: "Veg", description: "Sweet, salted or plain" },
    ]);
    console.log("Created sample menu items.");
  } else {
    console.log("Menu already exists, skipping.");
  }

  const settings = await Settings.findOne({});
  if (!settings) {
    await Settings.create({
      restaurantName: "My Restaurant",
      address: "123 Main Street",
      phone: "+91 90000 00000",
      defaultTaxPercent: 5,
      currencySymbol: "₹",
    });
    console.log("Created default settings - edit these from the Settings page after logging in.");
  }

  console.log("Seeding complete.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
