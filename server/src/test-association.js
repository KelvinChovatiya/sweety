const sequelize = require("./config/database");
const { User, GlucoseReading } = require("./models");

async function testAssociation() {
  try {
    await sequelize.authenticate();

    const user = await User.findOne({
      include: [
        {
          model: GlucoseReading,
          as: "readings",
        },
      ],
    });

    console.log("Association working!");
    console.log(user ? user.toJSON() : "No users found yet.");
  } catch (error) {
    console.error("Association test failed:", error.message);
  } finally {
    await sequelize.close();
  }
}

testAssociation();