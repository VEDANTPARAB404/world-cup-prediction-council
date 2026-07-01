import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Loader2, Database, ShieldAlert, Cpu, Users, MessageSquare, Award } from 'lucide-react';

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
  const [stages, setStages] = useState([
    { id: 1, label: 'Synchronizing Football-Data.org', desc: 'Querying live leagues, Elo rankings, and head-to-head records.', icon: Database, status: 'loading' },
    { id: 2, label: 'Building statistical model', desc: 'Compiling deterministic Monte Carlo simulation metrics.', icon: Cpu, status: 'upcoming' },
    { id: 3, label: 'Convening AI Prediction Council', desc: 'Bootstrapping specialized analyst agents.', icon: Users, status: 'upcoming' },
    { id: 4, label: 'Expert debate in progress', desc: 'Simulating cross-examinations and perspective shifts.', icon: MessageSquare, status: 'upcoming' },
    { id: 5, label: 'Finalizing prediction & consensus', desc: 'Calibrating hybrid weights and releasing final report.', icon: Award, status: 'upcoming' }
  ]);

  useEffect(() => {
    if (!isRunning) {
      // All completed
      setStages(prev => prev.map(s => ({ ...s, status: 'completed' })));
      return;
    }

    // Determine status of each stage dynamically based on progress indicators
    setStages(prev => {
      return prev.map(stage => {
        let status: 'upcoming' | 'loading' | 'completed' = 'upcoming';

        if (stage.id === 1) {
          // Sync completes very fast at the start
          status = (chatMessagesCount > 1 || currentRoundNum > 1) ? 'completed' : 'loading';
        } else if (stage.id === 2) {
          const stage1Done = chatMessagesCount > 1 || currentRoundNum > 1;
          if (stage1Done) {
            status = (chatMessagesCount > 2 || currentRoundNum > 1) ? 'completed' : 'loading';
          } else {
            status = 'upcoming';
          }
        } else if (stage.id === 3) {
          const stage2Done = chatMessagesCount > 2 || currentRoundNum > 1;
          if (stage2Done) {
            status = (currentRoundNum > 1) ? 'completed' : 'loading';
          } else {
            status = 'upcoming';
          }
        } else if (stage.id === 4) {
          const stage3Done = currentRoundNum > 1;
          if (stage3Done) {
            status = (currentRoundNum > 4) ? 'completed' : 'loading';
          } else {
            status = 'upcoming';
          }
        } else if (stage.id === 5) {
          const stage4Done = currentRoundNum > 4;
          if (stage4Done) {
            status = isRunning ? 'loading' : 'completed';
          } else {
            status = 'upcoming';
          }
        }

        return { ...stage, status };
      });
    });
  }, [currentRoundNum, chatMessagesCount, isRunning]);

  return (
    <div id="premium-prediction-stepper" className="bg-zinc-950/60 border border-zinc-808/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="absolute top-0 right-0 p-4 opacity-[0.01] font-black text-5xl select-none font-mono tracking-widest text-zinc-400">
        PIPELINE
      </div>
      
      <div className="flex items-center gap-3 border-b border-zinc-900 pb-3.5 mb-5">
        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-200 font-mono">
          Orchestration Pipeline Status
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div 
              key={stage.id} 
              className={`p-4 rounded-xl border transition-all duration-300 flex items-start gap-3.5 ${
                stage.status === 'completed'
                  ? 'bg-zinc-900/40 border-emerald-900/30'
                  : stage.status === 'loading'
                    ? 'bg-zinc-900/80 border-indigo-500/20 shadow-lg shadow-indigo-950/20'
                    : 'bg-zinc-950 border-zinc-900/60 opacity-60'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {stage.status === 'completed' ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : stage.status === 'loading' ? (
                  <div className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400 animate-spin">
                    <Loader2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 font-mono text-xs">
                    {idx + 1}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className={`text-xs font-semibold block leading-tight ${
                  stage.status === 'completed' 
                    ? 'text-zinc-200' 
                    : stage.status === 'loading'
                      ? 'text-white'
                      : 'text-zinc-455'
                }`}>
                  {stage.label}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium block leading-normal">
                  {stage.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
