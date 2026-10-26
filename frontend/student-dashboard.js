const student = JSON.parse(localStorage.getItem("student"));
const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first.");
    window.location.href = "student-login.html";
}

if (student) {
    document.getElementById("studentName").textContent =
        student.name || "Student";

    document.getElementById("studentRoll").textContent =
        student.roll_number || "University Roll No.";

    document.getElementById("profileIcon").textContent =
        student.name
            ? student.name.charAt(0).toUpperCase()
            : "S";
}


// =====================================================
// SIDEBAR NAVIGATION
// =====================================================

function showSection(sectionId, clickedItem) {

    const sections =
        document.querySelectorAll(".content-section");

    const navItems =
        document.querySelectorAll(".nav-item");

    sections.forEach(section => {
        section.classList.remove("active-section");
    });

    navItems.forEach(item => {
        item.classList.remove("active");
    });

    const selectedSection =
        document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active-section");
    }

    if (clickedItem) {
        clickedItem.classList.add("active");
    }

    updatePageTitle(sectionId);

    if (
        sectionId === "progress" ||
        sectionId === "history"
    ) {
        loadStudentRequests();
    }
}


// =====================================================
// SHOW SECTION BY ID
// =====================================================

function showSectionById(sectionId) {

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        item.classList.remove("active");

        if (
            item.getAttribute("onclick")?.includes(sectionId)
        ) {
            item.classList.add("active");
        }

    });

    const sections =
        document.querySelectorAll(".content-section");

    sections.forEach(section => {
        section.classList.remove("active-section");
    });

    const selectedSection =
        document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active-section");
    }

    updatePageTitle(sectionId);

    if (
        sectionId === "progress" ||
        sectionId === "history"
    ) {
        loadStudentRequests();
    }
}


// =====================================================
// PAGE TITLE
// =====================================================

function updatePageTitle(sectionId) {

    const pageTitle =
        document.getElementById("page-title");

    if (!pageTitle) {
        return;
    }

    const titles = {

        dashboard: "Student Dashboard",

        "new-request": "Enter New Request",

        progress: "Request Progress",

        history: "Request History"

    };

    pageTitle.textContent =
        titles[sectionId] || "Student Dashboard";
}


// =====================================================
// SUBMIT REQUEST
// =====================================================

async function submitRequest(event) {
    event.preventDefault();

    // =========================================
    // GET FORM VALUES
    // =========================================

    const requestType =
        document.getElementById("request-type").value;

    const department =
        document.getElementById("department").value;

    const subject =
        document.getElementById("request-subject")
            .value
            .trim();

    const description =
        document.getElementById("request-description")
            .value
            .trim();


    // =========================================
    // VALIDATE FORM
    // =========================================

    if (
        !requestType ||
        !department ||
        !subject ||
        !description
    ) {
        alert("Please fill in all required fields.");
        return;
    }


    // =========================================
    // CHECK LOGIN TOKEN
    // =========================================

    if (!token) {
        alert("Please login again.");

        window.location.href =
            "student-login.html";

        return;
    }


    // =========================================
    // SUBMIT REQUEST
    // =========================================

    try {

        const response = await fetch(
            "http://localhost:5000/api/student/requests",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    request_type:
                        requestType,

                    department_id:
                        department,

                    subject:
                        subject,

                    description:
                        description
                })
            }
        );


        // =========================================
        // READ SERVER RESPONSE
        // =========================================

        const responseText = await response.text();

console.log("REQUEST STATUS:", response.status);
console.log("REQUEST RESPONSE:", responseText);

let data;

try {
    data = JSON.parse(responseText);
} catch (error) {
    throw new Error(
        `Server returned ${response.status}: ${responseText}`
    );
}


        // =========================================
        // SUCCESS
        // =========================================

        if (response.ok) {

            alert(
                `${data.message}\nRequest ID: ${data.request_id}`
            );


            // Clear form
            const requestForm =
                document.querySelector(
                    ".request-form"
                );

            if (requestForm) {
                requestForm.reset();
            }


            // Reload dashboard statistics
            await loadRequestStatistics();


            // Reload student's requests
            await loadStudentRequests();


            // Go to Request Progress
            showSectionById("progress");

        }


        // =========================================
        // SERVER ERROR
        // =========================================

        else {

            alert(
                data.message ||
                "Failed to submit request."
            );

        }

    }


    // =========================================
    // CONNECTION / JAVASCRIPT ERROR
    // =========================================

    catch (error) {

        console.error(
            "Submit request error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }
}


// =====================================================
// LOAD REQUEST STATISTICS
// =====================================================

async function loadRequestStatistics() {

    if (!token) {
        return;
    }

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/student/requests",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.log(
                data.message
            );

            return;
        }


        const requests =
            data.requests || [];


        const total =
            requests.length;


        const pending =
            requests.filter(
                request =>
                    request.status === "New" ||
                    request.status === "Accepted"
            ).length;


        const inProgress =
            requests.filter(
                request =>
                    request.status === "In Progress"
            ).length;


        const completed =
            requests.filter(
                request =>
                    request.status === "Completed"
            ).length;


        const totalElement =
            document.getElementById(
                "totalRequests"
            );

        const pendingElement =
            document.getElementById(
                "pendingRequests"
            );

        const inProgressElement =
            document.getElementById(
                "inProgressRequests"
            );

        const completedElement =
            document.getElementById(
                "completedRequests"
            );


        if (totalElement) {
            totalElement.textContent =
                total;
        }

        if (pendingElement) {
            pendingElement.textContent =
                pending;
        }

        if (inProgressElement) {
            inProgressElement.textContent =
                inProgress;
        }

        if (completedElement) {
            completedElement.textContent =
                completed;
        }


        updateRecentRequests(requests);

    }

    catch (error) {

        console.error(
            "Error loading request statistics:",
            error
        );

    }

}


// =====================================================
// LOAD STUDENT REQUESTS
// =====================================================

async function loadStudentRequests() {

    if (!token) {
        return;
    }

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/student/requests",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.log(
                data.message
            );

            return;
        }


        const requests =
            data.requests || [];


        updateProgressTable(requests);

        updateHistoryTable(requests);

        updateRecentRequests(requests);

        updateStatisticsFromRequests(requests);

    }

    catch (error) {

        console.error(
            "Error loading student requests:",
            error
        );

    }

}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStatisticsFromRequests(requests) {

    const total =
        requests.length;


    const pending =
        requests.filter(
            request =>
                request.status === "New" ||
                request.status === "Accepted"
        ).length;


    const inProgress =
        requests.filter(
            request =>
                request.status === "In Progress"
        ).length;


    const completed =
        requests.filter(
            request =>
                request.status === "Completed"
        ).length;


    const totalElement =
        document.getElementById(
            "totalRequests"
        );

    const pendingElement =
        document.getElementById(
            "pendingRequests"
        );

    const inProgressElement =
        document.getElementById(
            "inProgressRequests"
        );

    const completedElement =
        document.getElementById(
            "completedRequests"
        );


    if (totalElement) {
        totalElement.textContent =
            total;
    }

    if (pendingElement) {
        pendingElement.textContent =
            pending;
    }

    if (inProgressElement) {
        inProgressElement.textContent =
            inProgress;
    }

    if (completedElement) {
        completedElement.textContent =
            completed;
    }

}


// =====================================================
// DEPARTMENT NAME
// =====================================================

function getDepartmentName(departmentId) {

    const departments = {

        1: "Engineering",

        2: "Hotel Management",

        3: "Pharmacy",

        4: "Management and Technology"

    };

    return (
        departments[departmentId] ||
        "Unknown"
    );
}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(status) {

    if (status === "New")
        return "status-new";

    if (status === "Accepted")
        return "status-accepted";

    if (status === "In Progress")
        return "status-progress";

    if (status === "Completed")
        return "status-completed";

    if (status === "Rejected")
        return "status-rejected";

    return "";
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleDateString(
        "en-IN",
        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }
    );

}


// =====================================================
// UPDATE PROGRESS TABLE
// =====================================================

function updateProgressTable(requests) {

    const tableBody =
        document.querySelector(
            "#progress .request-table tbody"
        );

    if (!tableBody) {
        return;
    }

    const activeRequests =
        requests.filter(request => {
            const status = String(request.status || "New").trim().toLowerCase();
            return status !== "completed" && status !== "rejected";
        });

    if (activeRequests.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="no-data"
                >
                    No active requests found.
                </td>

            </tr>

        `;

        return;
    }

    tableBody.innerHTML =
        activeRequests
            .map(request => {

                const staffResponse =
                    request.staff_response &&
                    request.staff_response.trim()
                        ? escapeHTML(request.staff_response)
                        : "No response yet.";

                return `

                    <tr>

                        <td>
                            ${request.request_id}
                        </td>

                        <td>
                            ${escapeHTML(request.subject)}
                        </td>

                        <td>
                            ${escapeHTML(
                                request.department_name ||
                                getDepartmentName(request.department_id)
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                request.created_at
                            )}
                        </td>

                        <td>

                            <span
                                class="status ${getStatusClass(
                                    request.status
                                )}"
                            >
                                ${escapeHTML(request.status)}
                            </span>

                        </td>

                        <td class="staff-response-cell">

                            ${
                                request.staff_response &&
                                request.staff_response.trim()
                                    ? `
                                        <span class="staff-response-text">
                                            ${staffResponse}
                                        </span>
                                      `
                                    : `
                                        <span class="no-response">
                                            No response yet.
                                        </span>
                                      `
                            }

                        </td>

                    </tr>

                `;

            })
            .join("");

}


// =====================================================
// UPDATE HISTORY TABLE
// =====================================================

function updateHistoryTable(requests) {

    const tableBody =
        document.querySelector(
            "#history .request-table tbody"
        );


    if (!tableBody) {
        return;
    }


    if (requests.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="no-data"
                >
                    No request history available.
                </td>

            </tr>

        `;

        return;
    }


    tableBody.innerHTML =
        requests
            .map(request => `

                <tr>

                    <td>
                        ${request.request_id}
                    </td>

                    <td>
                        ${escapeHTML(request.subject)}
                    </td>

                    <td>
                        ${getDepartmentName(
                            request.department_id
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            request.created_at
                        )}
                    </td>

                    <td>

                        <span
                            class="status ${getStatusClass(
                                request.status
                            )}"
                        >
                            ${request.status}
                        </span>

                    </td>

                </tr>

            `)
            .join("");

}


// =====================================================
// UPDATE RECENT REQUESTS
// =====================================================

function updateRecentRequests(requests) {

    const recentContainer =
        document.querySelector(
            "#dashboard .section-card:last-child"
        );


    if (!recentContainer) {
        return;
    }


    const recentRequests =
        requests.slice(0, 5);


    if (recentRequests.length === 0) {

        recentContainer.innerHTML = `

            <div class="section-heading">

                <h2>
                    Recent Requests
                </h2>

                <button
                    onclick="showSectionById('history')"
                >
                    View All
                </button>

            </div>


            <div class="empty-state">

                <div class="empty-icon">
                    ▤
                </div>

                <h3>
                    No Requests Yet
                </h3>

                <p>
                    You have not submitted any requests.
                </p>

                <button
                    onclick="showSectionById('new-request')"
                >
                    Submit Your First Request
                </button>

            </div>

        `;

        return;
    }


    recentContainer.innerHTML = `

        <div class="section-heading">

            <h2>
                Recent Requests
            </h2>

            <button
                onclick="showSectionById('history')"
            >
                View All
            </button>

        </div>


        <div class="request-table-container">

            <table class="request-table">

                <thead>

                    <tr>

                        <th>
                            Request ID
                        </th>

                        <th>
                            Subject
                        </th>

                        <th>
                            Department
                        </th>

                        <th>
                            Date
                        </th>

                        <th>
                            Status
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${recentRequests
                        .map(request => `

                            <tr>

                                <td>
                                    ${request.request_id}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        request.subject
                                    )}
                                </td>

                                <td>
                                    ${getDepartmentName(
                                        request.department_id
                                    )}
                                </td>

                                <td>
                                    ${formatDate(
                                        request.created_at
                                    )}
                                </td>

                                <td>

                                    <span
                                        class="status ${getStatusClass(
                                            request.status
                                        )}"
                                    >
                                        ${request.status}
                                    </span>

                                </td>

                            </tr>

                        `)
                        .join("")}

                </tbody>

            </table>

        </div>

    `;

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("student");

    window.location.href =
        "student-login.html";

}


// =====================================================
// INITIAL REQUEST LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadRequestStatistics();

        loadStudentRequests();

    }
);


// =====================================================
// NOTIFICATION SYSTEM
// =====================================================

const notificationBtn =
    document.getElementById(
        "notificationBtn"
    );


const notificationDropdown =
    document.getElementById(
        "notificationDropdown"
    );


const notificationBadge =
    document.getElementById(
        "notificationBadge"
    );


const notificationList =
    document.getElementById(
        "notificationList"
    );


const markAllReadBtn =
    document.getElementById(
        "markAllReadBtn"
    );


// =====================================================
// GET LOGGED-IN STUDENT
// =====================================================

const studentData =
    JSON.parse(
        localStorage.getItem("student")
    );


// =====================================================
// OPEN / CLOSE NOTIFICATION DROPDOWN
// =====================================================

if (notificationBtn) {

    notificationBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            if (notificationDropdown) {

                notificationDropdown.classList.toggle(
                    "show"
                );

            }

        }
    );

}


// =====================================================
// CLOSE DROPDOWN OUTSIDE
// =====================================================

document.addEventListener(
    "click",
    function (event) {

        if (
            notificationDropdown &&
            !notificationDropdown.contains(
                event.target
            ) &&
            notificationBtn &&
            !notificationBtn.contains(
                event.target
            )
        ) {

            notificationDropdown.classList.remove(
                "show"
            );

        }

    }
);


// =====================================================
// LOAD NOTIFICATIONS
// =====================================================

async function loadNotifications() {

    if (!studentData) {
        console.error("Student data is not available.");
        return;
    }

    const studentId =
        studentData.student_id ||
        studentData.id;

    console.log("STUDENT DATA:", studentData);
    console.log("STUDENT ID:", studentId);

    if (!studentId) {
        console.error("Student ID is missing.");
        return;
    }

    const notificationUrl =
        `http://localhost:5000/api/notifications/student/${studentId}`;

    console.log(
        "NOTIFICATION URL:",
        notificationUrl
    );

    try {

        const response = await fetch(
            notificationUrl,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        console.log(
            "NOTIFICATION RESPONSE STATUS:",
            response.status
        );

        const data =
            await response.json();

        console.log(
            "NOTIFICATION RESPONSE:",
            data
        );

        if (!response.ok) {
            console.error(
                "Notification API error:",
                data
            );
            return;
        }

        displayNotifications(
            data.notifications || []
        );

    } catch (error) {

        console.error(
            "Failed to load notifications:",
            error
        );
    }
}


// =====================================================
// DISPLAY NOTIFICATIONS
// =====================================================

function displayNotifications(
    notifications
) {

    if (!notificationList) {
        return;
    }


    notificationList.innerHTML = "";


    const unreadNotifications =
        notifications.filter(
            notification =>
                !notification.is_read
        );


    updateNotificationBadge(
        unreadNotifications.length
    );


    if (notifications.length === 0) {

        notificationList.innerHTML = `

            <div class="no-notifications">
                No new notifications
            </div>

        `;

        return;
    }


    notifications.forEach(
        notification => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "notification-item";


            if (!notification.is_read) {

                item.classList.add(
                    "unread"
                );

            }

item.innerHTML = `

    <p class="notification-message">
        ${escapeHTML(notification.message)}
    </p>

    <span class="notification-time">
        ${formatNotificationTime(
            notification.created_at
        )}
    </span>

`;


            item.addEventListener(
                "click",
                () =>
                    markNotificationRead(
                        notification.id
                    )
            );


            notificationList.appendChild(
                item
            );

        }
    );

}


// =====================================================
// UPDATE NOTIFICATION BADGE
// =====================================================

function updateNotificationBadge(
    count
) {

    if (!notificationBadge) {
        return;
    }


    notificationBadge.textContent =
        count;


    if (count === 0) {

        notificationBadge.classList.add(
            "hidden"
        );

    }

    else {

        notificationBadge.classList.remove(
            "hidden"
        );

    }

}


// =====================================================
// MARK ONE NOTIFICATION READ
// =====================================================

async function markNotificationRead(
    notificationId
) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/notifications/${notificationId}/read`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }

                }
            );


        if (response.ok) {

            loadNotifications();

        }

    }

    catch (error) {

        console.error(
            "Failed to mark notification as read:",
            error
        );

    }

}

// Backend controller logic belongs in server-side notificationController.js, not this browser file.

// =====================================================
// MARK ALL NOTIFICATIONS READ
// =====================================================

if (markAllReadBtn) {

    markAllReadBtn.addEventListener(
        "click",
        async function () {

            if (!studentData) {
                return;
            }


            const studentId =
                studentData.student_id || studentData.id;

            if (!studentId || !token) {
                console.error("Student ID or authorization token is missing.");
                return;
            }


            try {

                const response =
                    await fetch(
                        `http://localhost:5000/api/notifications/student/${studentId}/read-all`,
                        {

                            method: "PUT",

                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            }

                        }
                    );


                if (response.ok) {

                    loadNotifications();

                }

            }

            catch (error) {

                console.error(
                    "Failed to mark all notifications as read:",
                    error
                );

            }

        }
    );

}


// =====================================================
// FORMAT NOTIFICATION TIME
// =====================================================

function formatNotificationTime(
    dateString
) {

    const date =
        new Date(dateString);


    return date.toLocaleString(
        "en-IN",
        {

            dateStyle: "medium",

            timeStyle: "short"

        }
    );

}


// =====================================================
// AUTOMATIC DASHBOARD POLLING
// =====================================================

let dashboardPollingInterval = null;

function startDashboardPolling() {

    // Prevent multiple polling intervals
    if (dashboardPollingInterval) {
        clearInterval(dashboardPollingInterval);
    }

    dashboardPollingInterval = setInterval(
        async function () {

            // Don't make unnecessary requests
            // if the browser tab is not visible.
            if (document.hidden) {
                return;
            }

            console.log(
                "Checking for new notifications and request updates..."
            );

            // Check for new notifications
            await loadNotifications();

            // Refresh request status, response,
            // recent requests and statistics
            await loadStudentRequests();

        },
        10000
    ); // 10 seconds
}


// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Load everything immediately
        loadRequestStatistics();
        loadStudentRequests();
        loadNotifications();

        // Start automatic checking
        startDashboardPolling();

    }
);


// =====================================================
// STOP POLLING WHEN PAGE IS CLOSED
// =====================================================

window.addEventListener(
    "beforeunload",
    function () {

        if (dashboardPollingInterval) {
            clearInterval(dashboardPollingInterval);
            dashboardPollingInterval = null;
        }

    }
);