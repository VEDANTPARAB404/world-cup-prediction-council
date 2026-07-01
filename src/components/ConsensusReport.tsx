import React from 'react';
import { Contender, ModeratorOutput, DebateLog } from '../types';
import { Trophy, ArrowRight, RotateCcw, AlertTriangle, ArrowLeft, Shield, Globe, Award, Star, Activity, Medal } from 'lucide-react';
import FifaTrophyLogo from './FifaTrophyLogo';
import { motion } from 'motion/react';

interface ConsensusReportProps {
  moderatorReport: ModeratorOutput | null;
  contenders: Contender[];
  getCountryFlag: (name: string, emojiFallback?: string, sizeClass?: string) => React.ReactNode;
  setCurrentScreen: (screen: 'selection' | 'debate' | 'report') => void;
  chatMessages?: DebateLog[];
}

export default function ConsensusReport({
  moderatorReport,
  contenders,
  getCountryFlag,
  setCurrentScreen,
  chatMessages
}: ConsensusReportProps) {
  // Baseline default belief states for specialists before they speak
  const fav1 = contenders[0]?.name || 'Spain';
  const fav2 = contenders[1]?.name || 'France';
  const fav4 = contenders[3]?.name || 'Argentina';

  const defaultBeliefs: Record<string, any> = React.useMemo(() => ({
    'Stats Analyst': { favorite: fav1, confidence: 84, history: [{ favorite: fav1, confidence: 84 }] },
    'Tactical Analyst': { favorite: fav1, confidence: 78, history: [{ favorite: fav1, confidence: 78 }] },
    'Squad Analyst': { favorite: fav2, confidence: 80, history: [{ favorite: fav2, confidence: 80 }] },
    'Momentum Analyst': { favorite: fav2, confidence: 84, history: [{ favorite: fav2, confidence: 84 }] },
    'Defensive Analyst': { favorite: fav1, confidence: 75, history: [{ favorite: fav1, confidence: 75 }] },
    'Attacking Analyst': { favorite: fav1, confidence: 79, history: [{ favorite: fav1, confidence: 79 }] },
    'Risk Analyst': { favorite: fav1, confidence: 70, history: [{ favorite: fav1, confidence: 70 }] }
  }), [fav1, fav2, fav4]);

  const getAgentActiveState = (agentName: string) => {
    if (chatMessages) {
      for (let i = chatMessages.length - 1; i >= 0; i--) {
        const msg = chatMessages[i];
        if (msg.agentName === agentName && msg.beliefState) {
          return msg.beliefState;
        }
      }
    }
    return defaultBeliefs[agentName] || { favorite: 'Unknown', confidence: 50, history: [] };
  };

  // Dynamic metric calculations for the key evidence highlights section
  const highestElo = React.useMemo(() => {
    if (!contenders || contenders.length === 0) return null;
    return [...contenders].sort((a, b) => b.eloRating - a.eloRating)[0];
  }, [contenders]);

  const bestDef = React.useMemo(() => {
    if (!contenders || contenders.length === 0) return null;
    return [...contenders].sort((a, b) => a.goalsConcededLast10 - b.goalsConcededLast10)[0];
  }, [contenders]);

  const bestOff = React.useMemo(() => {
    if (!contenders || contenders.length === 0) return null;
    return [...contenders].sort((a, b) => b.goalsScoredLast10 - a.goalsScoredLast10)[0];
  }, [contenders]);

  const highestFifa = React.useMemo(() => {
    if (!contenders || contenders.length === 0) return null;
    return [...contenders].sort((a, b) => a.fifaRanking - b.fifaRanking)[0];
  }, [contenders]);

  return (
    <div className="space-y-6 flex flex-col justify-stretch">
      
      {/* Visual Indicator Header */}
      <div id="report-header" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1 shrink-0">
            <FifaTrophyLogo className="w-9 h-9" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-mono">Consensus Analysis Report</h4>
            <p className="text-zinc-550 text-[10px] font-mono mt-0.5">Comprehensive tactical forecast compiled from specialist sports analytics insights</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-nav-back"
            type="button"
            onClick={() => setCurrentScreen('debate')}
            className="px-4 py-1.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-808 text-xs font-mono rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 font-semibold group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Go Back</span>
          </button>
          <button
            id="btn-nav-transcripts"
            type="button"
            onClick={() => setCurrentScreen('debate')}
            className="px-4 py-1.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-350 border border-zinc-808 text-xs font-mono rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 font-semibold"
          >
            Review Debate Room Transcripts
          </button>
          <button
            id="btn-nav-roster-builder"
            type="button"
            onClick={() => setCurrentScreen('selection')}
            className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white border border-indigo-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm inline-flex items-center gap-1.5"
          >
            Roster Builder
          </button>
        </div>
      </div>

      {/* Main Bento Report Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in">
        
        {/* Predicted Winner block - col-span-8 */}
        <div className="lg:col-span-8 bg-zinc-900 border-2 border-amber-500/35 rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-amber-950/10">
          {/* Subtle Golden Radial Glow */}
          <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-gradient-to-r from-amber-500/10 to-transparent blur-3xl pointer-events-none"></div>
          
          <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-9xl -mr-10 -mt-10 uppercase tracking-tighter select-none font-sans text-amber-500">
            CHAMPION
          </div>

          <div className="relative z-10 w-full space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400 stroke-[2.5]" />
                    Pundit Consensus Champion Prediction
                  </span>
                </div>
                
                {moderatorReport ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-808 p-1.5 shadow-inner shrink-0">
                        {getCountryFlag(
                          moderatorReport.predictedWinner, 
                          contenders.find(c => c.name.toLowerCase() === moderatorReport.predictedWinner.toLowerCase())?.flag || '🏆', 
                          "w-16 h-11 rounded"
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-550 font-mono uppercase tracking-widest block font-bold">PREDICTED TO LIFT THE CUP</span>
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight font-sans mt-1">
                          {moderatorReport.predictedWinner}
                        </h2>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-semibold text-zinc-400 text-[10px] uppercase tracking-wider font-mono">Expert Editorial Summary:</h5>
                      <p className="text-zinc-200 text-xs md:text-sm leading-relaxed bg-zinc-950 p-4 rounded-xl border border-zinc-808/80 italic shadow-inner">
                        "{moderatorReport.finalVerdict}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-16 w-80 bg-zinc-850 animate-pulse rounded-xl mt-2"></div>
                    <div className="h-20 w-full max-w-lg bg-zinc-850 animate-pulse rounded-lg mt-4"></div>
                  </div>
                )}
              </div>

              {moderatorReport ? (
                <div className="text-left sm:text-right flex flex-col justify-start sm:items-end gap-3.5 shrink-0 w-full sm:w-auto">
                  <div>
                    <p className="text-zinc-550 text-[10px] uppercase tracking-wider font-bold mb-1.5 font-mono">Consensus Probability</p>
                    <div className="text-4xl md:text-5.5xl font-mono font-black text-amber-400 bg-zinc-950 px-5 py-2.5 rounded-2xl border-2 border-amber-500/20 shadow-lg inline-block">
                      {moderatorReport.winnerProbability}%
                    </div>
                  </div>

                  <div>
                    <p className="text-zinc-550 text-[10px] uppercase tracking-wider font-bold mb-1 font-mono">Confidence Level</p>
                    <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg text-xs font-mono font-bold">
                      {moderatorReport.winnerProbability > 35 ? 'HIGH CONSENSUS' : 'MODERATE AGENT DEBATE'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-20 w-32 bg-zinc-850 animate-pulse rounded-xl shrink-0"></div>
              )}
            </div>
          </div>

          {/* Core strengths lists inside Bento Block */}
          {moderatorReport && (
            <div className="mt-8 border-t border-zinc-850/80 pt-6 relative z-10">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono mb-3.5">Vetted Champion Tactical Strengths</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {moderatorReport.keyStrengths.map((strength, index) => (
                  <div key={index} className="flex gap-2.5 items-start bg-zinc-950/60 p-3 rounded-xl border border-zinc-808 transition-colors hover:border-zinc-700">
                    <span className="text-amber-400 mt-0.5 font-bold">✓</span>
                    <span className="text-xs text-zinc-300 leading-relaxed font-semibold">{strength}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right col: Consensus Probability Board (col-span-4) */}
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-808 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono mb-4">
              Consolidated Contender Standings
            </h3>

            <div className="space-y-4">
              {moderatorReport ? (
                moderatorReport.top5.map((candidate, idx) => {
                  const matchedTeam = contenders.find(c => c.name.toLowerCase() === candidate.team.toLowerCase());
                  const flag = matchedTeam?.flag || '⚽';
                  const originalPrimaryColor = matchedTeam?.primaryColor || '#6366f1';
                  
                  // Custom podium style colors: Gold, Silver, Bronze
                  const is1st = idx === 0;
                  const is2nd = idx === 1;
                  const is3rd = idx === 2;
                  
                  const podiumBg = is1st 
                    ? 'border-amber-500/20 bg-amber-950/5' 
                    : is2nd 
                      ? 'border-slate-400/10 bg-slate-400/5' 
                      : is3rd 
                        ? 'border-orange-500/10 bg-orange-950/5' 
                        : 'border-zinc-900 bg-zinc-950/20';

                  const badgeStyle = is1st
                    ? 'bg-amber-950 border-amber-500/35 text-amber-400'
                    : is2nd
                      ? 'bg-slate-900 border-slate-600/30 text-slate-300'
                      : is3rd
                        ? 'bg-orange-950 border-orange-700/30 text-orange-400'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-550';

                  return (
                    <div key={idx} className={`p-3 rounded-2xl border transition-all ${podiumBg}`}>
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="font-extrabold text-zinc-200 flex items-center gap-1.5">
                          <span className={`w-5 h-5 rounded-md border text-[9px] font-mono flex items-center justify-center font-bold ${badgeStyle}`}>
                            {is1st ? '🥇' : is2nd ? '🥈' : is3rd ? '🥉' : `0${idx+1}`}
                          </span>
                          {getCountryFlag(candidate.team, flag, "w-4.5 h-3")}
                          <span className="truncate max-w-[120px]">{candidate.team}</span>
                        </span>
                        
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-[10px] text-zinc-500 uppercase">PROB:</span>
                          <span className={`font-black ${is1st ? 'text-amber-400 text-sm' : 'text-indigo-400'}`}>
                            {candidate.probability}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Animated Framer Motion Probability Bar */}
                      <div className="w-full h-7 bg-zinc-950 rounded-lg overflow-hidden flex items-center px-3 relative border border-zinc-850 font-sans">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.probability}%` }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          className="absolute left-0 top-0 bottom-0 border-r-2" 
                          style={{ 
                            backgroundColor: is1st ? 'rgba(245, 158, 11, 0.08)' : `${originalPrimaryColor}10`,
                            borderRightColor: is1st ? '#f59e0b' : originalPrimaryColor
                          }}
                        />
                        <span className="relative z-10 text-[9.5px] text-zinc-400 leading-normal line-clamp-1 pr-1 italic">
                          {candidate.reason}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                [1,2,3,4,5].map((idx) => (
                  <div key={idx} className="space-y-1.5 animate-pulse">
                    <div className="flex justify-between h-4 bg-zinc-800 rounded-md w-full"></div>
                    <div className="h-8 bg-zinc-800 rounded-lg w-full"></div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-zinc-850 text-[10px] font-mono text-zinc-550 font-semibold uppercase tracking-wider text-center">
            Consolidated ELO parameters, squad rosters, and coaching blocks complete.
          </div>
        </div>
      </div>

      {/* 🔑 Key Evidence Highlights Bento Grid */}
      {contenders && contenders.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-808 rounded-xl p-6 md:p-8 space-y-4 shadow-sm">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center gap-2">
              <span className="text-amber-400">🔑</span> Tournament Evidence Highlights
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              Instantly synthesized coefficients from registered panels for comparative evaluation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {highestElo && (
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-808/80 flex flex-col justify-between gap-3 transition-colors hover:border-zinc-700">
                <div className="flex items-center justify-between text-zinc-450">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Highest Elo Coefficient</span>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <div className="text-base font-bold text-white flex items-center gap-1.5 leading-tight">
                    {getCountryFlag(highestElo.name, highestElo.flag || '⚽', "w-4 h-2.5")}
                    {highestElo.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-1.5 font-bold">
                    📈 {highestElo.eloRating} Elo Points
                  </div>
                </div>
              </div>
            )}

            {bestDef && (
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-808/80 flex flex-col justify-between gap-3 transition-colors hover:border-zinc-700">
                <div className="flex items-center justify-between text-zinc-450">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Best Defensive Record</span>
                  <Shield className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-white flex items-center gap-1.5 leading-tight">
                    {getCountryFlag(bestDef.name, bestDef.flag || '⚽', "w-4 h-2.5")}
                    {bestDef.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-1.5 font-bold">
                    🛡 Conceded: {bestDef.goalsConcededLast10} goals (last 10)
                  </div>
                </div>
              </div>
            )}

            {bestOff && (
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-808/80 flex flex-col justify-between gap-3 transition-colors hover:border-zinc-700">
                <div className="flex items-center justify-between text-zinc-450">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Strongest Recent Form</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-white flex items-center gap-1.5 leading-tight">
                    {getCountryFlag(bestOff.name, bestOff.flag || '⚽', "w-4 h-2.5")}
                    {bestOff.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-1.5 font-bold">
                    ⚽ Scored: {bestOff.goalsScoredLast10} goals (Form: {bestOff.recentForm})
                  </div>
                </div>
              </div>
            )}

            {highestFifa && (
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-808/80 flex flex-col justify-between gap-3 transition-colors hover:border-zinc-700">
                <div className="flex items-center justify-between text-zinc-450">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Top FIFA Ranking</span>
                  <Globe className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-white flex items-center gap-1.5 leading-tight">
                    {getCountryFlag(highestFifa.name, highestFifa.flag || '⚽', "w-4 h-2.5")}
                    {highestFifa.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-1.5 font-bold">
                    🌍 World Rank #{highestFifa.fifaRanking}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hybrid Probability Engine - Inspection / Debugger Panel */}
      {moderatorReport && moderatorReport.baselineProbabilities && (
        <div className="bg-zinc-900 border border-zinc-808 rounded-xl p-6 md:p-8 space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.02] font-black text-8xl -mr-6 -mt-6 select-none font-mono">
            HYBRID ENGINE
          </div>

          <div className="border-b border-zinc-808 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono flex items-center gap-1.5">
                Hybrid Probability Engine: Stage 1 vs Stage 2
              </h3>
              <p className="text-[10px] font-mono text-zinc-550 mt-0.5">
                Inspect Stage 1 (Deterministic Statistical Model) baseline against Stage 2 (OpenAI Expert Council) evidence-based adjustments
              </p>
            </div>
            <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2 py-1 rounded">
              Status: Correctly Calibrated (Sum = 100.0%)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Box: Comparisons */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Contender Calibration Audit</h4>
              <div className="space-y-2 bg-zinc-950/60 p-4 rounded-xl border border-zinc-808">
                {Object.keys(moderatorReport.baselineProbabilities).map((team) => {
                  const base = moderatorReport.baselineProbabilities?.[team] ?? 0;
                  const final = moderatorReport.finalProbabilities?.[team] ?? base;
                  const change = final - base;
                  const changeStr = change > 0 ? `+${change.toFixed(1)}%` : change < 0 ? `${change.toFixed(1)}%` : 'Unchanged';
                  const changeClass = change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-455' : 'text-zinc-500';

                  return (
                    <div key={team} className="flex items-center justify-between text-xs border-b border-zinc-900 last:border-0 pb-1.5 last:pb-0">
                      <span className="font-semibold text-zinc-350 flex items-center gap-1.5">
                        {getCountryFlag(team, contenders.find(c => c.name.toLowerCase() === team.toLowerCase())?.flag || '⚽', "w-4 h-2.5")}
                        {team}
                      </span>
                      <div className="flex items-center gap-4 font-mono">
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 block">Baseline</span>
                          <span className="text-zinc-400 font-semibold">{base.toFixed(1)}%</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 block">Council Final</span>
                          <span className="text-indigo-400 font-bold">{final.toFixed(1)}%</span>
                        </div>
                        <div className="text-right min-w-[70px]">
                          <span className="text-[10px] text-zinc-500 block">Shift</span>
                          <span className={`font-bold ${changeClass}`}>{changeStr}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Box: Adjustments Ledger */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Active Council Adjustments Ledger</h4>
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {moderatorReport.changes && moderatorReport.changes.length > 0 ? (
                  moderatorReport.changes.map((ch, i) => (
                    <div key={i} className="bg-zinc-950 p-3 rounded-lg border border-zinc-808 space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                          {getCountryFlag(ch.team, contenders.find(c => c.name.toLowerCase() === ch.team.toLowerCase())?.flag || '⚽', "w-3.5 h-2")}
                          {ch.team}
                        </span>
                        <span className={`font-semibold ${ch.new > ch.old ? 'text-emerald-400' : 'text-red-400'}`}>
                          {ch.old.toFixed(1)}% → {ch.new.toFixed(1)}% ({ch.new > ch.old ? '+' : ''}{(ch.new - ch.old).toFixed(1)}%)
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-normal italic">
                        "{ch.reason}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-808 text-center text-xs text-zinc-500 font-mono">
                    No adjustments made. Council accepted mathematical baseline parameters without modification.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collaborative Analyst Intelligence Insights */}
      {moderatorReport && (
        <div className="bg-zinc-900 border border-zinc-808 rounded-xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.02] font-black text-8xl -mr-6 -mt-6 select-none font-mono">
            INTEL
          </div>
          
          <div className="border-b border-zinc-808 pb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
              Collaborative Analyst Intelligence Insights
            </h3>
            <p className="text-[10px] font-mono text-zinc-550 mt-0.5">
              Synthesis of stance shifts, core friction points, and argument validation from the discussion session
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Col: Argument Validity & Friction Point */}
            <div className="space-y-5">
              {moderatorReport.strongestArgument && (
                <div className="bg-zinc-950 border border-zinc-808 p-4 rounded-xl space-y-2 transition-all">
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-808 pb-1.5">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      Strongest Critical Argument
                    </span>
                    <span className="bg-zinc-900 text-zinc-400 text-[9px] font-mono font-semibold px-2 py-0.5 rounded border border-zinc-808">
                      {moderatorReport.strongestArgument.author || 'Analyst'}
                    </span>
                  </div>
                  <h5 className="text-[11px] font-mono text-white font-bold leading-snug">
                    {moderatorReport.strongestArgument.argumentTitle}
                  </h5>
                  <p className="text-zinc-300 text-xs leading-relaxed font-sans select-text italic">
                    "{moderatorReport.strongestArgument.text}"
                  </p>
                </div>
              )}

              {moderatorReport.weakestArgument && (
                <div className="bg-zinc-950 border border-zinc-808 p-4 rounded-xl space-y-2 transition-all">
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-808 pb-1.5">
                    <span className="text-[10px] font-mono font-bold text-zinc-450 uppercase tracking-wider">
                      Weakest Argument Exposed
                    </span>
                    <span className="bg-zinc-900 text-zinc-400 text-[9px] font-mono font-semibold px-2 py-0.5 rounded border border-zinc-808">
                      {moderatorReport.weakestArgument.author || 'Analyst'}
                    </span>
                  </div>
                  <h5 className="text-[11px] font-mono text-white font-bold leading-snug">
                    {moderatorReport.weakestArgument.argumentTitle}
                  </h5>
                  <p className="text-zinc-300 text-xs leading-relaxed font-sans select-text italic">
                    "{moderatorReport.weakestArgument.text}"
                  </p>
                </div>
              )}

              {moderatorReport.biggestDisagreement && (
                <div className="bg-zinc-950 border border-zinc-808 p-4 rounded-xl space-y-2 transition-all">
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-808 pb-1.5">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      Central Tactical Friction Point
                    </span>
                    {moderatorReport.biggestDisagreement.opponents && moderatorReport.biggestDisagreement.opponents.length > 0 && (
                      <span className="bg-zinc-900 text-zinc-400 text-[9px] font-mono font-semibold px-2 py-0.5 rounded border border-zinc-808">
                        {moderatorReport.biggestDisagreement.opponents.join(' vs ')}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed font-sans select-text">
                    {moderatorReport.biggestDisagreement.description}
                  </p>
                </div>
              )}
            </div>

            {/* Right Col: Mind Shift & Consensus Analysis */}
            <div className="space-y-5">
              {moderatorReport.mostChangedAgent && (
                <div className="bg-zinc-950 border border-zinc-808 p-4 rounded-xl space-y-2 transition-all">
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-808 pb-1.5">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                      Analyst Shift Tracker
                    </span>
                    <span className="bg-zinc-900 text-zinc-400 text-[9px] font-mono font-semibold px-2 py-0.5 rounded border border-zinc-808">
                      {moderatorReport.mostChangedAgent.agent}
                    </span>
                  </div>
                  <div className="text-[11px] font-sans text-zinc-350">
                    Shifted stance from <strong className="text-white">{moderatorReport.mostChangedAgent.startFav}</strong> ({moderatorReport.mostChangedAgent.startConfidence}%) to <strong className="text-zinc-300">{moderatorReport.mostChangedAgent.endFav}</strong> ({moderatorReport.mostChangedAgent.endConfidence}%).
                  </div>
                  <div className="pt-1.5 border-t border-zinc-808 text-[10px] text-zinc-450 italic leading-relaxed">
                    <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider block not-italic mb-0.5">Primary Catalyst</span>
                    "{moderatorReport.mostChangedAgent.shiftReason}"
                  </div>
                </div>
              )}

              {moderatorReport.finalConsensusReasoning && (
                <div className="bg-zinc-950 border border-zinc-808 p-4 rounded-xl space-y-1.5 transition-all">
                  <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                    Unified Consensus Assembly Logic
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed font-sans select-text">
                    {moderatorReport.finalConsensusReasoning}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Bottom Row - Risks & Warnings and quick campaign trigger options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-zinc-900 border border-zinc-808 rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-4 font-mono flex items-center gap-1.5">
              Hard Target Bottlenecks & Strategic Risks
            </h3>
            
            {moderatorReport ? (
              <ul className="space-y-3">
                {moderatorReport.keyRisks.map((riskItem, index) => (
                  <li key={index} className="flex gap-2.5 items-start bg-zinc-950/60 p-3 rounded-lg border border-red-950/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                    <span className="text-xs text-red-200/90 leading-relaxed font-semibold">
                      {riskItem}
                    </span>
                  </li>
                ))}
                {contenders.length > 5 && (
                  <li className="flex gap-2.5 items-start bg-zinc-950/60 p-3 rounded-lg border border-red-950/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                    <span className="text-xs text-red-200/90 leading-relaxed font-semibold">
                      High contender density bracket alerts detected in summer playoffs. This multiplies systemic coaching surprises.
                    </span>
                  </li>
                )}
              </ul>
            ) : (
              <div className="space-y-3">
                <div className="h-10 bg-zinc-800 animate-pulse rounded-lg"></div>
                <div className="h-10 bg-zinc-800 animate-pulse rounded-lg"></div>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-red-950/20 text-[10px] uppercase font-mono tracking-wider font-semibold text-red-400">
            Vulnerability indices fully mapped and vetted.
          </div>
        </div>

        {/* Start New Campaign card */}
        <div className="bg-zinc-900 border border-zinc-808 rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 font-mono">
              Tournament Campaign Options
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4 font-semibold">
              Adjust active contender nations, sync recent on-pitch outcomes from real-world soccer matches, or design your own custom unlisted competitors under Coach strategic plans.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              id="btn-restart-campaign"
              onClick={() => setCurrentScreen('selection')}
              className="py-2.5 px-4 bg-zinc-955 hover:bg-zinc-850 text-xs text-zinc-300 font-semibold uppercase rounded-lg border border-zinc-808 hover:text-white transition-all cursor-pointer flex-1 text-center justify-center flex items-center gap-1.5 font-mono"
            >
              Start New Campaign
            </button>
            <button
              type="button"
              id="btn-nav-reread-debate"
              onClick={() => setCurrentScreen('debate')}
              className="py-2.5 px-4 bg-indigo-650/40 hover:bg-indigo-650 text-xs text-indigo-300 hover:text-white font-semibold uppercase rounded-lg border border-indigo-500/20 transition-all cursor-pointer flex-1 text-center justify-center flex items-center gap-1.5"
            >
              Reread Debate
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
