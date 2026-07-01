export interface ProjectFile {
  name: string;
  path: string;
  language: string;
  content: string;
}

export const pythonProjectFiles: ProjectFile[] = [
  {
    name: "requirements.txt",
    path: "requirements.txt",
    language: "plaintext",
    content: `google-genai>=1.0.0
pydantic>=2.0
python-dotenv>=1.0.0
`
  },
  {
    name: "README.md",
    path: "README.md",
    language: "markdown",
    content: `# World Cup Prediction Council 🏆🤖

A complete multi-agent predictive system built in Python. This project utilizes Google's official \`google-genai\` SDK and structured Pydantic schemas to predict the FIFA World Cup winner through an interactive, multi-agent debate session.

## 🌟 Structured Task Stages

This project coordinates the reasoning in four structured stages:

1. **Data Standardization**: Normalizes current contender metrics (Elo, FIFA rank, team forms) into uniform data schemas.
2. **Expert Aspect Analysis**: Executes specialized analysis layers concurrently (Stats, Tactical, Squads, and History) to gather unbiased, diverse perspectives.
3. **Interactive Peer Critique**: Facilitates consecutive feedback rounds where experts critique other analyst findings and correct vulnerabilities.
4. **Consensus Synthesis**: Governed by a **Moderator Agent** that balances contradicting inputs, identifies critical squad risks, and outputs a structured forecast verdict.

---

## 📂 Project Architecture

\`\`\`
world_cup_council/
├── README.md
├── requirements.txt
├── config.py
├── main.py
├── workflow.py
└── agents/
    ├── __init__.py
    ├── stats_agent.py
    ├── squad_agent.py
    ├── tactics_agent.py
    ├── history_agent.py
    ├── risk_agent.py
    └── moderator_agent.py
\`\`\`

---

## 🛠️ Step-by-Step Installation

### 1. Prerequisites
Ensure you have Python 3.9+ installed on your system.

### 2. Clone or Copy the Files
Create a local directory named \`world_cup_council\` and replicate the folder structure with the code provided in the viewer.

### 3. Install Dependencies
Install the required packages using pip:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 4. Configure Your Gemini API Key
Create a \`.env\` file in the root directory:
\`\`\`env
# .env
GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
\`\`\`

### 5. Launch the Prediction Council
Run the main script to start the interactive multi-agent workspace:
\`\`\`bash
python main.py
\`\`\`
`
  },
  {
    name: "config.py",
    path: "config.py",
    language: "python",
    content: `import os
import logging
from dotenv import load_dotenv
from google import genai

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s: %(message)s"
)
logger = logging.getLogger("PredictionCouncil")

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY is not defined in the environment. Please ensure it is present in .env.")

# Initialize the official Google GenAI Client
try:
    ai_client = genai.Client(api_key=GEMINI_API_KEY)
except Exception as e:
    logger.error(f"Failed to initialize GenAI Client: {e}")
    ai_client = None

DEFAULT_MODEL = "gemini-2.5-flash"
`
  },
  {
    name: "stats_agent.py",
    path: "agents/stats_agent.py",
    language: "python",
    content: `import json
from google.genai import types
from config import ai_client, DEFAULT_MODEL, logger

class StatsAgent:
    """
    Expert in FIFA rankings, Elo ratings, recent form, win rates, and goals stats.
    """
    def __init__(self):
        self.name = "Stats Agent"
        self.client = ai_client

    def analyze(self, contenders_data: list) -> dict:
        logger.info(f"{self.name} is commencing analytical assessment...")
        
        prompt = f"""
        You are the 'Stats Agent', an elite sports statistician and data analyst specializing in international football.
        Analyze the following contenders based strictly on:
        - FIFA Rankings & Elo Ratings
        - Recent form (last 10 matches win/loss/draw records)
        - Goals scored vs conceded ratio
        
        Contenders Data:
        {json.dumps(contenders_data, indent=2)}
        
        Determine the top contender teams with specific confidence scores (0-100) and analytical reasoning.
        
        Respond with structured JSON following this JSON schema:
        {{
            "agentName": "Stats Agent",
            "confidenceScore": 85,
            "topContenders": [
                {{"team": "Team Name", "score": 90, "reason": "Detailed stat-based reason"}}
            ],
            "analysis": "Comprehensive summary of statistical strengths and form."
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=DEFAULT_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"StatsAgent execution error: {e}")
            # Mock fallback if key/limit issues
            return {
                "agentName": self.name,
                "confidenceScore": 75,
                "topContenders": [
                    {"team": contenders_data[0]["name"] if contenders_data else "Unknown", "score": 80, "reason": "Fallback statistical analysis"}
                ],
                "analysis": "Statistical evaluation performed with emergency fallback mechanism."
            }
`
  },
  {
    name: "squad_agent.py",
    path: "agents/squad_agent.py",
    language: "python",
    content: `import json
from google.genai import types
from config import ai_client, DEFAULT_MODEL, logger

class SquadAgent:
    """
    Evaluates player quality, squad depth, injury profiles, and roster balance.
    """
    def __init__(self):
        self.name = "Squad Agent"
        self.client = ai_client

    def analyze(self, contenders_data: list) -> dict:
        logger.info(f"{self.name} is assessing rosters and squad depths...")
        
        prompt = f"""
        You are the 'Squad Agent', an elite scout and technical director.
        Evaluate the squads of the following teams:
        - Star players and key match-winners
        - Bench depth, roster balance, and positional coverage
        - Age profiles (experience vs youth energy)
        
        Contenders Data:
        {json.dumps(contenders_data, indent=2)}
        
        Respond with structured JSON following this JSON schema:
        {{
            "agentName": "Squad Agent",
            "confidenceScore": 80,
            "topContenders": [
                {{"team": "Team Name", "score": 85, "reason": "Squad depth and roster quality metrics"}}
            ],
            "analysis": "Roster analysis and positional balance overview."
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=DEFAULT_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"SquadAgent execution error: {e}")
            return {
                "agentName": self.name,
                "confidenceScore": 70,
                "topContenders": [
                    {"team": contenders_data[0]["name"] if contenders_data else "Unknown", "score": 75, "reason": "Fallback squad analysis"}
                ],
                "analysis": "Squad analysis completed via fallback routine."
            }
`
  },
  {
    name: "tactics_agent.py",
    path: "agents/tactics_agent.py",
    language: "python",
    content: `import json
from google.genai import types
from config import ai_client, DEFAULT_MODEL, logger

class TacticsAgent:
    """
    Evaluates manager competencies, tactical flexibility, defensive structures, and pressing systems.
    """
    def __init__(self):
        self.name = "Tactics Agent"
        self.client = ai_client

    def analyze(self, contenders_data: list) -> dict:
        logger.info(f"{self.name} is analyzing tactical formations and manager pedigree...")
        
        prompt = f"""
        You are the 'Tactics Agent', a premium football tactician and former elite coach.
        Assess the tactical layouts of the following teams:
        - Head coach pedigree and strategic flexibility
        - Pressing models and transitions (defense to attack)
        - Defensive block organization (high/low line, defensive compactness)
        
        Contenders Data:
        {json.dumps(contenders_data, indent=2)}
        
        Respond with structured JSON following this JSON schema:
        {{
            "agentName": "Tactics Agent",
            "confidenceScore": 85,
            "topContenders": [
                {{"team": "Team Name", "score": 88, "reason": "Tactical flexibility and solid transition models"}}
            ],
            "analysis": "Detailed tactical profiling."
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=DEFAULT_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"TacticsAgent execution error: {e}")
            return {
                "agentName": self.name,
                "confidenceScore": 75,
                "topContenders": [
                    {"team": contenders_data[0]["name"] if contenders_data else "Unknown", "score": 78, "reason": "Fallback tactics assessment"}
                ],
                "analysis": "Tactics analyzed via standard tactical template fallback."
            }
`
  },
  {
    name: "history_agent.py",
    path: "agents/history_agent.py",
    language: "python",
    content: `import json
from google.genai import types
from config import ai_client, DEFAULT_MODEL, logger

class HistoryAgent:
    """
    Evaluates World Cup pedigree, knock-out record, historical trends, and tournament mental fortitude.
    """
    def __init__(self):
        self.name = "History Agent"
        self.client = ai_client

    def analyze(self, contenders_data: list) -> dict:
        logger.info(f"{self.name} is indexing historic tournament records...")
        
        prompt = f"""
        You are the 'History Agent', an expert football historian and analyst.
        Examine the tournament pedigree of the following teams:
        - Historic tournament performance (e.g. World Cup champion lineage)
        - Performance under pressure (knockout penalty shootout statistics)
        - Psychological pedigree and weight of the badge
        
        Contenders Data:
        {json.dumps(contenders_data, indent=2)}
        
        Respond with structured JSON following this JSON schema:
        {{
            "agentName": "History Agent",
            "confidenceScore": 90,
            "topContenders": [
                {{"team": "Team Name", "score": 92, "reason": "Historic championship lineage and performance in crucial tournaments"}}
            ],
            "analysis": "Pedigree analysis, highlighting previous performance metrics."
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=DEFAULT_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"HistoryAgent execution error: {e}")
            return {
                "agentName": self.name,
                "confidenceScore": 80,
                "topContenders": [
                    {"team": contenders_data[0]["name"] if contenders_data else "Unknown", "score": 85, "reason": "Fallback historical lineage"}
                ],
                "analysis": " pedigree analysis completed via fallback."
            }
`
  },
  {
    name: "risk_agent.py",
    path: "agents/risk_agent.py",
    language: "python",
    content: `import json
from google.genai import types
from config import ai_client, DEFAULT_MODEL, logger

class RiskAgent:
    """
    Identifies failure profiles, overreliance, injury history, and hard tournament paths.
    """
    def __init__(self):
        self.name = "Risk Agent"
        self.client = ai_client

    def analyze_risks(self, contenders_data: list, specialist_opinions: list) -> dict:
        logger.info(f"{self.name} is compiling a risk matrix and vulnerability profiles...")
        
        prompt = f"""
        You are the 'Risk Agent', an expert sports risk analyst.
        Review the contenders and the specialist analyses compiled:
        
        Specialist Analyses:
        {json.dumps(specialist_opinions, indent=2)}
        
        Tasks:
        - Identify critical vulnerabilities (e.g., key player burnout, fragile backlines, lack of tactical Plan B)
        - Adjust contender evaluation points downward in case of extreme risk factors
        
        Respond with structured JSON following this JSON schema:
        {{
            "agentName": "Risk Agent",
            "vulnerabilities": [
                {{"team": "Team Name", "risk": "Critical player injury risk", "threatLevel": "High"}}
            ],
            "adjustedConfidenceScores": [
                {{"team": "Team Name", "adjustedScore": 75, "reason": "Adjusted due to dependency issues"}}
            ]
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=DEFAULT_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"RiskAgent execution error: {e}")
            return {
                "agentName": self.name,
                "vulnerabilities": [
                    {"team": "General Contender", "risk": "Standard physical fatigue", "threatLevel": "Medium"}
                ],
                "adjustedConfidenceScores": []
            }
`
  },
  {
    name: "moderator_agent.py",
    path: "agents/moderator_agent.py",
    language: "python",
    content: `import json
from google.genai import types
from config import ai_client, DEFAULT_MODEL, logger

class ModeratorAgent:
    """
    Supervises the council, conducts debate loops, resolves debates, and compiles a final prediction.
    """
    def __init__(self):
        self.name = "Moderator"
        self.client = ai_client

    def coordinate_debate(self, logs_from_round: list) -> list:
        logger.info("Moderator is coordinating debate rounds between specialist agents...")
        
        # This will instruct the model to simulate critique arguments
        prompt = f"""
        You are the 'Moderator Agent' representing the head of the FIFA World Cup Prediction Council.
        Based on the current expert opinions from Stats, Squad, Tactics, and History, formulate critiques.
        
        Expert Opinions:
        {json.dumps(logs_from_round, indent=2)}
        
        Create a debate section where each specialist critiques at least two other opinions.
        Respond with structured JSON following this JSON schema (a list of critiques):
        {{
            "critiques": [
                {{
                    "critiquingAgent": "Stats Agent",
                    "targetAgent": "Squad Agent",
                    "critique": "While the squad profile is high, recent Elo values indicate their actual on-pitch results are failing to back up their roster quality."
                }}
            ]
        }}
        """
        try:
            response = self.client.models.generate_content(
                model=DEFAULT_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.5
                )
            )
            return json.loads(response.text).get("critiques", [])
        except Exception as e:
            logger.error(f"Moderator debate coordination error: {e}")
            return []

    def compile_final_consensus(self, history: list) -> dict:
        logger.info("Moderator is formulating the final consensus verdict...")
        
        prompt = f"""
        You are the 'Moderator Agent'. Summarize all analyses, risk parameters, and the completed debate rounds:
        
        Debate History:
        {json.dumps(history, indent=2)}
        
        Formulate a final World Cup prediction report including:
        - Predicted winner (highest confidence)
        - Top 5 contender teams with probability percentages (summing up to 100% or relative)
        - Strengths and vulnerabilities
        - Concise concluding verdict explaining why this victor triumphs.
        
        Respond with structured JSON following this JSON schema:
        {{
            "predictedWinner": "Predicted Winner Team",
            "winnerProbability": 35.5,
            "top5": [
                {{"team": "Team A", "probability": 35.5, "reason": "Reason for probability"}},
                {{"team": "Team B", "probability": 25.0, "reason": "Reason for probability"}},
                {{"team": "Team C", "probability": 15.0, "reason": "Reason for probability"}},
                {{"team": "Team D", "probability": 12.5, "reason": "Reason for probability"}},
                {{"team": "Team E", "probability": 12.0, "reason": "Reason for probability"}}
            ],
            "keyStrengths": ["Strength 1", "Strength 2"],
            "keyRisks": ["Risk 1", "Risk 2"],
            "finalVerdict": "A robust concluding analysis justifying the predicted champion."
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=DEFAULT_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Moderator consensus compile error: {e}")
            return {
                "predictedWinner": "France",
                "winnerProbability": 30.0,
                "top5": [
                    {"team": "France", "probability": 30.0, "reason": "Roster depth"},
                    {"team": "Brazil", "probability": 25.0, "reason": "Talent pool"},
                    {"team": "Argentina", "probability": 20.0, "reason": "Tournament pedigree"}
                ],
                "keyStrengths": ["Fallback strength summary"],
                "keyRisks": ["Fallback risk assessment"],
                "finalVerdict": "Verification failed due to connectivity; defaulted fallback prediction output."
            }
`
  },
  {
    name: "workflow.py",
    path: "workflow.py",
    language: "python",
    content: `from agents.stats_agent import StatsAgent
from agents.squad_agent import SquadAgent
from agents.tactics_agent import TacticsAgent
from agents.history_agent import HistoryAgent
from agents.risk_agent import RiskAgent
from agents.moderator_agent import ModeratorAgent
from config import logger
import concurrent.futures

class PredictionWorkflow:
    """
    Executes all four orchestration paradigms in a complete prediction cycle.
    """
    def __init__(self):
        self.stats_agent = StatsAgent()
        self.squad_agent = SquadAgent()
        self.tactics_agent = TacticsAgent()
        self.history_agent = HistoryAgent()
        self.risk_agent = RiskAgent()
        self.moderator = ModeratorAgent()

    def run_prediction_flow(self, contenders_data: list) -> dict:
        logger.info("=== STARTING MULTI-AGENT WORLD CUP PREDICTION COUNCIL ===")
        
        # 1. SEQUENTIAL WORKFLOW: Formulating and processing contender portfolios in order
        logger.info("[Pattern: Sequential] Synchronizing initial candidate vectors...")
        standardized_contenders = []
        for index, team in enumerate(contenders_data):
            logger.info(f"Gathering metrics for candidate {index+1}/{len(contenders_data)}: {team['name']}")
            # Standardizing input schema for downstream consumption
            standardized_contenders.append({
                "name": team["name"],
                "fifaRanking": team.get("fifaRanking", 5),
                "eloRating": team.get("eloRating", 1800),
                "coach": team.get("coach", "Unknown"),
                "keyPlayers": team.get("keyPlayers", []),
                "form": team.get("recentForm", "W"),
                "stats": {
                    "goalsScored": team.get("goalsScoredLast10", 15),
                    "goalsConceded": team.get("goalsConcededLast10", 10)
                }
            })

        # 2. PARALLEL WORKFLOW: Analyzing different perspective fields concurrently
        logger.info("[Pattern: Parallel] Running expert specialists concurrently...")
        specialist_results = {}
        
        # Run Stats, Squad, Tactics, and History agents in parallel using thread executor
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            futures = {
                executor.submit(self.stats_agent.analyze, standardized_contenders): "Stats Agent",
                executor.submit(self.squad_agent.analyze, standardized_contenders): "Squad Agent",
                executor.submit(self.tactics_agent.analyze, standardized_contenders): "Tactics Agent",
                executor.submit(self.history_agent.analyze, standardized_contenders): "History Agent"
            }
            
            for future in concurrent.futures.as_completed(futures):
                agent_name = futures[future]
                try:
                    res = future.result()
                    specialist_results[agent_name] = res
                    logger.info(f"Parallel Task COMPLETED: {agent_name} successfully delivered findings.")
                except Exception as exc:
                    logger.error(f"Parallel Task EXCEPTION: {agent_name} generated error: {exc}")

        # Run risk assessment sequentially on the aggregated specialist findings
        risk_profile = self.risk_agent.analyze_risks(standardized_contenders, list(specialist_results.values()))
        specialist_results["Risk Agent"] = risk_profile

        # 3. LOOP WORKFLOW: Run 2 rounds of critique-defense debates
        logger.info("[Pattern: Loop] Starting multi-agent critique debate (2 rounds required)...")
        debate_history = []
        
        for round_num in range(1, 3):
            logger.info(f"--- COMMENCING DEBATE ROUND {round_num}/2 ---")
            
            # Moderator creates peer critiques from current positions
            logs_to_evaluate = list(specialist_results.values()) + debate_history
            critiques = self.moderator.coordinate_debate(logs_to_evaluate)
            
            # Record critiques in history
            round_record = {
                "round": round_num,
                "critiques": critiques
            }
            debate_history.append(round_record)
            logger.info(f"Round {round_num} debate closed. Resolved {len(critiques)} peer critiques.")

        # 4. HIERARCHICAL WORKFLOW: Moderator aggregates expertise and issues final decision
        logger.info("[Pattern: Hierarchical] Submitting debate dossiers to Moderator Agent for final synthesis...")
        
        entire_dossier = {
            "initialSpecialistAnalyses": list(specialist_results.values()),
            "riskAnalysis": risk_profile,
            "debateHistory": debate_history
        }
        
        final_consensus = self.moderator.compile_final_consensus(entire_dossier)
        logger.info("=== PREDICTION COUNCIL VERDICT ISSUED SUCCESSFULLY ===")
        
        return {
            "specialistAnalyses": specialist_results,
            "debateHistory": debate_history,
            "finalReport": final_consensus
        }
`
  },
  {
    name: "main.py",
    path: "main.py",
    language: "python",
    content: `import json
import os
from dotenv import load_dotenv
from workflow import PredictionWorkflow

def get_default_contenders():
    return [
        {
            "name": "Brazil",
            "fifaRanking": 5,
            "eloRating": 2045,
            "coach": "Dorival Júnior",
            "keyPlayers": ["Vinícius Júnior", "Rodrygo", "Alisson Becker"],
            "recentForm": "W W D W W",
            "goalsScoredLast10": 22,
            "goalsConcededLast10": 8
        },
        {
            "name": "France",
            "fifaRanking": 2,
            "eloRating": 2110,
            "coach": "Didier Deschamps",
            "keyPlayers": ["Kylian Mbappé", "Antoine Griezmann", "Aurélien Tchouaméni"],
            "recentForm": "W D W L W",
            "goalsScoredLast10": 19,
            "goalsConcededLast10": 7
        },
        {
            "name": "Argentina",
            "fifaRanking": 1,
            "eloRating": 2150,
            "coach": "Lionel Scaloni",
            "keyPlayers": ["Lionel Messi", "Lautaro Martínez", "Alexis Mac Allister"],
            "recentForm": "W W W D W",
            "goalsScoredLast10": 24,
            "goalsConcededLast10": 5
        },
        {
            "name": "Spain",
            "fifaRanking": 3,
            "eloRating": 2125,
            "coach": "Luis de la Fuente",
            "keyPlayers": ["Lamine Yamal", "Rodri", "Nico Williams"],
            "recentForm": "W W W W D",
            "goalsScoredLast10": 26,
            "goalsConcededLast10": 6
        },
        {
            "name": "England",
            "fifaRanking": 4,
            "eloRating": 2010,
            "coach": "Thomas Tuchel",
            "keyPlayers": ["Harry Kane", "Jude Bellingham", "Bukayo Saka"],
            "recentForm": "D W L W W",
            "goalsScoredLast10": 17,
            "goalsConcededLast10": 9
        }
    ]

def main():
    print("="*60)
    print("🏆 WORLD CUP PREDICTION COUNCIL - COLLABORATIVE MULTI-AGENT 🏆")
    print("="*60)
    
    # Load environment settings
    load_dotenv()
    if not os.getenv("GEMINI_API_KEY"):
        print("\\n⚠️ WARNING: GEMINI_API_KEY is missing from environment. Creating output of fallback dry run.")
        print("Please place your actual Gemini key in a .env file to enable live AI analysis.\\n")
    
    contenders = get_default_contenders()
    
    print("Current Prediction Council Registered Competitors:")
    for idx, team in enumerate(contenders):
        print(f"  {idx+1}. {team['name']} (FIFA Rank: {team['fifaRanking']} | Elo: {team['eloRating']} | Coach: {team['coach']})")
    
    print("\\nInitializing council system orchestration (Sequential, Parallel, Loop & Hierarchical Workflows)...")
    
    workflow = PredictionWorkflow()
    results = workflow.run_prediction_flow(contenders)
    
    print("\\n" + "="*50)
    print("📢 FINAL DECISION COUNCIL PREDICTION REPORT:")
    print("="*50)
    
    report = results.get("finalReport", {})
    print(f"🥇 PREDICTED WINNER: {report.get('predictedWinner', 'N/A')} (Confidence: {report.get('winnerProbability', 0.0)}%)")
    
    print("\\n📊 Top Consensual Multi-Agent Competitor Probabilities:")
    for candidate in report.get("top5", []):
        print(f"  - {candidate['team']}: {candidate['probability']}% | reason: {candidate['reason']}")
        
    print("\\n🛡️ General Core Strengths identified:")
    for strength in report.get("keyStrengths", []):
         print(f"  ✓ {strength}")
         
    print("\\n⚠️ General Core Risks identified:")
    for risk in report.get("keyRisks", []):
         print(f"  ⚔️ {risk}")
         
    print("\\n📝 Final Verdict Contextual Explanation:")
    print(report.get("finalVerdict", "Detailed explanation unavailable due to network/key error."))
    print("="*60)

if __name__ == '__main__':
    main()
`
  }
];
