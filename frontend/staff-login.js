// =========================================================
// STAFF LOGIN
// Campus Request Management System
// =========================================================


// =========================================================
// TOGGLE PASSWORD
// =========================================================

function toggleStaffPassword() {

    const passwordInput =
        document.getElementById(
            "staffLoginPassword"
        );

    const toggleButton =
        document.getElementById(
            "passwordToggle"
        );

    const eyeIcon =
        document.getElementById(
            "passwordEyeIcon"
        );


    if (
        !passwordInput ||
        !toggleButton
    ) {

        return;

    }


    if (
        passwordInput.type ===
        "password"
    ) {

        passwordInput.type =
            "text";


        toggleButton.setAttribute(
            "aria-label",
            "Hide password"
        );


        toggleButton.setAttribute(
            "title",
            "Hide password"
        );


        if (eyeIcon) {

            eyeIcon.innerHTML = `

                <path
                    d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z">
                </path>

                <circle
                    cx="12"
                    cy="12"
                    r="3">
                </circle>

                <line
                    x1="3"
                    y1="3"
                    x2="21"
                    y2="21">
                </line>

            `;

        }

    }

    else {

        passwordInput.type =
            "password";


        toggleButton.setAttribute(
            "aria-label",
            "Show password"
        );


        toggleButton.setAttribute(
            "title",
            "Show password"
        );


        if (eyeIcon) {

            eyeIcon.innerHTML = `

                <path
                    d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z">
                </path>

                <circle
                    cx="12"
                    cy="12"
                    r="3">
                </circle>

            `;

        }

    }

}



// =========================================================
// LOGIN MESSAGE
// =========================================================

function showStaffLoginMessage(
    message,
    type = "error"
) {

    const messageElement =
        document.getElementById(
            "staffLoginMessage"
        );


    if (!messageElement) {

        return;

    }


    messageElement.textContent =
        message;


    messageElement.className =
        `staff-login-message ${type}`;

}



// =========================================================
// STAFF LOGIN
// =========================================================

async function loginStaff(event) {

    event.preventDefault();


    const emailInput =
        document.getElementById(
            "staffLoginEmail"
        );

    const passwordInput =
        document.getElementById(
            "staffLoginPassword"
        );

    const loginButton =
        document.getElementById(
            "staffLoginButton"
        );


    if (
        !emailInput ||
        !passwordInput ||
        !loginButton
    ) {

        return;

    }


    const email =
        emailInput.value
            .trim()
            .toLowerCase();


    const password =
        passwordInput.value;


    // =====================================================
    // VALIDATION
    // =====================================================

    if (
        !email ||
        !password
    ) {

        showStaffLoginMessage(
            "Please enter your email and password.",
            "error"
        );

        return;

    }


    const eduEmailPattern =
        /^[^\s@]+@[^\s@]+\.edu$/i;


    if (
        !eduEmailPattern.test(email)
    ) {

        showStaffLoginMessage(
            "Please enter a valid official .edu email address.",
            "error"
        );

        return;

    }


    try {

        loginButton.disabled =
            true;


        loginButton.textContent =
            "Signing In...";


        showStaffLoginMessage(
            "",
            ""
        );


        // =================================================
        // LOGIN REQUEST
        // =================================================

        const response =
            await fetch(
                "https://campus-request-management-backend.onrender.com/api/staff-auth/login",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            email,

                            password

                        })

                }
            );


        const responseText =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }

        catch (jsonError) {

            throw new Error(
                `Server returned ${response.status}. Please check the backend.`
            );

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Staff login failed."
            );

        }


        // =================================================
        // SAVE SESSION
        // =================================================

        localStorage.setItem(
            "staffToken",
            data.token
        );


        localStorage.setItem(
            "staff",
            JSON.stringify(
                data.staff
            )
        );


        localStorage.setItem(
            "staffMustChangePassword",
            data.must_change_password
                ? "1"
                : "0"
        );


        // =================================================
        // ALWAYS OPEN DASHBOARD
        // =================================================

        window.location.href =
            "staff-dashboard.html";

    }

    catch (error) {

        console.error(
            "Staff Login Error:",
            error
        );


        showStaffLoginMessage(
            error.message ||
            "Unable to connect to the server.",
            "error"
        );

    }

    finally {

        loginButton.disabled =
            false;


        loginButton.textContent =
            "Sign In";

    }

}