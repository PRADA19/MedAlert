import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Volume2,
  Play,
  Moon,
  Sun,
  Shield,
  Download,
  Upload,
  Trash2,
  TestTube,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { useReminderStore } from '../store/reminderStore';
import { useMedicineStore } from '../store/medicineStore';
import { useHistoryStore } from '../store/historyStore';
import { useToastStore } from '../store/toastStore';
import { audioService } from '../services/audioService';
import { notificationService } from '../services/notificationService';
import { storageService } from '../services/storageService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, setTheme, setSoundPreset, setVolume, unlockAudio } = useSettingsStore();
  const { triggerTestReminder, triggerTestReminderInSeconds } = useReminderStore();
  const { loadDemoData, clearAllMedicines } = useMedicineStore();
  const { loadDemoHistory, clearHistory } = useHistoryStore();
  const { showToast } = useToastStore();

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isNotificationGranted, setIsNotificationGranted] = useState(false);

  React.useEffect(() => {
    notificationService.getPermission().then((perm) => {
      setIsNotificationGranted(perm === 'granted');
    });
  }, []);

  const handleTestSound = () => {
    unlockAudio();
    audioService.testSound(settings.reminderSound, settings.soundVolume);
    showToast('🔊 Sound Test', `Playing ${settings.reminderSound.replace('_', ' ')}`, 'info');
  };

  const handleRequestNotifications = async () => {
    const perm = await notificationService.requestPermission();
    if (perm === 'granted') {
      setIsNotificationGranted(true);
      updateSettings({ enableNotifications: true });
      showToast('✓ Notifications Granted', 'You will receive desktop & mobile medicine alerts.', 'success');
    } else {
      showToast('Notifications Denied', 'Permission was denied.', 'warning');
    }
  };

  const handleExportData = () => {
    const jsonStr = storageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medialert-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Export Complete', 'Backup file downloaded.', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importBackup(content);
      if (success) {
        showToast('✓ Import Successful', 'Data restored. Reloading app...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast('Import Failed', 'Invalid JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetConfirm = () => {
    storageService.clearAllData();
    clearAllMedicines();
    clearHistory();
    setIsResetOpen(false);
    showToast('App Data Reset', 'All settings and records have been cleared.', 'info');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <span>Application Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configure alarm audio, notifications, theme preferences, and developer tools.
        </p>
      </div>

      {/* Developer Test Section */}
      <Card className="p-6 bg-gradient-to-br from-brand-900 to-slate-900 text-white space-y-4 shadow-xl border-brand-500/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TestTube className="w-6 h-6 text-brand-400" />
            <h3 className="text-lg font-bold">Developer / Test Reminder Tools</h3>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-500/30 text-brand-300 border border-brand-400/30">
            Dev Mode
          </span>
        </div>
        <p className="text-xs text-brand-100/90 leading-relaxed">
          Test the complete reminder pipeline immediately without waiting for scheduled clock times. Triggering will start sound playback, show browser push notification, and launch the stacked popup modal.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              unlockAudio();
              triggerTestReminder();
            }}
            className="bg-brand-500 hover:bg-brand-400 text-white font-bold border-none shadow-lg"
          >
            ⚡ Trigger Test Reminder Now
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => {
              unlockAudio();
              triggerTestReminderInSeconds(10);
            }}
            className="border-white/30 text-white hover:bg-white/10"
          >
            ⏳ Test Reminder in 10 Seconds
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              loadDemoData();
              loadDemoHistory();
              showToast('✓ Demo Data Loaded', 'Sample medicines and history added.', 'success');
            }}
            className="text-brand-300 hover:text-white hover:bg-white/10"
          >
            <Sparkles className="w-4 h-4" /> Load Demo Data
          </Button>
        </div>
      </Card>

      {/* 1. Alarm Sound & Audio Settings */}
      <Card className="p-6 space-y-5">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <Volume2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          1. Alarm Sound & Audio Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Enable Sound Alarms</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Play audio ring when medicine is due.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableSound}
              onChange={(e) => updateSettings({ enableSound: e.target.checked })}
              className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
          </div>

          {settings.enableSound && (
            <>
              {/* Preset Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Alarm Preset Sound
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <select
                    value={settings.reminderSound}
                    onChange={(e) => setSoundPreset(e.target.value as any)}
                    className="flex-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                  >
                    <option value="gentle_bell">Gentle Bell (Harmonic Chimes)</option>
                    <option value="classic_alarm">Classic Alarm (Dual Beep)</option>
                    <option value="soft_chime">Soft Chime (Melodic Sequence)</option>
                  </select>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleTestSound}
                    className="w-full sm:w-auto shrink-0 gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" /> Test Sound
                  </Button>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span>Volume Level</span>
                  <span>{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>
            </>
          )}

          {/* Snooze & Missed Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Default Snooze Duration
              </label>
              <select
                value={settings.snoozeDurationMinutes}
                onChange={(e) => updateSettings({ snoozeDurationMinutes: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Auto-Mark Missed Threshold
              </label>
              <select
                value={settings.missedThresholdMinutes}
                onChange={(e) => updateSettings({ missedThresholdMinutes: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value={15}>15 Minutes after schedule</option>
                <option value={30}>30 Minutes after schedule</option>
                <option value={45}>45 Minutes after schedule</option>
                <option value={60}>60 Minutes after schedule</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Notifications & Permissions */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <Bell className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          2. Browser Notifications
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Status:</span>
              <span className={isNotificationGranted ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 font-bold'}>
                {isNotificationGranted ? '✓ Permission Granted' : 'Permission Required'}
              </span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Allows MediAlert to pop up system desktop notifications when tab is open.
            </p>
          </div>

          {!isNotificationGranted && (
            <Button variant="primary" size="sm" onClick={handleRequestNotifications}>
              Enable Notifications
            </Button>
          )}
        </div>
      </Card>

      {/* Caregiver Emergency Notification Settings */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          Caregiver / Family Alerts
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Enable Caregiver Alerts</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Notify family member if medicine dose is missed for over 30 minutes.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableCaregiverAlert}
              onChange={(e) => updateSettings({ enableCaregiverAlert: e.target.checked })}
              className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
          </div>

          {settings.enableCaregiverAlert && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Caregiver Name</label>
                <input
                  type="text"
                  value={settings.caregiverName}
                  onChange={(e) => updateSettings({ caregiverName: e.target.value })}
                  placeholder="e.g. John Doe (Son / Doctor)"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Caregiver Phone / SMS</label>
                <input
                  type="tel"
                  value={settings.caregiverPhone}
                  onChange={(e) => updateSettings({ caregiverPhone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 3. Appearance & Formatting */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <Sun className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          3. Appearance & Format
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Theme Mode
            </label>
            <div className="flex items-center gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                    settings.theme === t
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Time Format
            </label>
            <div className="flex items-center gap-2">
              {(['12h', '24h'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => updateSettings({ timeFormat: fmt })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase border transition-all ${
                    settings.timeFormat === fmt
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {fmt === '12h' ? '12-Hour (8:00 PM)' : '24-Hour (20:00)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active UI/UX Color Palette Card */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Active UI/UX Color Palette (Custom Theme)
          </label>
          <div className="grid grid-cols-5 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="space-y-1 text-center">
              <div className="h-10 rounded-xl bg-[#C8E6E2] shadow-sm border border-slate-300/40" />
              <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">#C8E6E2</span>
            </div>
            <div className="space-y-1 text-center">
              <div className="h-10 rounded-xl bg-[#9ED5D1] shadow-sm border border-slate-300/40" />
              <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">#9ED5D1</span>
            </div>
            <div className="space-y-1 text-center">
              <div className="h-10 rounded-xl bg-[#63C1BB] shadow-sm border border-slate-300/40" />
              <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">#63C1BB</span>
            </div>
            <div className="space-y-1 text-center">
              <div className="h-10 rounded-xl bg-[#3A9295] shadow-sm border border-slate-300/40" />
              <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">#3A9295</span>
            </div>
            <div className="space-y-1 text-center">
              <div className="h-10 rounded-xl bg-[#105F68] shadow-sm border border-slate-300/40" />
              <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">#105F68</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Data Backup & Reset */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <Download className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          4. Data Management & Backup
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="md" onClick={handleExportData}>
            <Download className="w-4 h-4" /> Export Backup JSON
          </Button>

          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Upload className="w-4 h-4" /> Import Backup JSON
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <Button variant="danger" size="md" onClick={() => setIsResetOpen(true)} className="ml-auto">
            <Trash2 className="w-4 h-4" /> Clear All Data
          </Button>
        </div>
      </Card>

      {/* Medical Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 text-center space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5 text-brand-600" /> Medical Disclaimer
        </p>
        <p>
          MediAlert is a reminder and tracking tool. It does not provide medical advice or diagnosis. Always follow instructions from your doctor or pharmacist.
        </p>
      </div>

      <ConfirmDialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={handleResetConfirm}
        title="Reset All Application Data?"
        message="This will erase all medicines, schedules, history logs, and custom settings. This action cannot be undone."
        confirmText="Reset Everything"
        variant="danger"
      />
    </div>
  );
};
