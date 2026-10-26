const jwt = require("jsonwebtoken");

const authenticateStaff = (req, res, next) => {
    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Staff authorization token is required."
            });
        }

        const parts =
            authHeader.split(" ");

        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization token."
            });
        }

        const token = parts[1];

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        if (decoded.role !== "staff") {
            return res.status(403).json({
                success: false,
                message: "Staff access required."
            });
        }

        req.staff = decoded;

        next();

    } catch (error) {

        console.error(
            "Staff Authentication Error:",
            error
        );

        return res.status(401).json({
            success: false,
            message: "Staff session expired or invalid."
        });
    }
};

module.exports = authenticateStaff;