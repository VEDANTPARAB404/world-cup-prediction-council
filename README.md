# ⚽ World Cup Prediction Council

An **Agentic Multi-Agent AI platform** that predicts FIFA World Cup outcomes using live football data, statistical analysis, and collaborative AI reasoning.

Instead of relying on a single LLM prompt, the application simulates a **panel of specialized football analysts** who debate, critique each other's conclusions, and reach a moderator-approved consensus with explainable probabilities.

---

## 🚀 Live Demo

> Coming Soon

## 📂 GitHub

https://github.com/VEDANTPARAB404/world-cup-prediction-council

---

# ✨ Features

- 🤖 Multi-Agent AI Debate System
- ⚽ Live Football-Data.org Integration
- 🧠 OpenAI GPT-4.1 Powered Reasoning
- 📊 Dynamic Tournament Probability Engine
- 🏆 Explainable AI Predictions
- 📈 Live FIFA Rankings & Team Form
- 🧩 Global Football Store with Smart Caching
- 🔄 Automatic Data Synchronization
- 🚦 Request Deduplication & Rate Limiting
- 📱 Modern Responsive UI

---

# 🏗️ Architecture

```
                   Football-Data.org API
                            │
                            ▼
                 Live Data Synchronization
                            │
                            ▼
                  Global Football Store
                            │
                            ▼
                 Statistical Analysis Layer
                            │
                            ▼
           ┌────────────────────────────────┐
           │      AI Prediction Council      │
           ├────────────────────────────────┤
           │ Stats Analyst                  │
           │ Tactical Analyst               │
           │ Squad Analyst                  │
           │ Momentum Analyst               │
           │ Risk Analyst                   │
           └────────────────────────────────┘
                            │
                    Multi-Round Debate
                            │
                            ▼
                  Moderator Consensus
                            │
                            ▼
              Final World Cup Prediction
```

---

# 🧠 Multi-Agent Workflow

The application follows an orchestrated multi-agent reasoning pipeline.

### 1️⃣ Live Data Collection

The application synchronizes:

- FIFA Rankings
- Team Form
- Recent Results
- Goal Statistics
- Elo Ratings
- Squad Information
- Tournament Standings

using **Football-Data.org**.

---

### 2️⃣ Statistical Engine

A baseline probability model evaluates every contender using:

- Elo Ratings
- Goal Difference
- Recent Form
- FIFA Ranking
- Tournament Performance

---

### 3️⃣ AI Debate Council

Instead of asking one AI model for the answer, the system creates multiple specialist perspectives.

Each agent evaluates the tournament independently.

Examples include:

- 📈 Stats Analyst
- 🎯 Tactical Analyst
- 👥 Squad Analyst
- 📊 Momentum Analyst
- ⚠️ Risk Analyst

The agents:

- present evidence
- challenge one another
- revise opinions
- defend their reasoning

across multiple debate rounds.

---

### 4️⃣ Moderator

A moderator reviews every argument and generates:

- final winner prediction
- probability distribution
- reasoning
- confidence score

---

# ⚙️ Tech Stack

### Frontend

- React
- TypeScript
- Vite

### Backend

- Node.js
- Express

### AI

- OpenAI GPT-4.1

### Sports Data

- Football-Data.org API

### State Management

- Custom Global Football Store

### Deployment

- Vercel / Render

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/VEDANTPARAB404/world-cup-prediction-council.git
```

Install dependencies

```bash
npm install
```

Create a `.env`

```env
OPENAI_API_KEY=your_openai_key
FOOTBALL_DATA_API_KEY=your_api_key
```

Run locally

```bash
npm run dev
```

---

# 📈 Performance

- Live football synchronization
- Smart caching
- Request deduplication
- API rate limiting
- Structured JSON validation
- Automatic JSON repair
- Multi-agent consensus reasoning

---

# 💡 Why Multi-Agent AI?

Traditional prediction systems rely on a single AI response.

This project instead creates a **collaborative panel of AI analysts** where different specialist agents reason from unique perspectives before reaching a moderated consensus.

The result is:

- better explainability
- transparent reasoning
- more robust predictions
- structured probability estimates

---

# 🎯 Future Improvements

- Player injury impact modelling
- Monte Carlo tournament simulations
- Historical tournament learning
- Match-level predictions
- Interactive bracket simulations
- Reinforcement learning for probability calibration

---

# 👨‍💻 Author

**Vedant Parab**

- GitHub: https://github.com/VEDANTPARAB404

---

## ⭐ Support

If you found this project interesting, consider giving it a ⭐ on GitHub!