const db = require("../db");

const getDashboardStats = async (req, res) => {
    try {
        // ---------------------------------------
        // REQUEST STATISTICS
        // ---------------------------------------
        const [requestStats] = await db.execute(`
            SELECT
                COUNT(*) AS totalRequests,
                SUM(status IN ('New', 'Accepted')) AS pendingRequests,
                SUM(status = 'In Progress') AS inProgressRequests,
                SUM(status = 'Completed') AS completedRequests
            FROM requests
        `);

        // ---------------------------------------
        // SYSTEM OVERVIEW COUNTS
        // ---------------------------------------
        const [studentCount] = await db.execute(`
            SELECT COUNT(*) AS totalStudents
            FROM students
        `);

        const [staffCount] = await db.execute(`
            SELECT COUNT(*) AS totalStaff
            FROM staff
        `);

        const [departmentCount] = await db.execute(`
            SELECT COUNT(*) AS totalDepartments
            FROM departments
        `);

        // ---------------------------------------
        // SEND RESPONSE
        // ---------------------------------------
        res.status(200).json({
            success: true,

            // Request statistics
            totalRequests: Number(requestStats[0].totalRequests) || 0,
            pendingRequests: Number(requestStats[0].pendingRequests) || 0,
            inProgressRequests: Number(requestStats[0].inProgressRequests) || 0,
            completedRequests: Number(requestStats[0].completedRequests) || 0,

            // System overview
            totalStudents: Number(studentCount[0].totalStudents) || 0,
            totalStaff: Number(staffCount[0].totalStaff) || 0,
            totalDepartments: Number(departmentCount[0].totalDepartments) || 0
        });

    } catch (error) {
        console.error("Dashboard Statistics Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load dashboard statistics."
        });
    }
};

module.exports = {
    getDashboardStats
};