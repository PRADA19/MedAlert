export type ThemeMode = 'light' | 'dark' | 'system';
export type SoundPreset = 'gentle_bell' | 'classic_alarm' | 'soft_chime';

export interface UserSettings {
  theme: ThemeMode;
  enableReminders: boolean;
  enableSound: boolean;
  soundVolume: number; // 0 to 1
  reminderSound: SoundPreset;
  enableContinuousAlarmLoop: boolean; // Loop endlessly until user turns off
  snoozeDurationMinutes: number; // 5, 10, 15, 30
  missedThresholdMinutes: number; // 15, 30, 45, 60
  enableNotifications: boolean;
  timeFormat: '12h' | '24h';
  startOfWeek: 'monday' | 'sunday';
  audioUnlocked: boolean;
  
  // Caregiver Notification Settings
  enableCaregiverAlert: boolean;
  caregiverName: string;
  caregiverPhone: string;
  caregiverEmail: string;
}
