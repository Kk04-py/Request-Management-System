const mysql = require("mysql2/promise");
const fs = require("fs");
require("dotenv").config();

let ssl;

if (process.env.DB_SSL_CA) {
// Render: use the CA certificate stored in environment variables
ssl = {
ca: process.env.DB_SSL_CA.replace(/\n/g, "\n"),
rejectUnauthorized: true
};
} else if (process.env.DB_SSL_CA_PATH) {
// Local computer: read the CA certificate from its file path
ssl = {
ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, "utf8"),
rejectUnauthorized: true
};
}

const pool = mysql.createPool({
host: process.env.DB_HOST,
port: Number(process.env.DB_PORT || 3306),
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME,
ssl,
waitForConnections: true,
connectionLimit: 10,
queueLimit: 0
});

pool.getConnection()
.then(connection => {
console.log("MySQL Connected Successfully");
connection.release();
})
.catch(error => {
console.error("Database Connection Failed:", error.message);
});

module.exports = pool;
