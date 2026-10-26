const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// ======================================================
// STUDENT REGISTER
// ======================================================

const registerStudent = async (req, res) => {
    try {

        const {
            name,
            email,
            roll_number,
            department_id,
            password
        } = req.body;

        if (!name || !email || !roll_number || !department_id || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const [existingStudent] = await db.execute(
            "SELECT * FROM students WHERE email=? OR roll_number=?",
            [email, roll_number]
        );

        if (existingStudent.length > 0) {
            return res.status(400).json({
                message: "Student already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            `INSERT INTO students
            (name,email,roll_number,department_id,password)
            VALUES(?,?,?,?,?)`,
            [
                name,
                email,
                roll_number,
                department_id,
                hashedPassword
            ]
        );

        res.status(201).json({
            message: "Student Registered Successfully."
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// ======================================================
// STUDENT LOGIN
// ======================================================

const loginStudent = async (req, res) => {

    try {

        const { roll_number, password } = req.body;

        if (!roll_number || !password) {
            return res.status(400).json({
                message: "Roll Number and Password are required."
            });
        }

        const [student] = await db.execute(
            "SELECT * FROM students WHERE roll_number=?",
            [roll_number]
        );

        if (student.length === 0) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            student[0].password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Password."
            });
        }

        const token = jwt.sign(
            {
                student_id: student[0].student_id,
                roll_number: student[0].roll_number
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        res.status(200).json({
            message: "Login Successful",
            token,
            student: {
                id: student[0].student_id,
                name: student[0].name,
                email: student[0].email,
                roll_number: student[0].roll_number,
                department_id: student[0].department_id
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// ======================================================
// ADMIN LOGIN
// ======================================================

const loginAdmin = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        // Find admin
        const [admins] = await db.execute(
            "SELECT * FROM admins WHERE email = ?",
            [email]
        );

        if (admins.length === 0) {
            return res.status(404).json({
                message: "Admin not found."
            });
        }

        const admin = admins[0];

        // Check password
        const isMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password."
            });
        }

        // Create admin JWT
        const token = jwt.sign(
            {
                admin_id: admin.admin_id,
                email: admin.email,
                role: "admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        res.status(200).json({
            message: "Admin login successful.",
            token,
            admin: {
                id: admin.admin_id,
                name: admin.name,
                email: admin.email,
                role: "admin"
            }
        });

    } catch (error) {

        console.error("Admin Login Error:", error);

        res.status(500).json({
            message: "Internal server error."
        });

    }

};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    registerStudent,
    loginStudent,
    loginAdmin
};