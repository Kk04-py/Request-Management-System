const express = require("express");
const router = express.Router();

const {
    createRequest,
    getStudentRequests
} = require("../controllers/requestController");

const authenticateStudent = require("../middleware/authMiddleware");

router.post(
    "/requests",
    authenticateStudent,
    createRequest
);

router.get(
    "/requests",
    authenticateStudent,
    getStudentRequests
);

module.exports = router;