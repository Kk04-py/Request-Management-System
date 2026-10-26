const express = require("express");

const router = express.Router();

const {
    registerStudent,
    loginStudent
} = require("../controllers/authController");

router.post("/student/register", registerStudent);

router.post("/student/login", loginStudent);

module.exports = router;