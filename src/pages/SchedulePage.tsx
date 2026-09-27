import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Pill,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from 'date-fns';
import { useMedicineStore } from '../store/medicineStore';
import { useHistoryStore } from '../store/historyStore';
import { useReminderStore } from '../store/reminderStore';
import { useSettingsStore } from '../store/settingsStore';
import {
  formatTimeDisplay,
  formatDateDisplay,
  isDateInActiveRange,
  getTodayDateString,
  getMinutesPastScheduled,
} from '../utils/dateUtils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const SchedulePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'today' | 'week'>('today');

  const { medicines } = useMedicineStore();
  const { history } = useHistoryStore();
  const { markAsTaken, snoozeReminders } = useReminderStore();
  const { settings } = useSettingsStore();

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isTodaySelected = isSameDay(selectedDate, new Date());

  // Generate Week Days for week view
  const weekStart = startOfWeek(selectedDate, {
    weekStartsOn: settings.startOfWeek === 'monday' ? 1 : 0,
  });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });

  // Calculate items for the selectedDate
  const scheduleForDate: Array<{
    medicine: (typeof medicines)[0];
    scheduledTime: string;
    status: 'taken' | 'pending' | 'missed' | 'skipped';
    log?: (typeof history)[0];
  }> = [];

  medicines.forEach((med) => {
    if (!med.active) return;
    if (!isDateInActiveRange(med.startDate, med.endDate, selectedDate)) return;

    med.times.forEach((timeStr) => {
      const log = history.find(
        (h) =>
          h.medicineId === med.id &&
          h.scheduledDate === selectedDateStr &&
          h.scheduledTime === timeStr
      );

      let status: 'taken' | 'pending' | 'missed' | 'skipped' = 'pending';

      if (log?.status === 'taken') {
        status = 'taken';
      } else if (log?.status === 'skipped') {
        status = 'skipped';
      } else if (log?.status === 'missed') {
        status = 'missed';
      } else if (isTodaySelected) {
        const minsPast = getMinutesPastScheduled(timeStr);
        if (minsPast >= settings.missedThresholdMinutes) {
          status = 'missed';
        }
      }

      scheduleForDate.push({
        medicine: med,
        scheduledTime: timeStr,
        status,
        log,
      });
    });
  });

  // Sort timeline by time
  scheduleForDate.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Medication Schedule</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Interactive daily and weekly schedule timeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>

          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'today'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Day View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Week View
            </button>
          </div>
        </div>
      </div>

      {/* Date Switcher Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-1.5 w-full sm:w-auto">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-md'
                      : isToday
                      ? 'bg-brand-50 text-brand-700 border border-brand-300 dark:bg-brand-950 dark:text-brand-300'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold opacity-80">
                    {format(day, 'EEE')}
                  </span>
                  <span className="text-sm font-black">{format(day, 'd')}</span>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Daily Schedule Timeline List */}
      <div className="space-y-4">
        {scheduleForDate.length === 0 ? (
          <Card className="p-8 text-center space-y-2">
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Medicines Scheduled for {format(selectedDate, 'MMM d')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All clear! Enjoy your day.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {scheduleForDate.map((item, idx) => {
              const { medicine, scheduledTime, status } = item;
              const formattedTime = formatTimeDisplay(scheduledTime, settings.timeFormat === '12h');

              return (
                <Card
                  key={`${medicine.id}_${scheduledTime}_${idx}`}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 transition-all"
                  style={{
                    borderLeftColor:
                      status === 'taken'
                        ? '#10b981'
                        : status === 'missed'
                        ? '#f43f5e'
                        : '#0d9488',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold shrink-0 shadow-sm">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-brand-600 dark:text-brand-400 px-2.5 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800">
                          {formattedTime}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {medicine.name}
                        </h4>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                        Dosage: {medicine.dosageAmount} {medicine.dosageUnit} • {medicine.instructions || 'Follow prescription'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <Badge
                      variant={
                        status === 'taken'
                          ? 'success'
                          : status === 'missed'
                          ? 'danger'
                          : 'info'
                      }
                      className="px-3 py-1 text-xs"
                    >
                      {status === 'taken' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Taken
                        </>
                      ) : status === 'missed' ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" /> Missed
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </>
                      )}
                    </Badge>

                    {isTodaySelected && status !== 'taken' && (
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
                          Take
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
