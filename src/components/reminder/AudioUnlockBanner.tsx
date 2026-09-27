import React from 'react';
import { Volume2, ShieldAlert } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { audioService } from '../../services/audioService';

export const AudioUnlockBanner: React.FC = () => {
  const { settings, unlockAudio } = useSettingsStore();

  if (settings.audioUnlocked || !settings.enableSound) {
    return null;
  }

  const handleUnlock = () => {
    const success = audioService.unlock();
    if (success) {
      audioService.testSound('gentle_bell', settings.soundVolume);
      unlockAudio();
    }
  };

  return (
    <div
      onClick={handleUnlock}
      className="cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm font-medium transition-all hover:opacity-95"
    >
      <div className="flex items-center gap-2 max-w-xl mx-auto">
        <Volume2 className="w-4 h-4 animate-bounce shrink-0" />
        <span>
          <strong>Audio Blocked:</strong> Click anywhere on this banner to enable sound alarms & notifications.
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleUnlock();
        }}
        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm shrink-0 ml-2"
      >
        Enable Sound 🔊
      </button>
    </div>
  );
};
