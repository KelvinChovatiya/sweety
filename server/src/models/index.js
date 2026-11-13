const User = require("./User");
const GlucoseReading = require("./GlucoseReading");

// One user can have many glucose readings.
User.hasMany(GlucoseReading, {
  foreignKey: "user_id",
  as: "readings",
});

// Each glucose reading belongs to one user.
GlucoseReading.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

module.exports = {
  User,
  GlucoseReading,
};