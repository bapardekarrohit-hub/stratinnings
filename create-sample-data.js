require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function createSampleData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Create sample user
    const sampleUser = new User({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      performance: {
        matches: 15,
        wins: 12,
        losses: 3,
        skillLevel: "Advanced"
      }
    });

    await sampleUser.save();
    console.log("Sample user created successfully");
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createSampleData();