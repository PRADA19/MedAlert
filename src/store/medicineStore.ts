import { create } from 'zustand';
import { Medicine, MedicineFilterOptions } from '../types/medicine';
import { storageService } from '../services/storageService';
import { INITIAL_DEMO_MEDICINES } from '../utils/demoData';

interface MedicineState {
  medicines: Medicine[];
  filters: MedicineFilterOptions;
  
  // Actions
  addMedicine: (med: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => Medicine;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  toggleMedicineActive: (id: string) => void;
  deductStock: (id: string, amount?: number) => void;
  refillStock: (id: string, newStockAmount: number) => void;
  setFilters: (filters: Partial<MedicineFilterOptions>) => void;
  resetFilters: () => void;
  loadDemoData: () => void;
  clearAllMedicines: () => void;
}

const DEFAULT_FILTERS: MedicineFilterOptions = {
  search: '',
  status: 'all',
  type: 'all',
};

export const useMedicineStore = create<MedicineState>((set, get) => ({
  medicines: storageService.getMedicines(),
  filters: DEFAULT_FILTERS,

  addMedicine: (medData) => {
    const newMed: Medicine = {
      ...medData,
      id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newMed, ...get().medicines];
    set({ medicines: updated });
    storageService.saveMedicines(updated);
    return newMed;
  },

  updateMedicine: (id, updates) => {
    const updated = get().medicines.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return m;
    });

    set({ medicines: updated });
    storageService.saveMedicines(updated);
  },

  deleteMedicine: (id) => {
    const updated = get().medicines.filter((m) => m.id !== id);
    set({ medicines: updated });
    storageService.saveMedicines(updated);
  },

  toggleMedicineActive: (id) => {
    const med = get().medicines.find((m) => m.id === id);
    if (med) {
      get().updateMedicine(id, { active: !med.active });
    }
  },

  deductStock: (id, amount = 1) => {
    const med = get().medicines.find((m) => m.id === id);
    if (med && med.enableStockTracking) {
      const newStock = Math.max(0, med.currentStock - (amount || med.dosageAmount || 1));
      get().updateMedicine(id, { currentStock: newStock });
    }
  },

  refillStock: (id, newStockAmount) => {
    const med = get().medicines.find((m) => m.id === id);
    if (med) {
      get().updateMedicine(id, { currentStock: Math.max(0, newStockAmount) });
    }
  },

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS });
  },

  loadDemoData: () => {
    set({ medicines: INITIAL_DEMO_MEDICINES });
    storageService.saveMedicines(INITIAL_DEMO_MEDICINES);
  },

  clearAllMedicines: () => {
    set({ medicines: [] });
    storageService.saveMedicines([]);
  },
}));
