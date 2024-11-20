// User routes for handling all CRUD functions

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all the users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error: Server error occured fetching the users' });
  }
});

// Get a single user by their id)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) {
      return res.status(404).json({ message: 'Error: User was not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Error: A server error occured fetching the user' });
  }
});

// Update a users bio by their id
router.put('/:id/bio', async (req, res) => {
  try {
    const { bio } = req.body;

    // Find user by id
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Error: User not found' });
    }

    // Update user fields
    user.bio = bio || user.bio;

    await user.save();

    res.status(200).json({ message: 'User bio updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Error: A server error occured updating the user' });
  }
});

// Update a users bio by their id
router.put('/:id/password', async (req, res) => {
  try {
    const { password } = req.body;

    // Find user by id
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Error: User not found' });
    }

    if (password) {
      // Hash new password if provided
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({ message: 'User password updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Error: A server error occured updating the user' });
  }
});

// Delete a user by their id
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Error: User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Error: A server error occured deleting the user' });
  }
});

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Function to process and save the profile picture
const processProfilePicture = async (buffer, filename) => {
  const outputPath = path.join(__dirname, '../uploads', filename);
  await sharp(buffer)
    .resize(200, 200)
    .jpeg({ quality: 80 })
    .toFile(outputPath);
  return `/uploads/${filename}`;
};

// Route to handle profile picture update
router.put('/:userId/profile-picture', upload.single('profilePicture'), async (req, res) => {
  const { userId } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Generate a unique filename
    const filename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;

    // Process and save the profile picture
    const profilePicturePath = await processProfilePicture(req.file.buffer, filename);

    // Update the user in the database
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: profilePicturePath },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ profilePicture: profilePicturePath });
  } catch (err) {
    console.error('Error updating profile picture:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Exporting the module
module.exports = router;
