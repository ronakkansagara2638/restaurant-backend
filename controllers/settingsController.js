import Settings from "../models/Settings.js";

// GET /api/settings - everyone logged in can read (needed to print bills correctly)
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// PUT /api/settings (admin only)
export const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) settings = new Settings({});

    const fields = ["restaurantName", "address", "phone", "gstNumber", "defaultTaxPercent", "currencySymbol"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) settings[field] = req.body[field];
    });

    await settings.save();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};
