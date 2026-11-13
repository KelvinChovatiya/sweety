const sequelize = require("./config/database");
const User = require("./models/User");
const GlucoseReading = require("./models/GlucoseReading");

async function testModels() {
  try {
    await sequelize.authenticate();

    await User.findAll({ limit: 1 });
    await GlucoseReading.findAll({ limit: 1 });

    console.log("Both models working successfully!");
  } catch (error) {
    console.error("Model test failed:", error.message);
  } finally {
    await sequelize.close();
  }
}

testModels();