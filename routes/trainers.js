const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const Trainer = require('../models/Trainer');

router.post('/', async (req, res) => {
  try {
    const { name, specialization, imageUrl } = req.body;

    if (!name || !specialization || !imageUrl) {
      return res.status(400).json({ message: 'يرجى ملء جميع الحقول' });
    }

    const trainer = new Trainer({ name, specialization, imageUrl });
    await trainer.save();

    res.status(201).json(trainer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// تأكد من وجود مجلد uploads/trainers
const uploadDir = path.join(__dirname, '..', 'uploads', 'trainers');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// إعداد multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `trainer-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('فقط ملفات الصور مسموحة (jpeg, jpg, png, gif)'));
    }
  }
});

router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'لم يتم رفع صورة.' });
  }

router.put('/:id', async (req, res) => {
  try {
    const updated = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'المدرب غير موجود' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
  
  // بناء رابط كامل
  const fullImageUrl = `${req.protocol}://${req.get('host')}/uploads/trainers/${req.file.filename}`;
  res.json({ imageUrl: fullImageUrl });
});

router.delete('/:id', async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) return res.status(404).json({ message: 'المدرب غير موجود' });

    res.json({ message: 'تم حذف المدرب' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
