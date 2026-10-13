import React, { useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Droplets } from 'lucide-react';

interface WaterWaveBottleProps {
  currentMl: number;
  goalMl: number;
  unit: 'ml' | 'oz';
  isGoalAchieved: boolean;
  onOpenGoalModal: () => void;
}

export const WaterWaveBottle: React.FC<WaterWaveBottleProps> = ({
  currentMl,
  goalMl,
  unit,
  isGoalAchieved,
  onOpenGoalModal,
}) => {
  const percentage = Math.round((currentMl / Math.max(1, goalMl)) * 100);
  const clampedPercent = Math.min(Math.max(percentage, 0), 100);

  const displayCurrent = unit === 'oz' ? (currentMl * 0.033814).toFixed(1) : currentMl.toLocaleString();
  const displayGoal = unit === 'oz' ? (goalMl * 0.033814).toFixed(1) : goalMl.toLocaleString();
  const remainingMl = Math.max(0, goalMl - currentMl);
  const displayRemaining = unit === 'oz' ? (remainingMl * 0.033814).toFixed(1) : remainingMl.toLocaleString();

  // Wave height calculation: liquid level height percentage (0% to 100%)
  const fillHeight = clampedPercent;

  const clipId = useId();
  const gradId = useId();

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur-xl rounded-3xl border border-sky-100/80 shadow-xl shadow-sky-500/5">
      {/* Top Status Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">
            <Droplets className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Hydration Level</h3>
            <p className="text-xs text-slate-500">Live Intake Vessel</p>
          </div>
        </div>

        <button
          onClick={onOpenGoalModal}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors border border-sky-200/50 flex items-center gap-1.5"
          title="Change daily goal"
        >
          <span>Goal: {displayGoal} {unit}</span>
          <span className="text-sky-400">✏️</span>
        </button>
      </div>

      {/* Main Hydration Flask Visual */}
      <div className="relative w-64 h-80 my-2 flex items-center justify-center">
        {/* Glow behind flask */}
        <div 
          className="absolute inset-4 rounded-full bg-gradient-to-tr from-sky-400/20 via-cyan-300/15 to-transparent blur-2xl -z-10 pointer-events-none transition-opacity duration-700"
          style={{ opacity: Math.max(0.3, clampedPercent / 100) }}
        />

        {/* Outer Flask Shell Glass Container */}
        <div className="relative w-52 h-76 rounded-[48px] bg-slate-50/50 border-[3.5px] border-slate-200/90 shadow-[inset_0_4px_16px_rgba(255,255,255,0.9),0_12px_32px_rgba(14,165,233,0.12)] overflow-hidden flex flex-col justify-end">
          
          {/* Glass Gloss / Reflection Overlay */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Left curved specular sheen */}
            <div className="absolute top-4 left-3 w-3 h-64 bg-gradient-to-b from-white/70 via-white/20 to-transparent rounded-full blur-[0.5px]" />
            {/* Right subtle reflection */}
            <div className="absolute top-12 right-3 w-1.5 h-48 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-full" />
            
            {/* Measurement Level Ticks */}
            <div className="absolute right-4 top-8 bottom-8 flex flex-col justify-between text-[10px] font-mono text-slate-400/70 select-none">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-[1.5px] bg-slate-300"></span>
                <span>100%</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-[1px] bg-slate-200"></span>
                <span>75%</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-[1.5px] bg-slate-300"></span>
                <span>50%</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-[1px] bg-slate-200"></span>
                <span>25%</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-[1px] bg-slate-200"></span>
                <span>0%</span>
              </span>
            </div>
          </div>

          {/* Liquid Container with SVG Wave and Animation */}
          <div
            className="w-full relative transition-all duration-700 ease-out"
            style={{ height: `${fillHeight}%` }}
          >
            {/* Animated SVG Wave at liquid surface */}
            <div className="absolute -top-6 left-0 right-0 h-8 overflow-hidden z-10 pointer-events-none">
              <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className="w-[200%] h-full fill-sky-400/80 animate-wave-slow"
              >
                <path d="M0,0 C150,90 350,-40 500,30 C650,90 850,-40 1000,30 C1150,90 1350,-40 1500,30 L1500,120 L0,120 Z" />
              </svg>
              <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className="w-[200%] h-full fill-cyan-400/60 -mt-8 animate-wave-fast"
              >
                <path d="M0,40 C150,-20 350,80 500,20 C650,-20 850,80 1000,20 C1150,-20 1350,80 1500,20 L1500,120 L0,120 Z" />
              </svg>
            </div>

            {/* Solid Water Body */}
            <div className="w-full h-full bg-gradient-to-t from-sky-600 via-sky-400 to-cyan-300 relative overflow-hidden">
              {/* Internal ambient water gradient shine */}
              <div className="absolute inset-0 bg-radial from-white/20 via-transparent to-black/10" />

              {/* Rising water bubbles */}
              <div className="absolute left-6 bottom-0 w-2 h-2 rounded-full bg-white/60 animate-bubble-1" />
              <div className="absolute left-16 bottom-0 w-3 h-3 rounded-full bg-white/40 animate-bubble-2" />
              <div className="absolute left-28 bottom-0 w-2.5 h-2.5 rounded-full bg-white/50 animate-bubble-3" />
              <div className="absolute left-36 bottom-0 w-1.5 h-1.5 rounded-full bg-white/60 animate-bubble-1" />
            </div>
          </div>

          {/* Flask Bottom Glass Rim */}
          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-slate-200/50 to-transparent pointer-events-none z-20" />
        </div>

        {/* Center Percentage & Info Badge Floating Over Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
          <motion.div
            key={percentage}
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex flex-col items-center"
          >
            <div className="backdrop-blur-md bg-white/75 px-4 py-2 rounded-2xl border border-white/80 shadow-lg shadow-sky-900/10 flex flex-col items-center">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight text-slate-800">
                  {percentage}%
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                {currentMl >= goalMl ? 'Goal Met' : 'Hydrated'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Goal celebration badge on completion */}
        <AnimatePresence>
          {isGoalAchieved && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-1 border border-amber-300"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-950 fill-amber-950" />
              <span>Goal Reached!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Numbers & Remaining Stats */}
      <div className="w-full mt-2 grid grid-cols-2 gap-3 text-center">
        <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-2.5">
          <p className="text-[11px] font-medium text-sky-700 uppercase tracking-wider">Consumed</p>
          <p className="text-lg font-bold text-slate-800">
            {displayCurrent} <span className="text-xs font-semibold text-slate-500">{unit}</span>
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5">
          <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">
            {currentMl >= goalMl ? 'Extra Intake' : 'Remaining'}
          </p>
          <p className="text-lg font-bold text-slate-800">
            {currentMl >= goalMl
              ? `+${(currentMl - goalMl).toLocaleString()}`
              : displayRemaining}{' '}
            <span className="text-xs font-semibold text-slate-500">{unit}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
