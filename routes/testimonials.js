const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, opinion } = req.body;
  if (!name || !opinion) return res.status(400).json({ message: 'جميع الحقول مطلوبة' });

  const newTestimonial = new Testimonial({ name, opinion });

  try {
    const saved = await newTestimonial.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'الرأي غير موجود' });

    res.json({ message: 'تم حذف الرأي' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
