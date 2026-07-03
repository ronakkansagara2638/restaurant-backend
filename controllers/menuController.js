import MenuItem from "../models/MenuItem.js";

// GET /api/menu  (everyone logged in can view the menu)
export const getMenuItems = async (req, res, next) => {
  try {
    const items = await MenuItem.find({}).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// POST /api/menu  (admin only)
export const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, foodType, isAvailable, imageUrl } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      category,
      foodType,
      isAvailable,
      imageUrl,
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

// PUT /api/menu/:id  (admin only)
export const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    const fields = ["name", "description", "price", "category", "foodType", "isAvailable", "imageUrl"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    });

    await item.save();
    res.json(item);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/menu/:id  (admin only)
export const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    await item.deleteOne();
    res.json({ message: "Menu item removed" });
  } catch (error) {
    next(error);
  }
};
