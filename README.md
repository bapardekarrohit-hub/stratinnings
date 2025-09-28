# Stratinnings - Sports Strategy Application

## Setup Instructions

### Prerequisites
1. **Node.js** - Download and install from https://nodejs.org/
2. **MongoDB** (optional) - Download from https://www.mongodb.com/try/download/community

### Installation Steps

1. **Copy the project folder** to your new computer

2. **Install dependencies**:
   ```bash
   cd strat
   npm install
   ```

3. **Create .env file** with these contents:
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/stratinnings
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash
   ```

4. **Start the application**:
   ```bash
   node server.js
   ```

5. **Open your browser** and go to:
   ```
   http://localhost:3000
   ```

### Features
- **AI Coach Bot** - Ask tactical questions
- **Real-Time Simulation** - Practice decision making
- **Skill Tracker** - Track your performance
- **Role-Based Strategy** - Learn different positions
- **Pro Scenarios** - Learn from professional matches

### Notes
- MongoDB is optional - the app works without it
- The AI Coach requires the Gemini API key to function
- Game stats are saved locally in your browser