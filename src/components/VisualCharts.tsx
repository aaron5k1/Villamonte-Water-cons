import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Clock, Award, CheckCircle2 } from 'lucide-react';
import { IntakeLog, DayHistory, UnitType } from '../types';

interface VisualChartsProps {
  logs: IntakeLog[];
  weeklyHistory: DayHistory[];
  dailyGoalMl: number;
  unit: UnitType;
}

export const VisualCharts: React.FC<VisualChartsProps> = ({
  logs,
  weeklyHistory,
  dailyGoalMl,
  unit,
}) => {
  const [activeTab, setActiveTab] = useState<'hourly' | 'weekly'>('hourly');

  // Group today's logs into hourly slots (from 6:00 to 23:00)
  const hourlySlots = [
    { label: '6 AM', hour: 6 },
    { label: '8 AM', hour: 8 },
    { label: '10 AM', hour: 10 },
    { label: '12 PM', hour: 12 },
    { label: '2 PM', hour: 14 },
    { label: '4 PM', hour: 16 },
    { label: '6 PM', hour: 18 },
    { label: '8 PM', hour: 20 },
    { label: '10 PM', hour: 22 },
  ];

  // Map each log into closest 2-hour bracket
  const hourlyData = hourlySlots.map((slot) => {
    const totalInSlot = logs
      .filter((log) => {
        const d = new Date(log.timestamp);
        const h = d.getHours();
        return h >= slot.hour - 1 && h <= slot.hour;
      })
      .reduce((sum, l) => sum + l.amount, 0);

    return {
      label: slot.label,
      hour: slot.hour,
      amountMl: totalInSlot,
    };
  });

  const maxHourlyMl = Math.max(...hourlyData.map((d) => d.amountMl), 600);
  const currentHour = new Date().getHours();

  // Weekly Stats calculations
  const totalWeeklyMl = weeklyHistory.reduce((sum, d) => sum + d.totalMl, 0);
  const avgWeeklyMl = Math.round(totalWeeklyMl / Math.max(1, weeklyHistory.length));
  const daysMetGoal = weeklyHistory.filter((d) => d.totalMl >= d.goalMl).length;
  const bestDay = [...weeklyHistory].sort((a, b) => b.totalMl - a.totalMl)[0];

  const formatUnit = (ml: number) => {
    if (unit === 'oz') {
      return `${(ml * 0.033814).toFixed(0)} oz`;
    }
    return `${ml.toLocaleString()} ml`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-sky-100/80 p-6 shadow-xl shadow-sky-500/5">
      {/* Header and Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-100 text-sky-600">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-800">Hydration Analytics</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === 'hourly'
              ? "Today's intake pattern across active hours"
              : 'Last 7 days consistency & goal performance'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/50 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('hourly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'hourly'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hourly Rhythm</span>
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'weekly'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>7-Day Trend</span>
          </button>
        </div>
      </div>

      {/* Hourly Chart Tab */}
      {activeTab === 'hourly' && (
        <div className="space-y-4">
          <div className="h-52 w-full pt-4 pb-2 px-1 flex items-end justify-between gap-2 border-b border-slate-100">
            {hourlyData.map((slot) => {
              const heightPct = Math.min(100, Math.round((slot.amountMl / maxHourlyMl) * 100));
              const isPastOrCurrent = slot.hour <= currentHour;
              const hasIntake = slot.amountMl > 0;

              return (
                <div key={slot.label} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-lg pointer-events-none whitespace-nowrap z-30 shadow-md">
                    {slot.label}: {formatUnit(slot.amountMl)}
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[28px] h-full flex items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 relative ${
                        hasIntake
                          ? 'bg-gradient-to-t from-sky-600 to-cyan-400 group-hover:brightness-110 shadow-sm shadow-sky-500/20'
                          : isPastOrCurrent
                          ? 'bg-slate-200/70'
                          : 'bg-slate-100/50'
                      }`}
                      style={{
                        height: hasIntake ? `${Math.max(12, heightPct)}%` : '6px',
                      }}
                    >
                      {hasIntake && (
                        <div className="absolute top-1 inset-x-0 mx-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                      )}
                    </div>
                  </div>

                  {/* Label */}
                  <span className={`text-[10px] font-semibold mt-2.5 whitespace-nowrap ${
                    slot.hour === currentHour ? 'text-sky-600 font-bold' : 'text-slate-400'
                  }`}>
                    {slot.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Hourly Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase">Today's Logs</span>
                <p className="text-base font-bold text-slate-800">{logs.length} drinks recorded</p>
              </div>
              <span className="text-xl">💧</span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase">Peak Intake Hour</span>
                <p className="text-base font-bold text-slate-800">
                  {hourlyData.reduce((prev, curr) => (curr.amountMl > prev.amountMl ? curr : prev), hourlyData[0]).amountMl > 0
                    ? hourlyData.reduce((prev, curr) => (curr.amountMl > prev.amountMl ? curr : prev), hourlyData[0]).label
                    : 'Awaiting logs'}
                </p>
              </div>
              <span className="text-xl">⚡</span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase">Pace Rating</span>
                <p className="text-base font-bold text-emerald-600">
                  {logs.length >= 3 ? 'On Great Track' : 'Steady Start'}
                </p>
              </div>
              <span className="text-xl">🎯</span>
            </div>
          </div>
        </div>
      )}

      {/* Weekly History Tab */}
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          <div className="h-52 w-full pt-4 pb-2 px-1 flex items-end justify-between gap-3 border-b border-slate-100">
            {weeklyHistory.map((day) => {
              const maxVal = Math.max(...weeklyHistory.map((d) => d.totalMl), dailyGoalMl * 1.1);
              const heightPct = Math.min(100, Math.round((day.totalMl / maxVal) * 100));
              const isGoalMet = day.totalMl >= day.goalMl;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-lg pointer-events-none whitespace-nowrap z-30 shadow-md">
                    {day.dayName}: {formatUnit(day.totalMl)} ({day.percentage}%)
                  </div>

                  {/* Goal check badge */}
                  {isGoalMet && (
                    <div className="mb-1 text-emerald-500">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-100" />
                    </div>
                  )}

                  {/* Bar */}
                  <div className="w-full max-w-[34px] h-full flex items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 relative ${
                        isGoalMet
                          ? 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/20'
                          : day.totalMl > 0
                          ? 'bg-gradient-to-t from-sky-500 to-cyan-400 shadow-sm shadow-sky-500/20'
                          : 'bg-slate-200/60'
                      }`}
                      style={{
                        height: `${Math.max(10, heightPct)}%`,
                      }}
                    />
                  </div>

                  {/* Day label */}
                  <span className="text-[11px] font-bold mt-2.5 text-slate-600">
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Weekly Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 uppercase">Daily Average</span>
              <p className="text-base font-bold text-slate-800">{formatUnit(avgWeeklyMl)}</p>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 uppercase">Goals Achieved</span>
              <p className="text-base font-bold text-slate-800">
                {daysMetGoal} of {weeklyHistory.length} Days
              </p>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 uppercase">Best Record</span>
              <p className="text-base font-bold text-sky-600">
                {bestDay ? `${bestDay.dayName} (${formatUnit(bestDay.totalMl)})` : '-'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
