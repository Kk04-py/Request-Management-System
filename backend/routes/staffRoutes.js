const express = require("express");
const router = express.Router();

const {
    getAllStaff,
    createStaff,
    updateStaffStatus
} = require("../controllers/staffController");

const authenticateAdmin = require("../middleware/adminAuthMiddleware");

router.get("/", authenticateAdmin, getAllStaff);

router.post("/", authenticateAdmin, createStaff);

router.put("/:id/status", authenticateAdmin, updateStaffStatus);

module.exports = router;