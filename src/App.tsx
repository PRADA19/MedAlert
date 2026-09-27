import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { MedicinesPage } from './pages/MedicinesPage';
import { AddMedicinePage } from './pages/AddMedicinePage';
import { MedicineDetailsPage } from './pages/MedicineDetailsPage';
import { SchedulePage } from './pages/SchedulePage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="medicines" element={<MedicinesPage />} />
          <Route path="medicines/add" element={<AddMedicinePage />} />
          <Route path="medicines/:id" element={<MedicineDetailsPage />} />
          <Route path="medicines/:id/edit" element={<AddMedicinePage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
