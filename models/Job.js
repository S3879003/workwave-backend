// Dependencies
const mongoose = require('mongoose');

// Define the job model for mongoose
const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  img: { type: String, required: true },
  jobType: { type: String, required: true },
  budget: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Associate with a user
  status: { 
    type: String, 
    enum: ['active', 'accepted', 'complete'], 
    default: 'active' 
  } // Job status field with default value
}, { timestamps: true });

// Export the model
module.exports = mongoose.model('Job', JobSchema);
