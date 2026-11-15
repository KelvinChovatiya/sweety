
const { GlucoseReading } = require("../models");

const slotLabels = {
  morning_fasting: "Morning fasting",
  after_breakfast: "After breakfast",
  after_lunch: "After lunch",
  after_dinner: "After dinner",
};

const validateGlucoseLevel = (value) => {
  if (value === undefined || value === null || value === "") {
    return "Please enter a glucose value.";
  }

  const level = Number(value);

  if (!Number.isInteger(level) || level < 40 || level > 600) {
    return "Value must be between 40 and 600 mg/dl.";
  }

  return null;
};


const createReading = async (req, res) => {
  try {
    const { reading_date, slot, glucose_level } = req.body;

    // Check required fields
    if (!reading_date || !slot) {
      return res.status(400).json({
        message: "Date and slot are required.",
      });
    }

    // Validate glucose value
    const glucoseError = validateGlucoseLevel(glucose_level);

    if (glucoseError) {
      return res.status(400).json({
        message: glucoseError,
      });
    }

    const level = Number(glucose_level);

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(reading_date)) {
      return res.status(400).json({
        message: "Date must be in YYYY-MM-DD format.",
      });
    }

    const date = new Date(`${reading_date}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== reading_date
    ) {
      return res.status(400).json({
        message: "Invalid reading date.",
      });
    }

    // Check future date
    const today = new Date().toISOString().slice(0, 10);

    if (reading_date > today) {
      return res.status(400).json({
        message: "Date cannot be in the future.",
      });
    }

    // Validate slot
    const allowedSlots = [
      "morning_fasting",
      "after_breakfast",
      "after_lunch",
      "after_dinner",
    ];

    if (!allowedSlots.includes(slot)) {
      return res.status(400).json({
        message: "Invalid reading slot.",
      });
    }

    // Check duplicate slot for this user and date
    const existingSlot = await GlucoseReading.findOne({
      where: {
        user_id: req.user.id,
        reading_date,
        slot,
      },
    });

    if (existingSlot) {
      return res.status(409).json({
        message: `You already have a ${slotLabels[slot]} reading for this date.`,
      });
    }

    // Check maximum four readings per day
    const readingCount = await GlucoseReading.count({
      where: {
        user_id: req.user.id,
        reading_date,
      },
    });

    if (readingCount >= 4) {
      return res.status(400).json({
        message: "You can add only 4 readings per day.",
      });
    }

    // Create reading for authenticated user
    const reading = await GlucoseReading.create({
      user_id: req.user.id,
      reading_date,
      slot,
      glucose_level: level,
    });

    return res.status(201).json({
      message: "Glucose reading created successfully.",
      reading,
    });
  } catch (error) {
    // Database duplicate safety check
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "A reading already exists for this slot and date.",
      });
    }

    console.error("Create reading error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};


const getReadings = async (req, res) => {
  try {
    const readings = await GlucoseReading.findAll({
      where: {
        user_id: req.user.id,
      },
      order: [
        ["reading_date", "DESC"],
        ["created_at", "DESC"],
      ],
    });

    return res.status(200).json({
      count: readings.length,
      readings,
    });
  } catch (error) {
    console.error("Get readings error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

const updateReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { reading_date, slot, glucose_level } = req.body;

    const reading = await GlucoseReading.findOne({
      where: {
        id,
        user_id: req.user.id,
      },
    });

    if (!reading) {
      return res.status(404).json({
        message: "Reading not found.",
      });
    }

    // Validate required fields
    if (!reading_date || !slot || glucose_level === undefined) {
      return res.status(400).json({
        message: "Date, slot and glucose level are required.",
      });
    }

    // Validate date format and actual date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(reading_date)) {
      return res.status(400).json({
        message: "Date must be in YYYY-MM-DD format.",
      });
    }

    const date = new Date(`${reading_date}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== reading_date
    ) {
      return res.status(400).json({
        message: "Invalid reading date.",
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    if (reading_date > today) {
      return res.status(400).json({
        message: "Future dates are not allowed.",
      });
    }

    const allowedSlots = [
      "morning_fasting",
      "after_breakfast",
      "after_lunch",
      "after_dinner",
    ];

    if (!allowedSlots.includes(slot)) {
      return res.status(400).json({
        message: "Invalid reading slot.",
      });
    }

    const level = Number(glucose_level);

    if (!Number.isInteger(level) || level < 40 || level > 600) {
      return res.status(400).json({
        message: "Glucose level must be an integer between 40 and 600.",
      });
    }

    await reading.update({
      reading_date,
      slot,
      glucose_level: level,
    });

    return res.status(200).json({
      message: "Reading updated successfully.",
      reading,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "A reading already exists for this slot and date.",
      });
    }

    console.error("Update reading error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};


const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;

    const reading = await GlucoseReading.findOne({
      where: {
        id,
        user_id: req.user.id,
      },
    });

    if (!reading) {
      return res.status(404).json({
        message: "Reading not found.",
      });
    }

    await reading.destroy();

    return res.status(200).json({
      message: "Reading deleted successfully.",
    });
  } catch (error) {
    console.error("Delete reading error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

module.exports = { createReading, getReadings, updateReading, deleteReading };
