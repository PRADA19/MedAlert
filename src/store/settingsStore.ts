import { create } from 'zustand';
import { UserSettings, ThemeMode, SoundPreset } from '../types/settings';
import { storageService, DEFAULT_SETTINGS } from '../services/storageService';

interface SettingsState {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  setTheme: (theme: ThemeMode) => void;
  setSoundPreset: (preset: SoundPreset) => void;
  setVolume: (vol: number) => void;
  unlockAudio: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const initialSettings = storageService.getSettings();

  // Apply dark mode class to html document element on init
  const applyTheme = (theme: ThemeMode) => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  applyTheme(initialSettings.theme);

  return {
    settings: initialSettings,

    updateSettings: (partial) => {
      const updated = { ...get().settings, ...partial };
      set({ settings: updated });
      storageService.saveSettings(updated);

      if (partial.theme) {
        applyTheme(partial.theme);
      }
    },

    setTheme: (theme) => {
      get().updateSettings({ theme });
    },

    setSoundPreset: (reminderSound) => {
      get().updateSettings({ reminderSound });
    },

    setVolume: (soundVolume) => {
      get().updateSettings({ soundVolume });
    },

    unlockAudio: () => {
      get().updateSettings({ audioUnlocked: true });
    },
  };
});
