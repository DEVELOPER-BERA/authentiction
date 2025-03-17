require("dotenv").config();
const mysql = require("mysql2");

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1); // Stop execution if DB connection fails
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

module.exports = db;
