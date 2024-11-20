// Authentication routes for handling user authentication.
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

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

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

// Utility function to resize and save the image using sharp
const processProfilePicture = async (fileBuffer, filename) => {
  const outputPath = `/uploads/${filename}`;
  await sharp(fileBuffer)
    .resize(200, 200) // Resize to 200x200 pixels
    .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
    .toFile(outputPath);
  return outputPath;
};

// Signup route with image upload, processing, and storage
router.post('/signup', upload.single('profilePicture'), async (req, res) => {
  const { firstName, lastName, email, password, accessLevel } = req.body;

  // Check if a profile picture was uploaded
  let profilePicturePath = null;
  if (req.file) {
    const filename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
    profilePicturePath = await processProfilePicture(req.file.buffer, filename);
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accessLevel,
      profilePicture: profilePicturePath
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error creating user:', err);
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
