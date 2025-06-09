const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const subs = await Subscription.find();
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { planName, price, desc1, desc2, desc3 } = req.body;
  if (!planName || !price) return res.status(400).json({ message: 'اسم الخطة والسعر مطلوبان' });

  const newSub = new Subscription({
    planName,
    price,
    desc1: desc1 || '',
    desc2: desc2 || '',
    desc3: desc3 || '',
  });

  try {
    const saved = await newSub.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ message: 'الخطة غير موجودة' });

    res.json({ message: 'تم حذف الخطة' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'الخطة غير موجودة' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
