const db = require("../db");
const {
    createAdminNotifications,
    createStudentNotification,
    createStaffNotifications
} = require("./notificationController");

// =========================================================
// STUDENT - CREATE REQUEST
// =========================================================

const createRequest = async (req, res) => {

    try {

        const student_id =
            req.student.student_id;

        const {
            request_type,
            department_id,
            subject,
            description
        } = req.body;


        // =====================================================
        // VALIDATE REQUEST
        // =====================================================

        if (
            !request_type ||
            !department_id ||
            !subject ||
            !description
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All fields are required."

            });

        }


        // =====================================================
        // CREATE REQUEST
        // =====================================================

        const [result] = await db.query(
            `
            INSERT INTO requests
            (
                student_id,
                department_id,
                request_type,
                subject,
                description,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                student_id,
                department_id,
                request_type,
                subject,
                description,
                "New"
            ]
        );


        // =====================================================
        // GET NEW REQUEST ID
        // =====================================================

        const requestId =
            result.insertId;


        // =====================================================
        // NOTIFY ALL ADMINS
        // =====================================================

        try {

            await createAdminNotifications({

                request_id:
                    requestId,

                message:
                    `New request #${requestId} has been submitted.`,

                type:
                    "new_request"

            });

        }

        catch (notificationError) {

            console.error(
                "Admin notification error:",
                notificationError
            );

        }


        // =====================================================
        // NOTIFY DEPARTMENT STAFF
        // =====================================================

        try {

            await createStaffNotifications({

                department_id:
                    department_id,

                request_id:
                    requestId,

                message:
                    `New request #${requestId} has been submitted to your department.`,

                type:
                    "new_request"

            });

        }

        catch (notificationError) {

            console.error(
                "Staff notification error:",
                notificationError
            );

        }


        // =====================================================
        // CREATE INITIAL REQUEST TIMELINE
        // =====================================================

        try {

            await db.execute(
                `
                INSERT INTO request_timeline
                (
                    request_id,
                    action,
                    old_status,
                    new_status,
                    response
                )
                VALUES
                (?, ?, ?, ?, ?)
                `,
                [
                    requestId,
                    "Request Submitted",
                    null,
                    "New",
                    null
                ]
            );

        }

        catch (timelineError) {

            console.error(
                "Request timeline error:",
                timelineError
            );

        }


        // =====================================================
        // RESPONSE
        // =====================================================

        res.status(201).json({

            success: true,

            message:
                "Request submitted successfully.",

            request_id:
                requestId

        });

    }

    catch (error) {

        console.log(
            "REQUEST ERROR:"
        );

        console.log(error);


        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// =========================================================
// STUDENT - GET OWN REQUESTS
// =========================================================

const getStudentRequests = async (req, res) => {

    try {

        const student_id = req.student.student_id;


        if (!student_id) {
            return res.status(401).json({
                success: false,
                message: "Student identity was not found in the login session."
            });
        }

        const [requests] = await db.execute(
            `SELECT
                r.request_id,
                r.student_id,
                r.department_id,
                d.department_name,
                r.request_type,
                r.subject,
                r.description,
                COALESCE(r.status, 'New') AS status,
                r.staff_response,
                r.created_at,
                r.updated_at
             FROM requests r
             LEFT JOIN departments d ON d.department_id = r.department_id
             WHERE r.student_id = ?
             ORDER BY r.created_at DESC, r.request_id DESC`,
            [student_id]
        );


        res.status(200).json({

            success: true,

            requests

        });

    }

    catch (error) {

        console.error(
            "GET REQUESTS ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};



// =========================================================
// ADMIN - GET ALL REQUESTS
// =========================================================

const getAllRequests = async (req, res) => {

    try {

        const [requests] = await db.execute(`

            SELECT

                r.request_id,

                r.subject,

                r.description,

                r.status,

                r.created_at,

                r.updated_at,

                s.name AS student_name,

                s.roll_number,

                d.department_name AS department_name

            FROM requests r

            JOIN students s
                ON r.student_id = s.student_id

            JOIN departments d
                ON r.department_id = d.department_id

            ORDER BY r.created_at DESC

        `);


        return res.status(200).json({

            success: true,

            requests

        });

    }

    catch (error) {

        console.error(
            "Get All Requests Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch requests."

        });

    }

};


// =========================================================
// ADMIN - GET SINGLE REQUEST
// =========================================================

const getRequestById = async (req, res) => {

    try {

        const requestId = req.params.id;


        if (!requestId) {

            return res.status(400).json({

                success: false,

                message: "Request ID is required."

            });

        }


        const [requests] = await db.execute(`

            SELECT

                r.request_id,
                r.request_type,
                r.subject,
                r.description,
                r.status,
                r.staff_response,
                r.created_at,
                r.updated_at,

                s.student_id,
                s.name AS student_name,
                s.roll_number,
                s.email AS student_email,

                d.department_id,
                d.department_name

            FROM requests r

            JOIN students s
                ON r.student_id = s.student_id

            JOIN departments d
                ON r.department_id = d.department_id

            WHERE r.request_id = ?

            LIMIT 1

        `, [requestId]);


        if (requests.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Request not found."

            });

        }


        res.status(200).json({

            success: true,

            request: requests[0]

        });

    }

    catch (error) {

        console.error(
            "Get Single Request Error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to fetch request."

        });

    }

};



// =========================================================
// ADMIN - UPDATE REQUEST
// =========================================================

const updateRequest = async (req, res) => {

    try {

        const requestId =
            req.params.id;

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


        // =====================================================
        // GET CURRENT REQUEST
        // =====================================================

        const [existingRequests] =
            await db.execute(
                `
                SELECT
                    request_id,
                    student_id,
                    status,
                    staff_response
                FROM requests
                WHERE request_id = ?
                `,
                [requestId]
            );


        if (existingRequests.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Request not found."

            });

        }


        const existingRequest =
            existingRequests[0];


        const oldStatus =
            existingRequest.status;

        const oldResponse =
            existingRequest.staff_response || "";


        const newResponse =
            staff_response || "";


        // =====================================================
        // DETECT CHANGES
        // =====================================================

        const statusChanged =
            oldStatus !== status;

        const responseChanged =
            oldResponse !== newResponse &&
            newResponse.trim() !== "";


        // =====================================================
        // UPDATE REQUEST
        // =====================================================

        await db.execute(
            `
            UPDATE requests
            SET
                status = ?,
                staff_response = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE request_id = ?
            `,
            [
                status,
                newResponse || null,
                requestId
            ]
        );


        // =====================================================
        // CREATE STUDENT NOTIFICATION
        // =====================================================

        if (statusChanged || responseChanged) {

            let notificationMessage = "";


            // -------------------------------------------------
            // STATUS + RESPONSE
            // -------------------------------------------------

            if (
                statusChanged &&
                responseChanged
            ) {

                notificationMessage =
                    `Request #${requestId} updated. ` +
                    `Status: ${status}. ` +
                    `A response has been added by staff.`;

            }


            // -------------------------------------------------
            // STATUS ONLY
            // -------------------------------------------------

            else if (statusChanged) {

                notificationMessage =
                    `Request #${requestId} status changed to ${status}.`;

            }


            // -------------------------------------------------
            // RESPONSE ONLY
            // -------------------------------------------------

            else if (responseChanged) {

                notificationMessage =
                    `A response has been added to request #${requestId}.`;

            }


            try {

                await createStudentNotification({

                    student_id:
                        existingRequest.student_id,

                    request_id:
                        requestId,

                    message:
                        notificationMessage,

                    type:
                        "request_update"

                });

            }

            catch (notificationError) {

                console.error(
                    "Student notification error:",
                    notificationError
                );

            }

        }


        res.status(200).json({

            success: true,

            message:
                "Request updated successfully."

        });

    }

    catch (error) {

        console.error(
            "Update Request Error:",
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
// EXPORT
// =========================================================

module.exports = {

    createRequest,

    getStudentRequests,

    getAllRequests,

    getRequestById,

    updateRequest

};