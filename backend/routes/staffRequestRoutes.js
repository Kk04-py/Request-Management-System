const express = require("express");
const router = express.Router();

const authenticateStaff = require("../middleware/staffAuthMiddleware");

const {
    getStaffRequests,
    getStaffDashboardStats,
    getStaffAnalytics,
    updateStaffRequest
} = require("../controllers/staffRequestController");

router.get(
    "/requests",
    authenticateStaff,
    getStaffRequests
);

router.get(
    "/stats",
    authenticateStaff,
    getStaffDashboardStats
);

router.get(
    "/analytics",
    authenticateStaff,
    getStaffAnalytics
);

router.put(
    "/requests/:id",
    authenticateStaff,
    updateStaffRequest
);

module.exports = router;