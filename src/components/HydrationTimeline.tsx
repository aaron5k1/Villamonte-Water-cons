import React from 'react';
import { Clock, CheckCircle2, Circle, Droplets, Sun, Sunset, Moon, Sunrise, Coffee } from 'lucide-react';
import { UnitType } from '../types';

interface Milestone {
  id: string;
  timeLabel: string;
  title: string;
  targetMl: number;
  icon: string;
  idealHour: number;
}

interface HydrationTimelineProps {
  currentMl: number;
  dailyGoalMl: number;
  unit: UnitType;
  onLogMilestone: (ml: number, title: string) => void;
}

export const HydrationTimeline: React.FC<HydrationTimelineProps> = ({
  currentMl,
  dailyGoalMl,
  unit,
  onLogMilestone,
}) => {
  // Dynamically divide the daily goal into 5 proportional milestones
  const portion = Math.round(dailyGoalMl / 5 / 50) * 50;

  const milestones: Milestone[] = [
    {
      id: 'm1',
      timeLabel: '7:30 AM',
      title: 'Wake-Up Kickstart',
      targetMl: portion,
      icon: '🌅',
      idealHour: 8,
    },
    {
      id: 'm2',
      timeLabel: '10:00 AM',
      title: 'Morning Focus Sip',
      targetMl: portion,
      icon: '🧠',
      idealHour: 11,
    },
    {
      id: 'm3',
      timeLabel: '1:00 PM',
      title: 'Post-Lunch Hydrate',
      targetMl: portion,
      icon: '🥗',
      idealHour: 14,
    },
    {
      id: 'm4',
      timeLabel: '4:00 PM',
      title: 'Afternoon Energy Defense',
      targetMl: portion,
      icon: '⚡',
      idealHour: 17,
    },
    {
      id: 'm5',
      timeLabel: '7:30 PM',
      title: 'Evening Wind-Down',
      targetMl: dailyGoalMl - portion * 4,
      icon: '🌙',
      idealHour: 20,
    },
  ];

  const currentHour = new Date().getHours();

  const formatAmount = (ml: number) => {
    if (unit === 'oz') {
      return `${(ml * 0.033814).toFixed(0)} oz`;
    }
    return `${ml} ml`;
  };

  // Cumulative threshold calculation
  let runningCumulative = 0;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-sky-100/80 p-6 shadow-xl shadow-sky-500/5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-100 text-sky-600">
              <Clock className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-800">Daily Pacing Schedule</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Balanced intake milestones to prevent dehydration slumps
          </p>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 border border-sky-200/60">
          Optimal Pacing
        </span>
      </div>

      {/* Milestone List */}
      <div className="space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200/80">
        {milestones.map((m) => {
          runningCumulative += m.targetMl;
          const isSatisfied = currentMl >= runningCumulative;
          const isCurrentWindow = !isSatisfied && currentHour <= m.idealHour;

          return (
            <div
              key={m.id}
              className={`relative flex items-center justify-between p-3.5 pl-10 rounded-2xl border transition-all ${
                isSatisfied
                  ? 'bg-emerald-50/50 border-emerald-100/80 text-emerald-950'
                  : isCurrentWindow
                  ? 'bg-gradient-to-r from-sky-50/80 to-white border-sky-300 ring-2 ring-sky-500/10'
                  : 'bg-slate-50/60 border-slate-200/70 text-slate-700'
              }`}
            >
              {/* Timeline marker icon */}
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white rounded-full p-0.5 shadow-xs">
                {isSatisfied ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                ) : (
                  <span className="w-4 h-4 rounded-full border-2 border-slate-300 block bg-white" />
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-lg p-1.5 rounded-xl bg-white shadow-xs border border-slate-100">
                  {m.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{m.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">{m.timeLabel}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Target: {formatAmount(m.targetMl)} (Cumulative: {formatAmount(runningCumulative)})
                  </p>
                </div>
              </div>

              {/* Action Button */}
              {isSatisfied ? (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100/70 px-2.5 py-1 rounded-xl">
                  Completed
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onLogMilestone(m.targetMl, m.title)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer ${
                    isCurrentWindow
                      ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>+{formatAmount(m.targetMl)}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
