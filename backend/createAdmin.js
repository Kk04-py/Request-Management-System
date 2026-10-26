const bcrypt = require("bcrypt");
const db = require("./db");

async function createAdmin() {
    try {
        const name = process.env.ADMIN_NAME;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

        const hashedPassword = await bcrypt.hash(password, 10);

        const [existingAdmin] = await db.execute(
            "SELECT admin_id FROM admins WHERE email = ?",
            [email]
        );

        if (existingAdmin.length > 0) {
            console.log("Admin account already exists.");
            process.exit();
        }

        await db.execute(
            `INSERT INTO admins
            (name, email, password)
            VALUES (?, ?, ?)`,
            [name, email, hashedPassword]
        );

        console.log("Admin account created successfully.");
        console.log("Email:", email);
        console.log("Password:", password);

        process.exit();

    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
}

createAdmin();