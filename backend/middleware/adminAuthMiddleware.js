const jwt = require("jsonwebtoken");

const authenticateAdmin = (req, res, next) => {
    try {

        // Get authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization token is required."
            });
        }

        // Expected format:
        // Authorization: Bearer TOKEN
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid authorization token."
            });
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Check admin role
        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required."
            });
        }

        // Store decoded admin information
        req.admin = decoded;

        // Continue to protected route
        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired admin token."
        });

    }
};

module.exports = authenticateAdmin;