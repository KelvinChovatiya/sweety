
const { GlucoseReading } = require("../models");

const createReading = async (req, res) => {
  try {
    const { reading_date, slot, glucose_level } = req.body;

    // Check required fields
    if (!reading_date || !slot || glucose_level === undefined) {
      return res.status(400).json({
        message: "Date, slot and glucose level are required.",
      });
    }

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

    // Future date check
    const today = new Date().toISOString().slice(0, 10);

    if (reading_date > today) {
      return res.status(400).json({
        message: "Future dates are not allowed.",
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

    // Validate glucose level
    const level = Number(glucose_level);

    if (
      !Number.isInteger(level) ||
      level < 40 ||
      level > 600
    ) {
      return res.status(400).json({
        message: "Glucose level must be an integer between 40 and 600.",
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
    // Duplicate slot for the same user and date
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
