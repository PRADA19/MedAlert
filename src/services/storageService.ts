import { Medicine } from '../types/medicine';
import { ReminderLog } from '../types/reminder';
import { UserSettings } from '../types/settings';

const STORAGE_KEYS = {
  MEDICINES: 'medialert_medicines',
  HISTORY: 'medialert_history',
  SETTINGS: 'medialert_settings',
  AUDIO_UNLOCKED: 'medialert_audio_unlocked',
};

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  enableReminders: true,
  enableSound: true,
  soundVolume: 0.8,
  reminderSound: 'gentle_bell',
  enableContinuousAlarmLoop: true,
  snoozeDurationMinutes: 10,
  missedThresholdMinutes: 30,
  enableNotifications: true,
  timeFormat: '12h',
  startOfWeek: 'monday',
  audioUnlocked: false,
  enableCaregiverAlert: false,
  caregiverName: '',
  caregiverPhone: '',
  caregiverEmail: '',
};

export const storageService = {
  // Medicines
  getMedicines(): Medicine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read medicines from localStorage', e);
      return [];
    }
  },

  saveMedicines(medicines: Medicine[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
    } catch (e) {
      console.error('Failed to save medicines to localStorage', e);
    }
  },

  // History
  getHistory(): ReminderLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read history from localStorage', e);
      return [];
    }
  },

  saveHistory(history: ReminderLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  },

  // Settings
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Failed to read settings from localStorage', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  },

  // Export / Import Backup
  exportBackup(): string {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      medicines: this.getMedicines(),
      history: this.getHistory(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backupData, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.medicines)) {
        this.saveMedicines(data.medicines);
      }
      if (Array.isArray(data.history)) {
        this.saveHistory(data.history);
      }
      if (data.settings && typeof data.settings === 'object') {
        this.saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup JSON', e);
      return false;
    }
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.MEDICINES);
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.AUDIO_UNLOCKED);
    } catch (e) {
      console.error('Failed to clear localStorage', e);
    }
  }
};
