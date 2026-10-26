// =========================================================
// STAFF DASHBOARD
// Campus Request Management System
// =========================================================


const API_BASE =
    "https://campus-request-management-backend.onrender.com";


const staffToken =
    localStorage.getItem(
        "staffToken"
    );


let currentStaff = null;

let currentRequestId = null;

let currentRequestPage = 1;

let notificationData = [];

let staffRequests = [];

let currentTaskFilter = "New";


// =========================================================
// AUTH CHECK
// =========================================================

if (!staffToken) {

    window.location.href =
        "staff-login.html";

}


// =========================================================
// DOM READY
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeDashboard();

    }
);


// =========================================================
// INITIALIZE
// =========================================================

async function initializeDashboard() {

    try {

        injectDashboardFixStyles();

        setupNavigation();

        setupEvents();

        ensurePasswordModalCloseButton();

        await loadStaffProfile();

        await loadStaffRequests();

        await loadNotifications();

        startStaffNotificationPolling();
        
        checkFirstLogin();

        // Default analytics to ALL TIME
        setupAnalyticsRange();

        renderAnalyticsFromRequests();

    }

    catch (error) {

        console.error(
            "Dashboard initialization error:",
            error
        );

    }

}


// =========================================================
// API HELPER
// =========================================================

async function staffFetch(
    url,
    options = {}
) {

    const token =
        localStorage.getItem(
            "staffToken"
        );


    if (!token) {

        window.location.href =
            "staff-login.html";

        throw new Error(
            "Staff session expired."
        );

    }


    const headers = {

        ...(options.headers || {}),

        Authorization:
            `Bearer ${token}`

    };


    const response =
        await fetch(
            `${API_BASE}${url}`,
            {
                ...options,
                headers
            }
        );


    if (
        response.status === 401
    ) {

        localStorage.removeItem(
            "staffToken"
        );

        localStorage.removeItem(
            "staff"
        );

        localStorage.removeItem(
            "staffMustChangePassword"
        );


        window.location.href =
            "staff-login.html";


        throw new Error(
            "Staff session expired."
        );

    }


    const text =
        await response.text();


    let data;


    try {

        data =
            text
                ? JSON.parse(text)
                : {};

    }

    catch {

        throw new Error(
            `Server returned ${response.status}.`
        );

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed."
        );

    }


    return data;

}


// =========================================================
// STAFF PROFILE
// =========================================================

async function loadStaffProfile() {

    try {

        const data =
            await staffFetch(
                "/api/staff-auth/profile"
            );


        currentStaff =
            data.staff;


        localStorage.setItem(
            "staff",
            JSON.stringify(
                currentStaff
            )
        );


        updateStaffUI();

    }

    catch (error) {

        console.error(
            "Staff profile error:",
            error
        );

        // Try existing local staff information
        const savedStaff =
            localStorage.getItem(
                "staff"
            );


        if (savedStaff) {

            try {

                currentStaff =
                    JSON.parse(
                        savedStaff
                    );

                updateStaffUI();

            }

            catch {

                console.error(
                    "Unable to read saved staff information."
                );

            }

        }

    }

}


// =========================================================
// UPDATE STAFF UI
// =========================================================

function updateStaffUI() {

    if (!currentStaff) {

        return;

    }


    const firstLetter =
        (
            currentStaff.name ||
            "S"
        )
            .charAt(0)
            .toUpperCase();


    const department =
        currentStaff.department_name ||
        `Department ${currentStaff.department_id}`;


    setText(
        "headerStaffName",
        currentStaff.name
    );


    setText(
        "headerStaffDepartment",
        department
    );


    setText(
        "profileName",
        currentStaff.name
    );


    setText(
        "profileDesignation",
        currentStaff.designation ||
        "Staff Member"
    );


    setText(
        "profileStaffId",
        currentStaff.staff_id
    );


    setText(
        "profileEmail",
        currentStaff.email
    );


    setText(
        "profileDepartment",
        department
    );


    setText(
        "profileDesignationInfo",
        currentStaff.designation ||
        "—"
    );


    setText(
        "headerProfileAvatar",
        firstLetter
    );


    setText(
        "profileAvatar",
        firstLetter
    );


    setText(
        "profileStatus",
        currentStaff.status
    );

}


// =========================================================
// DASHBOARD
// =========================================================
// Dashboard statistics are calculated from the same
// departmental requests loaded for the Requests page.
// =========================================================

async function loadDashboard() {

    renderStaffDashboardFromRequests(
        staffRequests
    );

}


// =========================================================
// CALCULATE DASHBOARD STATISTICS
// =========================================================

function renderStaffDashboardFromRequests(
    requests
) {

    requests =
        Array.isArray(requests)
            ? requests
            : [];


    const totalRequests =
        requests.length;


    const newRequests =
        requests.filter(
            request =>
                request.status === "New"
        ).length;


    const acceptedRequests =
        requests.filter(
            request =>
                request.status === "Accepted"
        ).length;


    const pendingRequests =
        newRequests +
        acceptedRequests;


    const inProgressRequests =
        requests.filter(
            request =>
                request.status ===
                "In Progress"
        ).length;


    const completedRequests =
        requests.filter(
            request =>
                request.status ===
                "Completed"
        ).length;


    const rejectedRequests =
        requests.filter(
            request =>
                request.status ===
                "Rejected"
        ).length;


    const today =
        new Date();


    const todayString =
        getLocalDateString(
            today
        );


    const todayRequests =
        requests.filter(
            request =>
                getRequestDateOnly(
                    request.created_at
                ) ===
                todayString
        ).length;


    // Dashboard cards

    setText(
        "totalRequests",
        totalRequests
    );


    setText(
        "newRequests",
        newRequests
    );


    setText(
        "pendingRequests",
        pendingRequests
    );


    setText(
        "inProgressRequests",
        inProgressRequests
    );


    setText(
        "completedRequests",
        completedRequests
    );


    setText(
        "rejectedRequests",
        rejectedRequests
    );


    setText(
        "todayRequests",
        todayRequests
    );


    // My Tasks cards

    setText(
        "taskNew",
        newRequests
    );


    setText(
        "taskAccepted",
        acceptedRequests
    );


    setText(
        "taskProgress",
        inProgressRequests
    );


    setText(
        "taskCompleted",
        completedRequests
    );


    // Recent activity

    const recent =
        [...requests]
            .sort(
                (
                    a,
                    b
                ) =>
                    getDateValue(
                        b.updated_at ||
                        b.created_at
                    ) -
                    getDateValue(
                        a.updated_at ||
                        a.created_at
                    )
            )
            .slice(
                0,
                5
            );


    renderRecentRequests(
        recent
    );


    // My Tasks work queue

    renderStaffWorkQueue(
        requests
    );

}


// =========================================================
// RECENT REQUESTS
// =========================================================

function renderRecentRequests(
    requests
) {

    const body =
        document.getElementById(
            "recentRequestsBody"
        );


    if (!body) {

        return;

    }


    if (
        !requests ||
        requests.length === 0
    ) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-cell">

                    No recent requests.

                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        requests.map(
            request => `

                <tr>

                    <td>
                        <strong>
                            #${request.request_id}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            request.student_name ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            request.subject ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${statusBadge(
                            request.status
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            request.updated_at ||
                            request.created_at
                        )}
                    </td>

                </tr>

            `
        ).join("");

}


// =========================================================
// REQUEST TYPES
// =========================================================
// Request types are now created from the actual
// departmental request data.
// =========================================================

async function loadRequestTypes() {

    const select =
        getFirstElement([
            "requestTypeFilter",
            "staffRequestTypeFilter"
        ]);


    if (!select) {

        return;

    }


    const types =
        [
            ...new Set(
                staffRequests
                    .map(
                        request =>
                            request.request_type
                    )
                    .filter(Boolean)
            )
        ]
            .sort();


    select.innerHTML = `

        <option value="">
            All Types
        </option>

    `;


    types.forEach(
        type => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                type;


            option.textContent =
                type;


            select.appendChild(
                option
            );

        }
    );

}


// =========================================================
// STAFF TOKEN
// =========================================================

function getStaffToken() {

    return localStorage.getItem(
        "staffToken"
    );

}


// =========================================================
// LOAD STAFF REQUESTS
// =========================================================

async function loadStaffRequests() {

    const tableBody =
        document.getElementById(
            "staffRequestsBody"
        );


    if (tableBody) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="no-data">

                    Loading requests...

                </td>

            </tr>

        `;

    }


    try {

        const data =
            await staffFetch(
                "/api/staff/requests"
            );


        staffRequests =
            Array.isArray(
                data.requests
            )
                ? data.requests
                : [];

currentTaskFilter = "New";

renderStaffWorkQueue(
    staffRequests
);
        // Request filter types

        await loadRequestTypes();


        // Requests table

        loadRequests(
            1
        );


        // Dashboard

        renderStaffDashboardFromRequests(
            staffRequests
        );


        // Analytics

        renderAnalyticsFromRequests();


    }

    catch (error) {

        console.error(
            "Staff Requests Error:",
            error
        );


        if (tableBody) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="no-data">

                        Unable to load requests.

                    </td>

                </tr>

            `;

        }

    }

}


// =========================================================
// LOAD / FILTER REQUESTS
// =========================================================

async function loadRequests(
    page = 1
) {

    currentRequestPage =
        page;


    const filtered =
        getFilteredRequests();


    renderStaffRequests(
        filtered
    );


    renderPagination({
        page: 1,
        totalPages: 1
    });

}


// =========================================================
// FILTER REQUESTS
// =========================================================

function getFilteredRequests() {

    let requests =
        [...staffRequests];


    const searchInput =
        getFirstElement([
            "requestSearch",
            "staffRequestSearch"
        ]);


    const statusInput =
        getFirstElement([
            "requestStatusFilter",
            "staffRequestStatusFilter"
        ]);


    const typeInput =
        getFirstElement([
            "requestTypeFilter",
            "staffRequestTypeFilter"
        ]);


    const dateInput =
        getFirstElement([
            "requestDate",
            "requestDateFilter",
            "staffRequestDateFilter"
        ]);


    const sortInput =
        getFirstElement([
            "requestSort",
            "staffRequestSort"
        ]);


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        statusInput
            ? statusInput.value
            : "";


    const type =
        typeInput
            ? typeInput.value
            : "";


    const date =
        dateInput
            ? dateInput.value
            : "";


    if (search) {

        requests =
            requests.filter(
                request => {

                    const searchable = `

                        ${request.request_id || ""}

                        ${request.student_name || ""}

                        ${request.roll_number || ""}

                        ${request.request_type || ""}

                        ${request.subject || ""}

                        ${request.status || ""}

                    `
                        .toLowerCase();


                    return searchable.includes(
                        search
                    );

                }
            );

    }


    if (status) {

        requests =
            requests.filter(
                request =>
                    request.status ===
                    status
            );

    }


    if (type) {

        requests =
            requests.filter(
                request =>
                    request.request_type ===
                    type
            );

    }


    // One date calendar

    if (date) {

        requests =
            requests.filter(
                request =>
                    getRequestDateOnly(
                        request.created_at
                    ) ===
                    date
            );

    }


    const sort =
        sortInput
            ? sortInput.value
            : "newest";


    requests.sort(
        (
            a,
            b
        ) => {

            const dateA =
                getDateValue(
                    a.created_at
                );


            const dateB =
                getDateValue(
                    b.created_at
                );


            if (
                sort === "oldest"
            ) {

                return dateA -
                    dateB;

            }


            return dateB -
                dateA;

        }
    );


    return requests;

}


// =========================================================
// RENDER REQUESTS
// =========================================================

function renderStaffRequests(
    requests
) {

    const tableBody =
        document.getElementById(
            "staffRequestsBody"
        );


    if (!tableBody) {

        return;

    }


    if (
        !requests ||
        requests.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="no-data">

                    No requests found for your department.

                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        requests.map(
            request => `

                <tr>

                    <td>
                        #${request.request_id}
                    </td>


                    <td>

                        <strong>

                            ${escapeHtml(
                                request.student_name ||
                                "-"
                            )}

                        </strong>

                    </td>


                    <td>

                        ${escapeHtml(
                            request.roll_number ||
                            "-"
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            request.request_type ||
                            "-"
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            request.subject ||
                            "-"
                        )}

                    </td>


                    <td>

                        <span
                            class="
                                status-badge
                                ${getStaffStatusClass(
                                    request.status
                                )}
                            ">

                            ${escapeHtml(
                                request.status ||
                                "-"
                            )}

                        </span>

                    </td>


                    <td>

                        ${formatStaffDate(
                            request.created_at
                        )}

                    </td>


                    <td>

                       <button
    type="button"
    class="table-action"
    onclick="openStaffRequest(${request.request_id})"
>
    View
</button>

                    </td>

                </tr>

            `
        ).join("");

}

// =========================================================
// VIEW REQUEST DETAILS
// =========================================================

function viewRequest(requestId) {

    const request =
        staffRequests.find(
            item =>
                Number(item.request_id) ===
                Number(requestId)
        );

    if (!request) {

        alert("Request details not found.");

        return;

    }

    console.log(
        "Request selected:",
        request
    );

}

// =========================================================
// PAGINATION
// =========================================================

function renderPagination(
    pagination
) {

    const container =
        document.getElementById(
            "requestPagination"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (
        !pagination ||
        pagination.totalPages <= 1
    ) {

        return;

    }


    for (
        let i = 1;
        i <= pagination.totalPages;
        i++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.textContent =
            i;


        if (
            i === pagination.page
        ) {

            button.classList.add(
                "active"
            );

        }


        button.addEventListener(
            "click",
            () => {

                loadRequests(
                    i
                );

            }
        );


        container.appendChild(
            button
        );

    }

}


// =========================================================
// OPEN REQUEST
// =========================================================

async function openRequest(
    requestId
) {

    currentRequestId =
        requestId;


    try {

        let request =
            staffRequests.find(
                item =>
                    Number(
                        item.request_id
                    ) ===
                    Number(
                        requestId
                    )
            );


        // Try API for complete request details

        try {

            const data =
                await staffFetch(
                    `/api/staff/requests/${requestId}`
                );


            if (
                data.request
            ) {

                request =
                    data.request;

            }


            if (
                data.timeline
            ) {

                renderTimeline(
                    data.timeline
                );

            }

        }

        catch (detailError) {

            console.warn(
                "Detailed request endpoint unavailable. Using loaded request data.",
                detailError
            );

        }


        if (!request) {

            throw new Error(
                "Request details could not be found."
            );

        }


        setText(
            "modalRequestTitle",
            `Request #${request.request_id}`
        );


        setText(
            "modalStudentName",
            request.student_name
        );


        setText(
            "modalRollNumber",
            request.roll_number
        );


        setText(
            "modalDepartment",
            request.department_name ||
            currentStaff?.department_name ||
            "-"
        );


        setText(
            "modalRequestType",
            request.request_type
        );


        setText(
            "modalCreatedAt",
            formatDate(
                request.created_at
            )
        );


        setText(
            "modalUpdatedAt",
            formatDate(
                request.updated_at
            )
        );


        setText(
            "modalSubject",
            request.subject
        );


        setText(
            "modalDescription",
            request.description
        );


        const responseInput =
            document.getElementById(
                "modalResponse"
            );


        if (responseInput) {

            responseInput.value =
                request.staff_response ||
                "";

        }


        const statusSelect =
            document.getElementById(
                "modalStatus"
            );


        if (statusSelect) {

            updateModalStatusOptions(
                request.status
            );

        }


        setText(
            "modalMessage",
            ""
        );


        const modal =
            document.getElementById(
                "requestModal"
            );


        if (modal) {

            modal.classList.add(
                "show"
            );

        }

    }

    catch (error) {

        alert(
            error.message
        );

    }

}


// Alias used by the View button

function openStaffRequest(
    requestId
) {

    openRequest(
        requestId
    );

}


// =========================================================
// STATUS OPTIONS
// =========================================================

function updateModalStatusOptions(
    currentStatus
) {

    const select =
        document.getElementById(
            "modalStatus"
        );


    if (!select) {

        return;

    }


    const transitions = {

        New: [
            "New",
            "Accepted",
            "Rejected"
        ],

        Accepted: [
            "Accepted",
            "In Progress",
            "Rejected"
        ],

        "In Progress": [
            "In Progress",
            "Completed",
            "Rejected"
        ],

        Completed: [
            "Completed"
        ],

        Rejected: [
            "Rejected"
        ]

    };


    const allowed =
        transitions[
            currentStatus
        ] || [
            currentStatus
        ];


    select.innerHTML =
        allowed.map(
            status => `

                <option
                    value="${escapeHtml(
                        status
                    )}">

                    ${escapeHtml(
                        status
                    )}

                </option>

            `
        ).join("");


    select.value =
        currentStatus;

}


// =========================================================
// SAVE REQUEST
// =========================================================

async function saveRequest() {

    if (!currentRequestId) {

        return;

    }


    const statusElement =
        document.getElementById(
            "modalStatus"
        );


    const responseElement =
        document.getElementById(
            "modalResponse"
        );


    const message =
        document.getElementById(
            "modalMessage"
        );


    if (!statusElement) {

        return;

    }


    const status =
        statusElement.value;


    const staffResponse =
        responseElement
            ? responseElement.value.trim()
            : "";


    if (message) {

        message.textContent =
            "";

    }


    const confirmed =
        confirm(
            "Are you sure you want to save this request update?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const data =
            await staffFetch(
                `/api/staff/requests/${currentRequestId}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            status,

                            staff_response:
                                staffResponse

                        })

                }
            );


        if (message) {

            message.style.color =
                "var(--success)";


            message.textContent =
                data.message ||
                "Request updated successfully.";

        }


        // Reload the complete departmental request list

        await loadStaffRequests();


        await loadNotifications();


        setTimeout(
            () => {

                closeRequestModal();

            },
            700
        );

    }

    catch (error) {

        if (message) {

            message.style.color =
                "var(--danger)";


            message.textContent =
                error.message;

        }

    }

}


// =========================================================
// TIMELINE
// =========================================================

function renderTimeline(
    timeline
) {

    const container =
        document.getElementById(
            "modalTimeline"
        );


    if (!container) {

        return;

    }


    if (
        !timeline ||
        timeline.length === 0
    ) {

        container.innerHTML = `

            <p
                style="
                    color:var(--muted);
                    font-size:11px;
                ">

                No timeline activity yet.

            </p>

        `;

        return;

    }


    container.innerHTML = `

        <h3
            style="
                font-size:13px;
                margin:0 0 15px;
            ">

            Request Timeline

        </h3>

        ${timeline.map(
            item => `

                <div
                    class="timeline-item">

                    <strong>

                        ${escapeHtml(
                            item.action
                        )}

                    </strong>

                    <span>

                        ${item.staff_name
                            ? escapeHtml(
                                item.staff_name
                            )
                            : "System"}

                        ·

                        ${formatDate(
                            item.created_at
                        )}

                    </span>

                    ${
                        item.response
                            ? `

                                <p>

                                    ${escapeHtml(
                                        item.response
                                    )}

                                </p>

                            `
                            : ""
                    }

                </div>

            `
        ).join("")}

    `;

}


// =========================================================
// CLOSE REQUEST MODAL
// =========================================================

function closeRequestModal() {

    const modal =
        document.getElementById(
            "requestModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    currentRequestId =
        null;

}


// =========================================================
// NOTIFICATIONS
// =========================================================

async function loadNotifications() {

    try {

        const data =
            await staffFetch(
                "/api/notifications/staff"
            );


        notificationData =
            data.notifications ||
            [];


        renderNotifications();

    }

    catch (error) {

        console.error(
            "Notification error:",
            error
        );

    }

}

// =========================================================
// AUTOMATIC STAFF NOTIFICATION REFRESH
// =========================================================

let staffNotificationInterval = null;


function startStaffNotificationPolling() {

    // Prevent duplicate intervals
    if (staffNotificationInterval) {

        clearInterval(
            staffNotificationInterval
        );

    }


    // Check immediately
    loadNotifications();


    // Check for new notifications every 5 seconds
    staffNotificationInterval =
        setInterval(
            () => {

                if (
                    !document.hidden
                ) {

                    loadNotifications();

                }

            },
            5000
        );

}

// =========================================================
// RENDER NOTIFICATIONS
// =========================================================

function renderNotifications() {

    const unread =
        notificationData.filter(
            notification =>
                !notification.is_read
        ).length;


    updateNotificationBadge(
        unread
    );


    const dropdown =
        document.getElementById(
            "notificationList"
        );


    const fullList =
        document.getElementById(
            "fullNotificationList"
        );


    const html =
        notificationData.length === 0

            ? `

                <div
                    class="empty-notification">

                    No notifications.

                </div>

            `

            :

            notificationData.map(
                notification => `

                    <div
                        class="
                            notification-item
                            ${
                                notification.is_read
                                    ? ""
                                    : "unread"
                            }
                        "
                        onclick="
                            handleNotification(
                                ${notification.id},
                                ${notification.request_id}
                            )
                        ">

                        <p>

                            ${escapeHtml(
                                notification.message
                            )}

                        </p>

                        <small>

                            ${formatDate(
                                notification.created_at
                            )}

                        </small>

                    </div>

                `
            ).join("");


    if (dropdown) {

        dropdown.innerHTML =
            html;

    }


    if (fullList) {

        fullList.innerHTML =
            html;

    }

}


// =========================================================
// NOTIFICATION BADGE
// =========================================================

function updateNotificationBadge(
    count
) {

    const badge =
        document.getElementById(
            "notificationBadge"
        );


    const sidebarBadge =
        document.getElementById(
            "sidebarNotificationBadge"
        );


    if (count > 0) {

        if (badge) {

            badge.textContent =
                count;

            badge.classList.remove(
                "hidden"
            );

        }


        if (sidebarBadge) {

            sidebarBadge.textContent =
                count;

            sidebarBadge.classList.remove(
                "hidden"
            );

        }

    }

    else {

        if (badge) {

            badge.classList.add(
                "hidden"
            );

        }


        if (sidebarBadge) {

            sidebarBadge.classList.add(
                "hidden"
            );

        }

    }

}


// =========================================================
// HANDLE NOTIFICATION
// =========================================================

async function handleNotification(
    notificationId,
    requestId
) {

    try {

        await staffFetch(
            `/api/notifications/${notificationId}/read`,
            {
                method: "PUT"
            }
        );


        await loadNotifications();


        if (requestId) {

            showSection(
                "requests"
            );


            await openRequest(
                requestId
            );

        }

    }

    catch (error) {

        console.error(
            error
        );

    }

}


// =========================================================
// MARK ALL READ
// =========================================================

async function markAllNotificationsRead() {

    try {

        await staffFetch(
            "/api/notifications/staff/read-all",
            {
                method: "PUT"
            }
        );


        await loadNotifications();

    }

    catch (error) {

        console.error(
            error
        );

    }

}


// =========================================================
// ANALYTICS RANGE
// =========================================================

function setupAnalyticsRange() {

    const select =
        document.getElementById(
            "analyticsRange"
        );


    if (!select) {

        return;

    }


    // Make sure All Time exists

    let allTime =
        select.querySelector(
            'option[value="all"]'
        );


    if (!allTime) {

        allTime =
            document.createElement(
                "option"
            );


        allTime.value =
            "all";


        allTime.textContent =
            "All Time";


        select.insertBefore(
            allTime,
            select.firstChild
        );

    }


    // ALL TIME is the default

    select.value =
        "all";

}


// =========================================================
// ANALYTICS
// =========================================================

async function loadAnalytics() {

    renderAnalyticsFromRequests();

}


// =========================================================
// RENDER ANALYTICS FROM REQUESTS
// =========================================================

function renderAnalyticsFromRequests() {

    let requests = [
        ...staffRequests
    ];


    // =====================================================
    // ANALYTICS RANGE
    // =====================================================

    const rangeSelect =
        document.getElementById(
            "analyticsRange"
        );


    const range =
        rangeSelect
            ? rangeSelect.value
            : "all";


    if (range !== "all") {

        const days =
            Number(range);


        if (
            [7, 30, 90].includes(days)
        ) {

            const cutoff =
                Date.now() -
                (
                    days *
                    24 *
                    60 *
                    60 *
                    1000
                );


            requests =
                requests.filter(
                    request =>
                        getDateValue(
                            request.created_at
                        ) >= cutoff
                );

        }

    }


    // =====================================================
    // BASIC COUNTS
    // =====================================================

    const total =
        requests.length;


    const completed =
        requests.filter(
            request =>
                request.status ===
                "Completed"
        );


    const completedCount =
        completed.length;


    const completionRate =
        total > 0
            ? (
                completedCount /
                total
            ) * 100
            : 0;


    // =====================================================
    // KPI CARDS
    // =====================================================

    setText(
        "analyticsRequests",
        total
    );


    setText(
        "analyticsCompleted",
        completedCount
    );


    setText(
        "analyticsCompletionRate",
        `${completionRate.toFixed(1)}%`
    );


    // =====================================================
    // PROCESSING TIME
    // =====================================================

    const processingTimes =
        completed
            .map(
                request => {

                    const created =
                        getDateValue(
                            request.created_at
                        );


                    const updated =
                        getDateValue(
                            request.updated_at ||
                            request.created_at
                        );


                    if (
                        !created ||
                        !updated ||
                        updated < created
                    ) {

                        return null;

                    }


                    return (
                        (
                            updated -
                            created
                        ) /
                        60000
                    );

                }
            )
            .filter(
                value =>
                    value !== null &&
                    !Number.isNaN(
                        value
                    )
            );


    let averageMinutes = null;

    let fastestMinutes = null;

    let slowestMinutes = null;


    if (
        processingTimes.length > 0
    ) {

        const totalMinutes =
            processingTimes.reduce(
                (
                    sum,
                    value
                ) =>
                    sum + value,
                0
            );


        averageMinutes =
            totalMinutes /
            processingTimes.length;


        fastestMinutes =
            Math.min(
                ...processingTimes
            );


        slowestMinutes =
            Math.max(
                ...processingTimes
            );

    }


    setText(
        "analyticsAverageTime",
        formatMinutes(
            averageMinutes
        )
    );


    setText(
        "averageProcessing",
        formatMinutes(
            averageMinutes
        )
    );


    setText(
        "fastestProcessing",
        formatMinutes(
            fastestMinutes
        )
    );


    setText(
        "slowestProcessing",
        formatMinutes(
            slowestMinutes
        )
    );


    // =====================================================
    // STATUS DISTRIBUTION
    // =====================================================

    const statusCounts = {

        New:
            requests.filter(
                request =>
                    request.status ===
                    "New"
            ).length,


        Accepted:
            requests.filter(
                request =>
                    request.status ===
                    "Accepted"
            ).length,


        "In Progress":
            requests.filter(
                request =>
                    request.status ===
                    "In Progress"
            ).length,


        Completed:
            requests.filter(
                request =>
                    request.status ===
                    "Completed"
            ).length,


        Rejected:
            requests.filter(
                request =>
                    request.status ===
                    "Rejected"
            ).length

    };


    renderStatusPieChart(
        statusCounts
    );


    // =====================================================
    // REQUEST TYPES
    // =====================================================

    const typeCounts = {};


    requests.forEach(
        request => {

            const type =
                request.request_type ||
                "Other";


            typeCounts[type] =
                (
                    typeCounts[type] ||
                    0
                ) + 1;

        }
    );


    const typeData =
        Object.entries(
            typeCounts
        )
            .map(
                ([
                    request_type,
                    total
                ]) => ({

                    request_type,

                    total

                })
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.total -
                    a.total
            );


    renderBarList(
        "typeAnalytics",
        typeData,
        "request_type"
    );


    // =====================================================
    // PEAK REQUEST HOURS
    // =====================================================

    const hourCounts = {};


    requests.forEach(
        request => {

            const date =
                parseDatabaseDate(
                    request.created_at
                );


            if (!date) {

                return;

            }


            const hour =
                date.getHours();


            hourCounts[hour] =
                (
                    hourCounts[hour] ||
                    0
                ) + 1;

        }
    );


    const peakHours =
        Object.entries(
            hourCounts
        )
            .map(
                ([
                    hour,
                    total
                ]) => ({

                    hour:
                        Number(hour),

                    total

                })
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.total -
                    a.total
            );


    renderPeakHours(
        peakHours
    );


    // =====================================================
    // RECENTLY COMPLETED
    // =====================================================

    const recentlyCompleted =
        completed
            .sort(
                (
                    a,
                    b
                ) =>
                    getDateValue(
                        b.updated_at ||
                        b.created_at
                    ) -
                    getDateValue(
                        a.updated_at ||
                        a.created_at
                    )
            )
            .slice(
                0,
                5
            );


    renderCompleted(
        recentlyCompleted
    );


    // =====================================================
    // REQUEST TREND
    // =====================================================

    const dailyData = {};


    requests.forEach(
        request => {

            const date =
                getRequestDateOnly(
                    request.created_at
                );


            if (!date) {

                return;

            }


            dailyData[date] =
                (
                    dailyData[date] ||
                    0
                ) + 1;

        }
    );


    const dailyTrend =
        Object.entries(
            dailyData
        )
            .sort(
                (
                    a,
                    b
                ) =>
                    a[0].localeCompare(
                        b[0]
                    )
            )
            .map(
                ([
                    date,
                    total
                ]) => ({

                    date,

                    total

                })
            );


    drawTrendChart(
        dailyTrend
    );

}


// =========================================================
// STATUS PIE CHART
// =========================================================

function renderStatusPieChart(
    statusCounts
) {

    const chart =
        document.getElementById(
            "statusPieChart"
        );


    const totalElement =
        document.getElementById(
            "statusPieTotal"
        );


    const legend =
        document.getElementById(
            "statusPieLegend"
        );


    // =====================================================
    // CHECK ELEMENTS
    // =====================================================

    if (!chart) {

        console.error(
            "statusPieChart element not found."
        );

        return;

    }


    if (!totalElement) {

        console.error(
            "statusPieTotal element not found."
        );

        return;

    }


    if (!legend) {

        console.error(
            "statusPieLegend element not found."
        );

        return;

    }


    // =====================================================
    // STATUS DATA
    // =====================================================

    const statuses = [

        {
            name: "New",

            value:
                Number(
                    statusCounts.New
                ) || 0,

            color: "#49648d"
        },


        {
            name: "Accepted",

            value:
                Number(
                    statusCounts.Accepted
                ) || 0,

            color: "#b99790"
        },


        {
            name: "In Progress",

            value:
                Number(
                    statusCounts["In Progress"]
                ) || 0,

            color: "#c9ada7"
        },


        {
            name: "Completed",

            value:
                Number(
                    statusCounts.Completed
                ) || 0,

            color: "#287d55"
        },


        {
            name: "Rejected",

            value:
                Number(
                    statusCounts.Rejected
                ) || 0,

            color: "#a84650"
        }

    ];


    const total =
        statuses.reduce(
            (
                sum,
                item
            ) =>
                sum + item.value,
            0
        );


    // =====================================================
    // FORCE CORRECT PIE CHART DIMENSIONS
    // =====================================================

    chart.style.width =
        "190px";

    chart.style.height =
        "190px";

    chart.style.minWidth =
        "190px";

    chart.style.minHeight =
        "190px";

    chart.style.maxWidth =
        "190px";

    chart.style.maxHeight =
        "190px";

    chart.style.borderRadius =
        "50%";

    chart.style.position =
        "relative";

    chart.style.flexShrink =
        "0";

    chart.style.display =
        "flex";

    chart.style.alignItems =
        "center";

    chart.style.justifyContent =
        "center";

    chart.style.background =
        "#e7e1df";

    chart.style.overflow =
        "hidden";


    // =====================================================
    // TOTAL IN CENTER OF PIE
    // =====================================================

    totalElement.style.position =
        "absolute";

    totalElement.style.top =
        "50%";

    totalElement.style.left =
        "50%";

    totalElement.style.transform =
        "translate(-50%, -50%)";

    totalElement.style.width =
        "105px";

    totalElement.style.height =
        "105px";

    totalElement.style.borderRadius =
        "50%";

    totalElement.style.background =
        "#ffffff";

    totalElement.style.display =
        "flex";

    totalElement.style.flexDirection =
        "column";

    totalElement.style.alignItems =
        "center";

    totalElement.style.justifyContent =
        "center";

    totalElement.style.textAlign =
        "center";

    totalElement.style.fontSize =
        "24px";

    totalElement.style.fontWeight =
        "800";

    totalElement.style.color =
        "#20213d";

    totalElement.style.lineHeight =
        "1.1";

    totalElement.style.zIndex =
        "2";

    totalElement.style.boxShadow =
        "0 2px 8px rgba(32, 33, 61, 0.08)";


    // =====================================================
    // TOTAL TEXT
    // =====================================================

    totalElement.innerHTML = `

        <strong
            style="
                font-size:26px;
                font-weight:800;
                color:#20213d;
            "
        >
            ${total}
        </strong>

        <span
            style="
                display:block;
                margin-top:4px;
                font-size:12px;
                font-weight:600;
                color:#8d91a4;
            "
        >
            Requests
        </span>

    `;


    // =====================================================
    // NO REQUESTS
    // =====================================================

    if (total === 0) {

        chart.style.background =
            "#e7e1df";


        legend.innerHTML = `

            <div
                class="status-pie-empty"
                style="
                    color:#8d91a4;
                    font-size:13px;
                    padding:10px 0;
                "
            >

                No requests available.

            </div>

        `;

        return;

    }


    // =====================================================
    // CREATE PIE SEGMENTS
    // =====================================================

    let currentPercentage =
        0;


    const segments = [];


    statuses.forEach(
        item => {

            if (
                item.value <= 0
            ) {

                return;

            }


            const percentage =
                (
                    item.value /
                    total
                ) * 100;


            const start =
                currentPercentage;


            const end =
                currentPercentage +
                percentage;


            segments.push(
                `${item.color} ${start}% ${end}%`
            );


            currentPercentage =
                end;

        }
    );


    chart.style.background =
        `conic-gradient(
            ${segments.join(", ")}
        )`;


    // =====================================================
    // LEGEND
    // =====================================================

    legend.innerHTML =
        statuses
            .filter(
                item =>
                    item.value > 0
            )
            .map(
                item => {

                    const percentage =
                        (
                            item.value /
                            total
                        ) * 100;


                    return `

                        <div
                            class="status-pie-legend-item"
                            style="
                                display:flex;
                                align-items:center;
                                gap:9px;
                                margin-bottom:12px;
                            "
                        >

                            <span
                                class="status-pie-legend-dot"
                                style="
                                    width:10px;
                                    height:10px;
                                    min-width:10px;
                                    border-radius:50%;
                                    background:${item.color};
                                    display:block;
                                "
                            ></span>


                            <span
                                class="status-pie-legend-name"
                                style="
                                    flex:1;
                                    font-size:13px;
                                    color:#20213d;
                                "
                            >

                                ${escapeHtml(
                                    item.name
                                )}

                            </span>


                            <strong
                                class="status-pie-legend-value"
                                style="
                                    font-size:13px;
                                    color:#20213d;
                                "
                            >

                                ${item.value}

                                <small
                                    style="
                                        color:#8d91a4;
                                        font-weight:600;
                                    "
                                >
                                    (${percentage.toFixed(0)}%)
                                </small>

                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

}

// =========================================================
// BAR LIST
// =========================================================

function renderBarList(
    elementId,
    data,
    labelKey
) {

    const container =
        document.getElementById(
            elementId
        );


    if (!container) {

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML =
            `

                <p
                    style="
                        color:var(--muted);
                        font-size:11px;
                    ">

                    No data available.

                </p>

            `;

        return;

    }


    const max =
        Math.max(
            ...data.map(
                item =>
                    Number(
                        item.total
                    )
            ),
            1
        );


    container.innerHTML =
        data.map(
            item => {

                const value =
                    Number(
                        item.total
                    );


                const percentage =
                    (
                        value /
                        max
                    ) *
                    100;


                return `

                    <div
                        class="bar-item">

                        <div
                            class="bar-label">

                            <span>

                                ${escapeHtml(
                                    item[labelKey]
                                )}

                            </span>

                            <strong>

                                ${value}

                            </strong>

                        </div>


                        <div
                            class="bar-track">

                            <div
                                class="bar-fill"
                                style="
                                    width:${percentage}%;
                                ">

                            </div>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// =========================================================
// PEAK HOURS
// =========================================================

function renderPeakHours(
    hours
) {

    const container =
        getFirstElement([
            "peakHours",
            "staffPeakHours"
        ]);


    if (!container) {

        return;

    }


    if (
        !hours ||
        hours.length === 0
    ) {

        container.innerHTML =
            `

                <span
                    style="
                        color:var(--muted);
                        font-size:11px;
                    ">

                    No request data available.

                </span>

            `;

        return;

    }


    container.innerHTML =
        hours
            .slice(
                0,
                6
            )
            .map(
                item => `

                    <div
                        class="peak-hour">

                        ${formatHour(
                            item.hour
                        )}

                        ·

                        ${item.total}

                        ${item.total === 1
                            ? "request"
                            : "requests"}

                    </div>

                `
            )
            .join("");

}


// =========================================================
// COMPLETED
// =========================================================

function renderCompleted(
    requests
) {

    const container =
        getFirstElement([
            "recentCompleted",
            "recentlyCompleted",
            "staffRecentlyCompleted"
        ]);


    if (!container) {

        return;

    }


    if (
        !requests ||
        requests.length === 0
    ) {

        container.innerHTML =
            `

                <p
                    style="
                        color:var(--muted);
                        font-size:11px;
                        padding:15px;
                    ">

                    No completed requests yet.

                </p>

            `;

        return;

    }


    container.innerHTML =
        requests.map(
            request => `

                <div
                    class="completed-item">

                    <div>

                        <strong>

                            #${request.request_id}

                            ·

                            ${escapeHtml(
                                request.subject ||
                                "-"
                            )}

                        </strong>

                        <span>

                            ${escapeHtml(
                                request.student_name ||
                                "-"
                            )}

                        </span>

                    </div>

                    <span>

                        ${formatDate(
                            request.updated_at ||
                            request.created_at
                        )}

                    </span>

                </div>

            `
        ).join("");

}


// =========================================================
// SIMPLE CANVAS LINE CHART
// =========================================================

function drawTrendChart(
    data
) {

    const canvas =
        document.getElementById(
            "requestTrendChart"
        );


    if (!canvas) {

        return;

    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    const width =
        canvas.clientWidth ||
        600;


    const height =
        180;


    const ratio =
        window.devicePixelRatio ||
        1;


    canvas.width =
        width *
        ratio;


    canvas.height =
        height *
        ratio;


    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    if (
        !data ||
        data.length === 0
    ) {

        ctx.fillStyle =
            "#8d91a4";

        ctx.font =
            "12px Arial";

        ctx.fillText(
            "No trend data available.",
            20,
            40
        );

        return;

    }


    const values =
        data.map(
            item =>
                Number(
                    item.total
                )
        );


    const max =
        Math.max(
            ...values,
            1
        );


    const padding =
        25;


    const chartWidth =
        width -
        padding *
        2;


    const chartHeight =
        height -
        padding *
        2;


    // Grid

    ctx.strokeStyle =
        "#e7e1df";

    ctx.lineWidth =
        1;


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            padding +
            (
                chartHeight *
                i /
                4
            );


        ctx.beginPath();

        ctx.moveTo(
            padding,
            y
        );

        ctx.lineTo(
            width -
            padding,
            y
        );

        ctx.stroke();

    }


    // Line

    ctx.strokeStyle =
        "#20213d";

    ctx.lineWidth =
        2;


    ctx.beginPath();


    data.forEach(
        (
            item,
            index
        ) => {

            const x =
                padding +
                (
                    data.length === 1
                        ? chartWidth / 2
                        : (
                            index /
                            (
                                data.length -
                                1
                            )
                        ) *
                        chartWidth
                );


            const y =
                padding +
                chartHeight -
                (
                    Number(
                        item.total
                    ) /
                    max
                ) *
                chartHeight;


            if (
                index === 0
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            }

            else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }
    );


    ctx.stroke();


    // Points

    ctx.fillStyle =
        "#b99790";


    data.forEach(
        (
            item,
            index
        ) => {

            const x =
                padding +
                (
                    data.length === 1
                        ? chartWidth / 2
                        : (
                            index /
                            (
                                data.length -
                                1
                            )
                        ) *
                        chartWidth
                );


            const y =
                padding +
                chartHeight -
                (
                    Number(
                        item.total
                    ) /
                    max
                ) *
                chartHeight;


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );

}


// =========================================================
// MY TASKS
// =========================================================

function renderStaffWorkQueue(
    requests
) {

  const container =
    document.getElementById(
        "taskSummary"
    );

    if (!container) {

        return;

    }


    const filtered =
        requests.filter(
            request =>
                request.status ===
                currentTaskFilter
        );


    if (
        filtered.length === 0
    ) {

        container.innerHTML = `

            <div
                style="
                    padding:22px;
                    color:#8d91a4;
                    text-align:left;
                ">

                No
                ${escapeHtml(
                    currentTaskFilter
                )}
                requests at the moment.

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div
            style="
                width:100%;
                overflow-x:auto;
            ">

            <table
                style="
                    width:100%;
                    border-collapse:collapse;
                ">

                <thead>

                    <tr>

                        <th
                            style="
                                text-align:left;
                                padding:12px;
                            ">

                            ID

                        </th>

                        <th
                            style="
                                text-align:left;
                                padding:12px;
                            ">

                            Student

                        </th>

                        <th
                            style="
                                text-align:left;
                                padding:12px;
                            ">

                            Type

                        </th>

                        <th
                            style="
                                text-align:left;
                                padding:12px;
                            ">

                            Subject

                        </th>

                        <th
                            style="
                                text-align:left;
                                padding:12px;
                            ">

                            Created

                        </th>

                        <th
                            style="
                                text-align:right;
                                padding:12px;
                            ">

                            Action

                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${filtered.map(
                        request => `

                            <tr>

                                <td
                                    style="
                                        padding:12px;
                                    ">

                                    <strong>
                                        #${request.request_id}
                                    </strong>

                                </td>

                                <td
                                    style="
                                        padding:12px;
                                    ">

                                    ${escapeHtml(
                                        request.student_name ||
                                        "-"
                                    )}

                                </td>

                                <td
                                    style="
                                        padding:12px;
                                    ">

                                    ${escapeHtml(
                                        request.request_type ||
                                        "-"
                                    )}

                                </td>

                                <td
                                    style="
                                        padding:12px;
                                    ">

                                    ${escapeHtml(
                                        request.subject ||
                                        "-"
                                    )}

                                </td>

                                <td
                                    style="
                                        padding:12px;
                                    ">

                                    ${formatStaffDate(
                                        request.created_at
                                    )}

                                </td>

                                <td
                                    style="
                                        padding:12px;
                                        text-align:right;
                                    ">

                                    <button
                                        type="button"
                                        class="view-request-btn"
                                        onclick="openStaffRequest(${request.request_id})">

                                        View

                                    </button>

                                </td>

                            </tr>

                        `
                    ).join("")}

                </tbody>

            </table>

        </div>

    `;

}


// =========================================================
// OPEN TASK CATEGORY
// =========================================================

function openTaskCategory(
    status
) {

    currentTaskFilter =
        status;


    renderStaffWorkQueue(
        staffRequests
    );

}


// =========================================================
// PASSWORD MODAL
// =========================================================

function checkFirstLogin() {

    const mustChange =
        localStorage.getItem(
            "staffMustChangePassword"
        );


    if (
        mustChange === "1" ||
        mustChange === "true"
    ) {

        openPasswordModal(
            true
        );

    }

}


// =========================================================
// ENSURE PASSWORD CROSS BUTTON
// =========================================================

function ensurePasswordModalCloseButton() {

    const modal =
        document.getElementById(
            "passwordModal"
        );


    if (!modal) {

        return;

    }


    if (
        modal.querySelector(
            ".staff-password-close"
        )
    ) {

        return;

    }


    modal.style.position =
        "fixed";


    const closeButton =
        document.createElement(
            "button"
        );


    closeButton.type =
        "button";


    closeButton.className =
        "staff-password-close";


    closeButton.innerHTML =
        "&times;";


    closeButton.setAttribute(
        "aria-label",
        "Close password window"
    );


    closeButton.title =
        "Close";


    closeButton.addEventListener(
        "click",
        closePasswordModal
    );


    modal.appendChild(
        closeButton
    );

}


// =========================================================
// OPEN PASSWORD MODAL
// =========================================================

function openPasswordModal(
    firstLogin = false
) {

    const modal =
        document.getElementById(
            "passwordModal"
        );


    if (!modal) {

        return;

    }


    ensurePasswordModalCloseButton();


    const description =
        document.getElementById(
            "passwordModalDescription"
        );


    if (
        firstLogin
    ) {

        if (description) {

            description.textContent =
                "This is your first login. Please change the temporary password before continuing.";

        }

    }

    else {

        if (description) {

            description.textContent =
                "Create a strong new password for your staff account.";

        }

    }


    // Clear old messages

    const message =
        document.getElementById(
            "passwordChangeMessage"
        );


    const match =
        document.getElementById(
            "passwordMatch"
        );


    const strengthText =
        document.getElementById(
            "strengthText"
        );


    if (message) {

        message.textContent =
            "";

    }


    if (match) {

        match.textContent =
            "";

        match.className =
            "password-match";

    }


    if (strengthText) {

        strengthText.textContent =
            "";

    }


    modal.classList.add(
        "show"
    );

}


// =========================================================
// CLOSE PASSWORD MODAL
// =========================================================

function closePasswordModal() {

    const modal =
        document.getElementById(
            "passwordModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "show"
    );


    const form =
        document.getElementById(
            "changePasswordForm"
        );


    if (form) {

        form.reset();

    }


    const message =
        document.getElementById(
            "passwordChangeMessage"
        );


    const match =
        document.getElementById(
            "passwordMatch"
        );


    const strengthText =
        document.getElementById(
            "strengthText"
        );


    if (message) {

        message.textContent =
            "";

    }


    if (match) {

        match.textContent =
            "";

        match.className =
            "password-match";

    }


    if (strengthText) {

        strengthText.textContent =
            "";

    }


    const bar =
        document.getElementById(
            "strengthBar"
        );


    if (bar) {

        bar.style.setProperty(
            "--strength-width",
            "0%"
        );

    }

}


// =========================================================
// CHANGE PASSWORD
// =========================================================

async function changePassword(
    event
) {

    event.preventDefault();


    const currentPasswordElement =
        document.getElementById(
            "currentPassword"
        );


    const newPasswordElement =
        document.getElementById(
            "newPassword"
        );


    const confirmPasswordElement =
        document.getElementById(
            "confirmPassword"
        );


    const message =
        document.getElementById(
            "passwordChangeMessage"
        );


    if (
        !currentPasswordElement ||
        !newPasswordElement ||
        !confirmPasswordElement
    ) {

        return;

    }


    const currentPassword =
        currentPasswordElement.value;


    const newPassword =
        newPasswordElement.value;


    const confirmPassword =
        confirmPasswordElement.value;


    if (message) {

        message.style.color =
            "var(--danger)";


        message.textContent =
            "";

    }


    if (!currentPassword) {

        showPasswordMessage(
            "Please enter your current password."
        );

        return;

    }


    if (!newPassword) {

        showPasswordMessage(
            "Please enter a new password."
        );

        return;

    }


    if (!confirmPassword) {

        showPasswordMessage(
            "Please confirm your new password."
        );

        return;

    }


    if (
        newPassword !==
        confirmPassword
    ) {

        showPasswordMessage(
            "Passwords do not match."
        );

        return;

    }


    const strength =
        getPasswordStrength(
            newPassword
        );


    if (
        strength < 4
    ) {

        showPasswordMessage(
            "Please use a stronger password."
        );

        return;

    }


    try {

        const data =
            await staffFetch(
                "/api/staff-auth/change-password",
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            currentPassword,

                            newPassword,

                            confirmPassword

                        })

                }
            );


        if (message) {

            message.style.color =
                "var(--success)";


            message.textContent =
                data.message ||
                "Password changed successfully.";

        }


        localStorage.setItem(
            "staffMustChangePassword",
            "0"
        );


        const form =
            document.getElementById(
                "changePasswordForm"
            );


        if (form) {

            form.reset();

        }


        updatePasswordStrength();

        updatePasswordMatch();


        setTimeout(
            () => {

                closePasswordModal();

            },
            1000
        );

    }

    catch (error) {

        showPasswordMessage(
            error.message
        );

    }

}


// =========================================================
// PASSWORD MESSAGE
// =========================================================

function showPasswordMessage(
    message
) {

    const element =
        document.getElementById(
            "passwordChangeMessage"
        );


    if (!element) {

        return;

    }


    element.style.color =
        "var(--danger)";


    element.textContent =
        message;

}


// =========================================================
// PASSWORD STRENGTH
// =========================================================

function getPasswordStrength(
    password
) {

    let score =
        0;


    if (
        password.length >= 8
    ) {

        score++;

    }


    if (
        /[A-Z]/.test(
            password
        )
    ) {

        score++;

    }


    if (
        /[a-z]/.test(
            password
        )
    ) {

        score++;

    }


    if (
        /[0-9]/.test(
            password
        )
    ) {

        score++;

    }


    if (
        /[^A-Za-z0-9]/.test(
            password
        )
    ) {

        score++;

    }


    return score;

}


// =========================================================
// UPDATE PASSWORD STRENGTH
// =========================================================

function updatePasswordStrength() {

    const input =
        document.getElementById(
            "newPassword"
        );


    const bar =
        document.getElementById(
            "strengthBar"
        );


    const text =
        document.getElementById(
            "strengthText"
        );


    if (
        !input
    ) {

        return;

    }


    const password =
        input.value;


    // IMPORTANT:
    // Empty password should not show Strong

    if (
        !password
    ) {

        if (bar) {

            bar.style.setProperty(
                "--strength-width",
                "0%"
            );

        }


        if (text) {

            text.textContent =
                "";

        }


        return;

    }


    const strength =
        getPasswordStrength(
            password
        );


    const widths = [

        "0%",

        "20%",

        "40%",

        "60%",

        "80%",

        "100%"

    ];


    const labels = [

        "",

        "Very weak",

        "Weak",

        "Fair",

        "Good",

        "Strong"

    ];


    if (bar) {

        bar.style.setProperty(
            "--strength-width",
            widths[strength]
        );

    }


    if (text) {

        text.textContent =
            labels[strength];

    }

}


// =========================================================
// UPDATE PASSWORD MATCH
// =========================================================

function updatePasswordMatch() {

    const passwordElement =
        document.getElementById(
            "newPassword"
        );


    const confirmElement =
        document.getElementById(
            "confirmPassword"
        );


    const element =
        document.getElementById(
            "passwordMatch"
        );


    if (
        !passwordElement ||
        !confirmElement ||
        !element
    ) {

        return;

    }


    const password =
        passwordElement.value;


    const confirm =
        confirmElement.value;


    // Do not show "match" for empty fields

    if (
        !password ||
        !confirm
    ) {

        element.textContent =
            "";

        element.className =
            "password-match";

        return;

    }


    if (
        password ===
        confirm
    ) {

        element.textContent =
            "✓ Passwords match.";


        element.className =
            "password-match valid";

    }

    else {

        element.textContent =
            "Passwords do not match.";


        element.className =
            "password-match invalid";

    }

}


// =========================================================
// NAVIGATION
// =========================================================

function setupNavigation() {

    document
        .querySelectorAll(
            ".staff-nav-item"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const section =
                            button.dataset.section;


                        showSection(
                            section
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-section-target]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        showSection(
                            button.dataset
                                .sectionTarget
                        );

                    }
                );

            }
        );

}


// =========================================================
// SHOW SECTION
// =========================================================

async function showSection(
    section
) {

    document
        .querySelectorAll(
            ".staff-nav-item"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.section ===
                    section
                );

            }
        );


    document
        .querySelectorAll(
            ".staff-section"
        )
        .forEach(
            element => {

                element.classList.toggle(
                    "active",
                    element.id ===
                    `section-${section}`
                );

            }
        );


    const titles = {

        dashboard:
            [
                "Dashboard",
                "Overview of your department requests"
            ],

        requests:
            [
                "Requests",
                "Search and process departmental requests"
            ],

        tasks:
            [
                "My Tasks",
                "Your department's current work queue"
            ],

        analytics:
            [
                "Analytics",
                "Department request analytics"
            ],

        notifications:
            [
                "Notifications",
                "Request-related updates"
            ],

        profile:
            [
                "Profile",
                "Staff account information"
            ]

    };


    const title =
        titles[section];


    if (title) {

        setText(
            "pageTitle",
            title[0]
        );


        setText(
            "pageSubtitle",
            title[1]
        );

    }


    if (
        section ===
        "analytics"
    ) {

        renderAnalyticsFromRequests();

    }


    if (
        section ===
        "tasks"
    ) {

        renderStaffWorkQueue(
            staffRequests
        );

    }


    if (
        section ===
        "notifications"
    ) {

        await loadNotifications();

    }

}


// =========================================================
// EVENTS
// =========================================================

function setupEvents() {

    // -----------------------------------------------------
    // Notifications
    // -----------------------------------------------------

    document
        .getElementById(
            "notificationButton"
        )
        ?.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                document
                    .getElementById(
                        "notificationDropdown"
                    )
                    ?.classList.toggle(
                        "show"
                    );

            }
        );


    document.addEventListener(
        "click",
        event => {

            const wrapper =
                document.querySelector(
                    ".staff-notification-wrapper"
                );


            if (
                wrapper &&
                !wrapper.contains(
                    event.target
                )
            ) {

                document
                    .getElementById(
                        "notificationDropdown"
                    )
                    ?.classList.remove(
                        "show"
                    );

            }

        }
    );


    document
        .getElementById(
            "markAllNotificationsRead"
        )
        ?.addEventListener(
            "click",
            markAllNotificationsRead
        );


    document
        .getElementById(
            "pageMarkAllRead"
        )
        ?.addEventListener(
            "click",
            markAllNotificationsRead
        );


    // -----------------------------------------------------
    // Request modal
    // -----------------------------------------------------

    document
        .getElementById(
            "closeRequestModal"
        )
        ?.addEventListener(
            "click",
            closeRequestModal
        );


    document
        .getElementById(
            "cancelRequestModal"
        )
        ?.addEventListener(
            "click",
            closeRequestModal
        );


    document
        .getElementById(
            "saveRequestButton"
        )
        ?.addEventListener(
            "click",
            saveRequest
        );


    // -----------------------------------------------------
    // Logout
    // -----------------------------------------------------

    document
        .getElementById(
            "logoutButton"
        )
        ?.addEventListener(
            "click",
            logoutStaff
        );


    // -----------------------------------------------------
    // Header profile
    // -----------------------------------------------------

    document
        .getElementById(
            "headerProfileButton"
        )
        ?.addEventListener(
            "click",
            () => {

                showSection(
                    "profile"
                );

            }
        );


    // -----------------------------------------------------
    // Change password
    // -----------------------------------------------------

    document
        .getElementById(
            "profileChangePassword"
        )
        ?.addEventListener(
            "click",
            () => {

                openPasswordModal(
                    false
                );

            }
        );


    document
        .getElementById(
            "changePasswordForm"
        )
        ?.addEventListener(
            "submit",
            changePassword
        );


    document
        .getElementById(
            "newPassword"
        )
        ?.addEventListener(
            "input",
            () => {

                updatePasswordStrength();

                updatePasswordMatch();

            }
        );


    document
        .getElementById(
            "confirmPassword"
        )
        ?.addEventListener(
            "input",
            updatePasswordMatch
        );


    // -----------------------------------------------------
    // Analytics
    // -----------------------------------------------------

    document
        .getElementById(
            "analyticsRange"
        )
        ?.addEventListener(
            "change",
            loadAnalytics
        );


    // -----------------------------------------------------
    // Request filters
    // -----------------------------------------------------

    const filterIds = [

        "requestStatusFilter",

        "requestTypeFilter",

        "requestDate",

        "requestDateFilter",

        "staffRequestStatusFilter",

        "staffRequestTypeFilter",

        "staffRequestDateFilter",

        "requestSort"

    ];


    filterIds.forEach(
        id => {

            document
                .getElementById(id)
                ?.addEventListener(
                    "change",
                    () => {

                        loadRequests(
                            1
                        );

                    }
                );

        }
    );


    let searchTimer;


    const searchInput =
        getFirstElement([
            "requestSearch",
            "staffRequestSearch"
        ]);


    searchInput
        ?.addEventListener(
            "input",
            () => {

                clearTimeout(
                    searchTimer
                );


                searchTimer =
                    setTimeout(
                        () => {

                            loadRequests(
                                1
                            );

                        },
                        250
                    );

            }
        );


    // -----------------------------------------------------
    // Reset filters
    // -----------------------------------------------------

    document
        .getElementById(
            "resetRequestFilters"
        )
        ?.addEventListener(
            "click",
            resetRequestFilters
        );


    document
        .getElementById(
            "staffRequestReset"
        )
        ?.addEventListener(
            "click",
            resetRequestFilters
        );


    // -----------------------------------------------------
    // Task cards
    // -----------------------------------------------------

    document
        .querySelectorAll(
            ".task-card"
        )
        .forEach(
            (
                card,
                index
            ) => {

                // Existing data attribute wins

                let status =
                    card.dataset.taskStatus;


                // If not present, assign based on
                // the four task cards

                if (!status) {

                    const statuses = [

                        "New",

                        "Accepted",

                        "In Progress",

                        "Completed"

                    ];


                    status =
                        statuses[index];

                    card.dataset.taskStatus =
                        status;

                }


                card.addEventListener(
                    "click",
                    () => {

                        currentTaskFilter =
                            status;


                        showSection(
                            "tasks"
                        );


                        renderStaffWorkQueue(
                            staffRequests
                        );

                    }
                );

            }
        );

}


// =========================================================
// RESET REQUEST FILTERS
// =========================================================

function resetRequestFilters() {

    const search =
        getFirstElement([
            "requestSearch",
            "staffRequestSearch"
        ]);


    const status =
        getFirstElement([
            "requestStatusFilter",
            "staffRequestStatusFilter"
        ]);


    const type =
        getFirstElement([
            "requestTypeFilter",
            "staffRequestTypeFilter"
        ]);


    const date =
        getFirstElement([
            "requestDate",
            "requestDateFilter",
            "staffRequestDateFilter"
        ]);


    const sort =
        getFirstElement([
            "requestSort",
            "staffRequestSort"
        ]);


    if (search) {

        search.value =
            "";

    }


    if (status) {

        status.value =
            "";

    }


    if (type) {

        type.value =
            "";

    }


    if (date) {

        date.value =
            "";

    }


    if (sort) {

        sort.value =
            "newest";

    }


    loadRequests(
        1
    );

}


// =========================================================
// LOGOUT
// =========================================================

function logoutStaff() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {

        return;

    }


    localStorage.removeItem(
        "staffToken"
    );


    localStorage.removeItem(
        "staff"
    );


    localStorage.removeItem(
        "staffMustChangePassword"
    );


    window.location.href =
        "staff-login.html";

}


// =========================================================
// CSS FIXES
// =========================================================
// These are injected from JS so you do not need to make
// another CSS edit just for the date field and password X.
// =========================================================

function injectDashboardFixStyles() {

    if (
        document.getElementById(
            "staffDashboardFixStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "staffDashboardFixStyles";


    style.textContent = `

        /* =========================================
           DATE FILTER
           ========================================= */

        #requestDate,
        #requestDateFilter,
        #staffRequestDateFilter {

            height: 48px !important;

            min-height: 48px !important;

            width: 100% !important;

            min-width: 180px !important;

            box-sizing: border-box !important;

            padding: 0 14px !important;

            border: 1px solid #e7e1df !important;

            border-radius: 10px !important;

            background: #ffffff !important;

            color: #20213d !important;

            font-family:
                "Segoe UI",
                Arial,
                sans-serif !important;

            font-size: 14px !important;

            outline: none !important;

        }


        #requestDate:focus,
        #requestDateFilter:focus,
        #staffRequestDateFilter:focus {

            border-color:
                #b99790 !important;

            box-shadow:
                0 0 0 3px
                rgba(185,151,144,0.12) !important;

        }


        /* =========================================
           PASSWORD MODAL CLOSE BUTTON
           ========================================= */

        .staff-password-close {

            position: absolute !important;

            top: 18px !important;

            right: 20px !important;

            width: 38px !important;

            height: 38px !important;

            border: none !important;

            border-radius: 50% !important;

            background: #f1e6e2 !important;

            color: #20213d !important;

            font-size: 27px !important;

            line-height: 34px !important;

            cursor: pointer !important;

            display: flex !important;

            align-items: center !important;

            justify-content: center !important;

            z-index: 50 !important;

            transition:
                0.2s ease !important;

        }


        .staff-password-close:hover {

            background: #e7d8d3 !important;

            transform: scale(1.05) !important;

        }


        /* =========================================
           PASSWORD MESSAGES
           ========================================= */

        #passwordChangeMessage:empty,
        #passwordMatch:empty,
        #strengthText:empty {

            display: none !important;

        }


        /* =========================================
           TASK QUEUE
           ========================================= */

        #workQueueContent,
        #workQueue,
        #taskWorkQueue,
        #myTasksQueue {

            min-height: 80px;

        }


        /* =========================================
           ANALYTICS PIE CHART AREA
           ========================================= */

        #statusAnalytics {

            min-height: 180px;

        }


        /* =========================================
           PROFILE TEXT
           ========================================= */

        #section-profile
        .profile-name,
        #section-profile
        #profileName {

            font-size: 25px !important;

            font-weight: 800 !important;

        }


        #section-profile
        .profile-designation,
        #section-profile
        #profileDesignation {

            font-size: 16px !important;

            font-weight: 600 !important;

        }


        #section-profile
        .profile-details,
        #section-profile
        .profile-info {

            font-size: 14px !important;

        }

    `;


    document.head.appendChild(
        style
    );

}


// =========================================================
// HELPERS
// =========================================================

function getFirstElement(
    ids
) {

    for (
        const id of ids
    ) {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            return element;

        }

    }


    return null;

}


// =========================================================
// SET TEXT
// =========================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ??
            "—";

    }

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(
    value
) {

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


// Existing function name compatibility

function escapeStaffHTML(
    value
) {

    return escapeHtml(
        value
    );

}


// =========================================================
// PARSE DATABASE DATE
// =========================================================

function parseDatabaseDate(
    value
) {

    if (!value) {

        return null;

    }


    if (
        value instanceof Date
    ) {

        return value;

    }


    let stringValue =
        String(
            value
        );


    // MySQL:
    // 2026-09-26 23:27:00

    if (
        stringValue.includes(
            " "
        ) &&
        !stringValue.includes(
            "T"
        )
    ) {

        stringValue =
            stringValue.replace(
                " ",
                "T"
            );

    }


    const date =
        new Date(
            stringValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


// =========================================================
// DATE VALUE
// =========================================================

function getDateValue(
    value
) {

    const date =
        parseDatabaseDate(
            value
        );


    return date
        ? date.getTime()
        : 0;

}


// =========================================================
// DATE ONLY
// =========================================================

function getRequestDateOnly(
    value
) {

    const date =
        parseDatabaseDate(
            value
        );


    if (!date) {

        return "";

    }


    return [

        date.getFullYear(),

        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ),

        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )

    ].join(
        "-"
    );

}


// =========================================================
// LOCAL DATE STRING
// =========================================================

function getLocalDateString(
    date
) {

    return [

        date.getFullYear(),

        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ),

        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )

    ].join(
        "-"
    );

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(
    date
) {

    if (!date) {

        return "—";

    }


    const parsed =
        parseDatabaseDate(
            date
        );


    if (!parsed) {

        return String(
            date
        );

    }


    return parsed.toLocaleString(
        "en-IN",
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


// Existing function name compatibility

function formatStaffDate(
    date
) {

    return formatDate(
        date
    );

}


// =========================================================
// FORMAT MINUTES
// =========================================================

function formatMinutes(
    minutes
) {

    if (
        minutes === null ||
        minutes === undefined ||
        Number.isNaN(
            Number(minutes)
        )
    ) {

        return "—";

    }


    const value =
        Number(
            minutes
        );


    if (
        value < 60
    ) {

        return `${Math.round(value)} min`;

    }


    const hours =
        Math.floor(
            value / 60
        );


    const remaining =
        Math.round(
            value % 60
        );


    if (
        remaining === 0
    ) {

        return `${hours} hr`;

    }


    return `${hours} hr ${remaining} min`;

}


// =========================================================
// FORMAT HOUR
// =========================================================

function formatHour(
    hour
) {

    const h =
        Number(
            hour
        );


    const suffix =
        h >= 12
            ? "PM"
            : "AM";


    const display =
        h % 12 ||
        12;


    return `${display} ${suffix}`;

}


// =========================================================
// STATUS CLASS
// =========================================================

function getStaffStatusClass(
    status
) {

    return String(
        status || ""
    )
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );

}


// =========================================================
// STATUS BADGE
// =========================================================

function statusBadge(
    status
) {

    const className =
        getStaffStatusClass(
            status
        );


    return `

        <span
            class="status-badge ${className}">

            ${escapeHtml(
                status
            )}

        </span>

    `;

}