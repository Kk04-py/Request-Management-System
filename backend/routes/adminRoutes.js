

const express = require("express");
const router = express.Router();

const { loginAdmin } = require("../controllers/authController");

const {
    getDashboardStats
} = require("../controllers/adminController");

const authenticateAdmin = require("../middleware/adminAuthMiddleware");

const {
    getAllRequests,
    getRequestById,
    updateRequest
} = require("../controllers/requestController");

const {
    getAllStudents,
    getStudentById,
    getAllDepartments
} = require("../controllers/studentController");


// ==========================================
// ADMIN LOGIN
// ==========================================

router.post("/login", loginAdmin);


// ==========================================
// DASHBOARD
// ==========================================

router.get(
    "/dashboard/stats",
    authenticateAdmin,
    getDashboardStats
);


// ==========================================
// TEST
// ==========================================

router.get(
    "/test",
    authenticateAdmin,
    (req, res) => {
        res.json({
            success: true,
            message: "Admin API working."
        });
    }
);


// ==========================================
// REQUESTS
// ==========================================

router.get(
    "/requests",
    authenticateAdmin,
    getAllRequests
);

router.get(
    "/requests/:id",
    authenticateAdmin,
    getRequestById
);

router.put(
    "/requests/:id",
    authenticateAdmin,
    updateRequest
);


// ==========================================
// STUDENTS
// ==========================================

router.get(
    "/students",
    authenticateAdmin,
    getAllStudents
);

router.get(
    "/students/:id",
    authenticateAdmin,
    getStudentById
);


// ==========================================
// DEPARTMENTS
// ==========================================

router.get(
    "/departments",
    authenticateAdmin,
    getAllDepartments
);


module.exports = router;