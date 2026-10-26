// =========================================================
// ADMIN LOGIN
// Campus Request Management System
// =========================================================


// ================= BACKEND URL =================

const API_URL = "http://localhost:5000";


// ================= LOGIN FORM =================

const adminLoginForm = document.getElementById("admin-login-form");

const loginError = document.getElementById("login-error");

const adminLoginBtn = document.getElementById("adminLoginBtn");


// ================= LOGIN =================

adminLoginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    // Clear previous error
    loginError.textContent = "";


    // Get form values
    const email = document
        .getElementById("admin-email")
        .value
        .trim();

    const password = document
        .getElementById("admin-password")
        .value;


    // Basic validation
    if (!email || !password) {

        loginError.textContent =
            "Email and password are required.";

        return;
    }


    // Disable button while logging in
    adminLoginBtn.disabled = true;

    adminLoginBtn.textContent = "Logging in...";


    try {

        // ================= API REQUEST =================

        const response = await fetch(
            `${API_URL}/api/admin/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );


        const data = await response.json();


        // ================= LOGIN FAILED =================

        if (!response.ok) {

            loginError.textContent =
                data.message || "Admin login failed.";

            return;
        }


        // ================= LOGIN SUCCESSFUL =================

        console.log("Admin login successful");


        // Save JWT
        localStorage.setItem(
            "adminToken",
            data.token
        );


        // Save admin information
        localStorage.setItem(
            "admin",
            JSON.stringify(data.admin)
        );


        // ================= REDIRECT =================

        window.location.href = "admin-dashboard.html";


    } catch (error) {

        console.error(
            "Admin Login Error:",
            error
        );

        loginError.textContent =
            "Unable to connect to the server. Please try again.";

    } finally {

        // Re-enable button
        adminLoginBtn.disabled = false;

        adminLoginBtn.textContent =
            "Login to Admin Portal";

    }

});