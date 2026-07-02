import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2, Database, Cpu, Users, MessageSquare, Trophy, Clock3, Sparkles } from 'lucide-react';

interface PremiumProgressStepperProps {
  currentRoundNum: number;
  chatMessagesCount: number;
  isRunning: boolean;
}

export default function PremiumProgressStepper({
  currentRoundNum,
  chatMessagesCount,
  isRunning
}: PremiumProgressStepperProps) {
  const stages = useMemo(() => {
    const timeline = [
      { id: 1, label: 'AI Council Assembling', desc: 'Specialist nodes are waking up and preparing the room.', icon: Sparkles },
      { id: 2, label: 'Live football data synchronized', desc: 'Verified rankings, fixtures, and match history are locked in.', icon: Database },
      { id: 3, label: 'Stats Analyst completed', desc: 'Objective performance signals have been processed.', icon: Cpu },
      { id: 4, label: 'Tactical Analyst completed', desc: 'Shape, structure, and matchup pressure are in review.', icon: Users },
      { id: 5, label: 'Squad Analyst debating', desc: 'Depth, form, and roster resilience are under discussion.', icon: MessageSquare },
      { id: 6, label: 'Momentum Analyst waiting', desc: 'Form streaks and in-session momentum are queued next.', icon: MessageSquare },
      { id: 7, label: 'Risk Analyst waiting', desc: 'Bracket volatility and upset risk are being staged.', icon: MessageSquare },
      { id: 8, label: 'Moderator reviewing arguments', desc: 'The consensus layer is synthesizing the final call.', icon: Trophy }
    ];

    const completedCount = !isRunning
      ? timeline.length
      : Math.min(
          timeline.length,
          Math.max(1, Math.floor(chatMessagesCount / 2) + Math.min(Math.max(currentRoundNum - 1, 0), 3))
        );

    return timeline.map((stage, index) => {
      const completed = index < completedCount;
      const active = isRunning && index === completedCount;
      return {
        ...stage,
        status: completed ? 'completed' : active ? 'loading' : 'upcoming'
      } as const;
    });
  }, [chatMessagesCount, currentRoundNum, isRunning]);

  const completedCount = stages.filter(stage => stage.status === 'completed').length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);
  const remainingSteps = Math.max(0, stages.length - completedCount);
  const estimatedSecondsRemaining = isRunning ? Math.max(3, remainingSteps * 1.2) : 0;

  return (
    <div id="premium-prediction-stepper" className="bg-zinc-950/70 border border-zinc-800/80 rounded-3xl p-5 md:p-6 shadow-2xl shadow-black/20 relative overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent"></div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-500">
              <span className={`h-2 w-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`}></span>
              Live Council Timeline
            </div>
            <h4 className="text-lg md:text-xl font-bold text-white font-display mt-2">AI Council assembling in real time</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              The council opens with synchronized data, then reveals each specialist as they complete their analysis.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
              <Clock3 className="w-3.5 h-3.5 text-indigo-300" />
              {isRunning ? `~${estimatedSecondsRemaining}s remaining` : 'Report ready'}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-mono text-zinc-500">
              {completedCount}/{stages.length} stages complete
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className={`rounded-2xl border p-4 transition-all duration-300 ${
                  stage.status === 'completed'
                    ? 'bg-emerald-500/5 border-emerald-500/15'
                    : stage.status === 'loading'
                      ? 'bg-indigo-500/8 border-indigo-400/25 shadow-lg shadow-indigo-950/15'
                      : 'bg-zinc-950 border-zinc-800/80 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {stage.status === 'completed' ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : stage.status === 'loading' ? (
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-400/35 flex items-center justify-center text-indigo-300">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                        <Icon className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Step {idx + 1}</span>
                      <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        stage.status === 'completed'
                          ? 'border-emerald-500/20 text-emerald-300 bg-emerald-500/5'
                          : stage.status === 'loading'
                            ? 'border-indigo-400/20 text-indigo-300 bg-indigo-500/5'
                            : 'border-zinc-800 text-zinc-500 bg-zinc-950'
                      }`}>
                        {stage.status}
                      </span>
                    </div>
                    <div className={`text-sm font-semibold leading-snug ${stage.status === 'loading' ? 'text-white' : 'text-zinc-200'}`}>
                      {stage.label}
                    </div>
                    <div className="text-[11px] text-zinc-500 leading-relaxed">
                      {stage.desc}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
