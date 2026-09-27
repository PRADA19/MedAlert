import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { ReminderModal } from '../reminder/ReminderModal';
import { FullScreenAlarmModal } from '../reminder/FullScreenAlarmModal';
import { AudioUnlockBanner } from '../reminder/AudioUnlockBanner';
import { ToastContainer } from '../ui/ToastContainer';
import { useReminderEngine } from '../../hooks/useReminderEngine';

export const AppLayout: React.FC = () => {
  // Initialize continuous background reminder engine loop
  useReminderEngine();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Audio Unlock Warning Banner */}
        <AudioUnlockBanner />

        {/* Global Header */}
        <Header />

        {/* Page View Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileNavigation />

      {/* Full-Screen Lockscreen Alarm Overlay */}
      <FullScreenAlarmModal />

      {/* Global Reminder Popup Modal */}
      <ReminderModal />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};
