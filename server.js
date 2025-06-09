require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Routes
const servicesRoutes = require("./routes/services");
const trainersRoutes = require("./routes/trainers");
const testimonialsRoutes = require("./routes/testimonials");
const lastnewsRoutes = require("./routes/lastnews");
const subscriptionsRoutes = require("./routes/subscriptions");
const authRoutes = require("./routes/auth");

// Init app
const app = express();

// ✅ Middlewares
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // دعم x-www-form-urlencoded

// ✅ API Routes
app.use("/api/services", servicesRoutes);
app.use("/api/trainers", trainersRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/lastnews", lastnewsRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/auth", authRoutes);

// ✅ Self Ping لـ Replit
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
setInterval(() => {
fetch("https://3151de04-72ef-4cfe-a32e-1b7d24b3f829-00-x6mg4vwn74xx.picard.replit.dev/")
    .then(() => console.log("✅ Self-ping success"))
    .catch((err) => console.error("❌ Self-ping failed", err));
}, 1000 * 60 * 5);

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("✅ SpiderGym API is running");
});

// ✅ Upload Setup
const uploadDir = path.join(__dirname, 'uploads/trainers');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const types = /jpeg|jpg|png|gif/;
    const valid = types.test(path.extname(file.originalname).toLowerCase()) && types.test(file.mimetype);
    valid ? cb(null, true) : cb(new Error('فقط صور (jpeg/jpg/png/gif) مسموح بها'));
  }
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ✅ Auth & Admin
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

// ✅ Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'يرجى إدخال البيانات' });

  try {
    const admin = await Admin.findOne({ username });
    if (!admin || !(await bcrypt.compare(password, admin.password)))
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });

    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'تم تسجيل الدخول', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// ✅ Register Admin
app.post('/api/register-admin', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'يرجى إدخال البيانات' });

  try {
    if (await Admin.findOne({ username }))
      return res.status(400).json({ message: 'اسم المستخدم موجود مسبقاً' });

    const hash = await bcrypt.hash(password, 10);
    await new Admin({ username, password: hash }).save();
    res.json({ message: 'تم إنشاء حساب المشرف بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// ✅ Upload image
app.post('/api/trainers/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'لم يتم رفع ملف' });
  const imageUrl = `/uploads/trainers/${req.file.filename}`;
  res.json({ message: 'تم رفع الصورة', imageUrl });
});

// ✅ Protected route
app.get('/api/protected-route', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'لا يوجد توكن' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'توكن غير صالح' });
    res.json({ message: 'تم التحقق', user: decoded });
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});