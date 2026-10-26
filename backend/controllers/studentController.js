const db = require("../db");

// ==========================================
// GET ALL STUDENTS
// ==========================================
const getAllStudents = async (req, res) => {
    try {
        const { search = "", department_id = "" } = req.query;

        let query = `
            SELECT
                s.student_id,
                s.name,
                s.email,
                s.roll_number,
                s.department_id,
                d.department_name,
                s.created_at,
                COUNT(r.request_id) AS request_count
            FROM students s
            LEFT JOIN departments d
                ON s.department_id = d.department_id
            LEFT JOIN requests r
                ON s.student_id = r.student_id
        `;

        const conditions = [];
        const params = [];

        // Search by name, roll number or email
        if (search.trim()) {
            conditions.push(`
                (
                    s.name LIKE ?
                    OR s.roll_number LIKE ?
                    OR s.email LIKE ?
                )
            `);

            const searchValue = `%${search.trim()}%`;

            params.push(
                searchValue,
                searchValue,
                searchValue
            );
        }

        // Department filter
        if (department_id) {
            conditions.push("s.department_id = ?");
            params.push(department_id);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += `
            GROUP BY
                s.student_id,
                s.name,
                s.email,
                s.roll_number,
                s.department_id,
                d.department_name,
                s.created_at
            ORDER BY s.created_at DESC
        `;

        const [students] = await db.execute(query, params);

        res.status(200).json({
            success: true,
            students
        });

    } catch (error) {
        console.error("Get All Students Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch students."
        });
    }
};


// ==========================================
// GET STUDENT BY ID
// ==========================================
const getStudentById = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Student information
        const [students] = await db.execute(
            `
            SELECT
                s.student_id,
                s.name,
                s.email,
                s.roll_number,
                s.department_id,
                d.department_name,
                s.created_at
            FROM students s
            LEFT JOIN departments d
                ON s.department_id = d.department_id
            WHERE s.student_id = ?
            `,
            [studentId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        const student = students[0];

        // Student requests
        const [requests] = await db.execute(
            `
            SELECT
                request_id,
                request_type,
                subject,
                status,
                created_at,
                updated_at
            FROM requests
            WHERE student_id = ?
            ORDER BY created_at DESC
            `,
            [studentId]
        );

        res.status(200).json({
            success: true,
            student,
            requests
        });

    } catch (error) {
        console.error("Get Student Details Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch student details."
        });
    }
};


// ==========================================
// GET ALL DEPARTMENTS
// ==========================================
const getAllDepartments = async (req, res) => {
    try {
        const [departments] = await db.execute(
            `
            SELECT
                department_id,
                department_name
            FROM departments
            ORDER BY department_name ASC
            `
        );

        res.status(200).json({
            success: true,
            departments
        });

    } catch (error) {
        console.error("Get Departments Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch departments."
        });
    }
};


module.exports = {
    getAllStudents,
    getStudentById,
    getAllDepartments
};