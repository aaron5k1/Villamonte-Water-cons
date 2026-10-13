import React, { useState } from 'react';
import { Target, X, Calculator, Check, Sparkles } from 'lucide-react';
import { UserGoalConfig, UnitType } from '../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: UserGoalConfig;
  onSave: (newConfig: UserGoalConfig) => void;
}

const PRESET_GOALS = [2000, 2500, 3000, 3500];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [dailyGoalMl, setDailyGoalMl] = useState(config.dailyGoalMl);
  const [unit, setUnit] = useState<UnitType>(config.unit);
  const [showCalculator, setShowCalculator] = useState(false);
  const [weightKg, setWeightKg] = useState(config.weightKg || 70);
  const [activity, setActivity] = useState(config.activityLevel || 'moderate');
  const [climate, setClimate] = useState(config.climate || 'temperate');

  if (!isOpen) return null;

  // Calculate scientific recommendation based on weight (approx 35ml/kg) + activity + weather
  const calculateScientificGoal = () => {
    let rec = weightKg * 35; // base
    if (activity === 'moderate') rec += 350;
    if (activity === 'active') rec += 700;
    if (activity === 'athlete') rec += 1200;

    if (climate === 'warm') rec += 300;
    if (climate === 'hot') rec += 600;

    // Round to nearest 50ml
    return Math.round(rec / 50) * 50;
  };

  const handleApplyCalculated = () => {
    const calculated = calculateScientificGoal();
    setDailyGoalMl(calculated);
    setShowCalculator(false);
  };

  const handleSave = () => {
    onSave({
      dailyGoalMl,
      unit,
      weightKg,
      activityLevel: activity,
      climate,
    });
    onClose();
  };

  const displayGoal = unit === 'oz' ? Math.round(dailyGoalMl * 0.033814) : dailyGoalMl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-600">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Set Hydration Goal</h3>
            <p className="text-xs text-slate-500">Customize your daily water target</p>
          </div>
        </div>

        {/* Unit Selector */}
        <div className="mb-6 flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
          <div>
            <span className="text-xs font-semibold text-slate-700">Display Unit</span>
            <p className="text-[11px] text-slate-500">Milliliters or Fluid Ounces</p>
          </div>
          <div className="flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setUnit('ml')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                unit === 'ml' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ml
            </button>
            <button
              onClick={() => setUnit('oz')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                unit === 'oz' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              fl oz
            </button>
          </div>
        </div>

        {/* Goal Slider & Presets */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Daily Target
            </label>
            <span className="text-2xl font-black text-sky-600">
              {displayGoal} <span className="text-sm font-semibold text-slate-500">{unit}</span>
            </span>
          </div>

          <input
            type="range"
            min={1000}
            max={5000}
            step={50}
            value={dailyGoalMl}
            onChange={(e) => setDailyGoalMl(Number(e.target.value))}
            className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between gap-2">
            {PRESET_GOALS.map((preset) => {
              const label = unit === 'oz' ? `${Math.round(preset * 0.033814)} oz` : `${preset} ml`;
              const isSelected = dailyGoalMl === preset;
              return (
                <button
                  key={preset}
                  onClick={() => setDailyGoalMl(preset)}
                  className={`flex-1 py-2 px-1 text-xs font-bold rounded-xl border transition ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 text-sky-700 ring-2 ring-sky-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Personalized Hydration Calculator Toggle */}
        <div className="mb-6 border border-sky-100 rounded-2xl p-4 bg-sky-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-800">Need a recommendation?</span>
            </div>
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 underline"
            >
              {showCalculator ? 'Hide Calculator' : 'Smart Calculator'}
            </button>
          </div>

          {showCalculator && (
            <div className="mt-4 pt-4 border-t border-sky-100 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Your Body Weight: {weightKg} kg ({Math.round(weightKg * 2.20462)} lbs)
                </label>
                <input
                  type="range"
                  min={40}
                  max={130}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full accent-sky-600 h-1.5 bg-sky-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Activity Level
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'sedentary', label: 'Desk / Low' },
                    { id: 'moderate', label: 'Moderate (30m walk)' },
                    { id: 'active', label: 'Active (1h workout)' },
                    { id: 'athlete', label: 'Intense Athlete' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setActivity(item.id as UserGoalConfig['activityLevel'])}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-medium text-left transition ${
                        activity === item.id
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Climate
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'temperate', label: 'Mild / AC' },
                    { id: 'warm', label: 'Warm' },
                    { id: 'hot', label: 'Hot / Summer' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setClimate(item.id as UserGoalConfig['climate'])}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-medium text-center transition ${
                        climate === item.id
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-sky-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Recommended</span>
                  <p className="text-base font-bold text-sky-700">
                    {calculateScientificGoal()} ml / day
                  </p>
                </div>
                <button
                  onClick={handleApplyCalculated}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 shadow-sm flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply This Target
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition"
          >
            Save Target
          </button>
        </div>
      </div>
    </div>
  );
};
