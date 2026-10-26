const db = require("../db");


// =========================================================
// CREATE STUDENT NOTIFICATION
// =========================================================

const createStudentNotification = async ({
    student_id,
    request_id,
    message,
    type = "request_update"
}) => {

    if (
        !student_id ||
        !request_id ||
        !message
    ) {

        throw new Error(
            "student_id, request_id and message are required"
        );

    }


    const [result] =
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
            (?, NULL, NULL, ?, ?, ?)
            `,
            [
                student_id,
                request_id,
                message,
                type
            ]
        );


    return result.insertId;

};



// =========================================================
// CREATE ADMIN NOTIFICATIONS
// =========================================================

const createAdminNotifications = async ({
    request_id,
    message,
    type = "new_request"
}) => {

    if (
        !request_id ||
        !message
    ) {

        throw new Error(
            "request_id and message are required"
        );

    }


    const [admins] =
        await db.execute(
            `
            SELECT admin_id
            FROM admins
            `
        );


    for (
        const admin
        of admins
    ) {

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
                NULL,
                ?,
                NULL,
                ?,
                ?,
                ?
            )
            `,
            [
                admin.admin_id,
                request_id,
                message,
                type
            ]
        );

    }

};



// =========================================================
// CREATE STAFF NOTIFICATIONS
// =========================================================

const createStaffNotifications = async ({
    department_id,
    request_id,
    message,
    type = "new_request"
}) => {

    if (
        !department_id ||
        !request_id ||
        !message
    ) {

        throw new Error(
            "department_id, request_id and message are required"
        );

    }


    const [staffMembers] =
        await db.execute(
            `
            SELECT
                staff_id
            FROM staff
            WHERE department_id = ?
            `,
            [department_id]
        );


    if (
        staffMembers.length === 0
    ) {

        return;

    }


    for (
        const staff
        of staffMembers
    ) {

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
                NULL,
                NULL,
                ?,
                ?,
                ?,
                ?
            )
            `,
            [
                staff.staff_id,
                request_id,
                message,
                type
            ]
        );

    }

};



// =========================================================
// GET STUDENT NOTIFICATIONS
// =========================================================

const getStudentNotifications = async (
    req,
    res
) => {

    try {

        const {
            student_id
        } = req.params;


        const [notifications] =
            await db.execute(
                `
                SELECT
                    id,
                    student_id,
                    request_id,
                    message,
                    type,
                    is_read,
                    created_at
                FROM notifications
                WHERE student_id = ?
                ORDER BY created_at DESC
                `,
                [student_id]
            );


        res.status(200).json({

            success: true,

            notifications

        });

    }

    catch (error) {

        console.error(
            "Get student notifications error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch notifications"

        });

    }

};



// =========================================================
// GET ADMIN NOTIFICATIONS
// =========================================================

const getAdminNotifications = async (req, res) => {
try {
const [notifications] = await db.execute(`             SELECT
                n.id,
                n.student_id,
                n.request_id,
                n.message,
                n.type,
                n.is_read,
                n.created_at
            FROM notifications n
            ORDER BY n.created_at DESC
        `);


    return res.status(200).json({
        success: true,
        notifications: notifications
    });

} catch (error) {
    console.error(
        "Get admin notifications error:",
        error.message
    );

    return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications"
    });
}


};






// =========================================================
// GET STAFF NOTIFICATIONS
// =========================================================

const getStaffNotifications = async (
    req,
    res
) => {

    try {

        const staffId =
            req.staff.staff_id;


        const [notifications] =
            await db.execute(
                `
                SELECT
                    id,
                    staff_id,
                    request_id,
                    message,
                    type,
                    is_read,
                    created_at
                FROM notifications
                WHERE staff_id = ?
                ORDER BY created_at DESC
                `,
                [staffId]
            );


        res.status(200).json({

            success: true,

            notifications

        });

    }

    catch (error) {

        console.error(
            "Get staff notifications error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch staff notifications"

        });

    }

};



// =========================================================
// MARK NOTIFICATION AS READ
// =========================================================

const markNotificationRead = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        const [result] =
            await db.execute(
                `
                UPDATE notifications
                SET is_read = 1
                WHERE id = ?
                `,
                [id]
            );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Notification marked as read"

        });

    }

    catch (error) {

        console.error(
            "Mark notification error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to update notification"

        });

    }

};



// =========================================================
// MARK ALL STUDENT NOTIFICATIONS
// =========================================================

const markAllStudentNotificationsRead =
    async (
        req,
        res
    ) => {

        try {

            const {
                student_id
            } = req.params;


            await db.execute(
                `
                UPDATE notifications
                SET is_read = 1
                WHERE student_id = ?
                `,
                [student_id]
            );


            res.status(200).json({

                success: true,

                message:
                    "All notifications marked as read."

            });

        }

        catch (error) {

            console.error(
                "Mark all student notifications error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to mark all notifications as read."

            });

        }

    };



// =========================================================
// MARK ALL STAFF NOTIFICATIONS
// =========================================================

const markAllStaffNotificationsRead =
    async (
        req,
        res
    ) => {

        try {

            const staffId =
                req.staff.staff_id;


            await db.execute(
                `
                UPDATE notifications
                SET is_read = 1
                WHERE staff_id = ?
                `,
                [staffId]
            );


            res.status(200).json({

                success: true,

                message:
                    "All notifications marked as read."

            });

        }

        catch (error) {

            console.error(
                "Mark all staff notifications error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to mark all notifications as read."

            });

        }

    };



// =========================================================
// OLD CREATE NOTIFICATION API
// =========================================================

const createNotification =
    async (
        req,
        res
    ) => {

        try {

            const {
                student_id,
                request_id,
                message,
                type
            } = req.body;


            const notificationId =
                await createStudentNotification({

                    student_id,

                    request_id,

                    message,

                    type:
                        type ||
                        "request_update"

                });


            res.status(201).json({

                success: true,

                message:
                    "Notification created successfully.",

                notification_id:
                    notificationId

            });

        }

        catch (error) {

            console.error(
                "Create notification error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to create notification"

            });

        }

    };



module.exports = {

    createNotification,

    createStudentNotification,

    createAdminNotifications,

    createStaffNotifications,

    getStudentNotifications,

    getAdminNotifications,

    getStaffNotifications,

    markNotificationRead,

    markAllStudentNotificationsRead,

    markAllStaffNotificationsRead

};