// Dependencies
const mongoose = require('mongoose');

// Define the job model for mongoose
const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  img: { type: String, required: true },
  jobType: { type: String, required: true },
  budget: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The client who posted the job
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // The freelancer accepted for the job
  status: { 
    type: String, 
    enum: ['active', 'accepted', 'complete'], 
    default: 'active' 
  },
}, { timestamps: true });

// Export the model
module.exports = mongoose.model('Job', JobSchema);
