# 🏆 World Cup Prediction Council

An **Agentic AI-powered** full-stack web application that predicts FIFA World Cup outcomes using **multi-agent orchestration**, live football data synchronization, and AI consensus reasoning.

Instead of relying on a single AI response, the application simulates a council of specialist AI analysts that independently analyze teams, debate their conclusions, challenge each other's reasoning, and produce a moderator-approved consensus prediction.

🌐 **Live Demo:** https://world-cup-prediction-council.onrender.com

---

## 🚀 Features

- 🤖 Agentic AI Multi-Agent Orchestration
- ⚽ Live Football Data Synchronization
- 🧠 Configurable AI Debate Depth (1–5 Rounds)
- 📊 Consensus Probability Engine
- 📝 Explainable AI Reasoning
- 📈 Interactive Debate Timeline
- 🌍 Live FIFA Rankings & Team Statistics
- ⚡ Client-side Global Football Store
- 🚀 Full-Stack Production Deployment
- 🔄 Automated GitHub → Render CI/CD

---

# 🤖 Multi-Agent AI Council

The prediction engine is built around **seven specialist AI agents**, each responsible for a unique domain of football analysis.

| Agent | Responsibility |
|--------|---------------|
| 📊 Stats Analyst | FIFA Rankings, Elo Ratings, Statistical Trends |
| 🎯 Tactical Analyst | Tactical Matchups, Formations, Coaching Decisions |
| 👥 Squad Analyst | Squad Depth, Injuries, Key Players, Chemistry |
| 📈 Momentum Analyst | Recent Form, Morale, Tournament Momentum |
| 🛡️ Defensive Analyst | Defensive Stability, Goals Conceded, Clean Sheets |
| ⚔️ Attacking Analyst | Goals Scored, Chance Creation, Finishing Threat |
| ⚠️ Risk Analyst | Upset Probability, Volatility, Confidence Calibration |

After each discussion round, a **Moderator Agent** evaluates every argument, resolves disagreements, and generates the final consensus prediction.

---

# 🏗️ Architecture

```text
                    User
                      │
                      ▼
      React + TypeScript + Vite
              Frontend UI
                      │
                      ▼
         Express + Node.js Backend
                      │
        ┌─────────────┴──────────────┐
        ▼                            ▼
 Football-Data.org API          OpenAI GPT
        │                            │
        └─────────────┬──────────────┘
                      ▼
      Data Preparation & Validation
                      ▼
        Multi-Agent Orchestration
                      ▼
       Configurable Debate Rounds
                 (1–5)
                      ▼
         Moderator Consensus Engine
                      ▼
      Consensus Probability Engine
                      ▼
     Interactive Prediction Dashboard
```

---

# ⚙️ Prediction Workflow

1. User selects World Cup contenders.
2. Live football data is synchronized from Football-Data.org.
3. Rankings, form, statistics, and squad information are normalized.
4. Seven specialist AI analysts independently analyze the contenders.
5. The agents debate over configurable discussion rounds.
6. Agents critique and refine their reasoning.
7. The Moderator synthesizes all viewpoints into a final consensus.
8. Final probabilities, explanations, and debate logs are returned to the user.

---

# 🧠 Agentic AI Orchestration

Unlike traditional AI applications that rely on a single prompt and response, this project implements a **role-based multi-agent orchestration workflow**.

Each specialist agent:

- Independently analyzes the prediction from its assigned domain.
- Produces structured reasoning.
- Challenges competing viewpoints.
- Revises its conclusions during configurable discussion rounds.
- Contributes toward a moderator-approved consensus.

This produces a transparent and explainable prediction process rather than a single opaque AI response.

---

# 📂 Project Structure

```
├── src/
│   ├── components/
│   ├── debateEngine.ts
│   ├── footballStore.ts
│   ├── liveFootballService.ts
│   ├── liveDataAvailability.ts
│   ├── data.ts
│   ├── types.ts
│   └── App.tsx
│
├── server.ts
├── package.json
└── README.md
```

---

# 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express.js

### AI

- OpenAI GPT
- Multi-Agent Prompt Orchestration

### Data

- Football-Data.org API

### Deployment

- GitHub
- Render

---

# 💡 Engineering Highlights

- Multi-Agent AI Orchestration
- Prompt Engineering
- REST API Design
- Live Data Synchronization
- Request Deduplication
- Global Client-side Store
- Local Storage Persistence
- Structured JSON Validation
- Explainable AI Reasoning
- Production Deployment
- GitHub → Render Continuous Deployment

---

# 🚀 Installation

```bash
git clone https://github.com/VEDANTPARAB404/world-cup-prediction-council.git

cd world-cup-prediction-council

npm install

npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file in the project root.

```env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY

FOOTBALL_DATA_API_KEY=YOUR_FOOTBALL_DATA_API_KEY

OPENAI_MODEL=gpt-4o
```

---

# 🎯 Future Improvements

- Independent LLM execution per specialist agent
- Streaming agent discussions
- Tournament bracket simulation
- Monte Carlo probability simulation
- Confidence-weighted moderator decisions
- Dynamic early consensus detection
- Additional specialist agents and tool integrations
  
---

## 👨‍💻 Author

**Vedant Parab**

If you found this project interesting, feel free to ⭐ the repository or connect with me on LinkedIn.
