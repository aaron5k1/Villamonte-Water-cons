import React, { useState } from 'react';
import { X, Check, Droplets, AlertTriangle, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';
import { UnitType } from '../types';

interface HydrationScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogRecommended: (amountMl: number, note: string) => void;
  unit: UnitType;
}

interface ScaleLevel {
  level: number;
  colorHex: string;
  label: string;
  status: 'Optimal' | 'Mild Dehydration' | 'Dehydrated' | 'Severe Dehydration';
  statusColor: string;
  advice: string;
  recMl: number;
}

const SCALE_LEVELS: ScaleLevel[] = [
  {
    level: 1,
    colorHex: '#fafbf0',
    label: 'Almost Clear',
    status: 'Optimal',
    statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    advice: 'Excellent hydration. Maintain regular sips without over-hydrating.',
    recMl: 150,
  },
  {
    level: 2,
    colorHex: '#fef08a',
    label: 'Pale Straw',
    status: 'Optimal',
    statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    advice: 'Ideal healthy hydration balance. Keep up your current daily rhythm.',
    recMl: 250,
  },
  {
    level: 3,
    colorHex: '#fde047',
    label: 'Light Yellow',
    status: 'Optimal',
    statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    advice: 'Good hydration state. Drink a small glass in the next hour.',
    recMl: 250,
  },
  {
    level: 4,
    colorHex: '#facc15',
    label: 'Bright Yellow',
    status: 'Mild Dehydration',
    statusColor: 'text-amber-800 bg-amber-50 border-amber-200',
    advice: 'Body is beginning to conserve water. Drink a full glass (350ml) now.',
    recMl: 350,
  },
  {
    level: 5,
    colorHex: '#eab308',
    label: 'Deep Golden',
    status: 'Mild Dehydration',
    statusColor: 'text-amber-800 bg-amber-50 border-amber-200',
    advice: 'Noticeable dehydration. Cellular fluid levels are lowered. Drink 400ml now.',
    recMl: 400,
  },
  {
    level: 6,
    colorHex: '#ca8a04',
    label: 'Amber Yellow',
    status: 'Dehydrated',
    statusColor: 'text-orange-800 bg-orange-50 border-orange-200',
    advice: 'Significant dehydration. Have a 500ml bottle with electrolytes if active.',
    recMl: 500,
  },
  {
    level: 7,
    colorHex: '#a16207',
    label: 'Dark Amber',
    status: 'Severe Dehydration',
    statusColor: 'text-rose-800 bg-rose-50 border-rose-200',
    advice: 'Severe fluid deficit. Rehydrate with 600ml water and electrolytes immediately.',
    recMl: 600,
  },
  {
    level: 8,
    colorHex: '#713f12',
    label: 'Brownish Tea',
    status: 'Severe Dehydration',
    statusColor: 'text-rose-900 bg-rose-100 border-rose-300',
    advice: 'Critical dehydration or potential kidney stress. Drink water now and seek advice if persistent.',
    recMl: 750,
  },
];

const SYMPTOMS = [
  'Mild headache',
  'Dry lips or mouth',
  'Afternoon sluggishness',
  'Muscle cramps / tightness',
  'Brain fog or low focus',
  'Feeling thirsty',
];

export const HydrationScaleModal: React.FC<HydrationScaleModalProps> = ({
  isOpen,
  onClose,
  onLogRecommended,
  unit,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(2);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  if (!isOpen) return null;

  const activeLevel = SCALE_LEVELS.find((l) => l.level === selectedLevel) || SCALE_LEVELS[1];

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const displayAmount = (ml: number) => {
    if (unit === 'oz') {
      return `${(ml * 0.033814).toFixed(0)} fl oz`;
    }
    return `${ml} ml`;
  };

  const handleApplyDrink = () => {
    onLogRecommended(activeLevel.recMl, `Urine scale check (Level ${activeLevel.level})`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Armstrong Hydration Scale</h3>
            <p className="text-xs text-slate-500">
              Clinical 8-shade dehydration self-check & symptom tracker
            </p>
          </div>
        </div>

        {/* Color Palette Selector */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Current Urine Shade:
            </label>
            <span className="text-[11px] font-semibold text-slate-500">
              Level {activeLevel.level} • {activeLevel.label}
            </span>
          </div>

          <div className="grid grid-cols-8 gap-1.5 sm:gap-2 p-2 bg-slate-100/80 rounded-2xl border border-slate-200/60">
            {SCALE_LEVELS.map((lvl) => {
              const isSelected = selectedLevel === lvl.level;
              return (
                <button
                  key={lvl.level}
                  type="button"
                  onClick={() => setSelectedLevel(lvl.level)}
                  className={`h-12 sm:h-14 rounded-xl border-2 transition-all flex flex-col items-center justify-between py-1 cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 shadow-md scale-105 ring-2 ring-slate-900/20'
                      : 'border-white/80 hover:scale-102 hover:shadow-xs'
                  }`}
                  style={{ backgroundColor: lvl.colorHex }}
                >
                  <span
                    className={`text-[9px] font-black ${
                      lvl.level > 4 ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {lvl.level}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Analysis & Recommendation Box */}
        <div className={`p-4 rounded-2xl border mb-6 ${activeLevel.statusColor}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider">
              Status: {activeLevel.status}
            </span>
            <span className="text-xs font-bold">Recommended: +{displayAmount(activeLevel.recMl)}</span>
          </div>
          <p className="text-xs leading-relaxed opacity-90">{activeLevel.advice}</p>
        </div>

        {/* Symptoms Checklist */}
        <div className="mb-6 space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Are you experiencing any of these dehydration signs?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SYMPTOMS.map((symptom) => {
              const isChecked = selectedSymptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  className={`p-2 rounded-xl border text-[11px] font-semibold text-left transition flex items-center justify-between cursor-pointer ${
                    isChecked
                      ? 'bg-sky-50 border-sky-300 text-sky-800 ring-1 ring-sky-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{symptom}</span>
                  {isChecked && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleApplyDrink}
            className="flex-1 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Droplets className="w-4 h-4" />
            <span>Drink & Log +{displayAmount(activeLevel.recMl)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
