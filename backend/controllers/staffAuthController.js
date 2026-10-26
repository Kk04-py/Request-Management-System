const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// =========================================================
// STAFF LOGIN
// =========================================================

const loginStaff = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        // =================================================
        // FIND STAFF
        // =================================================

        const [staffRows] =
            await db.execute(
                `
                SELECT
                    staff_id,
                    name,
                    email,
                    department_id,
                    designation,
                    password,
                    status,
                    must_change_password
                FROM staff
                WHERE email = ?
                LIMIT 1
                `,
                [normalizedEmail]
            );


        if (staffRows.length === 0) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        const staff =
            staffRows[0];


        // =================================================
        // ACCOUNT STATUS
        // =================================================

        if (
            staff.status !==
            "Active"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Your staff account is inactive. Please contact the administrator."

            });

        }


        // =================================================
        // PASSWORD
        // =================================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                staff.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // =================================================
        // JWT
        // =================================================

        const token =
            jwt.sign(

                {
                    staff_id:
                        staff.staff_id,

                    email:
                        staff.email,

                    role:
                        "staff",

                    department_id:
                        staff.department_id
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        process.env.JWT_EXPIRES_IN ||
                        "1d"
                }

            );


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            message:
                "Staff login successful.",

            token,

            must_change_password:
                Boolean(
                    staff.must_change_password
                ),

            staff: {

                id:
                    staff.staff_id,

                staff_id:
                    staff.staff_id,

                name:
                    staff.name,

                email:
                    staff.email,

                department_id:
                    staff.department_id,

                designation:
                    staff.designation,

                status:
                    staff.status

            }

        });

    }

    catch (error) {

        console.error(
            "Staff Login Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }

};



// =========================================================
// STAFF PROFILE
// =========================================================

const getStaffProfile = async (req, res) => {

    try {

        const staffId =
            req.staff.staff_id;


        const [rows] =
            await db.execute(
                `
                SELECT
                    s.staff_id,
                    s.name,
                    s.email,
                    s.department_id,
                    s.designation,
                    s.status,
                    s.must_change_password,
                    d.department_name
                FROM staff s
                LEFT JOIN departments d
                    ON s.department_id =
                       d.department_id
                WHERE s.staff_id = ?
                LIMIT 1
                `,
                [staffId]
            );


        if (rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Staff account not found."

            });

        }


        const staff =
            rows[0];


        if (
            staff.status !==
            "Active"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Your staff account is inactive."

            });

        }


        res.status(200).json({

            success: true,

            staff

        });

    }

    catch (error) {

        console.error(
            "Get Staff Profile Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load staff profile."

        });

    }

};



// =========================================================
// CHANGE STAFF PASSWORD
// =========================================================

const changeStaffPassword = async (req, res) => {

    try {

        const staffId =
            req.staff.staff_id;


        const {
            currentPassword,
            newPassword,
            confirmPassword
        } = req.body;


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All password fields are required."

            });

        }


        if (
            newPassword !==
            confirmPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "New password and confirm password do not match."

            });

        }


        // =================================================
        // PASSWORD STRENGTH
        // =================================================

        if (
            newPassword.length < 8
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 8 characters."

            });

        }


        if (
            !/[A-Z]/.test(newPassword)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least one uppercase letter."

            });

        }


        if (
            !/[a-z]/.test(newPassword)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least one lowercase letter."

            });

        }


        if (
            !/[0-9]/.test(newPassword)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least one number."

            });

        }


        if (
            !/[^A-Za-z0-9]/.test(newPassword)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least one special character."

            });

        }


        // =================================================
        // GET CURRENT PASSWORD
        // =================================================

        const [staffRows] =
            await db.execute(
                `
                SELECT
                    password,
                    status
                FROM staff
                WHERE staff_id = ?
                LIMIT 1
                `,
                [staffId]
            );


        if (staffRows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Staff account not found."

            });

        }


        const staff =
            staffRows[0];


        if (
            staff.status !==
            "Active"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Your staff account is inactive."

            });

        }


        // =================================================
        // VERIFY CURRENT PASSWORD
        // =================================================

        const currentPasswordMatch =
            await bcrypt.compare(
                currentPassword,
                staff.password
            );


        if (!currentPasswordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Current password is incorrect."

            });

        }


        // =================================================
        // PREVENT SAME PASSWORD
        // =================================================

        const samePassword =
            await bcrypt.compare(
                newPassword,
                staff.password
            );


        if (samePassword) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must be different from your current password."

            });

        }


        // =================================================
        // HASH NEW PASSWORD
        // =================================================

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );


        // =================================================
        // UPDATE PASSWORD
        // =================================================

        await db.execute(
            `
            UPDATE staff
            SET
                password = ?,
                must_change_password = 0
            WHERE staff_id = ?
            `,
            [
                hashedPassword,
                staffId
            ]
        );


        return res.status(200).json({

            success: true,

            message:
                "Password changed successfully."

        });

    }

    catch (error) {

        console.error(
            "Change Staff Password Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to change password."

        });

    }

};


module.exports = {

    loginStaff,

    getStaffProfile,

    changeStaffPassword

};