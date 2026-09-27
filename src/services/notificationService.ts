import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Medicine } from '../types/medicine';
import { isDateInActiveRange } from '../utils/dateUtils';

export const notificationService = {
  isSupported(): boolean {
    if (Capacitor.isNativePlatform()) return true;
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  async getPermission(): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await LocalNotifications.checkPermissions();
        return status.display;
      } catch (e) {
        return 'denied';
      }
    }
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  async requestPermission(): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await LocalNotifications.requestPermissions();
        await this.setupNativeChannel();
        return result.display;
      } catch (e) {
        console.error('Error requesting native notification permission', e);
        return 'denied';
      }
    }
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.error('Error requesting web notification permission', e);
      return 'denied';
    }
  },

  async setupNativeChannel() {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.createChannel({
          id: 'medicine-alarms',
          name: 'Medicine Lockscreen Alarms',
          description: 'High-priority medicine alarms that ring out loud even when phone screen is off/locked',
          importance: 5, // MAX importance to break through lockscreen & Do Not Disturb
          visibility: 1, // PUBLIC (shows on lockscreen)
          sound: 'alarm.wav',
          vibration: true,
          lights: true,
          lightColor: '#3A9295',
        });
      } catch (e) {
        console.error('Error creating native notification channel', e);
      }
    }
  },

  async sendNotification(title: string, body: string, icon: string = '/favicon.svg') {
    if (Capacitor.isNativePlatform()) {
      try {
        await this.setupNativeChannel();
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Math.floor(Math.random() * 1000000),
              schedule: { at: new Date(Date.now() + 200) },
              sound: 'alarm.wav',
              channelId: 'medicine-alarms',
              extra: { fullScreen: true },
            },
          ],
        });
      } catch (err) {
        console.error('Native notification error', err);
      }
      return null;
    }

    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon,
        badge: icon,
        requireInteraction: true,
        tag: 'medialert-reminder',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (e) {
      console.error('Error sending web notification', e);
      return null;
    }
  },

  // Synchronize all upcoming active medicine schedules into native Android AlarmManager
  async syncAllNativeAlarms(medicines: Medicine[]) {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await this.setupNativeChannel();

      // Cancel existing scheduled local notifications to avoid duplicate alarms
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      const notificationsToSchedule: any[] = [];
      const now = new Date();

      medicines.forEach((med) => {
        if (!med.active) return;
        if (!isDateInActiveRange(med.startDate, med.endDate)) return;

        // Schedule for the next 7 days
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const targetDate = new Date();
          targetDate.setDate(now.getDate() + dayOffset);
          const dateStr = targetDate.toISOString().slice(0, 10);

          if (!isDateInActiveRange(med.startDate, med.endDate, targetDate)) continue;

          med.times.forEach((timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const scheduledDateTime = new Date(targetDate);
            scheduledDateTime.setHours(hours, minutes, 0, 0);

            // Only schedule if it's in the future
            if (scheduledDateTime.getTime() > now.getTime()) {
              const uniqueNumericId = Math.abs(hashString(`${med.id}_${dateStr}_${timeStr}`));

              notificationsToSchedule.push({
                title: `💊 MediAlert — Take ${med.name}`,
                body: `Dosage: ${med.dosageAmount} ${med.dosageUnit}. Scheduled for ${formatTime(timeStr)}. Tap to open alarm!`,
                id: uniqueNumericId,
                schedule: { at: scheduledDateTime, allowWhileIdle: true },
                sound: 'alarm.wav',
                channelId: 'medicine-alarms',
                ongoing: true,
                autoCancel: false,
                extra: { medicineId: med.id, scheduledTime: timeStr, scheduledDate: dateStr },
              });
            }
          });
        }
      });

      if (notificationsToSchedule.length > 0) {
        // Schedule in batches of 50 to prevent OS overload
        const batchSize = 50;
        for (let i = 0; i < notificationsToSchedule.length; i += batchSize) {
          const batch = notificationsToSchedule.slice(i, i + batchSize);
          await LocalNotifications.schedule({ notifications: batch });
        }
        console.log(`✓ Successfully scheduled ${notificationsToSchedule.length} native alarms into Android System AlarmManager`);
      }
    } catch (err) {
      console.error('Failed to sync native system alarms', err);
    }
  }
};

// Helper: Hash string to positive 32-bit integer for notification ID
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Helper: Format 24h string to 12h display
function formatTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  const displayMin = m < 10 ? `0${m}` : m;
  return `${displayHour}:${displayMin} ${period}`;
}
