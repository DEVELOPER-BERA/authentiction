require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Forgot Password Route
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = Date.now() + 3600000; // 1 hour

  db.query(
    "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
    [resetToken, resetExpires, email],
    (err, result) => {
      if (err || result.affectedRows === 0)
        return res.status(400).json({ msg: "Email not found" });

      const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
      const mailOptions = {
        to: email,
        subject: "Password Reset",
        text: `Click here to reset your password: ${resetLink}`,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) return res.status(500).json({ msg: "Error sending email" });
        res.json({ msg: "Reset link sent to email" });
      });
    }
  );
});

// Reset Password Route
app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  const hash = await bcrypt.hash(newPassword, 10);

  db.query(
    "SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?",
    [token, Date.now()],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(400).json({ msg: "Invalid or expired token" });

      db.query(
        "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
        [hash, results[0].id],
        (err) => {
          if (err) return res.status(500).json({ msg: "Error updating password" });
          res.json({ msg: "Password reset successful" });
        }
      );
    }
  );
});

// Google OAuth Redirect
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.redirect(`https://projext-session-server-a9643bc1be6b.herokuapp.com/dashboard?token=${token}`);
  }
);

// Facebook OAuth Redirect
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.redirect(`https://projext-session-server-a9643bc1be6b.herokuapp.com/dashboard?token=${token}`);
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));