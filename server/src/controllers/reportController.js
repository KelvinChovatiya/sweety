
const { GlucoseReading } = require("../models");

const calculateSummary = (readings) => {
  const levels = readings.map((reading) => reading.glucose_level);

  const count = levels.length;

  return {
    highest: count ? Math.max(...levels) : null,
    lowest: count ? Math.min(...levels) : null,
    average: count
      ? Number(
          (levels.reduce((sum, level) => sum + level, 0) / count).toFixed(1)
        )
      : null,
    count,
  };
};
const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;

    // Validate date input
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "A valid date in YYYY-MM-DD format is required.",
      });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      return res.status(400).json({
        message: "Invalid date.",
      });
    }

    // Fetch only this user's readings for the requested date
    const readings = await GlucoseReading.findAll({
      where: {
        user_id: req.user.id,
        reading_date: date,
      },
      order: [["created_at", "ASC"]],
    });

   const summary = calculateSummary(readings);

    return res.status(200).json({
      date,
      summary: {
        highest: summary.highest,
        lowest: summary.lowest,
        average: summary.average,
        count: summary.count,
      },
      readings,
    });
  } catch (error) {
    console.error("Daily report error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};


const getMonthToDateReport = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const startDate = `${today.slice(0, 7)}-01`;

    const readings = await GlucoseReading.findAll({
      where: {
        user_id: req.user.id,
        reading_date: {
          [require("sequelize").Op.between]: [startDate, today],
        },
      },
      order: [
        ["reading_date", "ASC"],
        ["created_at", "ASC"],
      ],
    });

    return res.status(200).json({
      period: {
        start_date: startDate,
        end_date: today,
      },
      summary: calculateSummary(readings),
      readings,
    });
  } catch (error) {
    console.error("Month-to-date report error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};


const getPreviousMonthReport = async (req, res) => {
  try {
    const now = new Date();

    const firstDayCurrentMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );

    const lastDayPreviousMonth = new Date(
      firstDayCurrentMonth.getTime() - 24 * 60 * 60 * 1000
    );

    const firstDayPreviousMonth = new Date(
      Date.UTC(
        lastDayPreviousMonth.getUTCFullYear(),
        lastDayPreviousMonth.getUTCMonth(),
        1
      )
    );

    const startDate = firstDayPreviousMonth.toISOString().slice(0, 10);
    const endDate = lastDayPreviousMonth.toISOString().slice(0, 10);

    const { Op } = require("sequelize");

    const readings = await GlucoseReading.findAll({
      where: {
        user_id: req.user.id,
        reading_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [
        ["reading_date", "ASC"],
        ["created_at", "ASC"],
      ],
    });

    return res.status(200).json({
      period: {
        start_date: startDate,
        end_date: endDate,
      },
      summary: calculateSummary(readings),
      readings,
    });
  } catch (error) {
    console.error("Previous-month report error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
module.exports = { getDailyReport , getMonthToDateReport , getPreviousMonthReport };
