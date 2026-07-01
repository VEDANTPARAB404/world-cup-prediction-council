export interface Contender {
  id: string;
  name: string;
  flag: string; // E.g. "🇧🇷" or "🇫🇷"
  fifaRanking: number;
  eloRating: number;
  coach: string;
  keyPlayers: string[];
  recentForm: string; // e.g. "W D W W L"
  goalsScoredLast10: number;
  goalsConcededLast10: number;
  primaryColor: string;
}

export type WorkflowStep = 'SEQUENTIAL_DATA' | 'PARALLEL_ANALYSIS' | 'DEBATE_LOOP_1' | 'DEBATE_LOOP_2' | 'HEIRARCHICAL_MODERATION' | 'COMPLETED';

export interface AgentResponse {
  agentName: string;
  confidenceScore: number; // 0 to 100
  topContenders: Array<{ team: string; score: number; reason: string }>;
  analysis: string;
}

export interface AgentBelief {
  favorite: string;
  confidence: number;
  secondFavorite?: string;
  secondConfidence?: number;
  history?: Array<{ favorite: string; confidence: number }>; // Track confidence over time (Round -> score)
  shiftReason?: string; // Explain why the agent changed their mind or adjusted score
}

export interface DebaterCritique {
  critiquingAgent: string;
  targetAgent: string;
  critique: string;
}

export interface ModeratorOutput {
  predictedWinner: string;
  winnerProbability: number;
  top5: Array<{ team: string; probability: number; reason: string }>;
  keyStrengths: string[];
  keyRisks: string[];
  finalVerdict: string;
  strongestArgument?: { text: string; author: string; argumentTitle: string };
  weakestArgument?: { text: string; author: string; argumentTitle: string };
  biggestDisagreement?: { description: string; opponents: string[] };
  mostChangedAgent?: { agent: string; startFav: string; startConfidence: number; endFav: string; endConfidence: number; shiftReason: string };
  finalConsensusReasoning?: string;
  baselineProbabilities?: Record<string, number>;
  finalProbabilities?: Record<string, number>;
  changes?: Array<{ team: string; old: number; new: number; reason: string }>;
  individualAgentPredictions?: Record<string, {
    probabilities: Record<string, number>;
    reasons: Record<string, string>;
  }>;
  consensusProbabilities?: Record<string, number>;
  winner?: string;
  largestDisagreement?: string;
  reasonForConsensus?: string;
  averageProbabilities?: Record<string, number>;
  disagreementScore?: string;
  confidenceScore?: number;
}

export interface DebateLog {
  id: string;
  timestamp: string;
  stepType: WorkflowStep;
  agentName: 'Stats Analyst' | 'Squad Scout' | 'Tactical Analyst' | 'History Analyst' | 'Risk Analyst' | 'Moderator' | 'System' | string;
  role: string;
  title: string;
  message: string;
  structuredData?: any;
  beliefState?: AgentBelief;
  toolsUsed?: string[]; // E.g. ["Querying FIFA rankings Index", "Scraping match injury logs"]
}
