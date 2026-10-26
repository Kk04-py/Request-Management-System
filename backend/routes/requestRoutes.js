const express=require("express");

const router=express.Router();

const {
    createRequest
}=require("../controllers/requestController");

const {
    authenticateStudent
}=require("../middleware/authMiddleware");

router.post(
    "/student/request",
    authenticateStudent,
    createRequest
);

module.exports=router;