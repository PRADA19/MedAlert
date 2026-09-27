export type ReminderStatus = 'pending' | 'taken' | 'missed' | 'snoozed' | 'skipped';

export interface ReminderLog {
  id: string;
  medicineId: string;
  medicineName: string;
  medicineType: string;
  dosage: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: ReminderStatus;
  takenAt?: string | null; // ISO string when taken
  snoozedUntil?: string | null; // ISO string when snoozed until
  notes?: string;
  createdAt: string;
}

export interface ActiveDueItem {
  medicineId: string;
  scheduledTime: string;
  scheduledDate: string;
  dueAtISO: string;
}
