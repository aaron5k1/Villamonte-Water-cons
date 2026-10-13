import React, { useState } from 'react';
import { Lightbulb, Flame, Award, HeartPulse, ChevronRight, Droplet } from 'lucide-react';

interface HydrationTipsProps {
  currentStreak: number;
  progressPercent: number;
}

const FACTS = [
  {
    title: 'Cognitive Boost',
    desc: 'Mild dehydration of just 1-2% can impair concentration, working memory, and mood.',
    tag: 'Focus',
  },
  {
    title: 'Metabolism Kickstart',
    desc: 'Drinking 500ml of water can temporarily boost resting metabolic rate by 24-30%.',
    tag: 'Energy',
  },
  {
    title: 'Joint & Muscle Health',
    desc: 'Cartilage contains ~80% water. Consistent hydration keeps joints cushioned and prevents cramps.',
    tag: 'Fitness',
  },
  {
    title: 'Skin Glow & Elasticity',
    desc: 'Adequate hydration flushes cellular toxins and supports skin barrier elasticity.',
    tag: 'Vitality',
  },
];

export const HydrationTips: React.FC<HydrationTipsProps> = ({
  currentStreak,
  progressPercent,
}) => {
  const [factIndex, setFactIndex] = useState(0);

  const getSmartTip = () => {
    const hour = new Date().getHours();
    if (hour < 11) {
      return {
        title: 'Morning Rehydration Window',
        desc: 'Drink at least 400-500ml upon waking to activate internal organs and clear nighttime dehydration.',
        icon: '☀️',
      };
    } else if (hour < 16) {
      return {
        title: 'Afternoon Slump Defense',
        desc: progressPercent < 50
          ? "You are below 50% of your target. A tall glass now will stave off mid-day lethargy."
          : "Great momentum! Keep small continuous sips going through your afternoon tasks.",
        icon: '⚡',
      };
    } else if (hour < 20) {
      return {
        title: 'Evening Hydration Check',
        desc: progressPercent < 80
          ? 'Reach for your bottle before dinner to finish strong without disrupting your night sleep.'
          : 'Nearly there! You’ve done outstanding work maintaining hydration today.',
        icon: '🌇',
      };
    } else {
      return {
        title: 'Nighttime Wind-Down',
        desc: 'Take modest sips now so your body stays hydrated without frequent wake-ups at night.',
        icon: '🌙',
      };
    }
  };

  const smartTip = getSmartTip();
  const currentFact = FACTS[factIndex];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Smart Daily Coach Tip */}
      <div className="bg-gradient-to-br from-white to-sky-50/60 rounded-3xl border border-sky-100 p-5 shadow-lg shadow-sky-500/5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{smartTip.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                Hydration Coach
              </span>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700">
              Live Insight
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-900 mb-1">{smartTip.title}</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{smartTip.desc}</p>
        </div>

        {/* Streak & Consistency Bar */}
        <div className="mt-4 pt-3 border-t border-sky-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-50 text-amber-500 border border-amber-200">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800">{currentStreak} Day Streak</span>
              <p className="text-[10px] text-slate-500">Hydration consistency goal</p>
            </div>
          </div>

          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
            🔥 On Fire!
          </span>
        </div>
      </div>

      {/* Hydration Science & Body Facts Card */}
      <div className="bg-gradient-to-br from-white to-cyan-50/60 rounded-3xl border border-cyan-100 p-5 shadow-lg shadow-cyan-500/5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-cyan-100 text-cyan-700">
                <Lightbulb className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-800">
                Body Science
              </span>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
              {currentFact.tag}
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-900 mb-1">{currentFact.title}</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{currentFact.desc}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-cyan-100/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Fact {factIndex + 1} of {FACTS.length}
          </span>
          <button
            onClick={() => setFactIndex((prev) => (prev + 1) % FACTS.length)}
            className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 group"
          >
            <span>Next Insight</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
