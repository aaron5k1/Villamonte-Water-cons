import React from 'react';
import { GlassWater, Sparkles, PieChart, ShieldCheck } from 'lucide-react';
import { IntakeLog, UnitType } from '../types';

interface BeverageBreakdownProps {
  logs: IntakeLog[];
  unit: UnitType;
}

// Science-backed Beverage Hydration Index (BHI) multipliers
const BHI_MULTIPLIERS: Record<string, { multiplier: number; label: string; icon: string; color: string }> = {
  water: { multiplier: 1.0, label: 'Pure Water', icon: '💧', color: 'bg-sky-500' },
  sparkling: { multiplier: 1.0, label: 'Sparkling', icon: '🫧', color: 'bg-cyan-400' },
  infused: { multiplier: 1.0, label: 'Infused Fruit', icon: '🍋', color: 'bg-amber-400' },
  tea: { multiplier: 0.98, label: 'Herbal Tea', icon: '🍵', color: 'bg-emerald-500' },
  electrolyte: { multiplier: 1.15, label: 'Electrolytes', icon: '⚡', color: 'bg-violet-500' },
  coffee: { multiplier: 0.82, label: 'Coffee', icon: '☕', color: 'bg-amber-700' },
};

export const BeverageBreakdown: React.FC<BeverageBreakdownProps> = ({ logs, unit }) => {
  const totalGrossMl = logs.reduce((sum, l) => sum + l.amount, 0);

  // Group by drink type
  const groupTotals: Record<string, number> = {};
  logs.forEach((log) => {
    groupTotals[log.drinkType] = (groupTotals[log.drinkType] || 0) + log.amount;
  });

  // Calculate net effective hydration
  const netHydrationMl = Math.round(
    logs.reduce((sum, log) => {
      const bhi = BHI_MULTIPLIERS[log.drinkType]?.multiplier || 1.0;
      return sum + log.amount * bhi;
    }, 0)
  );

  const formatAmount = (ml: number) => {
    if (unit === 'oz') {
      return `${(ml * 0.033814).toFixed(0)} oz`;
    }
    return `${ml.toLocaleString()} ml`;
  };

  const drinkKeys = Object.keys(groupTotals);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-sky-100/80 p-6 shadow-xl shadow-sky-500/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700">
              <PieChart className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-800">Beverage Quality Index</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cellular retention based on Beverage Hydration Index (BHI)
          </p>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200/60">
          Net Hydration
        </span>
      </div>

      {/* Net vs Gross comparison header */}
      <div className="grid grid-cols-2 gap-3 mb-5 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Volume</span>
          <p className="text-base font-black text-slate-800">{formatAmount(totalGrossMl)}</p>
          <span className="text-[10px] text-slate-500">Gross intake</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-cyan-600">Net Cellular Hydration</span>
          <p className="text-base font-black text-cyan-700">{formatAmount(netHydrationMl)}</p>
          <span className="text-[10px] text-slate-500">
            {netHydrationMl >= totalGrossMl ? 'Enhanced with electrolytes' : 'Standard retention'}
          </span>
        </div>
      </div>

      {/* Breakdown Bar list */}
      {drinkKeys.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">
          No drinks logged today yet. Log a drink to see your beverage breakdown!
        </p>
      ) : (
        <div className="space-y-3">
          {drinkKeys.map((type) => {
            const amount = groupTotals[type];
            const pct = totalGrossMl > 0 ? Math.round((amount / totalGrossMl) * 100) : 0;
            const meta = BHI_MULTIPLIERS[type] || {
              multiplier: 1.0,
              label: type,
              icon: '💧',
              color: 'bg-sky-500',
            };

            return (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span>{meta.icon}</span>
                    <span className="font-bold text-slate-800">{meta.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (BHI {meta.multiplier.toFixed(2)}x)
                    </span>
                  </div>
                  <span className="font-semibold text-slate-600">
                    {formatAmount(amount)} ({pct}%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${meta.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
