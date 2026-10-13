import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, GlassWater, X, Check } from 'lucide-react';

interface NotificationBannerProps {
  visible: boolean;
  onDismiss: () => void;
  onQuickDrink: (amountMl: number) => void;
  unit: 'ml' | 'oz';
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  visible,
  onDismiss,
  onQuickDrink,
  unit,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-3xl shadow-2xl border border-sky-500/30 ring-4 ring-sky-500/10"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 animate-pulse">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Hydration Reminder! 💧
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Time for a refreshing sip to stay energized.
                </p>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[11px] text-sky-300 font-medium">Quick sip response:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onQuickDrink(250);
                  onDismiss();
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center gap-1 transition"
              >
                <GlassWater className="w-3.5 h-3.5" />
                <span>+250 {unit}</span>
              </button>
              <button
                onClick={onDismiss}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
