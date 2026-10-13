import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Moon,
  ChevronLeft,
  Target,
  LogOut,
  Trash2,
  Check,
  Shield,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ReminderConfig, UserGoalConfig } from '../../types';
import { soundManager } from '../../utils/sound';

interface SettingsPageProps {
  onBackToDashboard: () => void;
  goalConfig: UserGoalConfig;
  onUpdateGoalConfig: (newCfg: UserGoalConfig) => void;
  reminderConfig: ReminderConfig;
  onUpdateReminderConfig: (newCfg: ReminderConfig) => void;
  onResetTodayLogs: () => void;
  onTriggerTestReminder: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onBackToDashboard,
  goalConfig,
  onUpdateGoalConfig,
  reminderConfig,
  onUpdateReminderConfig,
  onResetTodayLogs,
  onTriggerTestReminder,
}) => {
  const { currentUser, logout, updateUser } = useAuth();

  const [unit, setUnit] = useState(goalConfig.unit);
  const [dailyGoalMl, setDailyGoalMl] = useState(goalConfig.dailyGoalMl);

  const [remindersEnabled, setRemindersEnabled] = useState(reminderConfig.enabled);
  const [intervalMinutes, setIntervalMinutes] = useState(reminderConfig.intervalMinutes);
  const [soundEnabled, setSoundEnabled] = useState(reminderConfig.soundEnabled);
  const [quietStart, setQuietStart] = useState(reminderConfig.quietStart);
  const [quietEnd, setQuietEnd] = useState(reminderConfig.quietEnd);

  const [savedBanner, setSavedBanner] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSavePreferences = () => {
    onUpdateGoalConfig({
      ...goalConfig,
      unit,
      dailyGoalMl,
    });

    onUpdateReminderConfig({
      enabled: remindersEnabled,
      intervalMinutes,
      soundEnabled,
      quietStart,
      quietEnd,
    });

    if (currentUser) {
      updateUser({
        unit,
        dailyGoalMl,
      });
    }

    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleLogout = () => {
    logout();
    // Logging out immediately brings user back to Login page
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Tracker</span>
        </button>

        <h2 className="text-base font-extrabold text-slate-900">Application Settings</h2>
      </div>

      {savedBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Hydration & Unit Preferences */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-xl shadow-sky-500/5 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Target className="w-5 h-5 text-sky-600" />
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Hydration & Metrics</h3>
            <p className="text-[11px] text-slate-500">Configure measurement unit and target goals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Measurement Unit
            </label>
            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setUnit('ml')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  unit === 'ml' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                Milliliters (ml)
              </button>
              <button
                type="button"
                onClick={() => setUnit('oz')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  unit === 'oz' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                Fluid Ounces (fl oz)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Daily Target ({unit})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1000"
                max="6000"
                step="50"
                value={dailyGoalMl}
                onChange={(e) => setDailyGoalMl(Number(e.target.value))}
                className="flex-1 px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-xs font-semibold text-slate-500">{unit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Periodic Reminders & Notifications */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-xl shadow-sky-500/5 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Periodic Hydration Reminders</h3>
              <p className="text-[11px] text-slate-500">Scheduled chimes and alerts throughout the day</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Reminder Frequency
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setIntervalMinutes(mins)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                    intervalMinutes === mins
                      ? 'bg-sky-50 border-sky-400 text-sky-700 ring-2 ring-sky-500/15'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Every {mins}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-sky-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <span className="text-xs font-bold text-slate-800">Water Droplet Chime</span>
                <p className="text-[11px] text-slate-500">Audio playback on reminder alert</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) soundManager.playReminderChime();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                soundEnabled
                  ? 'bg-sky-100 text-sky-700 border-sky-200'
                  : 'bg-slate-200 text-slate-600 border-slate-300'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-800">Quiet Sleep Window</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Sleep Start</label>
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Wake Up</label>
                <input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onTriggerTestReminder}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Test Alert Now
          </button>
          <button
            type="button"
            onClick={handleSavePreferences}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm cursor-pointer"
          >
            Save All Preferences
          </button>
        </div>
      </div>

      {/* Account & Session Actions */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl shadow-slate-500/5 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100">
          Account & Session Management
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-800">Reset Today's Intake Data</span>
            <p className="text-[11px] text-slate-500">Clears today's log entries back to zero</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset all of today's water intake logs?")) {
                onResetTodayLogs();
              }
            }}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold transition self-start sm:self-auto cursor-pointer"
          >
            Reset Today
          </button>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
          <div>
            <span className="text-xs font-bold text-rose-900">Sign Out of Water cons</span>
            <p className="text-[11px] text-rose-700">
              Ends your active session and redirects immediately to the Login page.
            </p>
          </div>

          {showLogoutConfirm ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
