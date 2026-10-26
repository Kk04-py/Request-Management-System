const express = require("express");

const router =
    express.Router();

const {

    loginStaff,

    getStaffProfile,

    changeStaffPassword

} = require(
    "../controllers/staffAuthController"
);

const authenticateStaff =
    require(
        "../middleware/staffAuthMiddleware"
    );


// =========================================================
// STAFF LOGIN
// =========================================================

router.post(
    "/login",
    loginStaff
);


// =========================================================
// STAFF PROFILE
// =========================================================

router.get(
    "/profile",
    authenticateStaff,
    getStaffProfile
);


// =========================================================
// CHANGE PASSWORD
// =========================================================

router.put(
    "/change-password",
    authenticateStaff,
    changeStaffPassword
);


module.exports = router;