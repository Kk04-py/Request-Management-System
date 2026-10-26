const express = require("express");

const router =
    express.Router();


const authenticateStaff =
    require(
        "../middleware/staffAuthMiddleware"
    );


const {

    getStaffDashboard,

    getStaffRequests,

    getStaffRequestTypes,

    getStaffRequestById,

    updateStaffRequest,

    getStaffAnalytics

} = require(
    "../controllers/staffDashboardController"
);



// =========================================================
// ALL STAFF ROUTES REQUIRE AUTHENTICATION
// =========================================================

router.use(
    authenticateStaff
);



// =========================================================
// DASHBOARD
// =========================================================

router.get(
    "/dashboard",
    getStaffDashboard
);



// =========================================================
// REQUESTS
// =========================================================

router.get(
    "/requests",
    getStaffRequests
);


router.get(
    "/requests/types",
    getStaffRequestTypes
);


router.get(
    "/requests/:id",
    getStaffRequestById
);


router.put(
    "/requests/:id",
    updateStaffRequest
);



// =========================================================
// ANALYTICS
// =========================================================

router.get(
    "/analytics",
    getStaffAnalytics
);


module.exports = router;