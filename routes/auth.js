// Authentication routes for handling user authentication

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Sign-in route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Debugging: Log the user data being sent back
    console.log('User data:', {
      token,
      accessLevel: user.accessLevel,
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio,
    });

    // Send back the token and the users info
    return res.status(200).json({
      token,
      accessLevel: user.accessLevel,
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, accessLevel } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accessLevel,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate the JWT
router.get('/validate', (req, res) => {
  // Get token from the header
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Error: No access token was provided!' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token validation error:', err);
      return res.status(401).json({ message: 'Error: Failed to authenticate token!' });
    }

    // if token is valid provide access
    res.status(200).json({ decoded });
  });
});

module.exports = router;
