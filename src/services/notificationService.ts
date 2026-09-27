import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export const notificationService = {
  isSupported(): boolean {
    if (Capacitor.isNativePlatform()) return true;
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  async getPermission(): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      return status.display;
    }
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  async requestPermission(): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      const result = await LocalNotifications.requestPermissions();
      return result.display;
    }
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.error('Error requesting notification permission', e);
      return 'denied';
    }
  },

  async sendNotification(title: string, body: string, icon: string = '/favicon.svg') {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Math.floor(Math.random() * 100000),
              schedule: { at: new Date(Date.now() + 100) },
              sound: 'alarm.wav',
              actionTypeId: 'ALARM_ACTION',
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

  async scheduleNativeAlarm(id: number, title: string, body: string, date: Date) {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id,
              schedule: { at: date, allowWhileIdle: true },
              sound: 'alarm.wav',
              ongoing: true,
            },
          ],
        });
      } catch (err) {
        console.error('Failed to schedule native alarm', err);
      }
    }
  }
};
