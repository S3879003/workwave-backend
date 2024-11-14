const express = require('express');
const router = express.Router();

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

// Retrieves a list of a user’s postings that haven’t yet had a freelancer hired for
router.get('/:userid/listings/open', async (req, res) => {

});

// Gets a list of the offers that have been submitted for the inputted project ID
router.get('/:userid/listings/:id/bids', async (req, res) => {

});

// Updates the project with the accepted user as the allocated freelancer.
router.put('/:userid/listings/:id/accept/:userid', async (req, res) => {

});

// Allows businesses to create new projects
router.post('/:userid/listings/create', async (req, res) => {

});