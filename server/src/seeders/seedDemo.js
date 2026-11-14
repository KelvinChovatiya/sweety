
const bcrypt = require("bcrypt");
const sequelize = require("../config/database");
const { User, GlucoseReading } = require("../models");

// Generate date strings without relying on server timezone.
const shiftDate = (date, days) => {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
};

const getPreviousMonthDate = () => {
  const today = new Date().toISOString().slice(0, 10);
  const currentMonthStart = `${today.slice(0, 7)}-01`;
  const previousMonthEnd = shiftDate(currentMonthStart, -1);

  return `${previousMonthEnd.slice(0, 7)}-15`;
};

const seedDemo = async () => {
  try {
    await sequelize.authenticate();

    // Create demo user if it doesn't already exist.
    const passwordHash = await bcrypt.hash("SweetyDemo123!", 12);

    const [user, created] = await User.findOrCreate({
      where: { email: "demo@sweety.com" },
      defaults: {
        name: "Sweety Demo",
        email: "demo@sweety.com",
        password_hash: passwordHash,
      },
    });

    console.log(created ? "Demo user created." : "Demo user already exists.");

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = shiftDate(today, -1);
    const previousMonthDate = getPreviousMonthDate();

    const sampleReadings = [
      {
        reading_date: today,
        slot: "morning_fasting",
        glucose_level: 105,
      },
      {
        reading_date: yesterday,
        slot: "after_breakfast",
        glucose_level: 140,
      },
      {
        reading_date: previousMonthDate,
        slot: "morning_fasting",
        glucose_level: 110,
      },
    ];

    for (const reading of sampleReadings) {
      await GlucoseReading.findOrCreate({
        where: {
          user_id: user.id,
          reading_date: reading.reading_date,
          slot: reading.slot,
        },
        defaults: {
          user_id: user.id,
          ...reading,
        },
      });
    }

    console.log("Demo readings seeded successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seedDemo();
