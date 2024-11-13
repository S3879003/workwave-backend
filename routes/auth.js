// Authentication routes for handling user authentication

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email)
    console.log(password)

    // Find user by the submitted email
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: 'Authentication error: Email is invalid!' });
    }

    // Compare the password with the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: 'Authentication error: Password is invalid!' });
    }

    // Generate the JWT
    const payload = {
      userId: user._id,
      accessLevel: user.accessLevel,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token });
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(500).json({ message: 'A server error occurred during sign in' });
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
