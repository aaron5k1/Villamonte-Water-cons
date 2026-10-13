import React, { useState } from 'react';
import { Bell, BellRing, X, Volume2, VolumeX, Moon, Clock, Play, CheckCircle, ShieldAlert } from 'lucide-react';
import { ReminderConfig } from '../types';
import { requestNotificationPermission, showHydrationNotification, isNotificationSupported } from '../utils/notifications';
import { soundManager } from '../utils/sound';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ReminderConfig;
  onSave: (config: ReminderConfig) => void;
  onTriggerTestNotification: () => void;
}

const INTERVAL_OPTIONS = [
  { value: 30, label: 'Every 30 mins' },
  { value: 45, label: 'Every 45 mins' },
  { value: 60, label: 'Every 1 hour', recommended: true },
  { value: 90, label: 'Every 1.5 hours' },
  { value: 120, label: 'Every 2 hours' },
];

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onTriggerTestNotification,
}) => {
  const [enabled, setEnabled] = useState(config.enabled);
  const [intervalMinutes, setIntervalMinutes] = useState(config.intervalMinutes);
  const [soundEnabled, setSoundEnabled] = useState(config.soundEnabled);
  const [quietStart, setQuietStart] = useState(config.quietStart);
  const [quietEnd, setQuietEnd] = useState(config.quietEnd);

  const [testSent, setTestSent] = useState(false);
  const [permissionState, setPermissionState] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setPermissionState(perm);
    if (perm === 'granted') {
      setEnabled(true);
    }
  };

  const handleTestNotification = () => {
    onTriggerTestNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleSave = () => {
    onSave({
      enabled,
      intervalMinutes,
      soundEnabled,
      quietStart,
      quietEnd,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-600">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Periodic Hydration Alerts</h3>
            <p className="text-xs text-slate-500">Stay consistently hydrated throughout the day</p>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="mb-6 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">Periodic Reminders</span>
              {enabled && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Receive gentle prompts when it's time for a glass
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => {
                setEnabled(e.target.checked);
                if (e.target.checked && permissionState === 'default') {
                  handleRequestPermission();
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>

        {/* Browser Permission Status Banner */}
        {isNotificationSupported() && permissionState !== 'granted' && (
          <div className="mb-6 p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start justify-between gap-3">
            <div className="flex gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">Browser Permissions Needed</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Enable system notifications to receive alerts even when Water cons is in the background.
                </p>
              </div>
            </div>
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-sm"
            >
              Allow
            </button>
          </div>
        )}

        {/* Interval Selector */}
        <div className="space-y-4 mb-6">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Reminder Frequency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INTERVAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setIntervalMinutes(opt.value)}
                className={`p-3 rounded-2xl border text-xs font-bold transition text-left flex flex-col justify-between ${
                  intervalMinutes === opt.value
                    ? 'bg-sky-50 border-sky-400 text-sky-700 ring-2 ring-sky-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{opt.label}</span>
                {opt.recommended && (
                  <span className="text-[10px] text-sky-600 font-semibold mt-1">Recommended</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sound & Quiet Hours Settings */}
        <div className="space-y-3 mb-6 border-t border-slate-100 pt-5">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/70 hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800">Water Droplet Chime</span>
                <p className="text-[11px] text-slate-500">Play gentle audio tone when reminding</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) soundManager.playReminderChime();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                soundEnabled
                  ? 'bg-sky-100 text-sky-700 border-sky-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* Quiet Hours */}
          <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-800">Quiet Sleep Window</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Mutes notifications automatically while you sleep
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Sleep Start</label>
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Wake Up</label>
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

        {/* Immediate Test Trigger Button */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800">Test Reminder Notification</span>
            <p className="text-[11px] text-slate-500">Verify audio chime & visual notification banner</p>
          </div>
          <button
            type="button"
            onClick={handleTestNotification}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200 shadow-sm flex items-center gap-1.5 transition active:scale-95"
          >
            {testSent ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Triggered!</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-sky-600 text-sky-600" />
                <span>Test Alert</span>
              </>
            )}
          </button>
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
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
