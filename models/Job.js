// Dependencies
const mongoose = require('mongoose');

// Define the user model for mongoose
const JobSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  bio:       { type: String, default: "", required: false },
  accessLevel: { type: Number, default: 1, required: true },
});

// export the model
module.exports = mongoose.model('Job', JobSchema);
