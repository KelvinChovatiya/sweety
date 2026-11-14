
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getDailyReport, getPreviousMonthReport, getMonthToDateReport } = require("../controllers/reportController");

router.get("/daily", authMiddleware, getDailyReport);
router.get("/month-to-date", authMiddleware, getMonthToDateReport);
router.get("/previous-month", authMiddleware, getPreviousMonthReport);

module.exports = router;
