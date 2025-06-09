const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  planName: { type: String, required: true },
  price: { type: Number, required: true },
  desc1: { type: String },
  desc2: { type: String },
  desc3: { type: String },
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
