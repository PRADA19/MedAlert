import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Search,
  Check,
} from 'lucide-react';
import { useHistoryStore } from '../store/historyStore';
import { useMedicineStore } from '../store/medicineStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatTimeDisplay, formatDateTimeDisplay } from '../utils/dateUtils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const HistoryPage: React.FC = () => {
  const { history, updateLogStatus, clearHistory, deleteLog } = useHistoryStore();
  const { medicines } = useMedicineStore();
  const { settings } = useSettingsStore();

  const [search, setSearch] = useState('');
  const [selectedMedId, setSelectedMedId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isClearOpen, setIsClearOpen] = useState(false);

  // Filter history logs
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      !search ||
      item.medicineName.toLowerCase().includes(search.toLowerCase()) ||
      item.dosage.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedMedId !== 'all' && item.medicineId !== selectedMedId) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Medication History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Log records of taken, missed, and snoozed medication doses.
          </p>
        </div>

        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsClearOpen(true)}
            className="text-rose-600 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/60"
          >
            <Trash2 className="w-4 h-4" /> Clear Logs
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by medicine..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />

        <select
          value={selectedMedId}
          onChange={(e) => setSelectedMedId(e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="all">All Medicines</option>
          {medicines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="taken">Taken</option>
          <option value="missed">Missed</option>
          <option value="skipped">Skipped</option>
          <option value="snoozed">Snoozed</option>
        </select>
      </div>

      {/* Log List */}
      {filteredHistory.length === 0 ? (
        <EmptyState
          title="No History Logs Found"
          description="No records match your search filters or no medication actions have been recorded yet."
        />
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <Card
              key={item.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                    item.status === 'taken'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
                      : item.status === 'missed'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
                  }`}
                >
                  {item.status === 'taken' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {item.medicineName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.dosage} • Scheduled:{' '}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {formatTimeDisplay(item.scheduledTime, settings.timeFormat === '12h')}
                    </strong>{' '}
                    on {item.scheduledDate}
                  </p>
                  {item.takenAt && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      ✓ Recorded taken at {formatDateTimeDisplay(item.takenAt, settings.timeFormat === '12h')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <Badge
                  variant={
                    item.status === 'taken'
                      ? 'success'
                      : item.status === 'missed'
                      ? 'danger'
                      : 'warning'
                  }
                  className="px-3 py-1 text-xs"
                >
                  {item.status.toUpperCase()}
                </Badge>

                {item.status === 'missed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateLogStatus(item.id, 'taken')}
                    className="text-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark Taken Later
                  </Button>
                )}

                <button
                  onClick={() => deleteLog(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={isClearOpen}
        onClose={() => setIsClearOpen(false)}
        onConfirm={() => {
          clearHistory();
          setIsClearOpen(false);
        }}
        title="Clear History Logs?"
        message="Are you sure you want to clear all medication history logs? This will reset adherence analytics data."
        confirmText="Clear All"
        variant="danger"
      />
    </div>
  );
};
