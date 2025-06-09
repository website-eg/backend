const express = require('express');
const router = express.Router();
const LastNews = require('../models/LastNews');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const news = await LastNews.find();
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { title, description, link } = req.body;
  if (!title || !description || !link) return res.status(400).json({ message: 'جميع الحقول مطلوبة' });

  const newNews = new LastNews({ title, description, link });

  try {
    const saved = await newNews.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const news = await LastNews.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ message: 'الخبر غير موجود' });

    res.json({ message: 'تم حذف الخبر' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await LastNews.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'الخبر غير موجود' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
