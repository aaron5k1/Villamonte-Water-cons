import React, { useState } from 'react';
import { Plus, RotateCcw, Coffee, Sparkles, Droplet, GlassWater, Flame, X } from 'lucide-react';
import { DrinkType } from '../types';

interface QuickLogBarProps {
  onLog: (amountMl: number, drinkType: DrinkType, note?: string) => void;
  onUndoLast: () => void;
  canUndo: boolean;
  unit: 'ml' | 'oz';
}

interface PresetOption {
  label: string;
  amountMl: number;
  iconName: string;
  popular?: boolean;
}

const PRESETS: PresetOption[] = [
  { label: 'Small Cup', amountMl: 150, iconName: 'cup' },
  { label: 'Standard Glass', amountMl: 250, iconName: 'glass', popular: true },
  { label: 'Warm Mug', amountMl: 350, iconName: 'mug' },
  { label: 'Active Bottle', amountMl: 500, iconName: 'bottle', popular: true },
  { label: 'Hydra Flask', amountMl: 750, iconName: 'flask' },
  { label: 'Big Jug', amountMl: 1000, iconName: 'jug' },
];

const DRINK_TYPES: { id: DrinkType; label: string; icon: string; bg: string }[] = [
  { id: 'water', label: 'Pure Water', icon: '💧', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'sparkling', label: 'Sparkling', icon: '🫧', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'infused', label: 'Lemon / Fruit', icon: '🍋', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'tea', label: 'Herbal Tea', icon: '🍵', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'electrolyte', label: 'Electrolytes', icon: '⚡', bg: 'bg-violet-50 text-violet-700 border-violet-200' },
  { id: 'coffee', label: 'Iced Coffee', icon: '☕', bg: 'bg-amber-100/60 text-amber-900 border-amber-300' },
];

export const QuickLogBar: React.FC<QuickLogBarProps> = ({
  onLog,
  onUndoLast,
  canUndo,
  unit,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('300');
  const [selectedType, setSelectedType] = useState<DrinkType>('water');
  const [customNote, setCustomNote] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customAmount);
    if (!isNaN(val) && val > 0) {
      const ml = unit === 'oz' ? Math.round(val / 0.033814) : Math.round(val);
      onLog(ml, selectedType, customNote.trim() || undefined);
      setShowCustomModal(false);
      setCustomNote('');
    }
  };

  const formatAmount = (ml: number) => {
    if (unit === 'oz') {
      return `${(ml * 0.033814).toFixed(0)} oz`;
    }
    return `${ml} ml`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-sky-100/80 p-6 shadow-xl shadow-sky-500/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Quick Log Water</h3>
          <p className="text-xs text-slate-500">Tap any container to add intake instantly</p>
        </div>

        <div className="flex items-center gap-2">
          {canUndo && (
            <button
              onClick={onUndoLast}
              className="text-xs font-medium text-slate-600 hover:text-rose-600 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200/80 transition flex items-center gap-1.5"
              title="Undo last recorded sip"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}

          <button
            onClick={() => setShowCustomModal(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-500 transition shadow-sm shadow-sky-600/20 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* Preset Buttons Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {PRESETS.map((preset) => {
          return (
            <button
              key={preset.amountMl}
              onClick={() => onLog(preset.amountMl, 'water')}
              className={`relative group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-left ${
                preset.popular
                  ? 'bg-gradient-to-b from-sky-50/80 to-sky-100/40 border-sky-200/80 hover:border-sky-300 hover:shadow-md hover:shadow-sky-500/10'
                  : 'bg-slate-50/70 border-slate-200/70 hover:bg-sky-50/50 hover:border-sky-200'
              }`}
            >
              {preset.popular && (
                <span className="absolute -top-1.5 right-2 px-1.5 py-0.5 bg-sky-500 text-[9px] font-bold text-white rounded-full uppercase tracking-tighter">
                  Fav
                </span>
              )}
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-sky-600 shadow-sm border border-slate-100 group-hover:scale-105 group-hover:text-sky-500 transition-transform">
                <GlassWater className="w-5 h-5" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800">
                +{formatAmount(preset.amountMl)}
              </span>
              <span className="text-[10px] font-medium text-slate-500 truncate w-full text-center">
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Log Dialog Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowCustomModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-600">
                <GlassWater className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Log Custom Drink</h3>
                <p className="text-xs text-slate-500">Add exact quantity and drink type</p>
              </div>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount ({unit})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    step={unit === 'oz' ? '0.5' : '10'}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white pr-16"
                  />
                  <span className="absolute right-4 top-3.5 text-sm font-semibold text-slate-400">
                    {unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Beverage Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DRINK_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                        selectedType === type.id
                          ? `${type.bg} ring-2 ring-sky-500`
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">{type.icon}</span>
                      <span className="truncate">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Note (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Post-workout hydrate, Morning coffee"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  maxLength={50}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition"
                >
                  Confirm & Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
