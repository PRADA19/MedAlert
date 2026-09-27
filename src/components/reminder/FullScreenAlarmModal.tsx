import React, { useEffect } from 'react';
import { Pill, Volume2, Clock, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';
import { useReminderStore } from '../../store/reminderStore';
import { useMedicineStore } from '../../store/medicineStore';
import { useSettingsStore } from '../../store/settingsStore';
import { audioService } from '../../services/audioService';
import { Button } from '../ui/Button';

export const FullScreenAlarmModal: React.FC = () => {
  const { activeDueItems, markAsTaken, snoozeReminders } = useReminderStore();
  const { medicines } = useMedicineStore();
  const { settings } = useSettingsStore();

  const currentReminder = activeDueItems[0];

  useEffect(() => {
    if (currentReminder && settings.enableSound) {
      audioService.playAlarm(settings.reminderSound, settings.soundVolume);
    }
    return () => {
      if (activeDueItems.length <= 1) {
        audioService.stopAlarm();
      }
    };
  }, [currentReminder, settings.enableSound, settings.reminderSound, settings.soundVolume]);

  if (!currentReminder) return null;

  const currentMedicine = medicines.find((m) => m.id === currentReminder.medicineId);
  const totalDueCount = activeDueItems.length;

  const handleTake = () => {
    markAsTaken([currentReminder.medicineId]);
    if (activeDueItems.length <= 1) {
      audioService.stopAlarm();
    }
  };

  const handleSnooze = () => {
    snoozeReminders([currentReminder.medicineId], settings.snoozeDurationMinutes);
    if (activeDueItems.length <= 1) {
      audioService.stopAlarm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-y-auto animate-fadeIn">
      {/* Top Header Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-widest bg-brand-950/80 px-3 py-1.5 rounded-full border border-brand-800">
          <Volume2 className="w-4 h-4 animate-bounce" />
          <span>Active Lockscreen Medical Alarm</span>
        </div>

        {totalDueCount > 1 && (
          <span className="text-xs font-black bg-rose-900/80 text-rose-200 border border-rose-700 px-3 py-1 rounded-full">
            {totalDueCount} Medicines Due
          </span>
        )}
      </div>

      {/* Center Alarm Focus Body */}
      <div className="my-auto py-8 text-center space-y-6 max-w-lg mx-auto">
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#3A9295] to-[#63C1BB] flex items-center justify-center text-white shadow-2xl shadow-[#3A9295]/40 border-2 border-white/20 animate-pulse">
          <Pill className="w-14 h-14 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-300">
            TIME FOR YOUR MEDICATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {currentMedicine?.name || 'Scheduled Medication'}
          </h1>
          <p className="text-lg font-semibold text-brand-200">
            Dosage: {currentMedicine ? `${currentMedicine.dosageAmount} ${currentMedicine.dosageUnit}` : '1 Dose'}
          </p>
        </div>

        {currentMedicine?.instructions && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300">
            💡 <span className="font-medium">{currentMedicine.instructions}</span>
          </div>
        )}

        {/* Caregiver Status */}
        {settings.enableCaregiverAlert && settings.caregiverName && (
          <div className="flex items-center justify-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-xl">
            <UserCheck className="w-4 h-4" />
            <span>Caregiver Contact: {settings.caregiverName} ({settings.caregiverPhone || 'Enabled'})</span>
          </div>
        )}
      </div>

      {/* Bottom Large Lockscreen Action Buttons */}
      <div className="space-y-3 max-w-lg mx-auto w-full pt-4">
        <button
          onClick={handleTake}
          className="w-full py-4 sm:py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 border border-emerald-400/30 transition-all"
        >
          <CheckCircle2 className="w-7 h-7 stroke-[3]" />
          <span>TAKE MEDICINE NOW</span>
        </button>

        <button
          onClick={handleSnooze}
          className="w-full py-3.5 sm:py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-bold text-base flex items-center justify-center gap-2 border border-slate-700 transition-all"
        >
          <Clock className="w-5 h-5 text-amber-400" />
          <span>SNOOZE FOR {settings.snoozeDurationMinutes} MINS</span>
        </button>
      </div>
    </div>
  );
};
