const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  opinion: { type: String, required: true },
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);
