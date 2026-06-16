const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const ADMIN_EMAIL = "admin@vjcinvoice.com";
const ADMIN_PASSWORD = "VJCInvoice@2024";
const JWT_SECRET = process.env.JWT_SECRET || "vjc_invoice_secret_2024";

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = jwt.sign(
    { email, name: "Mani", role: "admin" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    token,
    user: { email, name: "Mani", role: "admin" },
  });
});

router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
});

module.exports = router;
