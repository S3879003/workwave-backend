// Main server file that sets up the required middleware and access to endpoints
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
var cors = require('cors')

dotenv.config();

// import the application routes
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

// initialize the express app
const app = express();

// Use CORS with options
app.use(cors())

// setup the middleware
app.use(bodyParser.json());

// setup the API routes
app.use('/user', userRoutes);
app.use('/auth', authRoutes);

// connect to the Mongo database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connection to the MongoDB database successful');
  })
  .catch((err) => {
    console.error('Error: Failed to connect to the Database', err);
  });


// start the server
const PORT = 8888;

const server = app.listen(PORT, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Server is running at http://${host === '::' ? 'localhost' : host}:${port}`);
});
