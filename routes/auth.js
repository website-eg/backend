const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Schema
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

// تسجيل دخول
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "يرجى إدخال اسم المستخدم وكلمة المرور." });
  }

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة." });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة." });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "تم تسجيل الدخول بنجاح", token });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ في الخادم." });
  }
});

// إنشاء مشرف جديد
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "يرجى إدخال اسم المستخدم وكلمة المرور." });
  }

  try {
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "اسم المستخدم موجود بالفعل." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashed });
    await newAdmin.save();

    res.json({ message: "تم إنشاء حساب المشرف بنجاح." });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ في الخادم." });
  }
});

module.exports = router;
