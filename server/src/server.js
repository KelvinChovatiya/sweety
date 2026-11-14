
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const readingRoutes = require("./routes/readingRoutes");
const reportRoutes = require("./routes/reportRoutes");


const app = express();

app.use(cors());
app.use(express.json());


const authRoutes = require("./routes/authRoutes");

app.use("/api/readings", readingRoutes);

app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Sweety API is running!" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/auth", authRoutes);



const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log("PostgreSQL connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
