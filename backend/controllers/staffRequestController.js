const db = require("../db");

const {
    createStudentNotification
} = require("./notificationController");

// GET STAFF DEPARTMENT REQUESTS
const getStaffRequests = async (req, res) => {
    try {
        const departmentId = req.staff.department_id;

        if (!departmentId) {
            return res.status(400).json({
                success: false,
                message: "Staff department is not assigned."
            });
        }

        const [requests] = await db.execute(
            `
            SELECT
                r.request_id,
                r.student_id,
                s.name AS student_name,
                s.roll_number,
                s.email AS student_email,
                d.department_id,
                d.department_name,
                r.request_type,
                r.subject,
                r.description,
                r.status,
                r.staff_response,
                r.created_at,
                r.updated_at
            FROM requests r
            INNER JOIN students s
                ON r.student_id = s.student_id
            INNER JOIN departments d
                ON r.department_id = d.department_id
            WHERE r.department_id = ?
            ORDER BY r.updated_at DESC, r.created_at DESC
            `,
            [departmentId]
        );

        return res.status(200).json({
            success: true,
            requests
        });
    } catch (error) {
        console.error("Get Staff Requests Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load department requests."
        });
    }
};

// STAFF DASHBOARD STATISTICS
const getStaffDashboardStats = async (req, res) => {
    try {
        const departmentId = req.staff.department_id;

        if (!departmentId) {
            return res.status(400).json({
                success: false,
                message: "Staff department is not assigned."
            });
        }

        const [stats] = await db.execute(
            `
            SELECT
                COUNT(*) AS totalRequests,
                COALESCE(SUM(status = 'New'), 0) AS newRequests,
                COALESCE(SUM(status = 'Accepted'), 0) AS acceptedRequests,
                COALESCE(SUM(status IN ('New', 'Accepted')), 0) AS pendingRequests,
                COALESCE(SUM(status = 'In Progress'), 0) AS inProgressRequests,
                COALESCE(SUM(status = 'Completed'), 0) AS completedRequests,
                COALESCE(SUM(status = 'Rejected'), 0) AS rejectedRequests,
                COALESCE(SUM(DATE(created_at) = CURDATE()), 0) AS todayRequests
            FROM requests
            WHERE department_id = ?
            `,
            [departmentId]
        );

        const [recentRequests] = await db.execute(
            `
            SELECT
                r.request_id,
                s.name AS student_name,
                r.subject,
                r.status,
                r.updated_at,
                r.created_at
            FROM requests r
            INNER JOIN students s
                ON r.student_id = s.student_id
            WHERE r.department_id = ?
            ORDER BY r.updated_at DESC, r.created_at DESC
            LIMIT 5
            `,
            [departmentId]
        );

        const data = stats[0] || {};

        return res.status(200).json({
            success: true,
            totalRequests: Number(data.totalRequests) || 0,
            newRequests: Number(data.newRequests) || 0,
            acceptedRequests: Number(data.acceptedRequests) || 0,
            pendingRequests: Number(data.pendingRequests) || 0,
            inProgressRequests: Number(data.inProgressRequests) || 0,
            completedRequests: Number(data.completedRequests) || 0,
            rejectedRequests: Number(data.rejectedRequests) || 0,
            todayRequests: Number(data.todayRequests) || 0,
            recentRequests
        });
    } catch (error) {
        console.error("Staff Dashboard Statistics Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load staff dashboard statistics."
        });
    }
};

// STAFF ANALYTICS
const getStaffAnalytics = async (req, res) => {
    try {
        const departmentId = req.staff.department_id;
        const range = req.query.range || "all";

        if (!departmentId) {
            return res.status(400).json({
                success: false,
                message: "Staff department is not assigned."
            });
        }

        const dateConditions = {
            "7": "AND r.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)",
            "30": "AND r.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)",
            "90": "AND r.created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)"
        };

        if (!["all", "7", "30", "90"].includes(range)) {
            return res.status(400).json({
                success: false,
                message: "Invalid analytics date range."
            });
        }

        const dateCondition = dateConditions[range] || "";

        const [requests] = await db.execute(
            `
            SELECT
                r.request_id,
                r.request_type,
                r.status,
                r.created_at,
                r.updated_at,
                s.name AS student_name,
                s.roll_number,
                r.subject
            FROM requests r
            INNER JOIN students s
                ON r.student_id = s.student_id
            WHERE r.department_id = ?
            ${dateCondition}
            ORDER BY r.created_at ASC
            `,
            [departmentId]
        );

        return res.status(200).json({
            success: true,
            range,
            requests
        });
    } catch (error) {
        console.error("Staff Analytics Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load staff analytics."
        });
    }
};

// STAFF UPDATE REQUEST
const updateStaffRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const departmentId = req.staff.department_id;
        const { status, staff_response } = req.body;

        if (!departmentId) {
            return res.status(400).json({
                success: false,
                message: "Staff department is not assigned."
            });
        }

        const allowedStatuses = [
            "New",
            "Accepted",
            "In Progress",
            "Completed",
            "Rejected"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request status."
            });
        }

        if (
            staff_response !== undefined &&
            typeof staff_response !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Staff response must be text."
            });
        }

        const [existingRows] = await db.execute(
            `
            SELECT
                request_id,
                student_id,
                department_id,
                status,
                staff_response
            FROM requests
            WHERE request_id = ?
            LIMIT 1
            `,
            [requestId]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Request not found."
            });
        }

        const request = existingRows[0];

        if (
            Number(request.department_id) !== Number(departmentId)
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot access requests from another department."
            });
        }

        const oldStatus = request.status;
        const oldResponse = request.staff_response || "";
        const newResponse =
            staff_response === undefined
                ? oldResponse
                : staff_response.trim();

        const statusChanged = oldStatus !== status;
        const responseChanged = oldResponse !== newResponse;

        if (!statusChanged && !responseChanged) {
            return res.status(200).json({
                success: true,
                message: "No changes were needed."
            });
        }

        await db.execute(
            `
            UPDATE requests
            SET
                status = ?,
                staff_response = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE request_id = ?
            `,
            [status, newResponse || null, requestId]
        );

        try {
            await db.execute(
                `
                INSERT INTO request_timeline
                (
                    request_id,
                    staff_id,
                    action,
                    old_status,
                    new_status,
                    response
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    requestId,
                    req.staff.staff_id,
                    statusChanged && responseChanged
                        ? "Status and Response Updated"
                        : statusChanged
                            ? "Status Updated"
                            : "Staff Response Updated",
                    oldStatus,
                    status,
                    responseChanged ? newResponse || null : null
                ]
            );
        } catch (timelineError) {
            console.error("Staff Request Timeline Error:", timelineError);
        }

        let message;

        if (statusChanged && responseChanged) {
            message = `Request #${requestId} updated. Status changed to ${status}. A staff response was added.`;
        } else if (statusChanged) {
            message = `Request #${requestId} status changed to ${status}.`;
        } else {
            message = `A response was updated for request #${requestId}.`;
        }

        try {
            await createStudentNotification({
                student_id: request.student_id,
                request_id: requestId,
                message,
                type: "request_update"
            });
        } catch (notificationError) {
            console.error("Student Notification Error:", notificationError);
        }

        return res.status(200).json({
            success: true,
            message: "Request updated successfully."
        });
    } catch (error) {
        console.error("Staff Update Request Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update request."
        });
    }
};

module.exports = {
    getStaffRequests,
    getStaffDashboardStats,
    getStaffAnalytics,
    updateStaffRequest
};