const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

module.exports = mongoose.model('Trainer', TrainerSchema);
