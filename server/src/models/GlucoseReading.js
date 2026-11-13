
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GlucoseReading = sequelize.define(
  "GlucoseReading",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    reading_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    slot: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: [[
          "morning_fasting",
          "after_breakfast",
          "after_lunch",
          "after_dinner",
        ]],
      },
    },

    glucose_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 40,
        max: 600,
        isInt: true,
      },
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "glucose_readings",
    timestamps: false,
  }
);

module.exports = GlucoseReading;

