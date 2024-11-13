// User routes for handling all CRUD functions

const express = require('express');
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

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, password, bio, accessLevel } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: 'Error: A user already exists with this email address' });
    }

    // Hash the users password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      bio,
      accessLevel,
    });

    await user.save();

    res.status(201).json({ message: 'User has been created successfully' });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Error: A server error occured creating the user' });
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

// Update a user by their id
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, password, bio, accessLevel } = req.body;

    // Find user by id
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Error: User not found' });
    }

    // Update user fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.accessLevel =
      accessLevel !== undefined ? accessLevel : user.accessLevel;

    if (password) {
      // Hash new password if provided
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({ message: 'User updated successfully' });
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

// Exporting the module
module.exports = router;
