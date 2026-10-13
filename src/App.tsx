import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Droplets,
  Bell,
  Target,
  History,
  Clock,
  Flame,
  Award,
  Sparkles,
  RefreshCw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  Bot,
  MessageSquare,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  LayoutDashboard,
  HeartPulse,
  Download,
} from 'lucide-react';
import { IntakeLog, DrinkType, UserGoalConfig, ReminderConfig, DayHistory, UnitType } from './types';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { SettingsPage } from './components/settings/SettingsPage';
import { WaterWaveBottle } from './components/WaterWaveBottle';
import { QuickLogBar } from './components/QuickLogBar';
import { VisualCharts } from './components/VisualCharts';
import { HydrationTimeline } from './components/HydrationTimeline';
import { BeverageBreakdown } from './components/BeverageBreakdown';
import { HydrationScaleModal } from './components/HydrationScaleModal';
import { exportLogsToCSV } from './utils/exportCsv';
import { GoalModal } from './components/GoalModal';
import { ReminderModal } from './components/ReminderModal';
import { LogHistoryModal } from './components/LogHistoryModal';
import { NotificationBanner } from './components/NotificationBanner';
import { HydrationTips } from './components/HydrationTips';
import { GeminiChatbot } from './components/GeminiChatbot';
import { soundManager } from './utils/sound';
import { showHydrationNotification } from './utils/notifications';

const DEFAULT_GOAL: UserGoalConfig = {
  dailyGoalMl: 2500,
  unit: 'ml',
  weightKg: 70,
  activityLevel: 'moderate',
  climate: 'temperate',
};

const DEFAULT_REMINDER: ReminderConfig = {
  enabled: true,
  intervalMinutes: 60,
  soundEnabled: true,
  quietStart: '22:00',
  quietEnd: '07:00',
};

export default function App() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'settings'>('dashboard');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // User-scoped intake logs (starts clean with 0 dummy data for fresh accounts)
  const [logs, setLogs] = useState<IntakeLog[]>(() => {
    if (!currentUser) return [];
    try {
      const saved = localStorage.getItem(`water_cons_logs_${currentUser.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [goalConfig, setGoalConfig] = useState<UserGoalConfig>(() => {
    try {
      const saved = localStorage.getItem('water_cons_goal_v1');
      return saved ? JSON.parse(saved) : DEFAULT_GOAL;
    } catch {
      return DEFAULT_GOAL;
    }
  });

  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>(() => {
    try {
      const saved = localStorage.getItem('water_cons_reminders_v1');
      return saved ? JSON.parse(saved) : DEFAULT_REMINDER;
    } catch {
      return DEFAULT_REMINDER;
    }
  });

  // Modal open states
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);

  // Periodic Reminder timer and banner state
  const [showReminderBanner, setShowReminderBanner] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(reminderConfig.intervalMinutes * 60);
  const celebrationTriggeredRef = useRef(false);

  // Load user logs when user logs in or switches
  useEffect(() => {
    if (currentUser) {
      try {
        const saved = localStorage.getItem(`water_cons_logs_${currentUser.id}`);
        setLogs(saved ? JSON.parse(saved) : []);
      } catch {
        setLogs([]);
      }
    } else {
      setLogs([]);
    }
  }, [currentUser?.id]);

  // Save to LocalStorage per user
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(`water_cons_logs_${currentUser.id}`, JSON.stringify(logs));
      } catch {
        // Storage error ignore
      }
    }
  }, [logs, currentUser?.id]);

  useEffect(() => {
    try {
      localStorage.setItem('water_cons_goal_v1', JSON.stringify(goalConfig));
    } catch {
      // Storage error ignore
    }
  }, [goalConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('water_cons_reminders_v1', JSON.stringify(reminderConfig));
      setCountdownSeconds(reminderConfig.intervalMinutes * 60);
    } catch {
      // Storage error ignore
    }
  }, [reminderConfig]);

  // Sync user profile goal when user logs in or profile changes
  useEffect(() => {
    if (currentUser?.dailyGoalMl) {
      setGoalConfig((prev) => ({
        ...prev,
        dailyGoalMl: currentUser.dailyGoalMl,
        unit: currentUser.unit || prev.unit,
      }));
    }
  }, [currentUser]);

  // Total consumed today
  const totalMlToday = logs.reduce((sum, item) => sum + item.amount, 0);
  const isGoalAchieved = totalMlToday >= goalConfig.dailyGoalMl;
  const progressPercent = Math.round((totalMlToday / Math.max(1, goalConfig.dailyGoalMl)) * 100);

  // Trigger celebration confetti when reaching goal
  useEffect(() => {
    if (isGoalAchieved && !celebrationTriggeredRef.current && totalMlToday > 0) {
      celebrationTriggeredRef.current = true;
      soundManager.playGoalCelebration();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0284c7', '#38bdf8', '#06b6d4', '#67e8f9', '#f59e0b'],
        });
      } catch {
        // Confetti canvas fallback
      }
    } else if (!isGoalAchieved) {
      celebrationTriggeredRef.current = false;
    }
  }, [isGoalAchieved, totalMlToday]);

  // Active Periodic Countdown Timer
  useEffect(() => {
    if (!reminderConfig.enabled) return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          triggerPeriodicAlert();
          return reminderConfig.intervalMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [reminderConfig]);

  const triggerPeriodicAlert = () => {
    setShowReminderBanner(true);
    if (reminderConfig.soundEnabled) {
      soundManager.playReminderChime();
    }
    showHydrationNotification(
      'Water cons: Hydration Reminder! 💧',
      'Time for a refreshing glass of water to keep your body revitalized.'
    );
  };

  // Add water intake log
  const handleLogIntake = (amountMl: number, drinkType: DrinkType = 'water', note?: string) => {
    const newLog: IntakeLog = {
      id: `log-${Date.now()}`,
      amount: amountMl,
      drinkType,
      timestamp: new Date().toISOString(),
      note,
    };

    setLogs((prev) => [...prev, newLog]);
    soundManager.playWaterDrop();
    setCountdownSeconds(reminderConfig.intervalMinutes * 60);
  };

  // Undo last log
  const handleUndoLast = () => {
    if (logs.length === 0) return;
    setLogs((prev) => prev.slice(0, -1));
    soundManager.playWaterDrop();
  };

  // Delete individual log
  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  // Clear all today's logs
  const handleClearAll = () => {
    setLogs([]);
  };

  const handleLogoutAction = () => {
    setShowUserDropdown(false);
    logout();
    setActiveTab('dashboard');
  };

  // Format countdown mm:ss
  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  // Real weekly data dynamically reflecting today's latest total
  const weeklyHistory: DayHistory[] = (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const now = new Date();
    return days.map((dayName, idx) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - idx));
      const isToday = dayName === 'Today';
      const intake = isToday ? totalMlToday : 0;
      return {
        date: d.toISOString().split('T')[0],
        dayName,
        totalMl: intake,
        goalMl: goalConfig.dailyGoalMl,
        percentage: Math.round((intake / Math.max(1, goalConfig.dailyGoalMl)) * 100),
        logsCount: isToday ? logs.length : 0,
      };
    });
  })();

  const currentStreak = isGoalAchieved ? 1 : (logs.length > 0 ? 1 : 0);

  // If user is not authenticated, show Login & Registration Page
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-slate-50 to-white text-slate-900 flex flex-col font-sans selection:bg-sky-200">
      {/* Floating In-App Reminder Banner */}
      <NotificationBanner
        visible={showReminderBanner}
        onDismiss={() => setShowReminderBanner(false)}
        onQuickDrink={(ml) => handleLogIntake(ml, 'water', 'Reminder sip')}
        unit={goalConfig.unit}
      />

      {/* Navigation & Header Bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-sky-100/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & App Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                    Water <span className="text-sky-600">cons</span>
                  </h1>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Hydration Tracker & Analytics
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Page Tabs */}
          <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>

          {/* Header Action Buttons & User Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Periodic Reminder Pill */}
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                reminderConfig.enabled
                  ? 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
              }`}
              title="Reminder settings & test alerts"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="font-mono">{formatCountdown(countdownSeconds)}</span>
              {reminderConfig.enabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {/* Armstrong Urine Scale Self-Check Button */}
            <button
              onClick={() => setIsScaleModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 shadow-2xs cursor-pointer"
              title="Armstrong clinical dehydration self-check"
            >
              <HeartPulse className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden lg:inline">Self-Check</span>
            </button>

            {/* Gemini AI Assistant Button */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm border cursor-pointer ${
                isChatOpen
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white border-transparent hover:brightness-105'
              }`}
              title="Open Gemini AI Hydration Chat"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gemini AI</span>
            </button>

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/70 transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser?.avatarSeed || 'U'}
                </div>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-[90px] truncate">
                  {currentUser?.name}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      {currentUser?.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-sky-600" />
                    <span>Hydration Tracker</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition cursor-pointer"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-slate-600" />
                    <span>App Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      exportLogsToCSV(logs, goalConfig.unit, currentUser?.name || 'User');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Export Logs (CSV)</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={handleLogoutAction}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Page Tabs Bar */}
        <div className="flex md:hidden items-center justify-center p-1 bg-slate-100 rounded-2xl border border-slate-200/60 mt-2.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Tracker</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'profile' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'settings' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Main Content Router */}
      <main className="flex-1 flex flex-col">
        {/* Profile Page View */}
        {activeTab === 'profile' && (
          <ProfilePage
            onBackToDashboard={() => setActiveTab('dashboard')}
            onNavigateToSettings={() => setActiveTab('settings')}
            totalMlToday={totalMlToday}
            streak={currentStreak}
          />
        )}

        {/* Settings Page View */}
        {activeTab === 'settings' && (
          <SettingsPage
            onBackToDashboard={() => setActiveTab('dashboard')}
            goalConfig={goalConfig}
            onUpdateGoalConfig={setGoalConfig}
            reminderConfig={reminderConfig}
            onUpdateReminderConfig={setReminderConfig}
            onResetTodayLogs={handleClearAll}
            onTriggerTestReminder={triggerPeriodicAlert}
          />
        )}

        {/* Home / Tracker Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6 flex-1">
            {/* Top Metric Highlights Banner */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Daily Progress */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-sky-100 p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                  <span>Today's Progress</span>
                  <Droplets className="w-4 h-4 text-sky-600" />
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-slate-900">{progressPercent}%</span>
                  <span className="text-xs text-slate-500">
                    of{' '}
                    {goalConfig.unit === 'oz'
                      ? `${(goalConfig.dailyGoalMl * 0.033814).toFixed(0)} oz`
                      : `${goalConfig.dailyGoalMl} ml`}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Card 2: Total Volume Consumed */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-sky-100 p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                  <span>Intake Volume</span>
                  <Award className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900">
                    {goalConfig.unit === 'oz'
                      ? (totalMlToday * 0.033814).toFixed(1)
                      : totalMlToday.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{goalConfig.unit}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 truncate">
                  {isGoalAchieved
                    ? 'Target reached! Great work!'
                    : `${
                        goalConfig.unit === 'oz'
                          ? ((goalConfig.dailyGoalMl - totalMlToday) * 0.033814).toFixed(1)
                          : (goalConfig.dailyGoalMl - totalMlToday).toLocaleString()
                      } ${goalConfig.unit} left`}
                </p>
              </div>

              {/* Card 3: Hydration Streak */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-sky-100 p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                  <span>Hydration Streak</span>
                  <Flame className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900">{currentStreak}</span>
                  <span className="text-xs font-semibold text-amber-600">
                    {currentStreak === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {currentStreak > 0 ? 'Consistent hydration' : 'Start your streak today'}
                </p>
              </div>

              {/* Card 4: Next Periodic Reminder */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-sky-100 p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                  <span>Next Sip Reminder</span>
                  <Clock className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {formatCountdown(countdownSeconds)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Timer</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={triggerPeriodicAlert}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer"
                  >
                    Send Test Alert
                  </button>
                  <span className="text-[10px] text-slate-400">
                    Every {reminderConfig.intervalMinutes}m
                  </span>
                </div>
              </div>
            </section>

            {/* Centerpiece Layout: Bottle Vessel + Beverage Quality Breakdown + Quick Logging + Schedule Timeline + Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (5 cols on lg): Bottle Vessel + Beverage Quality Index */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <WaterWaveBottle
                  currentMl={totalMlToday}
                  goalMl={goalConfig.dailyGoalMl}
                  unit={goalConfig.unit}
                  isGoalAchieved={isGoalAchieved}
                  onOpenGoalModal={() => setIsGoalModalOpen(true)}
                />

                <BeverageBreakdown logs={logs} unit={goalConfig.unit} />
              </div>

              {/* Right Column (7 cols on lg): Quick Logger + Daily Milestone Timeline + Analytics Charts */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <QuickLogBar
                  onLog={handleLogIntake}
                  onUndoLast={handleUndoLast}
                  canUndo={logs.length > 0}
                  unit={goalConfig.unit}
                />

                <HydrationTimeline
                  currentMl={totalMlToday}
                  dailyGoalMl={goalConfig.dailyGoalMl}
                  unit={goalConfig.unit}
                  onLogMilestone={(ml, title) => handleLogIntake(ml, 'water', title)}
                />

                <VisualCharts
                  logs={logs}
                  weeklyHistory={weeklyHistory}
                  dailyGoalMl={goalConfig.dailyGoalMl}
                  unit={goalConfig.unit}
                />
              </div>
            </div>

            {/* Gemini AI Hydration Feature Card on Home Page */}
            <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-6 text-white shadow-xl shadow-sky-950/10 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-2 relative z-10 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30">
                    <Bot className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold tracking-wider uppercase text-sky-400">
                    AI Hydration Assistant
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    Multi-Turn Gemini
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  Need personalized advice, drink checks, or athletic sweat analysis?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Consult your real-time hydration coach powered by Google Gemini. Switch effortlessly between{' '}
                  <span className="text-sky-300 font-semibold">Hydration Coach</span> (gemini-3.5-flash for general tasks),{' '}
                  <span className="text-amber-300 font-semibold">Quick Sip Bot</span> (gemini-3.1-flash-lite for fast tasks), and{' '}
                  <span className="text-violet-300 font-semibold">Physiology Specialist</span> (gemini-3.1-pro-preview for complex tasks).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto relative z-10 shrink-0">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Launch Gemini Chat</span>
                </button>
              </div>
            </section>

            {/* Smart Tips & Insights Section */}
            <section className="pt-2">
              <HydrationTips currentStreak={currentStreak} progressPercent={progressPercent} />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/60 bg-white/60 py-6 px-4 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Water cons</span>
            <span>•</span>
            <span>Intelligent Hydration Tracker</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                handleClearAll();
                soundManager.playWaterDrop();
              }}
              className="text-sky-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Today's Logs
            </button>
            <button
              onClick={() => exportLogsToCSV(logs, goalConfig.unit, currentUser?.name || 'User')}
              className="hover:text-slate-700 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Download className="w-3 h-3 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="hover:text-slate-700 cursor-pointer"
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="hover:text-slate-700 cursor-pointer"
            >
              Settings
            </button>
            <button
              onClick={handleLogoutAction}
              className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        config={goalConfig}
        onSave={(newCfg) => setGoalConfig(newCfg)}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        config={reminderConfig}
        onSave={(newCfg) => setReminderConfig(newCfg)}
        onTriggerTestNotification={triggerPeriodicAlert}
      />

      <LogHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        logs={logs}
        onDeleteLog={handleDeleteLog}
        onClearAllToday={handleClearAll}
        unit={goalConfig.unit}
      />

      {/* Armstrong Clinical Hydration Scale Modal */}
      <HydrationScaleModal
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
        onLogRecommended={(ml, note) => handleLogIntake(ml, 'water', note)}
        unit={goalConfig.unit}
      />

      {/* Gemini AI Multi-Turn Chatbot */}
      <GeminiChatbot
        currentMl={totalMlToday}
        goalMl={goalConfig.dailyGoalMl}
        unit={goalConfig.unit}
        streak={currentStreak}
        isOpen={isChatOpen}
        onToggleOpen={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
}
