require("dotenv").config(); // ✅ Load .env first
const express = require("express");
const path = require("path");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const connectDB = require("./db");
const User = require("./models/User"); // ✅ Correct import
const bcrypt = require("bcrypt");




 // ✅ Import User model

// ✅ Connect Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.static("public"));

// ✅ Validate API Key on startup
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY is not set in .env file");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



// ---------- User Auth ----------



// Register new user
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ 
      username, 
      email, 
      password,
      performance: {
        matches: 0,
        wins: 0,
        losses: 0,
        skillLevel: "Beginner"
      }
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Login existing user
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: "Invalid input" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid username" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});





// ---------- Role-Based Strategy ----------
app.get("/role-strategy/:role", (req, res) => {
  const { role } = req.params;
  let strategies = [];

  if (role === "midfielder") {
    strategies = ["Press high", "Quick pass", "Create space"];
  } else if (role === "keeper") {
    strategies = ["Stay back", "Watch angles", "Quick reflex saves"];
  } else {
    strategies = ["Generic positioning", "Balance attack and defense"];
  }

  res.json({ strategies });
});



// ---------- Learn From Pro ----------
app.get("/pro-scenario", (req, res) => {
  const scenarios = [
    {
      match: "India vs Australia",
      situation: "Need 6 runs in last over",
      proChoice: "Go for boundary",
      reason: "Keep pressure on bowler and finish early"
    },
    {
      match: "Brazil vs Argentina",
      situation: "Defend 1 goal lead in extra time",
      proChoice: "Maintain possession",
      reason: "Waste time and avoid risky plays"
    }
  ];
  const random = scenarios[Math.floor(Math.random() * scenarios.length)];
  res.json(random);
});



// ---------- AI Coach Bot (Gemini AI) ----------
app.post("/coach-bot", async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== "string" || question.trim() === "") {
    return res.status(400).send("❌ Invalid request: please provide a valid question.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // ✅ use correct model
    const result = await model.generateContent(question);

    // ✅ Get plain text answer
    const answer = result.response.text();

    const sanitizedAnswer = answer.replace(/<script[^>]*>.*?<\/script>/gi, '');
    res.send(sanitizedAnswer);
  } catch (err) {
    console.error("❌ Gemini API Error:", err);
    res.status(500).send("AI request failed. " + (err.message || "Unknown error"));
  }
});




// ---------- User Skill Tracker (From DB) ----------
app.get("/tracker/:username", async (req, res) => {
  try {
    const username = req.params.username;
    if (typeof username !== 'string' || username.length > 50) {
      return res.status(400).json({ error: "Invalid username" });
    }
    
    const user = await User.findOne({ username });
    if (!user) {
      // Return default stats for new users
      return res.json({
        gamesPlayed: 8,
        accuracy: "75%",
        riskTaking: "Medium",
        adaptability: "High"
      });
    }
    
    const stats = {
      gamesPlayed: user.performance.matches || 8,
      accuracy: user.performance.wins > 0 ? `${Math.round((user.performance.wins / user.performance.matches) * 100)}%` : '75%',
      riskTaking: user.performance.skillLevel || 'Medium',
      adaptability: user.performance.skillLevel || 'High'
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "❌ Tracker fetch failed", details: err.message });
  }
});

// ---------- Fallback ----------
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "Starting page.html"));
});



// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});