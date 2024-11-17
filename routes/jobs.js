const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User'); // Import the User model


// Get all listed active projects
router.get('/listings/active', async (req, res) => {
  try {
    // Fetch all jobs with status 'active'
    const activeJobs = await Job.find({ status: 'active' }).populate('userId', 'firstName lastName');

    // Check if there are no active jobs
    if (!activeJobs || activeJobs.length === 0) {
      return res.status(200).json({ message: 'No active jobs found', jobs: [] });
    }

    // Return the list of active jobs
    res.status(200).json({ jobs: activeJobs });
  } catch (err) {
    console.error('Error retrieving active jobs:', err);
    res.status(500).json({ message: 'Server error: Unable to retrieve active jobs' });
  }
});

module.exports = router;

// Mark a job as completed
router.put('/:userid/listings/:id/complete', async (req, res) => {
  const { userid, id } = req.params;

  try {
    // Find the job by its ID and ensure the user is the owner
    const job = await Job.findOne({ _id: id, userId: userid });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or you do not have permission to complete this job.' });
    }

    // Update the job status to "complete"
    job.status = 'complete';
    await job.save();

    res.status(200).json({ message: 'Job marked as complete' });
  } catch (err) {
    console.error('Error marking job as complete:', err);
    res.status(500).json({ message: 'Server error: Unable to complete job' });
  }
});

// Deletes a job
router.delete('/:userid/listings/:id/delete', async (req, res) => {
  const { userid, id } = req.params;

  try {
    // Find the job by its ID and ensure the user is the owner
    const job = await Job.findOneAndDelete({ _id: id, userId: userid });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or you do not have permission to delete this job.' });
    }

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(500).json({ message: 'Server error: Unable to delete job' });
  }
});

// Retrieve list of ongoing projects for a user.
router.get('/:userid/ongoing', async (req, res) => {
  const { userid } = req.params;

  try {
    // Fetch projects where the user is either the client or the freelancer, and the status is "accepted"
    const projects = await Job.find({
      $or: [{ userId: userid }, { freelancerId: userid }],
      status: 'accepted'
    }).populate('userId', 'firstName lastName')
      .populate('freelancerId', 'firstName lastName');

    if (!projects) {
      return res.status(404).json({ message: 'No ongoing projects found' });
    }

    res.status(200).json({ projects });
  } catch (err) {
    console.error('Error fetching ongoing projects:', err);
    res.status(500).json({ message: 'Server error: Unable to fetch projects' });
  }
});

// Allow freelancers to bid on the target project
router.post('/:userid/listings/:id/bid', async (req, res) => {
  const { userid, id } = req.params; // userid: Freelancer's ID, id: Job's ID
  const { amount } = req.body; // The bid amount

  try {
    // Validate bid amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid bid amount' });
    }

    // Check if the user exists and is a freelancer
    const user = await User.findById(userid);
    if (!user || user.accessLevel !== 1) { // Assuming accessLevel 1 is for freelancers
      return res.status(403).json({ message: 'Access denied: Only freelancers can place bids' });
    }

    // Find the job by ID
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the freelancer has already placed a bid on this job
    const existingBid = job.bids.find(bid => bid.freelancerId.toString() === userid);
    if (existingBid) {
      return res.status(400).json({ message: 'You have already placed a bid on this job' });
    }

    // Add the bid to the job's bids array
    const newBid = {
      freelancerId: userid,
      amount,
      createdAt: new Date(),
    };
    job.bids.push(newBid);

    // Save the updated job
    await job.save();

    res.status(201).json({ message: 'Bid placed successfully', job });
  } catch (err) {
    console.error('Error placing bid:', err);
    res.status(500).json({ message: 'Server error: Unable to place bid' });
  }
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
  const { userid, id } = req.params;

  try {
    // Fetch the job by its ID and populate the freelancer details in bids
    const job = await Job.findById(id)
      .populate('bids.freelancerId', 'firstName lastName')
      .exec();

    // Check if the job exists
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log('Populated bids:', job.bids);

    // Ensure that the user requesting the bids is the owner of the job
    if (job.userId.toString() !== userid) {
      return res.status(403).json({ message: 'Access denied: You do not own this job' });
    }

    // Return the list of bids for the job
    res.status(200).json({ bids: job.bids });
  } catch (err) {
    console.error('Error retrieving bids:', err);
    res.status(500).json({ message: 'Server error: Unable to retrieve bids' });
  }
});

// Updates the project with the accepted user as the allocated freelancer.
router.put('/:userid/listings/:jobId/accept/:freelancerId', async (req, res) => {
  const { userid, jobId, freelancerId } = req.params;

  try {
    // Fetch the job by its ID
    const job = await Job.findById(jobId);

    // Check if the job exists
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Ensure that the user requesting the update is the owner of the job
    if (job.userId.toString() !== userid) {
      return res.status(403).json({ message: 'Access denied: You do not own this job' });
    }

    // Check if the freelancer ID is valid and present in the job's bids
    const bidExists = job.bids.some(bid => bid.freelancerId.toString() === freelancerId);
    if (!bidExists) {
      return res.status(400).json({ message: 'The selected freelancer did not place a bid on this job' });
    }

    // Update the job with the accepted freelancer and change the status
    job.freelancerId = freelancerId;
    job.status = 'accepted';

    // Save the updated job
    const updatedJob = await job.save();

    res.status(200).json({ message: 'Freelancer accepted successfully', job: updatedJob });
  } catch (err) {
    console.error('Error accepting freelancer:', err);
    res.status(500).json({ message: 'Server error: Unable to accept freelancer' });
  }
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
