import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useMedicineStore } from '../store/medicineStore';
import { useReminderStore } from '../store/reminderStore';
import { useHistoryStore } from '../store/historyStore';
import { useSettingsStore } from '../store/settingsStore';
import { notificationService } from '../services/notificationService';
import { ActiveDueItem } from '../types/reminder';
import {
  getTodayDateString,
  getCurrentTimeString,
  isDateInActiveRange,
  getMinutesPastScheduled,
} from '../utils/dateUtils';

export function useReminderEngine() {
  const { medicines } = useMedicineStore();
  const { triggerReminders, snoozedMap } = useReminderStore();
  const { history, addLog } = useHistoryStore();
  const { settings } = useSettingsStore();

  const isRunningRef = useRef(false);

  // Sync native system alarms into Android System AlarmManager whenever medicines change
  useEffect(() => {
    if (medicines.length > 0 && settings.enableReminders) {
      notificationService.syncAllNativeAlarms(medicines);
    }
  }, [medicines, settings.enableReminders]);

  // Listen for Native Notification Taps on Android/iOS
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const handleNotificationTap = async () => {
        try {
          const listener = await LocalNotifications.addListener(
            'localNotificationActionPerformed',
            (action) => {
              const extra = action.notification.extra;
              if (extra && extra.medicineId) {
                triggerReminders([
                  {
                    medicineId: extra.medicineId,
                    scheduledTime: extra.scheduledTime || getCurrentTimeString(),
                    scheduledDate: extra.scheduledDate || getTodayDateString(),
                    dueAtISO: new Date().toISOString(),
                  },
                ]);
              }
            }
          );
          return () => listener.remove();
        } catch (e) {
          console.error('Error adding notification tap listener', e);
        }
      };

      handleNotificationTap();
    }
  }, [triggerReminders]);

  useEffect(() => {
    if (!settings.enableReminders) return;

    const checkReminders = () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      try {
        const todayStr = getTodayDateString();
        const currentTimeStr = getCurrentTimeString();
        const nowMs = Date.now();

        const dueItems: ActiveDueItem[] = [];

        medicines.forEach((med) => {
          // Must be active
          if (!med.active) return;

          // Must be within date range
          if (!isDateInActiveRange(med.startDate, med.endDate)) return;

          med.times.forEach((timeStr) => {
            const key = `${med.id}_${timeStr}`;

            // Check if already logged for today (taken, skipped, missed)
            const existingLog = history.find(
              (h) =>
                h.medicineId === med.id &&
                h.scheduledDate === todayStr &&
                h.scheduledTime === timeStr
            );

            // If already logged today as taken, skipped, or missed, skip
            if (existingLog && ['taken', 'skipped', 'missed'].includes(existingLog.status)) {
              return;
            }

            const minutesPast = getMinutesPastScheduled(timeStr);

            // 1. Check if Snoozed item timer elapsed
            const snoozedUntilISO = snoozedMap[key];
            if (snoozedUntilISO) {
              const snoozeTimeMs = new Date(snoozedUntilISO).getTime();
              if (nowMs >= snoozeTimeMs) {
                dueItems.push({
                  medicineId: med.id,
                  scheduledTime: timeStr,
                  scheduledDate: todayStr,
                  dueAtISO: new Date().toISOString(),
                });
              }
              return;
            }

            // 2. Check if medicine is currently due (within 0 to missedThresholdMinutes range)
            if (minutesPast >= 0 && minutesPast < settings.missedThresholdMinutes) {
              dueItems.push({
                medicineId: med.id,
                scheduledTime: timeStr,
                scheduledDate: todayStr,
                dueAtISO: new Date().toISOString(),
              });
            }

            // 3. Auto-flag as Missed if time passed threshold without user taking action
            if (minutesPast >= settings.missedThresholdMinutes && !existingLog) {
              addLog({
                medicineId: med.id,
                medicineName: med.name,
                medicineType: med.type,
                dosage: `${med.dosageAmount} ${med.dosageUnit}`,
                scheduledDate: todayStr,
                scheduledTime: timeStr,
                status: 'missed',
                notes: `Not taken within ${settings.missedThresholdMinutes} minutes of scheduled time.`,
              });
            }
          });
        });

        if (dueItems.length > 0) {
          triggerReminders(dueItems);
        }
      } catch (err) {
        console.error('Error in reminder engine loop', err);
      } finally {
        isRunningRef.current = false;
      }
    };

    // Run check immediately on mount
    checkReminders();

    // Ticker interval every 5 seconds
    const interval = setInterval(checkReminders, 5000);

    return () => clearInterval(interval);
  }, [medicines, history, settings, snoozedMap, triggerReminders, addLog]);
}
