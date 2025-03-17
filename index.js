require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("./oauth"); // Import OAuth strategies
const verifyToken = require("./auth-middleware");

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) console.error("Database connection error:", err);
  else console.log("Connected to MySQL database");
});

// **User Registration**
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword],
    (err) => {
      if (err) return res.status(400).json({ msg: "Email already exists" });
      res.json({ msg: "User registered successfully" });
    }
  );
});

// **User Login**
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ msg: "Invalid credentials" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  });
});

// **Protected Route (Requires Token)**
app.get("/dashboard", verifyToken, (req, res) => {
  res.json({ msg: "Welcome to the protected dashboard", userId: req.userId });
});

// **OAuth Google Authentication**
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.redirect(`https://projext-session-server-a9643bc1be6b.herokuapp.com/dashboard?token=${token}`);
  }
);

// **OAuth Facebook Authentication**
app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.redirect(`https://projext-session-server-a9643bc1be6b.herokuapp.com/dashboard?token=${token}`);
  }
);

// **User Logout**
app.post("/logout", (req, res) => {
  res.json({ msg: "Logout successful" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
