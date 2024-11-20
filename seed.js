// seed the database with 10 users - deletes any existing users

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job')

dotenv.config();

const saltRounds = 10;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB database');
    seedUsers();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

// Function to seed the database with sample users
async function seedUsers() {
  try {
    // Remove any existing users from the database
    await User.deleteMany({});

    await Job.deleteMany({});

    // Array of users to seed the database with
    const users = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: await bcrypt.hash('password123', saltRounds),
        bio: 'I love to code in javaScript',
        accessLevel: 1,
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@test.com',
        password: await bcrypt.hash('password123', saltRounds),
        bio: 'I don\'t like coding in javascript, but I love python!',
        accessLevel: 1,
      },
      {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@test.com',
        password: await bcrypt.hash('password123', saltRounds),
        bio: 'I love to code in Java!',
        accessLevel: 2,
      },
      {
        firstName: 'Bob',
        lastName: 'Jones',
        email: 'bob@test.com',
        password: await bcrypt.hash('password123', saltRounds),
        bio: 'C# is the superior programming language',
        accessLevel: 1,
      },
      {
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie@test.com',
        password: await bcrypt.hash('password123', saltRounds),
        bio: 'PHP is my favorite language!',
        accessLevel: 1,
      },
      {
        firstName: 'David',
        lastName: 'Lee',
        email: 'david@example.com',
        password: await bcrypt.hash('password123', saltRounds),
        bio: 'C++ is the most versitile language and its the best!',
        accessLevel: 2,
      },
      {
        firstName: 'Eve',
        lastName: 'Black',
        email: 'eve@test.com',
        password: await bcrypt.hash('password123', saltRounds),
        bio: 'real developers use TypeScript!',
        accessLevel: 1,
      },
      {
        firstName: 'Frank',
        lastName: 'White',
        email: 'frank@test.com',
        password: await bcrypt.hash('password123', saltRounds),
        bio: 'I don\'t have a favorite, all programming languages have their use case!',
        accessLevel: 2,
      },
      {
        firstName: 'Grace',
        lastName: 'Green',
        email: 'grace@test.com',
        password: await bcrypt.hash('password123', saltRounds),
        bio: 'I don\'t know anything about programming',
        accessLevel: 1,
      },
      {
        firstName: 'Hannah',
        lastName: 'Blue',
        email: 'hannah@test.com',
        password: await bcrypt.hash('password123', saltRounds),
        bio: 'I only develop in Assembly',
        accessLevel: 1,
      },
    ];

    // Insert users into database
    await User.insertMany(users);

    console.log('Users loaded into the database');
    process.exit();
  } catch (err) {
    console.error('An error has occured seeding the users:', err);
    process.exit(1);
  }
}

// export the model
module.exports = seedUsers;
