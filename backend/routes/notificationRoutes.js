const express = require("express");
const router = express.Router();

const {
    createNotification,
    getStudentNotifications,
    getAdminNotifications,
    getStaffNotifications,
    markNotificationRead,
    markAllStudentNotificationsRead,
    markAllStaffNotificationsRead
} = require("../controllers/notificationController");

const authenticateAdmin = require("../middleware/adminAuthMiddleware");
const authenticateStaff = require("../middleware/staffAuthMiddleware");
const authenticateStudent = require("../middleware/authMiddleware");

router.post("/", createNotification);

router.get(
    "/student/:student_id",
    authenticateStudent,
    getStudentNotifications
);

router.put(
    "/student/:student_id/read-all",
    authenticateStudent,
    markAllStudentNotificationsRead
);

router.get(
    "/admin",
    authenticateAdmin,
    getAdminNotifications
);

router.get(
    "/staff",
    authenticateStaff,
    getStaffNotifications
);

router.put(
    "/staff/read-all",
    authenticateStaff,
    markAllStaffNotificationsRead
);

router.put(
    "/:id/read",
    markNotificationRead
);

module.exports = router;