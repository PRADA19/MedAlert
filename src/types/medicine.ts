export type MedicineType =
  | 'tablet'
  | 'capsule'
  | 'syrup'
  | 'injection'
  | 'drops'
  | 'cream'
  | 'other';

export type FrequencyType =
  | 'once_daily'
  | 'twice_daily'
  | 'thrice_daily'
  | 'four_times_daily'
  | 'every_x_hours'
  | 'specific_days'
  | 'custom';

export type DosageUnit = 'Tablet' | 'Capsule' | 'ml' | 'mg' | 'Drops' | 'Pills' | 'Units' | 'Spoons' | 'Application';

export interface Medicine {
  id: string;
  name: string;
  type: MedicineType;
  dosageAmount: number;
  dosageUnit: DosageUnit;
  frequency: FrequencyType;
  times: string[]; // Array of "HH:mm" in 24h format, e.g. ["08:00", "20:00"]
  specificDays?: number[]; // 0 for Sun, 1 for Mon... 6 for Sat
  intervalHours?: number; // if frequency === 'every_x_hours'
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD or null for no end date
  instructions?: string; // e.g. "Take after meals"
  notes?: string;
  // Stock tracking
  enableStockTracking: boolean;
  currentStock: number;
  dailyUsage: number;
  lowStockThreshold: number; // Days remaining or absolute count threshold
  // Status
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineFilterOptions {
  search: string;
  status: 'all' | 'active' | 'paused' | 'low_stock';
  type: MedicineType | 'all';
}
