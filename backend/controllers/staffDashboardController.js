const db = require("../db");


// =========================================================
// ALLOWED STATUS TRANSITIONS
// =========================================================

const allowedTransitions = {

    New: [
        "Accepted",
        "Rejected"
    ],

    Accepted: [
        "In Progress",
        "Rejected"
    ],

    "In Progress": [
        "Completed",
        "Rejected"
    ],

    Completed: [],

    Rejected: []

};



// =========================================================
// STAFF DASHBOARD OVERVIEW
// =========================================================

const getStaffDashboard = async (
    req,
    res
) => {

    try {

        const departmentId =
            req.staff.department_id;


        const [stats] =
            await db.execute(
                `
                SELECT

                    COUNT(*) AS totalRequests,

                    SUM(
                        status = 'New'
                    ) AS newRequests,

                    SUM(
                        status IN ('New', 'Accepted')
                    ) AS pendingRequests,

                    SUM(
                        status = 'In Progress'
                    ) AS inProgressRequests,

                    SUM(
                        status = 'Completed'
                    ) AS completedRequests,

                    SUM(
                        status = 'Rejected'
                    ) AS rejectedRequests,

                    SUM(
                        DATE(created_at) = CURDATE()
                    ) AS todayRequests

                FROM requests

                WHERE department_id = ?
                `,
                [departmentId]
            );


        const [recentRequests] =
            await db.execute(
                `
                SELECT

                    r.request_id,

                    r.subject,

                    r.request_type,

                    r.status,

                    r.created_at,

                    r.updated_at,

                    s.name AS student_name,

                    s.roll_number

                FROM requests r

                JOIN students s
                    ON r.student_id =
                       s.student_id

                WHERE r.department_id = ?

                ORDER BY
                    r.updated_at DESC

                LIMIT 8
                `,
                [departmentId]
            );


        res.status(200).json({

            success: true,

            stats: {

                totalRequests:
                    Number(
                        stats[0].totalRequests
                    ) || 0,

                newRequests:
                    Number(
                        stats[0].newRequests
                    ) || 0,

                pendingRequests:
                    Number(
                        stats[0].pendingRequests
                    ) || 0,

                inProgressRequests:
                    Number(
                        stats[0].inProgressRequests
                    ) || 0,

                completedRequests:
                    Number(
                        stats[0].completedRequests
                    ) || 0,

                rejectedRequests:
                    Number(
                        stats[0].rejectedRequests
                    ) || 0,

                todayRequests:
                    Number(
                        stats[0].todayRequests
                    ) || 0

            },

            recentRequests

        });

    }

    catch (error) {

        console.error(
            "Staff Dashboard Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load staff dashboard."

        });

    }

};



// =========================================================
// GET STAFF REQUESTS
// =========================================================

const getStaffRequests = async (
    req,
    res
) => {

    try {

        const departmentId =
            req.staff.department_id;


        const {
            search = "",
            status = "",
            request_type = "",
            date_from = "",
            date_to = "",
            sort = "newest",
            page = 1,
            limit = 10
        } = req.query;


        const currentPage =
            Math.max(
                Number(page) || 1,
                1
            );


        const perPage =
            Math.min(
                Math.max(
                    Number(limit) || 10,
                    1
                ),
                50
            );


        const offset =
            (currentPage - 1) *
            perPage;


        const conditions = [
            "r.department_id = ?"
        ];


        const values = [
            departmentId
        ];


        // =================================================
        // SEARCH
        // =================================================

        if (search.trim()) {

            conditions.push(`
                (
                    CAST(r.request_id AS CHAR)
                        LIKE ?

                    OR s.name
                        LIKE ?

                    OR s.roll_number
                        LIKE ?

                    OR r.subject
                        LIKE ?

                    OR r.description
                        LIKE ?
                )
            `);

            const searchValue =
                `%${search.trim()}%`;

            values.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue
            );

        }


        // =================================================
        // STATUS
        // =================================================

        if (status) {

            conditions.push(
                "r.status = ?"
            );

            values.push(status);

        }


        // =================================================
        // REQUEST TYPE
        // =================================================

        if (request_type) {

            conditions.push(
                "r.request_type = ?"
            );

            values.push(
                request_type
            );

        }


        // =================================================
        // DATE FROM
        // =================================================

        if (date_from) {

            conditions.push(
                "DATE(r.created_at) >= ?"
            );

            values.push(date_from);

        }


        // =================================================
        // DATE TO
        // =================================================

        if (date_to) {

            conditions.push(
                "DATE(r.created_at) <= ?"
            );

            values.push(date_to);

        }


        const whereClause =
            conditions.join(" AND ");


        // =================================================
        // SORT
        // =================================================

        const sortMap = {

            newest:
                "r.created_at DESC",

            oldest:
                "r.created_at ASC",

            updated:
                "r.updated_at DESC",

            request_id:
                "r.request_id DESC",

            student:
                "s.name ASC"

        };


        const orderBy =
            sortMap[sort] ||
            sortMap.newest;


        // =================================================
        // COUNT
        // =================================================

        const [countRows] =
            await db.execute(
                `
                SELECT
                    COUNT(*) AS total
                FROM requests r

                JOIN students s
                    ON r.student_id =
                       s.student_id

                WHERE ${whereClause}
                `,
                values
            );


        const total =
            Number(
                countRows[0].total
            ) || 0;


        // =================================================
        // REQUESTS
        // =================================================

        const [requests] =
            await db.execute(
                `
                SELECT

                    r.request_id,

                    r.student_id,

                    r.department_id,

                    r.request_type,

                    r.subject,

                    r.description,

                    r.status,

                    r.staff_response,

                    r.created_at,

                    r.updated_at,

                    s.name AS student_name,

                    s.roll_number,

                    s.email AS student_email,

                    d.department_name

                FROM requests r

                JOIN students s
                    ON r.student_id =
                       s.student_id

                JOIN departments d
                    ON r.department_id =
                       d.department_id

                WHERE ${whereClause}

                ORDER BY
                    ${orderBy}

                LIMIT ?
                OFFSET ?
                `,
                [
                    ...values,
                    perPage,
                    offset
                ]
            );


        res.status(200).json({

            success: true,

            requests,

            pagination: {

                page:
                    currentPage,

                limit:
                    perPage,

                total,

                totalPages:
                    Math.ceil(
                        total /
                        perPage
                    )

            }

        });

    }

    catch (error) {

        console.error(
            "Get Staff Requests Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch staff requests."

        });

    }

};



// =========================================================
// GET REQUEST TYPES
// =========================================================

const getStaffRequestTypes = async (
    req,
    res
) => {

    try {

        const departmentId =
            req.staff.department_id;


        const [rows] =
            await db.execute(
                `
                SELECT DISTINCT
                    request_type
                FROM requests
                WHERE department_id = ?
                ORDER BY request_type
                `,
                [departmentId]
            );


        res.status(200).json({

            success: true,

            requestTypes:
                rows.map(
                    row =>
                        row.request_type
                )

        });

    }

    catch (error) {

        console.error(
            "Request Types Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load request types."

        });

    }

};



// =========================================================
// GET SINGLE REQUEST
// =========================================================

const getStaffRequestById = async (
    req,
    res
) => {

    try {

        const requestId =
            req.params.id;


        const departmentId =
            req.staff.department_id;


        const [rows] =
            await db.execute(
                `
                SELECT

                    r.request_id,

                    r.student_id,

                    r.department_id,

                    r.request_type,

                    r.subject,

                    r.description,

                    r.status,

                    r.staff_response,

                    r.created_at,

                    r.updated_at,

                    s.name AS student_name,

                    s.roll_number,

                    s.email AS student_email,

                    d.department_name

                FROM requests r

                JOIN students s
                    ON r.student_id =
                       s.student_id

                JOIN departments d
                    ON r.department_id =
                       d.department_id

                WHERE
                    r.request_id = ?

                    AND r.department_id = ?

                LIMIT 1
                `,
                [
                    requestId,
                    departmentId
                ]
            );


        if (
            rows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Request not found or access denied."

            });

        }


        // =================================================
        // TIMELINE
        // =================================================

        const [timeline] =
            await db.execute(
                `
                SELECT

                    t.timeline_id,

                    t.action,

                    t.old_status,

                    t.new_status,

                    t.response,

                    t.created_at,

                    s.name AS staff_name

                FROM request_timeline t

                LEFT JOIN staff s
                    ON t.staff_id =
                       s.staff_id

                WHERE t.request_id = ?

                ORDER BY
                    t.created_at ASC
                `,
                [requestId]
            );


        res.status(200).json({

            success: true,

            request:
                rows[0],

            timeline

        });

    }

    catch (error) {

        console.error(
            "Staff Request Details Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch request details."

        });

    }

};



// =========================================================
// UPDATE STAFF REQUEST
// =========================================================

const updateStaffRequest = async (
    req,
    res
) => {

    try {

        const requestId =
            req.params.id;


        const staffId =
            req.staff.staff_id;


        const departmentId =
            req.staff.department_id;


        const {
            status,
            staff_response
        } = req.body;


        if (!status) {

            return res.status(400).json({

                success: false,

                message:
                    "Status is required."

            });

        }


        // =================================================
        // GET REQUEST
        // =================================================

        const [rows] =
            await db.execute(
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


        if (
            rows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Request not found."

            });

        }


        const request =
            rows[0];


        // =================================================
        // DEPARTMENT SECURITY
        // =================================================

        if (
            Number(
                request.department_id
            ) !==
            Number(
                departmentId
            )
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You cannot access requests from another department."

            });

        }


        const oldStatus =
            request.status;


        // =================================================
        // STATUS VALIDATION
        // =================================================

        if (
            status !== oldStatus
        ) {

            const allowed =
                allowedTransitions[
                    oldStatus
                ] || [];


            if (
                !allowed.includes(status)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Invalid status transition from "${oldStatus}" to "${status}".`

                });

            }

        }


        const oldResponse =
            request.staff_response ||
            "";


        const newResponse =
            typeof staff_response ===
            "string"
                ? staff_response.trim()
                : oldResponse;


        const statusChanged =
            oldStatus !== status;


        const responseChanged =
            oldResponse !== newResponse;


        if (
            !statusChanged &&
            !responseChanged
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No changes were made."

            });

        }


        // =================================================
        // UPDATE
        // =================================================

        await db.execute(
            `
            UPDATE requests

            SET

                status = ?,

                staff_response = ?,

                updated_at =
                    CURRENT_TIMESTAMP

            WHERE
                request_id = ?
            `,
            [
                status,

                newResponse ||
                    null,

                requestId
            ]
        );


        // =================================================
        // TIMELINE ACTION
        // =================================================

        let action =
            "Request Updated";


        if (
            statusChanged
        ) {

            if (
                status ===
                "Accepted"
            ) {

                action =
                    "Request Accepted";

            }

            else if (
                status ===
                "In Progress"
            ) {

                action =
                    "Request Moved to In Progress";

            }

            else if (
                status ===
                "Completed"
            ) {

                action =
                    "Request Completed";

            }

            else if (
                status ===
                "Rejected"
            ) {

                action =
                    "Request Rejected";

            }

        }


        if (
            responseChanged &&
            !statusChanged
        ) {

            action =
                "Staff Response Updated";

        }


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
            VALUES
            (?, ?, ?, ?, ?, ?)
            `,
            [
                requestId,

                staffId,

                action,

                oldStatus,

                status,

                responseChanged
                    ? newResponse
                    : null

            ]
        );


        // =================================================
        // STUDENT NOTIFICATION
        // =================================================

        let message = "";


        if (
            statusChanged &&
            responseChanged
        ) {

            message =
                `Request #${requestId} updated. ` +
                `Status: ${status}. ` +
                `A staff response has been added.`;

        }

        else if (
            statusChanged
        ) {

            message =
                `Request #${requestId} status changed to ${status}.`;

        }

        else {

            message =
                `A staff response has been updated for request #${requestId}.`;

        }


        try {

            await db.execute(
                `
                INSERT INTO notifications
                (
                    student_id,
                    admin_id,
                    staff_id,
                    request_id,
                    message,
                    type
                )
                VALUES
                (
                    ?,
                    NULL,
                    NULL,
                    ?,
                    ?,
                    'request_update'
                )
                `,
                [
                    request.student_id,

                    requestId,

                    message
                ]
            );

        }

        catch (notificationError) {

            console.error(
                "Student notification error:",
                notificationError
            );

        }


        res.status(200).json({

            success: true,

            message:
                "Request updated successfully."

        });

    }

    catch (error) {

        console.error(
            "Staff Update Request Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to update request."

        });

    }

};



// =========================================================
// STAFF ANALYTICS
// =========================================================

const getStaffAnalytics = async (
    req,
    res
) => {

    try {

        const departmentId =
            req.staff.department_id;


        const range =
            Number(
                req.query.range
            ) || 30;


        const allowedRanges = [
            7,
            30,
            90
        ];


        const days =
            allowedRanges.includes(range)
                ? range
                : 30;


        // =================================================
        // KPI
        // =================================================

        const [overview] =
            await db.execute(
                `
                SELECT

                    COUNT(*) AS totalRequests,

                    SUM(
                        status = 'Completed'
                    ) AS completedRequests,

                    SUM(
                        status IN
                        ('New', 'Accepted', 'In Progress')
                    ) AS pendingRequests,

                    ROUND(
                        (
                            SUM(
                                status = 'Completed'
                            )
                            /
                            NULLIF(COUNT(*), 0)
                        ) * 100,
                        1
                    ) AS completionRate

                FROM requests

                WHERE
                    department_id = ?

                    AND created_at >=
                        DATE_SUB(
                            NOW(),
                            INTERVAL ? DAY
                        )
                `,
                [
                    departmentId,
                    days
                ]
            );


        // =================================================
        // STATUS
        // =================================================

        const [statusDistribution] =
            await db.execute(
                `
                SELECT

                    status,

                    COUNT(*) AS total

                FROM requests

                WHERE
                    department_id = ?

                    AND created_at >=
                        DATE_SUB(
                            NOW(),
                            INTERVAL ? DAY
                        )

                GROUP BY status

                ORDER BY total DESC
                `,
                [
                    departmentId,
                    days
                ]
            );


        // =================================================
        // REQUEST TYPES
        // =================================================

        const [requestTypes] =
            await db.execute(
                `
                SELECT

                    request_type,

                    COUNT(*) AS total

                FROM requests

                WHERE
                    department_id = ?

                    AND created_at >=
                        DATE_SUB(
                            NOW(),
                            INTERVAL ? DAY
                        )

                GROUP BY request_type

                ORDER BY total DESC
                `,
                [
                    departmentId,
                    days
                ]
            );


        // =================================================
        // DAILY TREND
        // =================================================

        const [dailyTrend] =
            await db.execute(
                `
                SELECT

                    DATE(created_at)
                        AS request_date,

                    COUNT(*) AS total

                FROM requests

                WHERE
                    department_id = ?

                    AND created_at >=
                        DATE_SUB(
                            CURDATE(),
                            INTERVAL ? DAY
                        )

                GROUP BY
                    DATE(created_at)

                ORDER BY
                    request_date ASC
                `,
                [
                    departmentId,
                    days
                ]
            );


        // =================================================
        // PROCESSING TIME
        // =================================================

        const [processing] =
            await db.execute(
                `
                SELECT

                    ROUND(
                        AVG(
                            TIMESTAMPDIFF(
                                MINUTE,
                                created_at,
                                updated_at
                            )
                        ),
                        1
                    ) AS averageMinutes,

                    MIN(
                        TIMESTAMPDIFF(
                            MINUTE,
                            created_at,
                            updated_at
                        )
                    ) AS fastestMinutes,

                    MAX(
                        TIMESTAMPDIFF(
                            MINUTE,
                            created_at,
                            updated_at
                        )
                    ) AS slowestMinutes

                FROM requests

                WHERE
                    department_id = ?

                    AND status = 'Completed'

                    AND created_at >=
                        DATE_SUB(
                            NOW(),
                            INTERVAL ? DAY
                        )
                `,
                [
                    departmentId,
                    days
                ]
            );


        // =================================================
        // PEAK HOURS
        // =================================================

        const [peakHours] =
            await db.execute(
                `
                SELECT

                    HOUR(created_at)
                        AS hour,

                    COUNT(*) AS total

                FROM requests

                WHERE
                    department_id = ?

                    AND created_at >=
                        DATE_SUB(
                            NOW(),
                            INTERVAL ? DAY
                        )

                GROUP BY
                    HOUR(created_at)

                ORDER BY
                    total DESC
                `,
                [
                    departmentId,
                    days
                ]
            );


        // =================================================
        // RECENTLY COMPLETED
        // =================================================

        const [recentCompleted] =
            await db.execute(
                `
                SELECT

                    r.request_id,

                    r.subject,

                    r.updated_at,

                    s.name AS student_name,

                    r.staff_response

                FROM requests r

                JOIN students s
                    ON r.student_id =
                       s.student_id

                WHERE
                    r.department_id = ?

                    AND r.status = 'Completed'

                ORDER BY
                    r.updated_at DESC

                LIMIT 6
                `,
                [departmentId]
            );


        res.status(200).json({

            success: true,

            range: days,

            overview:
                overview[0],

            statusDistribution,

            requestTypes,

            dailyTrend,

            processing:
                processing[0],

            peakHours,

            recentCompleted

        });

    }

    catch (error) {

        console.error(
            "Staff Analytics Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load staff analytics."

        });

    }

};


module.exports = {

    getStaffDashboard,

    getStaffRequests,

    getStaffRequestTypes,

    getStaffRequestById,

    updateStaffRequest,

    getStaffAnalytics

};