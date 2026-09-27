import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sun, Moon, Bell, Volume2, ShieldCheck } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { notificationService } from '../../services/notificationService';
import { getTimeGreeting } from '../../utils/dateUtils';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { settings, setTheme } = useSettingsStore();

  const [isNotificationGranted, setIsNotificationGranted] = React.useState(false);

  React.useEffect(() => {
    notificationService.getPermission().then((perm) => {
      setIsNotificationGranted(perm === 'granted');
    });
  }, []);

  const handleToggleTheme = () => {
    setTheme(settings.theme === 'dark' ? 'light' : 'dark');
  };

  const handleRequestNotifications = async () => {
    const perm = await notificationService.requestPermission();
    if (perm === 'granted') {
      setIsNotificationGranted(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>{getTimeGreeting()}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
          Stay consistent with your medication.
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Status / Request */}
        {!isNotificationGranted && notificationService.isSupported() && (
          <button
            onClick={handleRequestNotifications}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-semibold hover:bg-brand-100 transition-colors"
            title="Enable Browser Push Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Enable Push</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={handleToggleTheme}
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
          title="Toggle Light / Dark Theme"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Quick Add Medicine Button */}
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/medicines/add')}
          className="shadow-md shadow-brand-600/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">Add Medicine</span>
        </Button>
      </div>
    </header>
  );
};
