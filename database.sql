USE campus_request_management;
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
);
INSERT INTO departments (department_name)
VALUES
('Engineering'),
('Hotel Management'),
('Pharmacy'),
('Management and Technology');

CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    department_id INT,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

CREATE TABLE staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

CREATE TABLE requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    department_id INT NOT NULL,
    request_type VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('New', 'Accepted', 'Rejected', 'In Progress', 'Completed') DEFAULT 'New',
    staff_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

CREATE TABLE request_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_staff_id INT,
    response TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(request_id),
    FOREIGN KEY (changed_by_staff_id) REFERENCES staff(staff_id)
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    request_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'request_update',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE,

    FOREIGN KEY (request_id)
        REFERENCES requests(request_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
describe admins;
SELECT admin_id, name, email, created_at
FROM admins;
show tables;

SELECT COUNT(*) AS total_students
FROM students;

SELECT * FROM departments;
DESCRIBE departments;

SHOW CREATE TABLE departments;
SELECT * FROM requests;

SELECT * FROM staff;

DESCRIBE notifications;
SELECT * FROM notifications LIMIT 5;

SELECT *
FROM notifications
ORDER BY created_at DESC
LIMIT 10;

DESCRIBE staff;

ALTER TABLE staff
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Active';

DESCRIBE staff;

SELECT *
FROM notifications
ORDER BY created_at DESC
LIMIT 10;

SELECT *
FROM requests
ORDER BY request_id DESC
LIMIT 5;

ALTER TABLE notifications
    MODIFY COLUMN student_id INT NULL,
    ADD COLUMN admin_id INT NULL,
    ADD COLUMN staff_id INT NULL;