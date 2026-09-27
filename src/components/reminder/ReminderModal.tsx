import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Pill, Check, Clock, ChevronDown, AlertCircle, Volume2, Shield } from 'lucide-react';
import { useReminderStore } from '../../store/reminderStore';
import { useMedicineStore } from '../../store/medicineStore';
import { useSettingsStore } from '../../store/settingsStore';
import { formatTimeDisplay } from '../../utils/dateUtils';
import { Button } from '../ui/Button';

export const ReminderModal: React.FC = () => {
  const { activeDueItems, isModalOpen, markAsTaken, snoozeReminders, skipReminders } = useReminderStore();
  const { medicines } = useMedicineStore();
  const { settings } = useSettingsStore();

  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);

  if (!isModalOpen || activeDueItems.length === 0) return null;

  // Resolve medicines
  const dueMedicines = activeDueItems
    .map((item) => ({
      item,
      medicine: medicines.find((m) => m.id === item.medicineId),
    }))
    .filter((entry): entry is { item: typeof entry.item; medicine: NonNullable<typeof entry.medicine> } => Boolean(entry.medicine));

  const allMedIds = dueMedicines.map((m) => m.medicine.id);

  const toggleSelectMed = (id: string) => {
    if (selectedMeds.includes(id)) {
      setSelectedMeds(selectedMeds.filter((m) => m !== id));
    } else {
      setSelectedMeds([...selectedMeds, id]);
    }
  };

  const handleTakeAll = () => {
    markAsTaken(allMedIds);
  };

  const handleTakeSelected = () => {
    if (selectedMeds.length > 0) {
      markAsTaken(selectedMeds);
      setSelectedMeds([]);
    } else {
      markAsTaken(allMedIds);
    }
  };

  const handleSnooze = (minutes: number) => {
    snoozeReminders(allMedIds, minutes);
    setShowSnoozeMenu(false);
  };

  const handleSkip = () => {
    skipReminders(allMedIds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-brand-500/30 overflow-hidden my-auto"
      >
        {/* Animated Top Alarm Header */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-brand-400/20 rounded-full blur-xl pointer-events-none" />

          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg mb-3"
          >
            <Bell className="w-8 h-8 fill-current" />
          </motion.div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-brand-100 border border-white/20 mb-2">
            <Volume2 className="w-3.5 h-3.5" /> Scheduled Medication Alarm
          </span>

          <h2 className="text-2xl font-bold tracking-tight">
            {dueMedicines.length === 1 ? 'Time for Your Medicine!' : `${dueMedicines.length} Medicines Due Now!`}
          </h2>
          <p className="text-brand-100 text-sm mt-1">
            {dueMedicines.length === 1
              ? `Scheduled for ${formatTimeDisplay(dueMedicines[0].item.scheduledTime, settings.timeFormat === '12h')}`
              : 'Please review and confirm taking your scheduled medications.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {dueMedicines.map(({ item, medicine }) => (
            <div
              key={`${medicine.id}_${item.scheduledTime}`}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2 transition-all hover:border-brand-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold shrink-0 shadow-sm">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {medicine.name}
                    </h4>
                    <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      {medicine.dosageAmount} {medicine.dosageUnit} • <span className="capitalize">{medicine.type}</span>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                  {formatTimeDisplay(item.scheduledTime, settings.timeFormat === '12h')}
                </span>
              </div>

              {medicine.instructions && (
                <div className="text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 p-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{medicine.instructions}</span>
                </div>
              )}

              {medicine.enableStockTracking && (
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  <span>Current Stock: {medicine.currentStock} {medicine.dosageUnit}s</span>
                  {medicine.currentStock <= medicine.lowStockThreshold && (
                    <span className="text-rose-500 font-medium">⚠️ Low Stock Alert</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Take All Button */}
            <Button
              variant="success"
              size="lg"
              onClick={handleTakeAll}
              className="flex-1 text-base shadow-lg shadow-emerald-600/20 py-3"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              {dueMedicines.length === 1 ? '✓ Mark as Taken' : '✓ Take All Medicines'}
            </Button>

            {/* Snooze Menu Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                className="w-full sm:w-auto py-3 gap-2"
              >
                <Clock className="w-5 h-5" />
                Snooze
                <ChevronDown className="w-4 h-4" />
              </Button>

              <AnimatePresence>
                {showSnoozeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-20"
                  >
                    <div className="p-2 space-y-1">
                      <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Snooze Duration
                      </p>
                      {[5, 10, 15, 30].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => handleSnooze(mins)}
                          className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:text-brand-600 rounded-xl transition-colors flex items-center justify-between"
                        >
                          <span>{mins} Minutes</span>
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
            <button
              onClick={handleSkip}
              className="hover:text-rose-500 underline transition-colors"
            >
              Skip this dose
            </button>

            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Health Protection Active
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
