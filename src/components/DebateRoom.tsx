import React, { useMemo, useState, useEffect } from 'react';
import { DebateLog, Contender, ModeratorOutput, AgentBelief } from '../types';
import { Zap, Trophy, ArrowRight, Activity, ArrowDown, Sparkles, TrendingUp, HelpCircle, RotateCcw, ChevronDown, ChevronRight, Calendar, UserCheck, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FifaTrophyLogo from './FifaTrophyLogo';
import { calculateTournamentProbabilities } from '../debateEngine';
import { useFootballStore } from '../footballStore';
import PremiumProgressStepper from './PremiumProgressStepper';

interface DebateRoomProps {
  chatMessages: DebateLog[];
  typingAgent: string | null;
  currentRoundNum: number;
  isRunning: boolean;
  contenders: Contender[];
  handleSkipDebate: () => void;
  handleRestart: () => void;
  setCurrentScreen: (screen: 'selection' | 'debate' | 'report') => void;
  getCountryFlag: (name: string, emojiFallback?: string, sizeClass?: string) => React.ReactNode;
  moderatorReport: ModeratorOutput | null;
  debateContainerEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function DebateRoom({
  chatMessages,
  typingAgent,
  currentRoundNum,
  isRunning,
  contenders,
  handleSkipDebate,
  handleRestart,
  setCurrentScreen,
  getCountryFlag,
  moderatorReport,
  debateContainerEndRef
}: DebateRoomProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [isAutoScrollActive, setIsAutoScrollActive] = React.useState(true);
  const [expandedSection, setExpandedSection] = useState<'round1' | 'round2' | 'consensus' | null>('round1');

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const threshold = 40; // pixel tolerance from bottom
      const totalScrollableHeight = container.scrollHeight - container.clientHeight;
      const isScrollAtBottom = totalScrollableHeight - container.scrollTop <= threshold;
      
      // If user manually scrolls up past threshold, pause auto-scroll.
      if (isScrollAtBottom) {
        setIsAutoScrollActive(true);
      } else {
        setIsAutoScrollActive(false);
      }
    }
  };

  // Group messages into structural collapsible sections
  const groupedMessages = useMemo(() => {
    const groups = {
      round1: [] as DebateLog[],
      round2: [] as DebateLog[],
      consensus: [] as DebateLog[]
    };

    chatMessages.forEach(msg => {
      const st = msg.stepType;
      if (st === 'SEQUENTIAL_DATA' || st === 'PARALLEL_ANALYSIS') {
        groups.round1.push(msg);
      } else if (st === 'DEBATE_LOOP_1') {
        groups.round2.push(msg);
      } else if (st === 'COMPLETED' || st === 'HEIRARCHICAL_MODERATION' || msg.agentName === 'Moderator') {
        groups.consensus.push(msg);
      } else {
        groups.round1.push(msg);
      }
    });

    return groups;
  }, [chatMessages]);

  // Keep the active section auto-expanded while the debate is running
  useEffect(() => {
    if (isRunning && chatMessages.length > 0) {
      const lastMsg = chatMessages[chatMessages.length - 1];
      const st = lastMsg.stepType;
      if (st === 'SEQUENTIAL_DATA' || st === 'PARALLEL_ANALYSIS') {
        setExpandedSection('round1');
      } else if (st === 'DEBATE_LOOP_1') {
        setExpandedSection('round2');
      } else if (st === 'COMPLETED' || st === 'HEIRARCHICAL_MODERATION' || lastMsg.agentName === 'Moderator') {
        setExpandedSection('consensus');
      }
    } else if (!isRunning && chatMessages.length > 0) {
      // By default on completion, expand the final consensus section
      if (groupedMessages.consensus.length > 0) {
        setExpandedSection('consensus');
      }
    }
  }, [chatMessages, isRunning, groupedMessages]);

  // Auto scroll effect
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && isAutoScrollActive) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages, typingAgent, isAutoScrollActive, expandedSection]);

  // Reset scroll lock on start of new simulation
  useEffect(() => {
    if (chatMessages.length <= 1) {
      setIsAutoScrollActive(true);
    }
  }, [chatMessages.length]);

  // Baseline default belief states for specialists before they speak
  const fav1 = contenders[0]?.name || 'Spain';
  const fav2 = contenders[1]?.name || 'France';
  const fav4 = contenders[3]?.name || 'Argentina';

  const defaultBeliefs: Record<string, AgentBelief> = useMemo(() => ({
    'Stats Analyst': { favorite: fav1, confidence: 84, history: [{ favorite: fav1, confidence: 84 }] },
    'Tactical Analyst': { favorite: fav1, confidence: 78, history: [{ favorite: fav1, confidence: 78 }] },
    'Squad Analyst': { favorite: fav2, confidence: 80, history: [{ favorite: fav2, confidence: 80 }] },
    'Momentum Analyst': { favorite: fav2, confidence: 84, history: [{ favorite: fav2, confidence: 84 }] },
    'Defensive Analyst': { favorite: fav1, confidence: 75, history: [{ favorite: fav1, confidence: 75 }] },
    'Attacking Analyst': { favorite: fav1, confidence: 79, history: [{ favorite: fav1, confidence: 79 }] },
    'Risk Analyst': { favorite: fav1, confidence: 70, history: [{ favorite: fav1, confidence: 70 }] }
  }), [fav1, fav2, fav4]);

  const analystCards = useMemo(() => ([
    { key: 'Stats Analyst', label: 'Stats Analyst', role: 'FIFA Rank & Elo Ratings', color: 'indigo', icon: Activity },
    { key: 'Tactical Analyst', label: 'Tactical Analyst', role: 'Tactics & Setup Shapes', color: 'purple', icon: Sparkles },
    { key: 'Squad Analyst', label: 'Squad Scout', role: 'Roster Depth & Spine Strength', color: 'blue', icon: Users },
    { key: 'Momentum Analyst', label: 'Momentum Analyst', role: 'Form Runs & Team Morale', color: 'amber', icon: TrendingUp },
    { key: 'Defensive Analyst', label: 'Defensive Analyst', role: 'Concessions & Low Blocks', color: 'cyan', icon: Trophy },
    { key: 'Attacking Analyst', label: 'Attacking Analyst', role: 'Goal Scoring & Shooting', color: 'orange', icon: HelpCircle },
    { key: 'Risk Analyst', label: 'Risk Analyst', role: 'Vulnerability & Transition Risk', color: 'rose', icon: ArrowDown }
  ]), []);

  // Helper to extract the last updated state/belief for a specific agent based on current visible chat logs
  const getAgentActiveState = (agentName: string): AgentBelief => {
    for (let i = chatMessages.length - 1; i >= 0; i--) {
      const msg = chatMessages[i];
      if (msg.agentName === agentName && msg.beliefState) {
        return msg.beliefState;
      }
    }
    return defaultBeliefs[agentName] || { favorite: 'Unknown', confidence: 50, history: [] };
  };

  const getLatestAgentMessage = (agentName: string) => {
    for (let i = chatMessages.length - 1; i >= 0; i--) {
      const msg = chatMessages[i];
      if (msg.agentName === agentName || msg.agentName === agentName.replace(' Analyst', ' Agent')) {
        return msg;
      }
    }
    return null;
  };

  const { data: globalFootballData } = useFootballStore();

  const liveProbabilities = useMemo(() => {
    // Calculate baseline tournament probabilities
    const baseline = calculateTournamentProbabilities(contenders, globalFootballData);
    const baselineMap = new Map<string, number>();
    baseline.forEach(item => {
      baselineMap.set(item.team, item.probability);
    });

    // If moderatorReport has finalProbabilities, use them directly
    if (moderatorReport && moderatorReport.finalProbabilities) {
      return contenders.map(c => ({
        team: c.name,
        flag: c.flag || '⚽',
        probability: moderatorReport.finalProbabilities?.[c.name] ?? baselineMap.get(c.name) ?? (100 / contenders.length),
        primaryColor: c.primaryColor || '#6366f1',
        favoredBy: [] as string[]
      })).sort((a, b) => b.probability - a.probability);
    }

    // Otherwise, dynamically adjust based on the current active beliefs of the 7 analysts
    const specialists = [
      'Stats Analyst', 'Tactical Analyst', 'Squad Analyst', 
      'Momentum Analyst', 'Defensive Analyst', 'Attacking Analyst', 'Risk Analyst'
    ];

    const analystBeliefs = specialists.map(key => ({
      key,
      belief: getAgentActiveState(key)
    }));

    // Adjust contender probabilities based on active beliefs
    const adjustedScores: Record<string, number> = {};
    contenders.forEach(c => {
      adjustedScores[c.name] = baselineMap.get(c.name) ?? (100 / contenders.length);
    });

    // For each specialist, add extra weight to their favorite team
    analystBeliefs.forEach(item => {
      const fav = item.belief.favorite;
      if (adjustedScores[fav] !== undefined) {
        // Add a weight proportional to confidence (e.g. up to 6% per specialist)
        adjustedScores[fav] += (item.belief.confidence / 100) * 6;
      }
    });

    // Normalize so they sum to 100%
    const totalScore = Object.values(adjustedScores).reduce((sum, s) => sum + s, 0);
    const result = contenders.map(c => {
      const rawScore = adjustedScores[c.name] || 0;
      const normalizedProbability = totalScore > 0 ? (rawScore / totalScore) * 100 : (100 / contenders.length);
      
      // Find which analysts currently favor this team
      const favoredBy = analystBeliefs
        .filter(item => item.belief.favorite.toLowerCase() === c.name.toLowerCase())
        .map(item => item.key.split(' ')[0]); // e.g. "Stats", "Tactical"

      return {
        team: c.name,
        flag: c.flag || '⚽',
        probability: Math.round(normalizedProbability * 10) / 10,
        primaryColor: c.primaryColor || '#6366f1',
        favoredBy
      };
    });

    // Sort by probability descending
    return result.sort((a, b) => b.probability - a.probability);
  }, [contenders, chatMessages, moderatorReport, globalFootballData]);

  return (
    <div className="space-y-6">
      {/* Dynamic Header Room */}
      <div id="debate-room-navigation-card" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Analytics Council Room
              </h4>
              <p className="text-zinc-500 text-[10px] font-mono mt-0.5">
                {isRunning ? 'Live Specialist Discussion Feed' : 'Discussion concluded successfully'}
              </p>
            </div>

            {/* Projected Champion Winner Board */}
            {!isRunning && moderatorReport && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-950 border border-zinc-805 px-3 py-1 rounded-lg flex items-center gap-2 shadow-sm shrink-0"
              >
                <div className="text-[10px] font-mono leading-tight">
                  <span className="text-zinc-550 font-medium block uppercase tracking-wider text-[7px]">Projected Outcome</span>
                  <span className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                    {getCountryFlag(moderatorReport.predictedWinner, '⚽', "w-4.5 h-3")}
                    {moderatorReport.predictedWinner}
                    <span className="text-zinc-440 font-mono">({moderatorReport.winnerProbability}%)</span>
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Custom Progress Rounds Progress Bar */}
        <div className="flex flex-wrap items-center bg-zinc-950 border border-zinc-808 rounded-lg p-1 text-[10px] font-mono max-w-full overflow-x-auto">
          {[
            { num: 1, label: 'Predictions' },
            { num: 2, label: 'Cross-Exam' },
            { num: 3, label: 'Follow-ups' },
            { num: 4, label: 'Mind Shifts' },
            { num: 5, label: 'Consensus' }
          ].map((step) => {
            const isActive = currentRoundNum === step.num;
            const isCompleted = currentRoundNum > step.num;
            return (
              <div 
                key={step.num}
                className={`px-2.5 py-1 rounded transition-all shrink-0 ${
                  isActive 
                    ? 'bg-zinc-800 text-white font-bold border border-zinc-700' 
                    : isCompleted 
                      ? 'text-zinc-400' 
                      : 'text-zinc-650'
                }`}
              >
                R{step.num}: {step.label}
              </div>
            );
          })}
        </div>

        {/* Actions layout group */}
        <div className="flex gap-2.5 self-stretch md:self-auto justify-center">
          <button
            id="btn-restart-debate-room"
            type="button"
            onClick={handleRestart}
            className="px-4 py-1.5 bg-zinc-950 hover:bg-zinc-850/85 text-zinc-400 hover:text-white border border-zinc-808 hover:border-zinc-750 text-xs font-mono rounded-lg transition-all font-semibold cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart Selection
          </button>

          {isRunning && (
            <button
              id="btn-skip-debate-room"
              type="button"
              onClick={handleSkipDebate}
              className="px-4 py-1.5 bg-zinc-950 hover:bg-rose-950/20 text-zinc-400 hover:text-rose-400 border border-zinc-808 hover:border-rose-900/30 text-xs font-mono rounded-lg transition-all font-semibold cursor-pointer inline-flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> Skip to Report
            </button>
          )}
        </div>
      </div>

      {/* Premium Multi-Stage Progress Stepper */}
      <PremiumProgressStepper 
        currentRoundNum={currentRoundNum} 
        chatMessagesCount={chatMessages.length} 
        isRunning={isRunning} 
      />

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               {/* Left Sidebar: Genuinely Agentic Active States - col-span-4 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900 border border-zinc-808 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 font-mono">
                Specialist Analyst Verdicts
              </h4>
              <span className="text-[9px] font-mono bg-zinc-950 text-emerald-400 px-2 py-0.5 rounded border border-zinc-808 uppercase tracking-wide">
                {isRunning ? 'Calibrating...' : 'Concluded'}
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {analystCards.map((item) => {
                const belief = getAgentActiveState(item.key);
                const latestMessage = getLatestAgentMessage(item.key);
                const status = typingAgent === item.key || typingAgent === item.label
                  ? 'Debating'
                  : latestMessage
                    ? 'Completed'
                    : isRunning
                      ? 'Thinking'
                      : 'Completed';
                
                // Color configuration
                const barColor = item.color === 'indigo' ? 'bg-indigo-500' 
                               : item.color === 'blue' ? 'bg-blue-500' 
                               : item.color === 'purple' ? 'bg-purple-500' 
                               : item.color === 'amber' ? 'bg-amber-500' 
                               : item.color === 'cyan' ? 'bg-cyan-500'
                               : item.color === 'orange' ? 'bg-orange-500'
                               : 'bg-rose-500';

                return (
                  <div key={item.key} className="p-3 bg-zinc-950 border border-zinc-808 rounded-2xl space-y-3 transition-all hover:border-zinc-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${barColor.replace('bg-', 'bg-')}/10 border-current/20 text-white`}>
                          <item.icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <strong className="text-xs text-white block font-semibold leading-tight truncate">{item.label}</strong>
                          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono block mt-0.5">{item.role}</span>
                        </div>
                      </div>

                      <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        status === 'Debating'
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                          : status === 'Thinking'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      }`}>
                        {status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-zinc-900/70 border border-zinc-808/50 rounded-xl p-2">
                        <span className="text-zinc-500 uppercase tracking-wider block">Current conclusion</span>
                        <div className="mt-1 flex items-center gap-1.5 text-zinc-100 font-semibold truncate">
                          <span>{belief.favorite}</span>
                          {contenders.some(c => c.name.toLowerCase() === belief.favorite.toLowerCase()) && 
                            getCountryFlag(belief.favorite, contenders.find(c => c.name.toLowerCase() === belief.favorite.toLowerCase())?.flag || '🏳️', "w-4 h-2.5 shrink-0")
                          }
                        </div>
                      </div>
                      <div className="bg-zinc-900/70 border border-zinc-808/50 rounded-xl p-2">
                        <span className="text-zinc-500 uppercase tracking-wider block">Confidence</span>
                        <div className="mt-1 text-white font-semibold">{belief.confidence}%</div>
                      </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-808/50 rounded-xl p-3 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-zinc-400 uppercase tracking-wider">Current reasoning</span>
                        <span className="text-zinc-500">{latestMessage ? 'Live' : 'Baseline'}</span>
                      </div>

                      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                        <motion.div className={`h-full ${barColor}`} style={{ width: `${belief.confidence}%` }} initial={{ width: 0 }} animate={{ width: `${belief.confidence}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} />
                      </div>

                      <p className="text-[10px] text-zinc-400 font-sans leading-relaxed line-clamp-3">
                        {latestMessage?.message || belief.shiftReason || `Confidence is anchored on ${belief.favorite}'s current profile.`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active tested targets */}
          <div className="bg-zinc-900 border border-zinc-808 rounded-xl p-5 shadow-sm text-xs">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block mb-2.5 font-bold">Council Contenders Scope</span>
            <div className="flex flex-wrap gap-1.5">
              {contenders.map(c => (
                <span key={c.id} className="bg-zinc-950 px-2.5 py-1 rounded border border-zinc-808 text-[11px] font-medium flex items-center gap-1.5">
                  {getCountryFlag(c.name, c.flag || '🏳️', "w-4.5 h-3")}
                  <span className="font-semibold text-zinc-300">{c.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* WhatsApp / Discord style Chat Message Room - col-span-8 */}
        <div id="chat-conversation-arena" className="lg:col-span-8 flex flex-col justify-between bg-zinc-900 border border-zinc-808 rounded-2xl p-4 md:p-6 shadow-sm min-h-[520px]">
          
          {/* Chat Messages Scrolling list container */}
          <div className="relative flex-1 flex flex-col min-h-[420px] overflow-hidden mb-4">
              {typingAgent && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 flex items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 text-xs text-zinc-300"
                >
                  <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-400 animate-pulse shrink-0"></span>
                  <span className="font-mono uppercase tracking-wider text-[10px] text-indigo-200">{typingAgent} is debating</span>
                  <span className="text-zinc-500">Composing the next statement...</span>
                </motion.div>
              )}

            <div 
              ref={scrollContainerRef} 
              onScroll={handleScroll}
              className="flex-1 space-y-4 max-h-[520px] overflow-y-auto pr-2 scrollbar-none md:scrollbar-thin"
            >
              <AnimatePresence initial={false}>
                {chatMessages.length > 0 ? (
                  (() => {
                    const renderMessage = (msg: DebateLog, index: number) => {
                      const isSys = msg.agentName === 'System';
                      
                      if (isSys) {
                        return (
                          <motion.div 
                            key={msg.id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex justify-center my-3"
                          >
                            <span className="bg-slate-950/85 text-slate-400 border border-indigo-500/10 px-4 py-2 rounded-2xl text-[10px] sm:text-[11px] font-mono text-center max-w-lg shadow-inner flex items-center gap-1.5 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0"></span>
                              {msg.message}
                            </span>
                          </motion.div>
                        );
                      }

                      // Define exact color styling based on the actual specialist role
                      let bubbleStyle = 'bg-slate-950 text-slate-200 border-slate-808';
                      let avatarColor = 'bg-indigo-600/20 text-indigo-400 border-indigo-500/20';
                      let accentColor = 'text-indigo-400';

                      if (msg.agentName === 'Stats Analyst' || msg.agentName === 'Stats Agent') {
                        bubbleStyle = 'bg-slate-950/70 border-indigo-500/10 hover:border-indigo-500/20';
                        avatarColor = 'bg-indigo-600/20 text-indigo-300 border-indigo-500/20';
                        accentColor = 'text-indigo-400';
                      } else if (msg.agentName === 'Squad Scout' || msg.agentName === 'Squad Agent') {
                        bubbleStyle = 'bg-slate-950/70 border-blue-500/10 hover:border-blue-500/20';
                        avatarColor = 'bg-blue-600/20 text-blue-300 border-blue-500/20';
                        accentColor = 'text-blue-400';
                      } else if (msg.agentName === 'Tactical Analyst' || msg.agentName === 'Tactics Agent') {
                        bubbleStyle = 'bg-slate-950/70 border-purple-500/10 hover:border-purple-500/20';
                        avatarColor = 'bg-purple-600/20 text-purple-300 border-purple-500/20';
                        accentColor = 'text-purple-400';
                      } else if (msg.agentName === 'History Analyst' || msg.agentName === 'History Agent') {
                        bubbleStyle = 'bg-slate-950/70 border-amber-500/10 hover:border-amber-500/20';
                        avatarColor = 'bg-amber-600/20 text-amber-300 border-amber-500/20';
                        accentColor = 'text-amber-400';
                      } else if (msg.agentName === 'Risk Analyst' || msg.agentName === 'Risk Agent') {
                        bubbleStyle = 'bg-slate-950/70 border-rose-500/10 hover:border-rose-500/20';
                        avatarColor = 'bg-rose-600/20 text-rose-300 border-rose-500/20';
                        accentColor = 'text-rose-450';
                      } else if (msg.agentName === 'Moderator') {
                        bubbleStyle = 'bg-slate-950 border-emerald-500/20 hover:border-emerald-500/30';
                        avatarColor = 'bg-emerald-600/20 text-emerald-300 border-emerald-500/20';
                        accentColor = 'text-emerald-400';
                      }

                      // Pretty name displays
                      const cleanAgentName = msg.agentName === 'Stats Agent' || msg.agentName === 'Stats Analyst' ? 'Stats Analyst'
                                        : msg.agentName === 'Squad Agent' || msg.agentName === 'Squad Scout' ? 'Squad Scout'
                                        : msg.agentName === 'Tactics Agent' || msg.agentName === 'Tactical Analyst' ? 'Tactical Analyst'
                                        : msg.agentName === 'History Agent' || msg.agentName === 'History Analyst' ? 'History Analyst'
                                        : msg.agentName === 'Risk Agent' || msg.agentName === 'Risk Analyst' ? 'Risk Analyst'
                                        : msg.agentName === 'Moderator' ? 'Moderator'
                                        : msg.agentName;

                      const showMindUpdate = msg.beliefState && msg.beliefState.history && msg.beliefState.history.length > 1;
                      const prevBelief = showMindUpdate ? msg.beliefState!.history![msg.beliefState!.history!.length - 2] : null;
                      const isOpinionChanged = prevBelief && (prevBelief.favorite !== msg.beliefState!.favorite || prevBelief.confidence !== msg.beliefState!.confidence);

                      return (
                        <motion.div 
                          key={msg.id || index}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className={`flex gap-3 items-start p-3.5 rounded-2xl border transition-colors ${bubbleStyle}`}
                        >
                          {/* Chat Circle Avatar representative */}
                          <div className={`w-9 h-9 rounded-full shrink-0 border flex items-center justify-center font-bold text-xs shadow-md select-none ${avatarColor}`}>
                            {msg.agentName.slice(0, 2)}
                          </div>

                          {/* Speech block body */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex justify-between items-baseline gap-2">
                              <strong className="text-sm text-slate-100 font-extrabold font-display leading-none">{cleanAgentName}</strong>
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{msg.role}</span>
                            </div>
                            
                            {msg.title && (
                              <div className={`text-[10px] font-mono font-bold tracking-wider uppercase ${accentColor}`}>
                                {msg.title}
                              </div>
                            )}
                            
                            <p className="text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-line font-sans pt-0.5 select-text selection:bg-indigo-600/35">
                              {msg.message}
                            </p>

                            {/* Visual Tool Usage inside Chat */}
                            {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                              <div className="mt-2 py-1.5 px-2.5 rounded-xl bg-slate-900/60 border border-slate-808 flex flex-wrap gap-1.5 items-center select-none">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                                <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Executed tool:</span>
                                {msg.toolsUsed.map((tool, tIdx) => (
                                  <span key={tIdx} className="bg-slate-950 text-[9px] font-mono text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Visual Mind shift alert pill inside speech bubbles */}
                            {msg.beliefState && (
                              <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                                {isOpinionChanged ? (
                                  <span className="bg-amber-600/10 border border-amber-500/25 text-amber-300 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 select-none">
                                    ⚡ Belief Shift: Favouring {msg.beliefState.favorite} ({prevBelief.confidence}% ➔ {msg.beliefState.confidence}%)
                                  </span>
                                ) : (
                                  <span className="bg-slate-900 border border-zinc-808 text-slate-400 text-[9px] font-mono px-2 py-0.5 rounded-md inline-flex items-center gap-1 select-none">
                                    🎯 Favorite: {msg.beliefState.favorite} ({msg.beliefState.confidence}%)
                                  </span>
                                )}
                                
                                {msg.beliefState.secondFavorite && (
                                  <span className="text-slate-500 text-[9px] font-mono select-none">
                                    / Alt: {msg.beliefState.secondFavorite} ({msg.beliefState.secondConfidence}%)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    };

                    return (
                      <div className="space-y-3.5 w-full">
                        {[
                          { key: 'round1', label: 'Round 1: Initial Council Predictions', messages: groupedMessages.round1 },
                          { key: 'round2', label: 'Round 2: Tactical Cross-Examinations', messages: groupedMessages.round2 },
                          { key: 'consensus', label: 'Final Consensus Verdict', messages: groupedMessages.consensus }
                        ].map((sec) => {
                          const isExpanded = expandedSection === sec.key;
                          const hasMessages = sec.messages.length > 0;
                          
                          // Hide upcoming empty sections while running to keep the interface extremely tidy
                          if (!hasMessages && isRunning) return null;

                          return (
                            <div 
                              key={sec.key} 
                              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                                isExpanded 
                                  ? 'border-zinc-700 bg-zinc-950/25 shadow-md' 
                                  : 'border-zinc-900/60 bg-zinc-900/40 hover:border-zinc-800'
                              }`}
                            >
                              {/* Accordion Header */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (hasMessages) {
                                    setExpandedSection(isExpanded ? null : (sec.key as any));
                                  }
                                }}
                                disabled={!hasMessages}
                                className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                                  !hasMessages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-zinc-900/50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`p-1.5 rounded-lg border ${
                                    isExpanded 
                                      ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' 
                                      : 'bg-zinc-950 border-zinc-808 text-zinc-500'
                                  }`}>
                                    {sec.key === 'round1' ? <Calendar className="w-4 h-4" />
                                     : sec.key === 'round2' ? <TrendingUp className="w-4 h-4" />
                                     : sec.key === 'round3' ? <Sparkles className="w-4 h-4" />
                                     : sec.key === 'moderator' ? <UserCheck className="w-4 h-4" />
                                     : <Trophy className="w-4 h-4" />}
                                  </span>
                                  <div>
                                    <span className={`text-xs font-bold leading-none block ${isExpanded ? 'text-white' : 'text-zinc-300'}`}>
                                      {sec.label}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-mono block mt-1.5">
                                      {hasMessages ? `${sec.messages.length} ${sec.messages.length === 1 ? 'statement' : 'statements'} recorded` : 'Awaiting simulation phase...'}
                                    </span>
                                  </div>
                                </div>

                                {hasMessages && (
                                  <div className="flex items-center gap-2">
                                    {sec.messages.length > 0 && isRunning && (
                                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900/35 animate-pulse">
                                        Live
                                      </span>
                                    )}
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-zinc-450" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-zinc-550" />
                                    )}
                                  </div>
                                )}
                              </button>

                              {/* Accordion Content */}
                              {isExpanded && hasMessages && (
                                <div className="p-4 border-t border-zinc-900/80 space-y-4 bg-zinc-950/45">
                                  {sec.messages.map((msg, msgIdx) => (
                                    <React.Fragment key={msg.id || msgIdx}>
                                      {renderMessage(msg, msgIdx)}
                                    </React.Fragment>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-slate-650 italic h-full min-h-[220px] flex flex-col items-center justify-center text-center gap-3 w-full">
                    <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-xs font-mono text-slate-400">Inviting prediction specialists to the panel...</p>
                  </div>
                )}
              </AnimatePresence>

              {/* Snap Snappy Typing Indicators */}
              {typingAgent && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-center bg-slate-950/40 p-3 rounded-2xl border border-indigo-500/5"
                >
                  <div className="w-8 h-8 rounded-full border border-indigo-500/20 bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <span className="text-xs animate-ping">💬</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-indigo-350 font-medium font-mono">
                      {typingAgent === 'Stats Agent' || typingAgent === 'Stats Analyst' ? '📊 Stats Analyst is calculating Elo standings...'
                       : typingAgent === 'Squad Agent' || typingAgent === 'Squad Scout' ? '⚽ Squad Scout is reviewing bench strength rosters...'
                       : typingAgent === 'Tactics Agent' || typingAgent === 'Tactical Analyst' ? '🎯 Tactical Analyst is charting squad setup shapes...'
                       : typingAgent === 'History Agent' || typingAgent === 'History Analyst' ? '📚 History Analyst is analyzing tournament lineage...'
                       : typingAgent === 'Risk Agent' || typingAgent === 'Risk Analyst' ? '⚠️ Risk Analyst is cross-checking tactical gaps...'
                       : typingAgent?.toLowerCase().includes('moderator') ? '🎙️ Moderator is assessing consensus models...'
                       : `${typingAgent} is typing comments...`}
                    </span>
                    <div className="flex gap-1 items-center pt-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Anchor block for scroll auto alignment */}
              <div ref={debateContainerEndRef} />
            </div>

            {/* Scroll bottom helper floating badge */}
            {!isAutoScrollActive && chatMessages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const container = scrollContainerRef.current;
                  if (container) {
                     container.scrollTo({
                      top: container.scrollHeight,
                      behavior: 'smooth'
                    });
                    setIsAutoScrollActive(true);
                  }
                }}
                className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-4 py-2 text-xs font-mono font-bold shadow-2xl transition-all border border-indigo-400 hover:scale-105 active:scale-95 flex items-center gap-1.5 z-10 cursor-pointer text-center"
              >
                <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                Resume Live Discussion
              </button>
            )}
          </div>

          {/* Reveal Verdict bottom card alert */}
          {!isRunning && moderatorReport && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="mt-2 bg-gradient-to-r from-indigo-950/45 to-slate-950 border border-indigo-500/25 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1 shrink-0">
                  <FifaTrophyLogo className="w-10 h-10" />
                </span>
                <div>
                  <strong className="text-xs text-white uppercase block font-mono">Prediction Debate Concluded!</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Unified prediction and analyst consensus is ready.</span>
                </div>
              </div>
              <button
                id="btn-reveal-consensus-room"
                type="button"
                onClick={() => setCurrentScreen('report')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase tracking-wider text-white rounded-xl shadow-md cursor-pointer border border-indigo-400 hover:scale-105 transition-all inline-flex items-center gap-1.5 shrink-0"
              >
                Reveal Consensus Report <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
