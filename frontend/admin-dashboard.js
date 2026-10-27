// =========================================================
// ADMIN DASHBOARD JAVASCRIPT
// Campus Request Management System
// =========================================================


// =========================================================
// AUTHENTICATION CHECK
// =========================================================

const adminToken =
    localStorage.getItem("adminToken");

const storedAdmin =
    localStorage.getItem("admin");


if (!adminToken) {

    window.location.href =
        "admin-login.html";

}


// =========================================================
// LOAD ADMIN INFORMATION
// =========================================================

function loadAdminInformation() {

    if (!storedAdmin) {
        return;
    }

    try {

        const admin =
            JSON.parse(storedAdmin);


        const adminName =
            document.getElementById("adminName");

        if (adminName && admin.name) {

            adminName.textContent =
                admin.name;

        }


        const adminEmail =
            document.getElementById("adminEmail");

        if (adminEmail && admin.email) {

            adminEmail.textContent =
                admin.email;

        }


        const profileIcon =
            document.getElementById("profileIcon");

        if (profileIcon && admin.name) {

            profileIcon.textContent =
                admin.name
                    .charAt(0)
                    .toUpperCase();

        }

    } catch (error) {

        console.error(
            "Error loading admin information:",
            error
        );

    }

}

// =========================================================
// LOAD DASHBOARD STATISTICS
// =========================================================

async function loadDashboardStatistics() {

    try {

        const token = localStorage.getItem("adminToken");

        if (!token) {
            window.location.href = "admin-login.html";
            return;
        }


        const response = await fetch(
            "https://campus-request-management-backend.onrender.com/api/admin/dashboard/stats",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const statistics = await response.json();


        console.log(
            "Dashboard Statistics:",
            statistics
        );


        if (!response.ok) {

            throw new Error(
                statistics.message ||
                "Failed to load dashboard statistics."
            );

        }


        // =====================================================
        // TOTAL REQUESTS
        // =====================================================

        const totalRequests =
            document.getElementById("totalRequests");

        if (totalRequests) {

            totalRequests.textContent =
                statistics.totalRequests ?? 0;

        }


        // =====================================================
        // PENDING REQUESTS
        // =====================================================

        const pendingRequests =
            document.getElementById("pendingRequests");

        if (pendingRequests) {

            pendingRequests.textContent =
                statistics.pendingRequests ?? 0;

        }


        // =====================================================
        // IN PROGRESS REQUESTS
        // =====================================================

        const inProgressRequests =
            document.getElementById("inProgressRequests");

        if (inProgressRequests) {

            inProgressRequests.textContent =
                statistics.inProgressRequests ?? 0;

        }


        // =====================================================
        // COMPLETED REQUESTS
        // =====================================================

        const completedRequests =
            document.getElementById("completedRequests");

        if (completedRequests) {

            completedRequests.textContent =
                statistics.completedRequests ?? 0;

        }


        // =====================================================
        // REGISTERED STUDENTS
        // =====================================================

        const totalStudents =
            document.getElementById("totalStudents");

        if (totalStudents) {

            totalStudents.textContent =
                statistics.totalStudents ?? 0;

        }


        // =====================================================
        // STAFF MEMBERS
        // =====================================================

        const totalStaff =
            document.getElementById("totalStaff");

        if (totalStaff) {

            totalStaff.textContent =
                statistics.totalStaff ?? 0;

        }


        // =====================================================
        // DEPARTMENTS
        // =====================================================

        const totalDepartments =
            document.getElementById("totalDepartments");

        if (totalDepartments) {

            totalDepartments.textContent =
                statistics.totalDepartments ?? 0;

        }


    } catch (error) {

        console.error(
            "Error loading dashboard statistics:",
            error
        );

    }

}


// =========================================================
// LOAD ALL STUDENT REQUESTS
// =========================================================

async function loadAdminRequests() {

    try {

        const token =
            localStorage.getItem("adminToken");


        if (!token) {

            console.error(
                "Admin token not found."
            );

            return;

        }


        const response = await fetch(
            "https://campus-request-management-backend.onrender.com/api/admin/requests",
            {
                
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data =
            await response.json();


        console.log(
            "Admin Requests Response:",
            data
        );

        console.log(
            "Admin Requests Status:",
            response.status
        );


        if (!response.ok) {

            console.error(
                "Failed to load requests:",
                data.message
            );

            return;

        }


        const requests =
            data.requests || [];


        const tableBody =
            document.getElementById(
                "adminRequestsBody"
            );


        if (!tableBody) {

            console.error(
                "adminRequestsBody element not found."
            );

            return;

        }


        tableBody.innerHTML = "";


        if (requests.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data">
                        No requests available.
                    </td>
                </tr>
            `;

            return;

        }


        requests.forEach(request => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    #${request.request_id}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(
                            request.student_name || "-"
                        )}
                    </strong>

                    <br>

                    <small>
                        ${escapeHTML(
                            request.roll_number || "-"
                        )}
                    </small>
                </td>

                <td>
                    ${escapeHTML(
                        request.subject || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        request.department_name || "-"
                    )}
                </td>

                <td>
                    ${formatRequestDate(
                        request.created_at
                    )}
                </td>

                <td>
                    <span
                        class="status ${getStatusClass(
                            request.status
                        )}"
                    >
                        ${escapeHTML(
                            request.status || "-"
                        )}
                    </span>
                </td>

                <td>
                    <button
                        type="button"
                        class="view-request-btn"
                        onclick="viewRequest(
                            ${request.request_id}
                        )"
                    >
                        View
                    </button>
                </td>

            `;


            tableBody.appendChild(row);

        });


    } catch (error) {

        console.error(
            "Error loading admin requests:",
            error
        );

    }

}


// =========================================================
// FORMAT REQUEST DATE
// =========================================================

function formatRequestDate(date) {

    if (!date) {
        return "-";
    }


    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
        return "-";
    }


    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =========================================================
// FORMAT DATE AND TIME
// =========================================================

function formatRequestDateTime(date) {

    if (!date) {
        return "-";
    }


    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
        return "-";
    }


    return parsedDate.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =========================================================
// STATUS CSS CLASS
// =========================================================

function getStatusClass(status) {

    if (!status) {
        return "";
    }


    return status
        .toLowerCase()
        .replace(/\s+/g, "-");

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }


    const div = document.createElement("div");

    div.textContent = String(value);

    return div.innerHTML;

}


// =========================================================
// CREATE REQUEST DETAILS MODAL
// =========================================================

function createRequestDetailsModal() {

    if (document.getElementById("requestDetailsModal")) {
        return;
    }


    const modal =
        document.createElement("div");

    modal.id = "requestDetailsModal";

    modal.className = "request-details-modal";


    modal.innerHTML = `

        <div class="request-details-overlay">

            <div class="request-details-container">

                <div class="request-details-header">

                    <div>
                        <h2>Request Details</h2>

                        <p id="requestModalId">
                            Request
                        </p>
                    </div>

                    <button
                        type="button"
                        class="request-modal-close"
                        onclick="closeRequestModal()">

                        &times;

                    </button>

                </div>


                <div
                    id="requestModalLoading"
                    class="request-modal-loading">

                    Loading request details...

                </div>


                <div
                    id="requestModalContent"
                    class="request-modal-content"
                    style="display: none;">


                    <!-- STUDENT INFORMATION -->

                    <div class="request-detail-section">

                        <h3>Student Information</h3>

                        <div class="request-detail-grid">

                            <div class="request-detail-item">

                                <span class="detail-label">
                                    Student Name
                                </span>

                                <strong id="detailStudentName">
                                    -
                                </strong>

                            </div>


                            <div class="request-detail-item">

                                <span class="detail-label">
                                    Roll Number
                                </span>

                                <strong id="detailRollNumber">
                                    -
                                </strong>

                            </div>


                            <div class="request-detail-item">

                                <span class="detail-label">
                                    Department
                                </span>

                                <strong id="detailDepartment">
                                    -
                                </strong>

                            </div>

                        </div>

                    </div>


                    <!-- REQUEST INFORMATION -->

                    <div class="request-detail-section">

                        <h3>Request Information</h3>

                        <div class="request-detail-grid">

                            <div class="request-detail-item">

                                <span class="detail-label">
                                    Request Type
                                </span>

                                <strong id="detailRequestType">
                                    -
                                </strong>

                            </div>


                            <div class="request-detail-item">

                                <span class="detail-label">
                                    Subject
                                </span>

                                <strong id="detailSubject">
                                    -
                                </strong>

                            </div>


                            <div class="request-detail-item">

                                <span class="detail-label">
                                    Created On
                                </span>

                                <strong id="detailCreatedAt">
                                    -
                                </strong>

                            </div>


                            <div class="request-detail-item">

                                <span class="detail-label">
                                    Last Updated
                                </span>

                                <strong id="detailUpdatedAt">
                                    -
                                </strong>

                            </div>

                        </div>

                    </div>


                    <!-- DESCRIPTION -->

                    <div class="request-detail-section">

                        <h3>Request Description</h3>

                        <div
                            id="detailDescription"
                            class="request-description">

                            -

                        </div>

                    </div>


                    <!-- ADMIN ACTIONS -->

                    <div class="request-detail-section admin-action-section">

                        <h3>Admin Action</h3>


                        <div class="admin-form-group">

                            <label for="requestStatus">
                                Request Status
                            </label>

                            <select id="requestStatus">

                                <option value="New">
                                    New
                                </option>

                                <option value="Accepted">
                                    Accepted
                                </option>

                                <option value="In Progress">
                                    In Progress
                                </option>

                                <option value="Completed">
                                    Completed
                                </option>

                                <option value="Rejected">
                                    Rejected
                                </option>

                            </select>

                        </div>


                        <div class="admin-form-group">

                            <label for="staffResponse">
                                Response to Student
                            </label>

                            <textarea
                                id="staffResponse"
                                rows="5"
                                placeholder="Write a response to the student..."></textarea>

                        </div>


                        <div
                            id="requestUpdateMessage"
                            class="request-update-message">
                        </div>


                        <div class="request-modal-actions">

                            <button
                                type="button"
                                class="request-cancel-btn"
                                onclick="closeRequestModal()">

                                Cancel

                            </button>


                            <button
                                type="button"
                                id="saveRequestButton"
                                class="request-save-btn"
                                onclick="saveRequestUpdate()">

                                Save Changes

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(modal);
const statusDropdown =
    document.getElementById("requestStatus");

if (statusDropdown) {

    statusDropdown.addEventListener(
        "change",
        function () {

            console.log(
                "STATUS DROPDOWN CHANGED TO:",
                this.value
            );

        }
    );

}

    addRequestModalStyles();


    const overlay =
        modal.querySelector(".request-details-overlay");


    if (overlay) {

        overlay.addEventListener(
            "click",
            function(event) {

                if (event.target === overlay) {
                    closeRequestModal();
                }

            }
        );

    }

}



// =========================================================
// REQUEST MODAL STYLES
// =========================================================

function addRequestModalStyles() {

    if (document.getElementById("requestModalStyles")) {
        return;
    }


    const style =
        document.createElement("style");

    style.id = "requestModalStyles";


    style.textContent = `

        /* =====================================================
           VIEW REQUEST BUTTON
        ===================================================== */

        .view-request-btn {

            border: none;

            padding: 7px 14px;

            border-radius: 6px;

            background: #22223B;

            color: #ffffff;

            font-size: 13px;

            font-weight: 600;

            cursor: pointer;

            transition: 0.2s ease;

        }


        .view-request-btn:hover {

            background: #4A4E69;

            transform: translateY(-1px);

        }


        /* =====================================================
           MODAL - COMPLETE VIEWPORT LOCK
        ===================================================== */

        html.request-modal-open,
        body.request-modal-open {

            overflow: hidden !important;

            width: 100% !important;

            height: 100% !important;

            max-height: 100% !important;

        }


        body.request-modal-open {

            position: fixed !important;

            left: 0 !important;

            right: 0 !important;

            top: 0 !important;

            overflow: hidden !important;

        }


        /* =====================================================
           MODAL WRAPPER
        ===================================================== */

        .request-details-modal {

            position: fixed !important;

            top: 0 !important;

            left: 0 !important;

            right: 0 !important;

            bottom: 0 !important;

            width: 100vw !important;

            height: 100vh !important;

            max-width: 100vw !important;

            max-height: 100vh !important;

            margin: 0 !important;

            padding: 0 !important;

            z-index: 999999 !important;

            overflow: hidden !important;

            overscroll-behavior: none !important;

            box-sizing: border-box !important;

        }


        /* =====================================================
           MODAL OVERLAY
        ===================================================== */

        .request-details-overlay {

            position: fixed !important;

            top: 0 !important;

            left: 0 !important;

            right: 0 !important;

            bottom: 0 !important;

            width: 100vw !important;

            height: 100vh !important;

            max-width: 100vw !important;

            max-height: 100vh !important;

            margin: 0 !important;

            padding: 20px !important;

            box-sizing: border-box !important;

            display: flex !important;

            align-items: center !important;

            justify-content: center !important;

            background: rgba(20, 20, 35, 0.65);

            backdrop-filter: blur(4px);

            overflow: hidden !important;

            overscroll-behavior: none !important;

        }


        /* =====================================================
           REQUEST CONTAINER

           IMPORTANT:
           Container itself does NOT scroll.

           Only request-modal-scroll-area scrolls.
        ===================================================== */

        .request-details-container {

            position: relative !important;

            display: flex !important;

            flex-direction: column !important;

            width: 100% !important;

            max-width: 850px !important;

            height: 90vh !important;

            max-height: 90vh !important;

            margin: 0 !important;

            padding: 0 !important;

            box-sizing: border-box !important;

            background: #ffffff !important;

            border-radius: 14px !important;

            box-shadow:
                0 20px 60px rgba(0, 0, 0, 0.25);

            overflow: hidden !important;

            overscroll-behavior: contain !important;

            animation:
                requestModalOpen 0.2s ease;

        }


        /* =====================================================
           HEADER

           Header remains fixed while content scrolls.
        ===================================================== */

        .request-details-header {

            flex: 0 0 auto !important;

            display: flex;

            align-items: center;

            justify-content: space-between;

            padding: 22px 26px;

            border-bottom: 1px solid #eeeeee;

            background: #f8f8fa;

            box-sizing: border-box;

        }


        .request-details-header h2 {

            margin: 0;

            color: #22223B;

            font-size: 21px;

        }


        .request-details-header p {

            margin: 5px 0 0;

            color: #777777;

            font-size: 13px;

        }


        /* =====================================================
           CLOSE BUTTON
        ===================================================== */

        .request-modal-close {

            flex: 0 0 auto;

            width: 34px;

            height: 34px;

            border: none;

            border-radius: 50%;

            background: #eeeeee;

            color: #444444;

            font-size: 23px;

            line-height: 1;

            cursor: pointer;

            transition: 0.2s ease;

        }


        .request-modal-close:hover {

            background: #dddddd;

            color: #222222;

        }


        /* =====================================================
           LOADING AREA
        ===================================================== */

        .request-modal-loading {

            flex: 1 1 auto;

            min-height: 0;

            padding: 50px 25px;

            text-align: center;

            color: #777777;

            font-size: 14px;

            overflow: auto;

            box-sizing: border-box;

        }


        /* =====================================================
           ONLY SCROLLABLE CONTENT AREA
        ===================================================== */

        .request-modal-content {

            flex: 1 1 auto !important;

            min-height: 0 !important;

            padding: 25px 26px 30px;

            box-sizing: border-box;

            overflow-y: auto !important;

            overflow-x: hidden !important;

            overscroll-behavior: contain !important;

            scrollbar-width: thin;

        }


        /* Chrome / Edge / Safari */

        .request-modal-content::-webkit-scrollbar {

            width: 8px;

        }


        .request-modal-content::-webkit-scrollbar-track {

            background: #f1f1f1;

        }


        .request-modal-content::-webkit-scrollbar-thumb {

            background: #b8b8b8;

            border-radius: 10px;

        }


        .request-modal-content::-webkit-scrollbar-thumb:hover {

            background: #999999;

        }


        /* =====================================================
           REQUEST SECTIONS
        ===================================================== */

        .request-detail-section {

            margin-bottom: 25px;

            padding-bottom: 22px;

            border-bottom: 1px solid #eeeeee;

        }


        .request-detail-section:last-child {

            border-bottom: none;

            margin-bottom: 0;

        }


        .request-detail-section h3 {

            margin: 0 0 16px;

            color: #22223B;

            font-size: 15px;

            font-weight: 700;

        }


        /* =====================================================
           DETAIL GRID
        ===================================================== */

        .request-detail-grid {

            display: grid;

            grid-template-columns:
                repeat(2, minmax(0, 1fr));

            gap: 15px;

        }


        .request-detail-item {

            padding: 13px 15px;

            background: #f8f8fa;

            border: 1px solid #eeeeee;

            border-radius: 8px;

            box-sizing: border-box;

        }


        .detail-label {

            display: block;

            margin-bottom: 5px;

            color: #888888;

            font-size: 12px;

        }


        .request-detail-item strong {

            color: #333333;

            font-size: 14px;

            word-break: break-word;

        }


        /* =====================================================
           DESCRIPTION
        ===================================================== */

        .request-description {

            padding: 16px;

            min-height: 90px;

            background: #f8f8fa;

            border: 1px solid #eeeeee;

            border-radius: 8px;

            color: #444444;

            font-size: 14px;

            line-height: 1.6;

            white-space: pre-wrap;

            word-break: break-word;

            box-sizing: border-box;

        }


        /* =====================================================
           ADMIN ACTIONS
        ===================================================== */

        .admin-action-section {

            padding-bottom: 0;

        }


        .admin-form-group {

            margin-bottom: 18px;

        }


        .admin-form-group label {

            display: block;

            margin-bottom: 7px;

            color: #333333;

            font-size: 13px;

            font-weight: 600;

        }


        .admin-form-group select,
        .admin-form-group textarea {

            width: 100%;

            box-sizing: border-box;

            border: 1px solid #d8d8df;

            border-radius: 8px;

            background: #ffffff;

            color: #333333;

            font-family: inherit;

            font-size: 14px;

            outline: none;

            transition: 0.2s ease;

        }


        .admin-form-group select {

            height: 42px;

            padding: 0 12px;

        }


        .admin-form-group textarea {

            padding: 12px;

            resize: vertical;

            min-height: 110px;

        }


        .admin-form-group select:focus,
        .admin-form-group textarea:focus {

            border-color: #4A4E69;

            box-shadow:
                0 0 0 3px rgba(74, 78, 105, 0.10);

        }


        /* =====================================================
           ACTION BUTTONS
        ===================================================== */

        .request-modal-actions {

            display: flex;

            justify-content: flex-end;

            gap: 10px;

            margin-top: 22px;

        }


        .request-cancel-btn,
        .request-save-btn {

            border: none;

            border-radius: 7px;

            padding: 10px 18px;

            font-size: 13px;

            font-weight: 600;

            cursor: pointer;

            transition: 0.2s ease;

        }


        .request-cancel-btn {

            background: #eeeeee;

            color: #444444;

        }


        .request-cancel-btn:hover {

            background: #dddddd;

        }


        .request-save-btn {

            background: #22223B;

            color: #ffffff;

        }


        .request-save-btn:hover {

            background: #4A4E69;

        }


        .request-save-btn:disabled {

            opacity: 0.6;

            cursor: not-allowed;

        }


        /* =====================================================
           UPDATE MESSAGE
        ===================================================== */

        .request-update-message {

            display: none;

            padding: 10px 12px;

            margin-top: 5px;

            border-radius: 7px;

            font-size: 13px;

        }


        .request-update-message.success {

            display: block;

            background: #eaf7ee;

            color: #24733a;

            border: 1px solid #c9e9d2;

        }


        .request-update-message.error {

            display: block;

            background: #fff0f0;

            color: #a33a3a;

            border: 1px solid #f0cccc;

        }


        /* =====================================================
           MODAL ANIMATION
        ===================================================== */

        @keyframes requestModalOpen {

            from {

                opacity: 0;

                transform:
                    translateY(15px)
                    scale(0.98);

            }

            to {

                opacity: 1;

                transform:
                    translateY(0)
                    scale(1);

            }

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 650px) {

            .request-details-overlay {

                padding: 10px !important;

                align-items: flex-start !important;

            }


            .request-details-container {

                width: 100% !important;

                height: 94vh !important;

                max-height: 94vh !important;

                margin-top: 10px !important;

                border-radius: 12px !important;

            }


            .request-detail-grid {

                grid-template-columns: 1fr;

            }


            .request-details-header {

                padding: 18px;

            }


            .request-modal-content {

                padding: 20px 18px;

            }


            .request-modal-actions {

                flex-direction: column-reverse;

            }


            .request-cancel-btn,
            .request-save-btn {

                width: 100%;

            }

        }

    `;


    document.head.appendChild(style);

}

// ==========================================
// STUDENTS MANAGEMENT
// ==========================================

let studentSearchTimeout = null;


// ==========================================
// LOAD STUDENTS
// ==========================================

async function loadStudents() {

    const tableBody = document.getElementById("studentsTableBody");
    const emptyState = document.getElementById("studentsEmptyState");

    if (!tableBody) {
        console.error("Students table body not found.");
        return;
    }

    try {

        const token = localStorage.getItem("adminToken");

        if (!token) {
            window.location.href = "admin-login.html";
            return;
        }


        const searchInput =
            document.getElementById("studentSearchInput");

        const departmentFilter =
            document.getElementById("studentDepartmentFilter");


        const search = searchInput
            ? searchInput.value.trim()
            : "";

        const departmentId = departmentFilter
            ? departmentFilter.value
            : "";


        const params = new URLSearchParams();


        if (search) {
            params.append("search", search);
        }


        if (departmentId) {
            params.append("department_id", departmentId);
        }


        const queryString = params.toString();

        const url =
            `https://campus-request-management-backend.onrender.com/api/admin/students` +
            (queryString ? `?${queryString}` : "");


        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="table-loading">
                    Loading students...
                </td>
            </tr>
        `;


        const response = await fetch(url, {

            method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`
            }

        });


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Failed to load students."
            );

        }


        renderStudents(data.students || []);


    } catch (error) {

        console.error("Load Students Error:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="table-error">
                    Failed to load students.
                </td>
            </tr>
        `;

        if (emptyState) {
            emptyState.style.display = "none";
        }

    }

}


// ==========================================
// RENDER STUDENTS
// ==========================================

function renderStudents(students) {

    const tableBody =
        document.getElementById("studentsTableBody");

    const emptyState =
        document.getElementById("studentsEmptyState");


    if (!tableBody) {
        return;
    }


    if (!students || students.length === 0) {

        tableBody.innerHTML = "";

        if (emptyState) {
            emptyState.style.display = "flex";
        }

        return;

    }


    if (emptyState) {
        emptyState.style.display = "none";
    }


    tableBody.innerHTML = students.map(student => {

        const studentId =
            student.student_id ?? "-";

        const name =
            escapeHTML(student.name || "-");

        const rollNumber =
            escapeHTML(student.roll_number || "-");

        const email =
            escapeHTML(student.email || "-");

        const department =
            escapeHTML(
                student.department_name || "Not Assigned"
            );

        const requestCount =
            Number(student.request_count || 0);

        const registeredOn =
            formatStudentDate(student.created_at);


        return `
            <tr>

                <td>
                    <span class="student-id">
                        ${studentId}
                    </span>
                </td>


                <td>

                   <div class="student-name-cell">
    <span>
        ${name}
    </span>
</div>

                </td>


                <td>
                    ${rollNumber}
                </td>


                <td>
                    ${email}
                </td>


                <td>
    ${department}
</td>


                <td>

                    <span class="request-count">
                        ${requestCount}
                    </span>

                </td>


                <td>
                    ${registeredOn}
                </td>


                <td>

                    <button
                        type="button"
                        class="student-view-button"
                        onclick="viewStudent(${studentId})"
                    >
                        View
                    </button>

                </td>

            </tr>
        `;

    }).join("");

}


// ==========================================
// LOAD DEPARTMENTS
// ==========================================

async function loadStudentDepartments() {

    const select =
        document.getElementById("studentDepartmentFilter");

    if (!select) {
        return;
    }


    try {

        const token =
            localStorage.getItem("adminToken");


        if (!token) {
            window.location.href = "admin-login.html";
            return;
        }


        const response = await fetch(
            "https://campus-request-management-backend.onrender.com/api/admin/departments",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Failed to load departments."
            );

        }


        select.innerHTML = `
            <option value="">
                All Departments
            </option>
        `;


        (data.departments || []).forEach(department => {

            const option = document.createElement("option");

            option.value = department.department_id;

            option.textContent =
                department.department_name;

            select.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Load Student Departments Error:",
            error
        );

    }

}


// ==========================================
// STUDENT SEARCH
// ==========================================

function handleStudentSearch() {

    clearTimeout(studentSearchTimeout);


    studentSearchTimeout = setTimeout(() => {

        loadStudents();

    }, 300);

}


// ==========================================
// STUDENT DEPARTMENT FILTER
// ==========================================

function handleStudentDepartmentFilter() {

    loadStudents();

}


// ==========================================
// VIEW STUDENT
// ==========================================

async function viewStudent(studentId) {

    const modal =
        document.getElementById("studentDetailsModal");


    if (!modal) {

        console.error(
            "Student details modal not found."
        );

        return;

    }


    try {

        const token =
            localStorage.getItem("adminToken");


        if (!token) {
            window.location.href = "admin-login.html";
            return;
        }


        // Show modal
        modal.classList.add("active");


        // Loading state
        setStudentDetailsLoading();


        const response = await fetch(
            `https://campus-request-management-backend.onrender.com/api/admin/students/${studentId}`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load student details."
            );

        }


        populateStudentDetails(
            data.student,
            data.requests || []
        );


    } catch (error) {

        console.error(
            "View Student Error:",
            error
        );


        alert(
            error.message ||
            "Failed to load student details."
        );


        closeStudentDetailsModal();

    }

}


// ==========================================
// POPULATE STUDENT DETAILS
// ==========================================

function populateStudentDetails(student, requests) {

    if (!student) {
        return;
    }


    document.getElementById(
        "studentModalName"
    ).textContent =
        student.name || "Student";


    document.getElementById(
        "studentModalId"
    ).textContent =
        `Student ID: ${student.student_id}`;


    document.getElementById(
        "detailStudentId"
    ).textContent =
        student.student_id || "-";


    document.getElementById(
        "detailStudentName"
    ).textContent =
        student.name || "-";


    document.getElementById(
        "detailStudentRoll"
    ).textContent =
        student.roll_number || "-";


    document.getElementById(
        "detailStudentEmail"
    ).textContent =
        student.email || "-";


    document.getElementById(
        "detailStudentDepartment"
    ).textContent =
        student.department_name ||
        "Not Assigned";


    document.getElementById(
        "detailStudentRegistered"
    ).textContent =
        formatStudentDate(student.created_at);


    document.getElementById(
        "studentTotalRequests"
    ).textContent =
        requests.length;


    renderStudentRequestHistory(requests);

}


// ==========================================
// REQUEST HISTORY
// ==========================================

function renderStudentRequestHistory(requests) {

    const tableBody =
        document.getElementById(
            "studentRequestHistoryBody"
        );


    if (!tableBody) {
        return;
    }


    if (!requests || requests.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="no-request-history"
                >
                    This student has not submitted any requests.
                </td>
            </tr>
        `;

        return;

    }


    tableBody.innerHTML =
        requests.map(request => {

            const status =
                request.status || "New";


            return `
                <tr>

                    <td>
                        #${request.request_id}
                    </td>


                    <td>
                        ${escapeHTML(
                            request.subject || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            request.request_type || "-"
                        )}
                    </td>


                    <td>

                        <span class="${getStatusClass(status)}">
                            ${escapeHTML(status)}
                        </span>

                    </td>


                    <td>
                        ${formatStudentDate(
                            request.created_at
                        )}
                    </td>

                </tr>
            `;

        }).join("");

}


// ==========================================
// STUDENT MODAL LOADING
// ==========================================

function setStudentDetailsLoading() {

    const fields = [
        "detailStudentId",
        "detailStudentName",
        "detailStudentRoll",
        "detailStudentEmail",
        "detailStudentDepartment",
        "detailStudentRegistered"
    ];


    fields.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = "Loading...";
        }

    });


    const name =
        document.getElementById(
            "studentModalName"
        );

    if (name) {
        name.textContent = "Loading student...";
    }


    const id =
        document.getElementById(
            "studentModalId"
        );

    if (id) {
        id.textContent = "";
    }


    const total =
        document.getElementById(
            "studentTotalRequests"
        );

    if (total) {
        total.textContent = "—";
    }


    const requestBody =
        document.getElementById(
            "studentRequestHistoryBody"
        );

    if (requestBody) {

        requestBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="table-loading"
                >
                    Loading request history...
                </td>
            </tr>
        `;

    }

}


// ==========================================
// CLOSE STUDENT MODAL
// ==========================================

function closeStudentDetailsModal() {

    const modal =
        document.getElementById(
            "studentDetailsModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove("active");

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatStudentDate(dateValue) {

    if (!dateValue) {
        return "-";
    }


    const date = new Date(dateValue);


    if (Number.isNaN(date.getTime())) {
        return "-";
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


// ==========================================
// GET STUDENT INITIALS
// ==========================================

function getStudentInitials(name) {

    if (!name) {
        return "ST";
    }


    const words =
        name.trim().split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


// ==========================================
// STUDENT EVENT LISTENERS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const searchInput =
            document.getElementById(
                "studentSearchInput"
            );


        const departmentFilter =
            document.getElementById(
                "studentDepartmentFilter"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                handleStudentSearch
            );

        }


        if (departmentFilter) {

            departmentFilter.addEventListener(
                "change",
                handleStudentDepartmentFilter
            );

        }


        loadStudentDepartments();

        loadStudents();

    }
);


// ==========================================
// CLOSE MODAL ON OVERLAY CLICK
// ==========================================

document.addEventListener(
    "click",
    (event) => {

        if (
            event.target.classList.contains(
                "student-details-overlay"
            )
        ) {

            closeStudentDetailsModal();

        }

    }
);
// =========================================================
// VIEW REQUEST
// =========================================================

async function viewRequest(requestId) {

    createRequestDetailsModal();


    const modal =
        document.getElementById("requestDetailsModal");


    const loading =
        document.getElementById("requestModalLoading");


    const content =
        document.getElementById("requestModalContent");


    const modalId =
        document.getElementById("requestModalId");


    if (!modal) {
        return;
    }


    modal.style.display = "block";


    // LOCK BACKGROUND PAGE SCROLLING

    document.body.style.overflow = "hidden";


    if (loading) {

        loading.style.display = "block";

        loading.textContent =
            "Loading request details...";

    }


    if (content) {
        content.style.display = "none";
    }


    if (modalId) {

        modalId.textContent =
            `Request #${requestId}`;

    }


    try {

        const token =
            localStorage.getItem("adminToken");


        if (!token) {

            window.location.href =
                "admin-login.html";

            return;
        }


        const response = await fetch(
            `https://campus-request-management-backend.onrender.com/api/admin/requests/${requestId}`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        console.log(
            "Request Details Response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load request details."
            );

        }


        const request =
            data.request || data.data || data;


        populateRequestDetails(request);


        if (loading) {
            loading.style.display = "none";
        }


        if (content) {
            content.style.display = "block";
        }

    }

    catch (error) {

        console.error(
            "View Request Error:",
            error
        );


        if (loading) {

            loading.style.display = "block";

            loading.innerHTML = `

                <div style="
                    color:#a33a3a;
                    margin-bottom:15px;
                ">

                    ${escapeHTML(error.message)}

                </div>


                <button
                    type="button"
                    onclick="closeRequestModal()"
                    style="
                        border:none;
                        background:#22223B;
                        color:white;
                        padding:9px 16px;
                        border-radius:6px;
                        cursor:pointer;
                    ">

                    Close

                </button>

            `;

        }

    }

}


// =========================================================
// POPULATE REQUEST DETAILS
// =========================================================

function populateRequestDetails(request) {

    if (!request) {
        throw new Error(
            "Request details were not returned by the server."
        );
    }


    const requestId =
        request.request_id ||
        request.id ||
        "-";


    const modalId =
        document.getElementById("requestModalId");


    if (modalId) {

        modalId.textContent =
            `Request #${requestId}`;

    }


    const studentName =
        request.student_name ||
        request.name ||
        "-";


    const rollNumber =
        request.roll_number ||
        "-";


    const department =
        request.department_name ||
        request.department ||
        "-";


    const requestType =
        request.request_type ||
        "-";


    const subject =
        request.subject ||
        "-";


    const description =
        request.description ||
        "-";


    const createdAt =
        request.created_at ||
        null;


    const updatedAt =
        request.updated_at ||
        null;


    const status =
        request.status ||
        "New";


    const staffResponse =
        request.staff_response ||
        request.response ||
        "";


    // =====================================================
    // STUDENT INFORMATION
    // =====================================================

    const studentNameElement =
        document.getElementById("detailStudentName");

    if (studentNameElement) {
        studentNameElement.textContent =
            studentName;
    }


    const rollElement =
        document.getElementById("detailRollNumber");

    if (rollElement) {
        rollElement.textContent =
            rollNumber;
    }


    const departmentElement =
        document.getElementById("detailDepartment");

    if (departmentElement) {
        departmentElement.textContent =
            department;
    }


    // =====================================================
    // REQUEST INFORMATION
    // =====================================================

    const requestTypeElement =
        document.getElementById("detailRequestType");

    if (requestTypeElement) {
        requestTypeElement.textContent =
            requestType;
    }


    const subjectElement =
        document.getElementById("detailSubject");

    if (subjectElement) {
        subjectElement.textContent =
            subject;
    }


    const createdElement =
        document.getElementById("detailCreatedAt");

    if (createdElement) {
        createdElement.textContent =
            formatRequestDateTime(createdAt);
    }


    const updatedElement =
        document.getElementById("detailUpdatedAt");

    if (updatedElement) {
        updatedElement.textContent =
            formatRequestDateTime(updatedAt);
    }


    // =====================================================
    // DESCRIPTION
    // =====================================================

    const descriptionElement =
        document.getElementById("detailDescription");

    if (descriptionElement) {
        descriptionElement.textContent =
            description;
    }


    // =====================================================
    // STATUS
    // =====================================================

    const statusElement =
        document.getElementById("requestStatus");


    if (statusElement) {

        const availableStatuses = [
            "New",
            "Accepted",
            "In Progress",
            "Completed",
            "Rejected"
        ];


        // Make sure the server status exists
        // in the dropdown.

        if (
            availableStatuses.includes(status)
        ) {

            statusElement.value =
                status;

        } else {

            statusElement.value =
                "New";

        }


        console.log(
            "Request status loaded:",
            statusElement.value
        );

    }


    // =====================================================
    // STAFF RESPONSE
    // =====================================================

    const responseElement =
        document.getElementById("staffResponse");


    if (responseElement) {

        responseElement.value =
            staffResponse;

    }


    // =====================================================
    // CLEAR UPDATE MESSAGE
    // =====================================================

    const message =
        document.getElementById(
            "requestUpdateMessage"
        );


    if (message) {

        message.textContent = "";

        message.className =
            "request-update-message";

    }

}


// =========================================================
// SAVE REQUEST UPDATE
// =========================================================

async function saveRequestUpdate() {

    const modalId =
        document.getElementById("requestModalId");


    if (!modalId) {
        return;
    }


    const idText =
        modalId.textContent || "";


    const match =
        idText.match(/#(\d+)/);


    if (!match) {

        alert(
            "Unable to identify the request."
        );

        return;
    }


    const requestId =
        match[1];


    const statusElement =
        document.getElementById("requestStatus");


    const responseElement =
        document.getElementById("staffResponse");


    const saveButton =
        document.getElementById(
            "saveRequestButton"
        );


    const message =
        document.getElementById(
            "requestUpdateMessage"
        );


    if (!statusElement || !responseElement) {

        console.error(
            "Request status or response element not found."
        );

        return;
    }


    // =====================================================
    // GET CURRENTLY SELECTED STATUS
    // =====================================================

    const selectedOption =
        statusElement.options[
            statusElement.selectedIndex
        ];


    const status =
        selectedOption
            ? selectedOption.value
            : "";


    const staffResponse =
        responseElement.value.trim();


    console.log(
        "================================="
    );

    console.log(
        "STATUS SELECTED:",
        status
    );

    console.log(
        "SELECTED OPTION TEXT:",
        selectedOption
            ? selectedOption.textContent.trim()
            : "NONE"
    );

    console.log(
        "REQUEST ID:",
        requestId
    );

    console.log(
        "================================="
    );


    // =====================================================
    // VALIDATE STATUS
    // =====================================================

    const allowedStatuses = [
        "New",
        "Accepted",
        "In Progress",
        "Completed",
        "Rejected"
    ];


    if (!allowedStatuses.includes(status)) {

        showRequestUpdateMessage(
            "Please select a valid request status.",
            "error"
        );

        return;
    }


    try {

        const token =
            localStorage.getItem("adminToken");


        if (!token) {

            window.location.href =
                "admin-login.html";

            return;
        }


        // =================================================
        // DISABLE SAVE BUTTON
        // =================================================

        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
                "Saving...";

        }


        if (message) {

            message.textContent = "";

            message.className =
                "request-update-message";

        }


        // =================================================
        // SEND UPDATE TO BACKEND
        // =================================================

        const response = await fetch(

            `https://campus-request-management-backend.onrender.com/api/admin/requests/${requestId}`,

            {
                method: "PUT",

                headers: {

                    "Authorization":
                        `Bearer ${token}`,

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    status:
                        status,

                    staff_response:
                        staffResponse

                })

            }

        );


        const data =
            await response.json();


        console.log(
            "Update Request Response:",
            data
        );


        // =================================================
        // CHECK RESPONSE
        // =================================================

        if (!response.ok) {

            throw new Error(

                data.message ||
                "Failed to update request."

            );

        }


        // =================================================
        // SUCCESS MESSAGE
        // =================================================

        showRequestUpdateMessage(

            data.message ||
            "Request updated successfully.",

            "success"

        );


        // =================================================
        // REFRESH MANAGE REQUESTS TABLE
        // =================================================

        await loadAdminRequests();


        // =================================================
        // REFRESH DASHBOARD STATISTICS
        // =================================================

        await loadDashboardStatistics();


        // =================================================
        // CLOSE MODAL
        // =================================================

        setTimeout(

            () => {

                closeRequestModal();

            },

            900

        );

    }


    catch (error) {

        console.error(
            "Update Request Error:",
            error
        );


        showRequestUpdateMessage(

            error.message ||
            "Failed to update request.",

            "error"

        );

    }


    finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Changes";

        }

    }

}
// =========================================================
// REQUEST UPDATE MESSAGE
// =========================================================

function showRequestUpdateMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "requestUpdateMessage"
        );


    if (!message) {
        return;
    }


    message.textContent = text;

    message.className =
        `request-update-message ${type}`;

}



// =========================================================
// CLOSE REQUEST MODAL
// =========================================================

function closeRequestModal() {

    const modal =
        document.getElementById(
            "requestDetailsModal"
        );


    if (!modal) {
        return;
    }


    modal.style.display = "none";
    document.documentElement.classList.remove(
    "request-modal-open"
);

document.body.classList.remove(
    "request-modal-open"
);


    // =====================================================
    // RESTORE PAGE SCROLLING
    // =====================================================

    document.documentElement.classList.remove(
        "request-modal-open"
    );

    document.body.classList.remove(
        "request-modal-open"
    );

}

// =========================================================
// ESCAPE KEY CLOSES REQUEST MODAL
// =========================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key !== "Escape") {
            return;
        }


        const modal =
            document.getElementById(
                "requestDetailsModal"
            );


        if (
            modal &&
            modal.style.display !== "none"
        ) {

            closeRequestModal();

        }

    }
);


// =========================================================
// SIDEBAR NAVIGATION
// =========================================================

function showSection(
    sectionId,
    clickedItem
) {

    const sections =
        document.querySelectorAll(
            ".content-section"
        );


    sections.forEach(
        section => {

            section.classList.remove(
                "active-section"
            );

        }
    );


    const selectedSection =
        document.getElementById(
            sectionId
        );


    if (selectedSection) {

        selectedSection.classList.add(
            "active-section"
        );

    }


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        item => {

            item.classList.remove(
                "active"
            );

        }
    );


    if (clickedItem) {

        clickedItem.classList.add(
            "active"
        );

    }


    updatePageTitle(sectionId);


    if (sectionId === "requests") {

    loadAdminRequests();

}


if (sectionId === "staff") {

    loadStaff();

}
}


// =========================================================
// PAGE TITLE
// =========================================================

function updatePageTitle(sectionId) {

    const pageTitle =
        document.getElementById(
            "page-title"
        );


    if (!pageTitle) {
        return;
    }


    const titles = {

        dashboard:
            "Admin Dashboard",

        requests:
            "Manage Requests",

        staff:
            "Manage Staff",

        students:
            "Students",

        departments:
            "Departments"

    };


    pageTitle.textContent =
        titles[sectionId] ||
        "Admin Dashboard";

}


// =========================================================
// LOGOUT
// =========================================================

function logoutAdmin() {

    localStorage.removeItem(
        "adminToken"
    );

    localStorage.removeItem(
        "admin"
    );


    window.location.replace(
        "admin-login.html"
    );

}


// =========================================================
// MANAGE STAFF - ADD STAFF FORM
// =========================================================

function showAddStaffForm() {

    const modal =
        document.getElementById(
            "staffModal"
        );

    const form =
        document.getElementById(
            "staffForm"
        );

    const title =
        document.getElementById(
            "staffModalTitle"
        );

    const result =
        document.getElementById(
            "staffCredentialsResult"
        );


    if (
        !modal ||
        !form ||
        !title
    ) {

        console.error(
            "Staff modal elements not found."
        );

        return;
    }


    form.reset();

    const validIcon =
    document.getElementById(
        "staffEmailValidIcon"
    );

if (validIcon) {
    validIcon.classList.remove("show");
}

    form.style.display =
        "block";


    if (result) {

        result.style.display =
            "none";

    }


    title.textContent =
        "Add New Staff";


    modal.classList.add(
        "active"
    );

}


// =========================================================
// CLOSE STAFF MODAL
// =========================================================

function closeStaffModal() {

    const modal =
        document.getElementById(
            "staffModal"
        );


    const form =
        document.getElementById(
            "staffForm"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    if (form) {
        form.reset();
    }

}

// =========================================================
// STAFF EMAIL VALIDATION
// =========================================================

function validateStaffEmailInput() {

    const emailInput =
        document.getElementById("staffEmail");

    const validIcon =
        document.getElementById(
            "staffEmailValidIcon"
        );

    if (!emailInput || !validIcon) {
        return;
    }

    const email =
        emailInput.value.trim();

    // Required .edu email format
    const eduEmailPattern =
        /^[^\s@]+@[^\s@]+\.edu$/i;

    if (eduEmailPattern.test(email)) {

        validIcon.classList.add("show");

    } else {

        validIcon.classList.remove("show");

    }
}

// =========================================================
// STAFF EMAIL INPUT LISTENER
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const emailInput =
            document.getElementById("staffEmail");

        if (!emailInput) {
            return;
        }

        emailInput.addEventListener(
            "input",
            validateStaffEmailInput
        );

    }
);

// =========================================================
// SAVE STAFF
// =========================================================

async function saveStaff(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("staffName")
            .value
            .trim();


    const email =
        document
            .getElementById("staffEmail")
            .value
            .trim();


    const department =
        document
            .getElementById("staffDepartment")
            .value;


    const designation =
        document
            .getElementById("staffDesignation")
            .value
            .trim();


    // =====================================================
    // VALIDATION
    // =====================================================

    if (
        !name ||
        !email ||
        !department ||
        !designation
    ) {

        alert(
            "Please fill in all staff details."
        );

        return;
    }


    // =====================================================
    // .EDU EMAIL VALIDATION
    // =====================================================

    const eduEmailPattern =
        /^[^\s@]+@[^\s@]+\.edu$/i;


    if (!eduEmailPattern.test(email)) {

        alert(
            "Please enter a valid official .edu email address."
        );

        return;
    }


    // =====================================================
    // GET DEPARTMENT ID
    // =====================================================

    const departmentMap = {

        "Engineering": 1,

        "Pharmacy": 2,

        "Hotel Management": 3,

        "Management and Technology": 4

    };


    const departmentId =
        departmentMap[department];


    if (!departmentId) {

        alert(
            "Invalid department selected."
        );

        return;
    }


    // =====================================================
    // AUTHENTICATION
    // =====================================================

    const token =
        localStorage.getItem(
            "adminToken"
        );


    if (!token) {

        window.location.href =
            "admin-login.html";

        return;
    }


    // =====================================================
    // BUTTON
    // =====================================================

    const saveButton =
        document.querySelector(
            "#staffForm .staff-save-btn"
        );


    try {

        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
                "Creating...";

        }


        // =================================================
        // SEND TO BACKEND
        // =================================================

        const response =
            await fetch(
                "https://campus-request-management-backend.onrender.com/api/admin/staff",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        department_id:
                            departmentId,

                        designation:
                            designation

                    })

                }
            );


        const data =
            await response.json();


        console.log(
            "Create Staff Response:",
            data
        );


        // =================================================
        // ERROR
        // =================================================

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to create staff account."
            );

        }


        // =================================================
        // SHOW TEMPORARY PASSWORD
        // =================================================

        showStaffCredentials(
            data
        );


        // =================================================
        // REFRESH STAFF TABLE
        // =================================================

        await loadStaff();


        // =================================================
        // REFRESH DASHBOARD COUNT
        // =================================================

        await loadDashboardStatistics();


    } catch (error) {

        console.error(
            "Create Staff Error:",
            error
        );

        alert(
            error.message ||
            "Unable to create staff account."
        );

    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Staff";

        }

    }

}

// =========================================================
// LOAD STAFF
// =========================================================

let allStaff = [];


async function loadStaff() {

    try {

        const token =
            localStorage.getItem(
                "adminToken"
            );


        if (!token) {
            return;
        }


        const response =
            await fetch(
                "https://campus-request-management-backend.onrender.com/api/admin/staff",
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

            throw new Error(
                data.message ||
                "Failed to load staff."
            );

        }


        allStaff =
            data.staff || [];


        renderStaffTable(
            allStaff
        );


    } catch (error) {

        console.error(
            "Load Staff Error:",
            error
        );

        const tableBody =
            document.getElementById(
                "staffTableBody"
            );


        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="no-data">

                        Failed to load staff.

                    </td>
                </tr>
            `;

        }

    }

}

// =========================================================
// RENDER STAFF TABLE
// =========================================================

function renderStaffTable(staffList) {

    const tableBody =
        document.getElementById(
            "staffTableBody"
        );


    if (!tableBody) {
        return;
    }


    if (
        !staffList ||
        staffList.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="no-data">

                    No staff members available.

                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        staffList.map(
            staff => {

                ```javascript
const status = staff.status || "Active";

const statusClass = status.toLowerCase();

const actionText =
    status === "Active"
        ? "Deactivate"
        : "Activate";

const nextStatus =
    status === "Active"
        ? "Inactive"
        : "Active";
```


                return `
                    <tr>

                        <td>
                            #${staff.staff_id}
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    staff.name
                                )}
                            </strong>

                            <br>

                            <small>
                                ${escapeHTML(
                                    staff.designation
                                )}
                            </small>
                        </td>

                        <td>
                            ${escapeHTML(
                                staff.email
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                staff.department_name
                            )}
                        </td>

                        <td>
                            <span
                                class="status ${statusClass}"> ${escapeHTML(status)} </span>
                        </td>

                        <td>

                            <button
                                type="button"
                                class="view-request-btn"
                                onclick="toggleStaffStatus(
                                    ${staff.staff_id},
                                    '${nextStatus}'
                                )">

                                ${actionText}

                            </button>

                        </td>

                    </tr>
                `;

            }
        ).join("");

}
// =========================================================
// FILTER STAFF
// =========================================================

function filterStaff() {

    const search =
        document
            .getElementById("staffSearch")
            ?.value
            .trim()
            .toLowerCase() || "";


    const department =
        document
            .getElementById("departmentFilter")
            ?.value || "all";


    const status =
        document
            .getElementById("statusFilter")
            ?.value || "all";


    const filteredStaff =
        allStaff.filter(
            staff => {

                const matchesSearch =
                    !search ||
                    staff.name
                        .toLowerCase()
                        .includes(search) ||
                    staff.email
                        .toLowerCase()
                        .includes(search);


                const matchesDepartment =
                    department === "all" ||
                    staff.department_name ===
                        department;


                const matchesStatus =
                    status === "all" ||
                    staff.status ===
                        status;


                return (
                    matchesSearch &&
                    matchesDepartment &&
                    matchesStatus
                );

            }
        );


    renderStaffTable(
        filteredStaff
    );

}

// =========================================================
// TOGGLE STAFF STATUS
// =========================================================

async function toggleStaffStatus(
    staffId,
    status
) {

    const action =
        status === "Active"
            ? "activate"
            : "deactivate";


    const confirmed =
        confirm(
            `Are you sure you want to ${action} this staff account?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const token =
            localStorage.getItem(
                "adminToken"
            );


        if (!token) {

            window.location.href =
                "admin-login.html";

            return;
        }


        const response =
            await fetch(
                `https://campus-request-management-backend.onrender.com/api/admin/staff/${staffId}/status`,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({
                        status: status
                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update staff status."
            );

        }


        alert(
            data.message ||
            "Staff status updated."
        );


        await loadStaff();


        await loadDashboardStatistics();


    } catch (error) {

        console.error(
            "Toggle Staff Status Error:",
            error
        );

        alert(
            error.message ||
            "Unable to update staff status."
        );

    }

}

// =========================================================
// SHOW STAFF CREDENTIALS
// =========================================================

function showStaffCredentials(data) {

    const form =
        document.getElementById(
            "staffForm"
        );


    const result =
        document.getElementById(
            "staffCredentialsResult"
        );


    const email =
        document.getElementById(
            "createdStaffEmail"
        );


    const password =
        document.getElementById(
            "temporaryStaffPassword"
        );


    if (
        !form ||
        !result ||
        !email ||
        !password
    ) {
        return;
    }


    email.textContent =
        data.email ||
        document.getElementById(
            "staffEmail"
        ).value.trim();


    password.textContent =
        data.temporary_password;


    form.style.display =
        "none";


    result.style.display =
        "block";

}


// =========================================================
// CLOSE STAFF CREDENTIALS
// =========================================================

function closeStaffCredentials() {

    const modal =
        document.getElementById(
            "staffModal"
        );


    const form =
        document.getElementById(
            "staffForm"
        );


    const result =
        document.getElementById(
            "staffCredentialsResult"
        );


    if (result) {

        result.style.display =
            "none";

    }


    if (form) {

        form.style.display =
            "block";

        form.reset();

    }


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }

}


// =========================================================
// COPY TEMPORARY PASSWORD
// =========================================================

async function copyTemporaryPassword() {

    const password =
        document.getElementById(
            "temporaryStaffPassword"
        );


    if (!password) {
        return;
    }


    try {

        await navigator.clipboard.writeText(
            password.textContent
        );


        alert(
            "Temporary password copied."
        );

    } catch (error) {

        console.error(
            "Copy password error:",
            error
        );

    }

}
// =========================================================
// CLOSE STAFF MODAL WHEN CLICKING OUTSIDE
// =========================================================

document.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "staffModal"
            );


        if (!modal) {
            return;
        }


        if (event.target === modal) {

            closeStaffModal();

        }

    }
);

// =========================================================
// ADMIN NOTIFICATION SYSTEM
// =========================================================


// =========================================================
// ELEMENTS
// =========================================================

const adminNotificationBtn =
    document.getElementById(
        "adminNotificationBtn"
    );

const adminNotificationDropdown =
    document.getElementById(
        "adminNotificationDropdown"
    );

const adminNotificationBadge =
    document.getElementById(
        "adminNotificationBadge"
    );

const adminNotificationList =
    document.getElementById(
        "adminNotificationList"
    );

const adminMarkAllReadBtn =
    document.getElementById(
        "adminMarkAllReadBtn"
    );


// =========================================================
// OPEN / CLOSE DROPDOWN
// =========================================================

if (adminNotificationBtn) {

    adminNotificationBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            if (!adminNotificationDropdown) {
                return;
            }

            adminNotificationDropdown.classList.toggle(
                "show"
            );

        }
    );

}


// =========================================================
// CLOSE WHEN CLICKING OUTSIDE
// =========================================================

document.addEventListener(
    "click",
    function (event) {

        if (
            adminNotificationDropdown &&
            adminNotificationBtn &&
            !adminNotificationDropdown.contains(
                event.target
            ) &&
            !adminNotificationBtn.contains(
                event.target
            )
        ) {

            adminNotificationDropdown.classList.remove(
                "show"
            );

        }

    }
);


// =========================================================
// LOAD ADMIN NOTIFICATIONS
// =========================================================

async function loadAdminNotifications() {

    const token =
        localStorage.getItem("adminToken");


    if (!token) {

        return;

    }


    try {

        const response = await fetch(
            "https://campus-request-management-backend.onrender.com/api/notifications/admin",
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

            console.error(
                "Admin notification API error:",
                data
            );

            return;

        }


        displayAdminNotifications(
            data.notifications || []
        );


    } catch (error) {

        console.error(
            "Failed to load admin notifications:",
            error
        );

    }

}


// =========================================================
// DISPLAY ADMIN NOTIFICATIONS
// =========================================================

function displayAdminNotifications(
    notifications
) {

    if (!adminNotificationList) {

        return;

    }


    adminNotificationList.innerHTML = "";


    const unreadNotifications =
        notifications.filter(
            notification =>
                !notification.is_read
        );


    updateAdminNotificationBadge(
        unreadNotifications.length
    );


    if (notifications.length === 0) {

        adminNotificationList.innerHTML = `

            <div class="admin-no-notifications">

                No new notifications

            </div>

        `;

        return;

    }


    notifications.forEach(notification => {

        const item =
            document.createElement("div");


        item.className =
            "admin-notification-item";


        if (!notification.is_read) {

            item.classList.add("unread");

        }


        item.innerHTML = `

            <p class="admin-notification-message">

                ${escapeHTML(
                    notification.message
                )}

            </p>

            <span class="admin-notification-time">

                ${formatAdminNotificationTime(
                    notification.created_at
                )}

            </span>

        `;


        item.addEventListener(
            "click",
            async function () {

                await markAdminNotificationRead(
                    notification.id
                );


                // Close dropdown
                if (
                    adminNotificationDropdown
                ) {

                    adminNotificationDropdown
                        .classList
                        .remove("show");

                }


                // Open Manage Requests
                showSection(
                    "requests"
                );


                // Open the related request
                if (
                    notification.request_id
                ) {

                    setTimeout(
                        () => {

                            viewRequest(
                                notification.request_id
                            );

                        },
                        150
                    );

                }

            }
        );


        adminNotificationList.appendChild(
            item
        );

    });

}


// =========================================================
// UPDATE ADMIN BADGE
// =========================================================

function updateAdminNotificationBadge(
    count
) {

    if (!adminNotificationBadge) {

        return;

    }


    adminNotificationBadge.textContent =
        count;


    if (count === 0) {

        adminNotificationBadge.classList.add(
            "hidden"
        );

    } else {

        adminNotificationBadge.classList.remove(
            "hidden"
        );

    }

}


// =========================================================
// MARK ONE ADMIN NOTIFICATION AS READ
// =========================================================

async function markAdminNotificationRead(
    notificationId
) {

    try {

        const response = await fetch(

            `https://campus-request-management-backend.onrender.com/api/notifications/${notificationId}/read`,

            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                }
            }

        );


        if (response.ok) {

            await loadAdminNotifications();

        }

    } catch (error) {

        console.error(
            "Failed to mark admin notification as read:",
            error
        );

    }

}


// =========================================================
// MARK ALL ADMIN NOTIFICATIONS AS READ
// =========================================================

if (adminMarkAllReadBtn) {

    adminMarkAllReadBtn.addEventListener(
        "click",
        async function () {

            const token =
                localStorage.getItem(
                    "adminToken"
                );


            if (!token) {

                return;

            }


            try {

                const notificationsResponse =
                    await fetch(
                        "https://campus-request-management-backend.onrender.com/api/notifications/admin",
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    `Bearer ${token}`
                            }
                        }
                    );


                const data =
                    await notificationsResponse.json();


                const notifications =
                    data.notifications || [];


                const unread =
                    notifications.filter(
                        notification =>
                            !notification.is_read
                    );


                for (
                    const notification
                    of unread
                ) {

                    await fetch(
                        `https://campus-request-management-backend.onrender.com/api/notifications/${notification.id}/read`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );

                }


                await loadAdminNotifications();

            } catch (error) {

                console.error(
                    "Failed to mark all admin notifications as read:",
                    error
                );

            }

        }
    );

}


// =========================================================
// FORMAT ADMIN NOTIFICATION TIME
// =========================================================

function formatAdminNotificationTime(
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


// =========================================================
// INITIAL LOAD
// =========================================================

loadAdminNotifications();


// =========================================================
// RUN WHEN PAGE LOADS
// =========================================================
loadAdminInformation();

loadDashboardStatistics();

loadAdminRequests();

loadStaff(); 

// ============================================
// AUTOMATIC DASHBOARD REFRESH
// ============================================

let dashboardRefreshInterval = null;
let isDashboardRefreshing = false;

async function refreshDashboardAutomatically() {
    if (isDashboardRefreshing || document.hidden) {
        return;
    }

    isDashboardRefreshing = true;

    try {
        await Promise.all([
            loadDashboardStatistics(),
            loadAdminRequests(),
            loadAdminNotifications()
        ]);
    } catch (error) {
        console.error("Automatic dashboard refresh failed:", error);
    } finally {
        isDashboardRefreshing = false;
    }
}

// Refresh every 10 seconds
if (dashboardRefreshInterval) {
    clearInterval(dashboardRefreshInterval);
}

dashboardRefreshInterval = setInterval(
    refreshDashboardAutomatically,
    10000
);

// Refresh when the user returns to the dashboard tab
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        refreshDashboardAutomatically();
    }
});
// =========================================================
// DEPARTMENT REPORTS
// Uses the existing list endpoints; no new report endpoint required.
// =========================================================

let currentDepartmentReport = null;
let departmentReportRequests = [];
let departmentReportDepartment = null;

function normalizeDepartmentName(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

async function fetchAdminResource(path) {
    const token = localStorage.getItem("adminToken");
    if (!token) {
        window.location.href = "admin-login.html";
        throw new Error("Your admin session has expired. Please log in again.");
    }

    const response = await fetch(`https://campus-request-management-backend.onrender.com/api${path}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminToken");
        window.location.href = "admin-login.html";
        throw new Error(data.message || "Your admin session has expired.");
    }

    if (!response.ok) {
        throw new Error(data.message || `Failed to load ${path}.`);
    }

    return data;
}

function getDepartmentIdentifier(item) {
    return item?.department_id ?? item?.departmentId ?? item?.department?.department_id ?? null;
}

function belongsToDepartment(item, department) {
    if (!item || !department) return false;

    const itemDepartmentId = getDepartmentIdentifier(item);
    if (itemDepartmentId !== null && itemDepartmentId !== undefined && itemDepartmentId !== "") {
        return String(itemDepartmentId) === String(department.department_id);
    }

    const itemDepartmentName =
        item.department_name ||
        item.department ||
        item.departmentName ||
        item.department?.department_name ||
        "";

    return normalizeDepartmentName(itemDepartmentName) ===
        normalizeDepartmentName(department.department_name);
}

function getRequestStudentLabel(request) {
    const name = request.student_name || request.name || request.full_name || "Unknown student";
    const roll = request.roll_number ? ` (${request.roll_number})` : "";
    return `${name}${roll}`;
}

function renderDepartmentReportStats(department, requests, students, staff) {
    const container = document.getElementById("departmentReportStats");
    if (!container) return;

    const pending = requests.filter(r => ["New", "Accepted"].includes(r.status)).length;
    const inProgress = requests.filter(r => r.status === "In Progress").length;
    const completed = requests.filter(r => r.status === "Completed").length;
    const rejected = requests.filter(r => r.status === "Rejected").length;
    const completionRate = requests.length ? Math.round((completed / requests.length) * 100) : 0;

    const stats = [
        ["Total Requests", requests.length],
        ["Pending", pending],
        ["In Progress", inProgress],
        ["Completed", completed],
        ["Rejected", rejected],
        ["Students", students.length],
        ["Staff Members", staff.length],
        ["Completion Rate", `${completionRate}%`]
    ];

    container.innerHTML = stats.map(([label, value]) => `
        <div class="overview-card department-report-stat">
            <h3>${escapeHTML(value)}</h3>
            <p>${escapeHTML(label)}</p>
        </div>
    `).join("");
}

function renderDepartmentRequests() {
    const tbody = document.getElementById("departmentRequestsTable");
    if (!tbody) return;

    const search = (document.getElementById("departmentRequestSearch")?.value || "")
        .trim()
        .toLowerCase();
    const status = document.getElementById("departmentRequestStatus")?.value || "all";

    const filtered = departmentReportRequests.filter(request => {
        const searchable = [
            request.request_id,
            request.subject,
            request.student_name,
            request.roll_number,
            request.request_type,
            request.status
        ].join(" ").toLowerCase();
        const matchesSearch = searchable.includes(search);
        const matchesStatus = status === "all" || request.status === status;
        return matchesSearch && matchesStatus;
    });

    if (!filtered.length) {
        tbody.innerHTML = `
            <tr><td colspan="5" class="no-data">No requests match this search or status filter.</td></tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(request => `
        <tr>
            <td>#${escapeHTML(request.request_id ?? "—")}</td>
            <td>${escapeHTML(getRequestStudentLabel(request))}</td>
            <td>${escapeHTML(request.subject || request.request_type || "—")}</td>
            <td><span class="status ${getStatusClass(request.status)}">${escapeHTML(request.status || "New")}</span></td>
            <td>${escapeHTML(formatRequestDate(request.created_at))}</td>
        </tr>
    `).join("");
}

function renderDepartmentStaff(staff) {
    const tbody = document.getElementById("departmentStaffTable");
    if (!tbody) return;

    if (!staff.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="no-data">No staff members found for this department.</td></tr>`;
        return;
    }

    tbody.innerHTML = staff.map(member => `
        <tr>
            <td>${escapeHTML(member.staff_id ?? member.id ?? "—")}</td>
            <td>${escapeHTML(member.name || member.full_name || "—")}</td>
            <td>${escapeHTML(member.email || "—")}</td>
            <td>${escapeHTML(member.status || (member.is_active === 0 ? "Inactive" : "Active"))}</td>
        </tr>
    `).join("");
}

async function departmentReport(id) {
    const panel = document.getElementById("departmentReport");
    const title = document.getElementById("departmentReportTitle");
    const subtitle = document.getElementById("departmentReportSubtitle");
    const stats = document.getElementById("departmentReportStats");
    const requestsBody = document.getElementById("departmentRequestsTable");
    const staffBody = document.getElementById("departmentStaffTable");

    if (!panel) {
        console.error("Department report panel not found. Check the HTML element with id='departmentReport'.");
        return;
    }

    panel.style.display = "block";
    if (title) title.textContent = "Department Report";
    if (subtitle) subtitle.textContent = "Loading department information…";
    if (stats) stats.innerHTML = `<p>Loading statistics…</p>`;
    if (requestsBody) requestsBody.innerHTML = `<tr><td colspan="5" class="table-loading">Loading requests…</td></tr>`;
    if (staffBody) staffBody.innerHTML = `<tr><td colspan="4" class="table-loading">Loading staff…</td></tr>`;

    try {
        const [departmentData, requestData, studentData, staffData] = await Promise.all([
            fetchAdminResource("/admin/departments"),
            fetchAdminResource("/admin/requests"),
            fetchAdminResource("/admin/students"),
            fetchAdminResource("/admin/staff")
        ]);

        const departments = departmentData.departments || [];
        const department = departments.find(d => String(d.department_id) === String(id));
        if (!department) throw new Error("The selected department was not found. Please check the department list returned by the server.");

        const requests = (requestData.requests || []).filter(item => belongsToDepartment(item, department));
        const students = (studentData.students || []).filter(item => belongsToDepartment(item, department));
        const staff = (staffData.staff || []).filter(item => belongsToDepartment(item, department));

        currentDepartmentReport = department;
        departmentReportDepartment = department;
        departmentReportRequests = requests;

        if (title) title.textContent = `${department.department_name} Report`;
        if (subtitle) subtitle.textContent = `Department ID: ${department.department_id} · Overview of requests, students and staff.`;

        renderDepartmentReportStats(department, requests, students, staff);
        renderDepartmentRequests();
        renderDepartmentStaff(staff);
    } catch (error) {
        console.error("Department report error:", error);
        if (subtitle) subtitle.textContent = "Unable to load this department report.";
        if (stats) stats.innerHTML = `<p class="no-data">${escapeHTML(error.message || "An unexpected error occurred.")}</p>`;
        if (requestsBody) requestsBody.innerHTML = `<tr><td colspan="5" class="no-data">Could not load department requests.</td></tr>`;
        if (staffBody) staffBody.innerHTML = `<tr><td colspan="4" class="no-data">Could not load department staff.</td></tr>`;
    }
}

function closeDepartmentReport() {
    const panel = document.getElementById("departmentReport");
    if (panel) panel.style.display = "none";
    currentDepartmentReport = null;
    departmentReportDepartment = null;
    departmentReportRequests = [];
}

async function initializeDepartmentReportCards() {
    const grid = document.querySelector("#departments .department-grid");
    if (!grid) return;

    try {
        const data = await fetchAdminResource("/admin/departments");
        const departments = data.departments || [];

        grid.querySelectorAll(".department-card").forEach(card => {
            const heading = card.querySelector("h3");
            if (!heading) return;

            const cardName = normalizeDepartmentName(heading.textContent);
            const department = departments.find(item =>
                normalizeDepartmentName(item.department_name) === cardName
            );

            if (!department) {
                card.setAttribute("title", "Department record not found");
                return;
            }

            card.dataset.departmentId = department.department_id;
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-label", `View ${department.department_name} report`);
            card.style.cursor = "pointer";

            if (card.dataset.reportListenerAttached === "true") return;
            card.dataset.reportListenerAttached = "true";
            card.addEventListener("click", () => departmentReport(department.department_id));
            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    departmentReport(department.department_id);
                }
            });
        });
    } catch (error) {
        console.error("Unable to connect department cards to reports:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const closeButton = document.getElementById("closeDepartmentReport");
    const searchInput = document.getElementById("departmentRequestSearch");
    const statusFilter = document.getElementById("departmentRequestStatus");

    if (closeButton) closeButton.addEventListener("click", closeDepartmentReport);
    if (searchInput) searchInput.addEventListener("input", renderDepartmentRequests);
    if (statusFilter) statusFilter.addEventListener("change", renderDepartmentRequests);

    initializeDepartmentReportCards();
});
