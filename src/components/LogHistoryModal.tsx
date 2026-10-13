import React from 'react';
import { X, Trash2, Clock, Droplets, Calendar } from 'lucide-react';
import { IntakeLog, UnitType } from '../types';

interface LogHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: IntakeLog[];
  onDeleteLog: (id: string) => void;
  onClearAllToday: () => void;
  unit: UnitType;
}

const DRINK_NAMES: Record<string, { label: string; icon: string }> = {
  water: { label: 'Water', icon: '💧' },
  sparkling: { label: 'Sparkling Water', icon: '🫧' },
  infused: { label: 'Fruit Infusion', icon: '🍋' },
  tea: { label: 'Herbal Tea', icon: '🍵' },
  electrolyte: { label: 'Electrolyte Mix', icon: '⚡' },
  coffee: { label: 'Iced Coffee', icon: '☕' },
};

export const LogHistoryModal: React.FC<LogHistoryModalProps> = ({
  isOpen,
  onClose,
  logs,
  onDeleteLog,
  onClearAllToday,
  unit,
}) => {
  if (!isOpen) return null;

  const formatAmount = (ml: number) => {
    if (unit === 'oz') {
      return `${(ml * 0.033814).toFixed(1)} fl oz`;
    }
    return `${ml} ml`;
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Today';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Today's Intake History</h3>
            <p className="text-xs text-slate-500">
              {logs.length} drink entries recorded today
            </p>
          </div>
        </div>

        {/* Logs list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-2">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Droplets className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-600">No drinks logged yet today</p>
              <p className="text-xs text-slate-400 mt-1">
                Tap on any quick container on the home screen to log your first sip!
              </p>
            </div>
          ) : (
            [...logs].reverse().map((log) => {
              const drinkInfo = DRINK_NAMES[log.drinkType] || { label: 'Water', icon: '💧' };
              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl p-2 rounded-xl bg-white shadow-xs border border-slate-200/50">
                      {drinkInfo.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          {formatAmount(log.amount)}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          • {drinkInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{formatTime(log.timestamp)}</span>
                        {log.note && <span className="italic truncate max-w-[150px]">"{log.note}"</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteLog(log.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Remove entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {logs.length > 0 ? (
            <button
              onClick={() => {
                if (window.confirm('Reset all water logs for today?')) {
                  onClearAllToday();
                }
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1"
            >
              Clear Today's Logs
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
