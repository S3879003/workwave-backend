const mongoose = require('mongoose');

// Define a simplified Bid Schema
const BidSchema = new mongoose.Schema({
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Define the Job Schema
const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  img: { type: String, required: true },
  jobType: { type: String, required: true },
  budget: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Client ID
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Assigned freelancer
  status: { type: String, enum: ['active', 'accepted', 'complete'], default: 'active' },
  bids: [BidSchema] // Embedded bids array
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
