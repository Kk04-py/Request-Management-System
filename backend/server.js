const express = require("express");
const cors = require("cors");

require("dotenv").config();

// Database connection
require("./db");

// Routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const staffRoutes = require("./routes/staffRoutes");
const staffAuthRoutes =
    require("./routes/staffAuthRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const staffDashboardRoutes =
    require("./routes/staffDashboardRoutes");
    const staffRequestRoutes =
    require("./routes/staffRequestRoutes");
const app = express();


// ================= MIDDLEWARE =================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// ================= ROUTES =================

// Authentication routes
app.use("/api", authRoutes);

// Student routes
app.use("/api/student", studentRoutes);



// Notification routes
app.use("/api/notifications", notificationRoutes);

app.use("/api/admin", adminRoutes);

// Staff routes
app.use(
    "/api/admin/staff",
    staffRoutes
);

app.use(
    "/api/staff-auth",
    staffAuthRoutes
);

app.use(
    "/api/staff",
    staffRequestRoutes
);

app.use(
    "/api/staff",
    staffDashboardRoutes
);


// ================= HOME ROUTE =================

app.get("/", (req, res) => {

    res.send(
        "Campus Request Management System Backend is Running..."
    );

});


// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {

    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });

});


// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server running on Port ${PORT}`);

});