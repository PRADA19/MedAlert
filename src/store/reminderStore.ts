import { create } from 'zustand';
import { ActiveDueItem } from '../types/reminder';
import { audioService } from '../services/audioService';
import { notificationService } from '../services/notificationService';
import { useSettingsStore } from './settingsStore';
import { useMedicineStore } from './medicineStore';
import { useHistoryStore } from './historyStore';
import { useToastStore } from './toastStore';
import { getTodayDateString, getCurrentTimeString, formatTimeDisplay } from '../utils/dateUtils';
import confetti from 'canvas-confetti';

interface ReminderState {
  activeDueItems: ActiveDueItem[];
  isModalOpen: boolean;
  snoozedMap: Record<string, string>; // key: `${medicineId}_${scheduledTime}`, value: ISO string
  
  // Actions
  triggerReminders: (items: ActiveDueItem[]) => void;
  markAsTaken: (medicineIds: string[]) => void;
  snoozeReminders: (medicineIds: string[], minutes: number) => void;
  skipReminders: (medicineIds: string[]) => void;
  closeModal: () => void;
  
  // Test Reminders
  triggerTestReminder: (customMedicineId?: string) => void;
  triggerTestReminderInSeconds: (seconds: number) => void;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  activeDueItems: [],
  isModalOpen: false,
  snoozedMap: {},

  triggerReminders: (items) => {
    if (items.length === 0) return;

    // Filter out items that are currently snoozed and snooze time hasn't elapsed
    const nowISO = new Date().toISOString();
    const validItems = items.filter((item) => {
      const snoozeKey = `${item.medicineId}_${item.scheduledTime}`;
      const snoozedUntil = get().snoozedMap[snoozeKey];
      if (snoozedUntil && new Date(snoozedUntil).getTime() > new Date(nowISO).getTime()) {
        return false;
      }
      return true;
    });

    if (validItems.length === 0) return;

    // Merge with existing active items (avoid duplicates)
    const existingKeys = new Set(get().activeDueItems.map((i) => `${i.medicineId}_${i.scheduledTime}`));
    const newUniqueItems = validItems.filter((i) => !existingKeys.has(`${i.medicineId}_${i.scheduledTime}`));

    if (newUniqueItems.length === 0 && get().isModalOpen) return;

    const merged = [...get().activeDueItems, ...newUniqueItems];
    set({ activeDueItems: merged, isModalOpen: true });

    // 1. Play Sound if enabled in settings
    const settings = useSettingsStore.getState().settings;
    if (settings.enableReminders && settings.enableSound) {
      audioService.playAlarm(settings.reminderSound, settings.soundVolume);
    }

    // 2. Trigger Browser Notification if enabled
    if (settings.enableReminders && settings.enableNotifications) {
      const medicines = useMedicineStore.getState().medicines;
      const dueMeds = merged
        .map((item) => medicines.find((m) => m.id === item.medicineId))
        .filter(Boolean);

      if (dueMeds.length === 1 && dueMeds[0]) {
        const med = dueMeds[0];
        notificationService.sendNotification(
          'MediAlert — Medicine Reminder 💊',
          `Time to take ${med.name} (${med.dosageAmount} ${med.dosageUnit}). Scheduled for ${formatTimeDisplay(merged[0].scheduledTime)}.`
        );
      } else if (dueMeds.length > 1) {
        notificationService.sendNotification(
          `MediAlert — ${dueMeds.length} Medicines Due 💊`,
          `You have ${dueMeds.length} medications scheduled right now: ${dueMeds.map((m) => m?.name).join(', ')}.`
        );
      }
    }
  },

  markAsTaken: (medicineIds) => {
    const { activeDueItems } = get();
    const medicines = useMedicineStore.getState().medicines;
    const today = getTodayDateString();
    const nowISO = new Date().toISOString();

    medicineIds.forEach((medId) => {
      const item = activeDueItems.find((i) => i.medicineId === medId);
      const med = medicines.find((m) => m.id === medId);
      
      if (med) {
        // Add log entry to history
        useHistoryStore.getState().addLog({
          medicineId: med.id,
          medicineName: med.name,
          medicineType: med.type,
          dosage: `${med.dosageAmount} ${med.dosageUnit}`,
          scheduledDate: item?.scheduledDate || today,
          scheduledTime: item?.scheduledTime || getCurrentTimeString(),
          status: 'taken',
          takenAt: nowISO,
        });

        // Deduct Stock
        useMedicineStore.getState().deductStock(med.id, med.dosageAmount);

        // Clear snooze status if exists
        const snoozeKey = `${med.id}_${item?.scheduledTime || ''}`;
        const currentSnoozed = { ...get().snoozedMap };
        delete currentSnoozed[snoozeKey];
        set({ snoozedMap: currentSnoozed });
      }
    });

    // Remove taken items from due queue
    const remaining = activeDueItems.filter((i) => !medicineIds.includes(i.medicineId));

    if (remaining.length === 0) {
      audioService.stopAlarm();
      set({ activeDueItems: [], isModalOpen: false });
      
      // Celebrate with subtle confetti!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}

      useToastStore.getState().showToast('✓ Great job!', 'Medication marked as taken.', 'success');
    } else {
      set({ activeDueItems: remaining });
      useToastStore.getState().showToast('✓ Marked as taken', `${medicineIds.length} medicine(s) updated.`, 'success');
    }
  },

  snoozeReminders: (medicineIds, minutes) => {
    const { activeDueItems, snoozedMap } = get();
    const snoozedUntilISO = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    const updatedSnoozed = { ...snoozedMap };

    medicineIds.forEach((medId) => {
      const item = activeDueItems.find((i) => i.medicineId === medId);
      if (item) {
        const snoozeKey = `${medId}_${item.scheduledTime}`;
        updatedSnoozed[snoozeKey] = snoozedUntilISO;
      }
    });

    const remaining = activeDueItems.filter((i) => !medicineIds.includes(i.medicineId));

    if (remaining.length === 0) {
      audioService.stopAlarm();
      set({ activeDueItems: [], isModalOpen: false, snoozedMap: updatedSnoozed });
    } else {
      set({ activeDueItems: remaining, snoozedMap: updatedSnoozed });
    }

    useToastStore.getState().showToast(
      '⏰ Reminder Snoozed',
      `Snoozed for ${minutes} minutes. We will remind you again.`,
      'info'
    );
  },

  skipReminders: (medicineIds) => {
    const { activeDueItems } = get();
    const medicines = useMedicineStore.getState().medicines;
    const today = getTodayDateString();

    medicineIds.forEach((medId) => {
      const item = activeDueItems.find((i) => i.medicineId === medId);
      const med = medicines.find((m) => m.id === medId);

      if (med) {
        useHistoryStore.getState().addLog({
          medicineId: med.id,
          medicineName: med.name,
          medicineType: med.type,
          dosage: `${med.dosageAmount} ${med.dosageUnit}`,
          scheduledDate: item?.scheduledDate || today,
          scheduledTime: item?.scheduledTime || getCurrentTimeString(),
          status: 'skipped',
        });
      }
    });

    const remaining = activeDueItems.filter((i) => !medicineIds.includes(i.medicineId));

    if (remaining.length === 0) {
      audioService.stopAlarm();
      set({ activeDueItems: [], isModalOpen: false });
    } else {
      set({ activeDueItems: remaining });
    }

    useToastStore.getState().showToast('Medication Skipped', 'Recorded in history.', 'info');
  },

  closeModal: () => {
    audioService.stopAlarm();
    set({ isModalOpen: false });
  },

  triggerTestReminder: (customMedicineId) => {
    const medicines = useMedicineStore.getState().medicines;
    let med = medicines.find((m) => m.id === customMedicineId);

    if (!med) {
      if (medicines.length === 0) {
        // Create a temporary demo medicine for test
        med = useMedicineStore.getState().addMedicine({
          name: 'Vitamin D3 (Test)',
          type: 'capsule',
          dosageAmount: 1,
          dosageUnit: 'Capsule',
          frequency: 'once_daily',
          times: [getCurrentTimeString()],
          startDate: getTodayDateString(),
          endDate: null,
          instructions: 'Take with water',
          enableStockTracking: true,
          currentStock: 30,
          dailyUsage: 1,
          lowStockThreshold: 5,
          active: true,
        });
      } else {
        med = medicines[0];
      }
    }

    const testItem: ActiveDueItem = {
      medicineId: med.id,
      scheduledTime: getCurrentTimeString(),
      scheduledDate: getTodayDateString(),
      dueAtISO: new Date().toISOString(),
    };

    get().triggerReminders([testItem]);
  },

  triggerTestReminderInSeconds: (seconds) => {
    useToastStore.getState().showToast(
      '⏳ Timer Started',
      `Test reminder will trigger in ${seconds} seconds. Keep this tab open.`,
      'info'
    );

    setTimeout(() => {
      get().triggerTestReminder();
    }, seconds * 1000);
  },
}));
