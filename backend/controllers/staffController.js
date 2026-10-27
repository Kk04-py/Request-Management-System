const db = require("../db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

function generateTemporaryPassword() {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "@#$%";
    const all = upper + lower + numbers + symbols;

    function randomChar(source) {
        return source[crypto.randomInt(0, source.length)];
    }

    let password =
        randomChar(upper) +
        randomChar(lower) +
        randomChar(numbers) +
        randomChar(symbols);

    for (let i = 0; i < 8; i++) {
        password += randomChar(all);
    }

    return password
        .split("")
        .sort(() => crypto.randomInt(-1, 2))
        .join("");
}


// GET ALL STAFF
const getAllStaff = async (req, res) => {
    try {
        const [staff] = await db.execute(`
           
    SELECT
        s.staff_id,
        s.name,
        s.email,
        s.department_id,
        s.created_at,
        d.department_name
    FROM staff s
    LEFT JOIN departments d
        ON s.department_id = d.department_id
    ORDER BY s.created_at DESC
`);

        res.status(200).json({
            success: true,
            staff
        });
    } catch (error) {
        console.error("Get All Staff Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load staff."
        });
    }
};


// CREATE STAFF
const createStaff = async (req, res) => {
    try {
        const { name, email, department_id, designation } = req.body;

        if (
            !name?.trim() ||
            !email?.trim() ||
            !department_id ||
            !designation?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email, department and designation are required."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanDesignation = designation.trim();

        const eduEmailPattern = /^[^\s@]+@[^\s@]+\.edu$/i;

        if (!eduEmailPattern.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Staff email must be an official .edu email address."
            });
        }

        const [existingStaff] = await db.execute(
            `
            SELECT staff_id
            FROM staff
            WHERE email = ?
            LIMIT 1
            `,
            [cleanEmail]
        );

        if (existingStaff.length > 0) {
            return res.status(409).json({
                success: false,
                message: "A staff account with this email already exists."
            });
        }

        const [departments] = await db.execute(
            `
            SELECT department_id
            FROM departments
            WHERE department_id = ?
            LIMIT 1
            `,
            [department_id]
        );

        if (departments.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Selected department does not exist."
            });
        }

        const temporaryPassword = generateTemporaryPassword();
const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

const [result] = await db.execute(
    `
    INSERT INTO staff
    (
        name,
        email,
        password,
        department_id
    )
    VALUES (?, ?, ?, ?)
    `,
    [
        cleanName,
        cleanEmail,
        hashedPassword,
        department_id
    ]
);

        res.status(201).json({
            success: true,
            message: "Staff account created successfully.",
            staff_id: result.insertId,
            temporary_password: temporaryPassword
        });
    } catch (error) {
        console.error("Create Staff Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create staff account."
        });
    }
};


// ACTIVATE / DEACTIVATE STAFF
const updateStaffStatus = async (req, res) => {
    try {
        const staffId = req.params.id;
        const { status } = req.body;

        if (status !== "Active" && status !== "Inactive") {
            return res.status(400).json({
                success: false,
                message: "Invalid staff status."
            });
        }

        const [result] = await db.execute(
            `
            UPDATE staff
            SET status = ?
            WHERE staff_id = ?
            `,
            [status, staffId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found."
            });
        }

        res.status(200).json({
            success: true,
            message: `Staff account ${status.toLowerCase()} successfully.`
        });
    } catch (error) {
        console.error("Update Staff Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update staff status."
        });
    }
};


module.exports = {
    getAllStaff,
    createStaff,
    updateStaffStatus
};