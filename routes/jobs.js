const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User'); // Import the User model


// Get all listed projects
router.get('/listings', async (req, res) => {

});

// Mark a job as completed
router.put('/:userid/listings/:id/complete', async (req, res) => {

});

// Deletes a job
router.delete('/delete', async (req, res) => {

});

// Retrieve list of a users active projects.
router.get('/:userid/active', async (req, res) => {

});

// Allow freelancers to bid on the target project.
router.post('/:userid/listings/:id/bid', async (req, res) => {

});

// Retrieves a list of a user’s postings that haven’t yet had a freelancer hired for it
router.get('/:userid/listings/active', async (req, res) => {
  const { userid } = req.params;

  try {
    // Find all active jobs for the specified user and populate the user details
    const activeJobs = await Job.find({ userId: userid, status: 'active' })
      .populate('userId', 'firstName lastName');

    if (!activeJobs || activeJobs.length === 0) {
      return res.status(200).json({ message: 'No active jobs found', jobs: [] });
    }

    res.status(200).json({ jobs: activeJobs });
  } catch (err) {
    console.error('Error retrieving active jobs:', err);
    res.status(500).json({ message: 'Server error: Unable to retrieve active jobs' });
  }
});


// Gets a list of the offers that have been submitted for the inputted project ID
router.get('/:userid/listings/:id/bids', async (req, res) => {

});

// Updates the project with the accepted user as the allocated freelancer.
router.put('/:userid/listings/:id/accept/:userid', async (req, res) => {

});

// Allows businesses to create new projects
router.post('/:userid/listings/create', async (req, res) => {
    const { title, description, jobType, budget, img } = req.body;
    const { userid } = req.params;
  
    try {
      // Validate that all required fields are provided
      if (!title || !description || !jobType || !budget || !img) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // Create a new job using the Job model
      const newJob = new Job({
        title,
        description,
        jobType,
        budget,
        img,
        userId: userid, // Associate the job with the user who created it
      });
  
      // Save the job to the database
      const savedJob = await newJob.save();
  
      // Send a success response
      res.status(201).json({ message: 'Job listing created successfully', job: savedJob });
    } catch (err) {
      console.error('Error creating job listing:', err);
      res.status(500).json({ message: 'Server error: Unable to create job listing' });
    }
  });

module.exports = router;
