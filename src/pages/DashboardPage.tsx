import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Flame,
  Package,
  ArrowRight,
} from 'lucide-react';
import { useMedicineStore } from '../store/medicineStore';
import { useHistoryStore } from '../store/historyStore';
import { useReminderStore } from '../store/reminderStore';
import { useSettingsStore } from '../store/settingsStore';
import {
  getTodayDateString,
  getCurrentTimeString,
  formatTimeDisplay,
  isDateInActiveRange,
  getMinutesPastScheduled,
} from '../utils/dateUtils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { medicines, loadDemoData } = useMedicineStore();
  const { history } = useHistoryStore();
  const { markAsTaken, snoozeReminders } = useReminderStore();
  const { settings } = useSettingsStore();

  const todayStr = getTodayDateString();
  const currentTimeStr = getCurrentTimeString();

  // 1. Calculate Today's Scheduled Medicines
  const todayScheduleItems: Array<{
    medicine: (typeof medicines)[0];
    scheduledTime: string;
    status: 'taken' | 'pending' | 'missed' | 'snoozed';
    log?: (typeof history)[0];
    minutesPast: number;
  }> = [];

  medicines.forEach((med) => {
    if (!med.active) return;
    if (!isDateInActiveRange(med.startDate, med.endDate)) return;

    med.times.forEach((timeStr) => {
      const log = history.find(
        (h) =>
          h.medicineId === med.id &&
          h.scheduledDate === todayStr &&
          h.scheduledTime === timeStr
      );

      const minutesPast = getMinutesPastScheduled(timeStr);
      let status: 'taken' | 'pending' | 'missed' | 'snoozed' = 'pending';

      if (log?.status === 'taken') {
        status = 'taken';
      } else if (log?.status === 'missed' || (minutesPast >= settings.missedThresholdMinutes && !log)) {
        status = 'missed';
      }

      todayScheduleItems.push({
        medicine: med,
        scheduledTime: timeStr,
        status,
        log,
        minutesPast,
      });
    });
  });

  // Sort by scheduled time ascending
  todayScheduleItems.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const totalCount = todayScheduleItems.length;
  const takenCount = todayScheduleItems.filter((i) => i.status === 'taken').length;
  const missedCount = todayScheduleItems.filter((i) => i.status === 'missed').length;
  const pendingCount = todayScheduleItems.filter((i) => i.status === 'pending').length;

  // Adherence Percentage
  const adherenceRate = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  // Low stock medicines
  const lowStockMedicines = medicines.filter(
    (m) => m.active && m.enableStockTracking && m.currentStock <= m.lowStockThreshold
  );

  // If no medicines exist, show polished Welcome / Onboarding experience
  if (medicines.length === 0) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto py-6">
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to MediAlert 💊
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Never miss your medicine again.
            </h1>
            <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
              Simple scheduling, real-time alarms, smart notifications, stock tracking, and adherence analytics — all in one privacy-focused app.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/medicines/add')}
                className="bg-white text-brand-700 hover:bg-brand-50 font-bold border-none shadow-lg"
              >
                <Plus className="w-5 h-5 stroke-[3]" /> Add Your First Medicine
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={loadDemoData}
                className="border-white/40 text-white hover:bg-white/10"
              >
                ⚡ Load Demo Data
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Smart Scheduling</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set custom daily or interval reminders with exact dosage units and start/end dates.
            </p>
          </Card>
          <Card className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Stock Tracking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automatically track remaining pill counts and receive warnings before you run out.
            </p>
          </Card>
          <Card className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Health Analytics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monitor weekly adherence rates, view charts, and maintain streak badges for consistency.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900 flex items-center justify-center shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Medicines Today
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalCount}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Taken
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{takenCount}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending
            </p>
            <h3 className="text-2xl font-black text-sky-600 dark:text-sky-400">{pendingCount}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Missed
            </p>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{missedCount}</h3>
          </div>
        </Card>
      </div>

      {/* Low Stock Warning Section */}
      {lowStockMedicines.length > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  ⚠️ Low Stock Warning ({lowStockMedicines.length} Medicine{lowStockMedicines.length > 1 ? 's' : ''})
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {lowStockMedicines.map((m) => `${m.name} (${m.currentStock} left)`).join(', ')}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/medicines')}
              className="border-amber-500/40 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 shrink-0"
            >
              Manage Stock <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* Today's Schedule Timeline Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Today's Medicines Timeline</span>
              <Badge variant="brand">{totalCount} Total</Badge>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live schedule for {todayStr}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/schedule')}
            className="text-brand-600 dark:text-brand-400"
          >
            Full Schedule <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {todayScheduleItems.length === 0 ? (
          <EmptyState
            title="No Medicines Scheduled Today"
            description="You have no active medicines scheduled for today. Take a break or add a new schedule!"
            actionLabel="+ Add Medicine"
            onAction={() => navigate('/medicines/add')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayScheduleItems.map((item, index) => {
              const { medicine, scheduledTime, status } = item;
              const formattedTime = formatTimeDisplay(scheduledTime, settings.timeFormat === '12h');

              return (
                <Card
                  key={`${medicine.id}_${scheduledTime}_${index}`}
                  className="p-5 flex flex-col justify-between space-y-4 border-l-4 transition-all hover:shadow-md"
                  style={{
                    borderLeftColor:
                      status === 'taken'
                        ? '#10b981'
                        : status === 'missed'
                        ? '#f43f5e'
                        : '#3A9295',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0 font-bold">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {medicine.name}
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {medicine.dosageAmount} {medicine.dosageUnit} • <span className="capitalize">{medicine.type}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                      {formattedTime}
                    </span>
                  </div>

                  {medicine.instructions && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                      ℹ️ {medicine.instructions}
                    </p>
                  )}

                  {/* Status & Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    {status === 'taken' ? (
                      <Badge variant="success" className="px-3 py-1 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ✓ Taken
                      </Badge>
                    ) : status === 'missed' ? (
                      <Badge variant="danger" className="px-3 py-1 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5" /> ⚠ Missed
                      </Badge>
                    ) : (
                      <Badge variant="info" className="px-3 py-1 text-xs">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </Badge>
                    )}

                    {status !== 'taken' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => snoozeReminders([medicine.id], settings.snoozeDurationMinutes)}
                        >
                          Snooze
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => markAsTaken([medicine.id])}
                        >
                          Take Now
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
