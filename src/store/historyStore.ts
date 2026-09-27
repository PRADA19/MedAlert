import { create } from 'zustand';
import { ReminderLog, ReminderStatus } from '../types/reminder';
import { storageService } from '../services/storageService';
import { INITIAL_DEMO_HISTORY } from '../utils/demoData';

interface HistoryState {
  history: ReminderLog[];
  
  // Actions
  addLog: (log: Omit<ReminderLog, 'id' | 'createdAt'>) => ReminderLog;
  updateLogStatus: (id: string, newStatus: ReminderStatus, takenAtISO?: string) => void;
  deleteLog: (id: string) => void;
  loadDemoHistory: () => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: storageService.getHistory(),

  addLog: (logData) => {
    const newLog: ReminderLog = {
      ...logData,
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newLog, ...get().history];
    set({ history: updated });
    storageService.saveHistory(updated);
    return newLog;
  },

  updateLogStatus: (id, newStatus, takenAtISO) => {
    const updated = get().history.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          takenAt: newStatus === 'taken' ? (takenAtISO || new Date().toISOString()) : item.takenAt,
        };
      }
      return item;
    });

    set({ history: updated });
    storageService.saveHistory(updated);
  },

  deleteLog: (id) => {
    const updated = get().history.filter((h) => h.id !== id);
    set({ history: updated });
    storageService.saveHistory(updated);
  },

  loadDemoHistory: () => {
    set({ history: INITIAL_DEMO_HISTORY });
    storageService.saveHistory(INITIAL_DEMO_HISTORY);
  },

  clearHistory: () => {
    set({ history: [] });
    storageService.saveHistory([]);
  },
}));
