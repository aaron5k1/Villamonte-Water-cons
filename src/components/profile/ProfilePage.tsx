import React, { useState } from 'react';
import {
  User,
  Mail,
  Award,
  Flame,
  Droplets,
  Calendar,
  Weight,
  Activity,
  Sun,
  Target,
  Edit2,
  Check,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types/auth';

interface ProfilePageProps {
  onBackToDashboard: () => void;
  onNavigateToSettings: () => void;
  totalMlToday: number;
  streak: number;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onBackToDashboard,
  onNavigateToSettings,
  totalMlToday,
  streak,
}) => {
  const { currentUser, updateUser } = useAuth();

  const badges = [
    {
      id: 'first-sip',
      title: 'First Sip',
      desc: 'Logged your first drink',
      icon: '💧',
      unlocked: totalMlToday > 0,
    },
    {
      id: 'streak-target',
      title: 'Goal Achiever',
      desc: 'Reached your daily hydration goal',
      icon: '🎯',
      unlocked: currentUser ? totalMlToday >= currentUser.dailyGoalMl : false,
    },
    {
      id: 'streak-5',
      title: '5-Day Streak',
      desc: 'Met hydration goal 5 days in a row',
      icon: '🔥',
      unlocked: streak >= 5,
    },
    {
      id: 'centurion',
      title: 'Hydration Master',
      desc: 'Over 10,000 ml lifetime intake logged',
      icon: '🏆',
      unlocked: totalMlToday >= 10000,
    },
  ];

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [weightKg, setWeightKg] = useState(currentUser?.weightKg || 70);
  const [activity, setActivity] = useState(currentUser?.activityLevel || 'moderate');
  const [climate, setClimate] = useState(currentUser?.climate || 'temperate');
  const [dailyGoalMl, setDailyGoalMl] = useState(currentUser?.dailyGoalMl || 2500);

  const [savedBanner, setSavedBanner] = useState(false);

  if (!currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: name.trim() || currentUser.name,
      weightKg: Number(weightKg),
      activityLevel: activity,
      climate,
      dailyGoalMl: Number(dailyGoalMl),
    });
    setIsEditing(false);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Tracker</span>
        </button>

        <button
          onClick={onNavigateToSettings}
          className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer"
        >
          Manage App Settings →
        </button>
      </div>

      {savedBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile changes successfully saved!</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-xl shadow-sky-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-sky-500/20">
              {currentUser.avatarSeed}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">{currentUser.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.email}</span>
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Member since {currentUser.joinedDate}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition self-start sm:self-auto cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Milestone Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Today Intake</span>
              <Droplets className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-xl font-black text-slate-900">{totalMlToday.toLocaleString()} ml</p>
            <p className="text-[10px] text-slate-400 mt-1">
              {Math.round((totalMlToday / currentUser.dailyGoalMl) * 100)}% of daily goal
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Streak Record</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl font-black text-slate-900">{streak} {streak === 1 ? 'Day' : 'Days'}</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">
              {streak > 0 ? 'Active on track' : 'Start your streak today'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Daily Target</span>
              <Target className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-xl font-black text-slate-900">{currentUser.dailyGoalMl} ml</p>
            <p className="text-[10px] text-slate-400 mt-1">Personalized intake</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Hydration Rank</span>
              <Award className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-xl font-black text-slate-900">Tier 2</p>
            <p className="text-[10px] text-slate-400 mt-1">Gold Hydrator</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Form / Details Card */}
      {isEditing ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-xl shadow-sky-500/5">
          <h3 className="text-base font-extrabold text-slate-900 mb-4">Edit Personal Information</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Body Weight (kg)
                </label>
                <input
                  type="number"
                  min="30"
                  max="200"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Activity Level
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                >
                  <option value="sedentary">Sedentary (Desk / Low)</option>
                  <option value="moderate">Moderate (Daily 30m walk)</option>
                  <option value="active">Active (1h workouts)</option>
                  <option value="athlete">High Athlete (Intense training)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Daily Goal Target (ml)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="6000"
                  step="50"
                  value={dailyGoalMl}
                  onChange={(e) => setDailyGoalMl(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Hydration Badges & Achievements */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-xl shadow-sky-500/5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-extrabold text-slate-900">Hydration Achievements</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border transition ${
                b.unlocked
                  ? 'bg-gradient-to-b from-amber-50/50 to-white border-amber-200/80 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200/60 opacity-60'
              }`}
            >
              <div className="text-2xl mb-2">{b.icon}</div>
              <h4 className="text-xs font-extrabold text-slate-900">{b.title}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{b.desc}</p>
              <span
                className={`inline-block mt-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  b.unlocked ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {b.unlocked ? 'Unlocked' : 'In Progress'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
