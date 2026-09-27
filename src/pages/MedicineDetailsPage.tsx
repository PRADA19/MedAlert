import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Pill,
  Clock,
  Calendar,
  Package,
  Edit2,
  Trash2,
  ArrowLeft,
  Power,
  CheckCircle2,
  AlertTriangle,
  History as HistoryIcon,
} from 'lucide-react';
import { useMedicineStore } from '../store/medicineStore';
import { useHistoryStore } from '../store/historyStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatTimeDisplay, formatDateDisplay, formatDateTimeDisplay } from '../utils/dateUtils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const MedicineDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { medicines, deleteMedicine, toggleMedicineActive, refillStock } = useMedicineStore();
  const { history } = useHistoryStore();
  const { settings } = useSettingsStore();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [refillInput, setRefillInput] = useState('30');

  const medicine = medicines.find((m) => m.id === id);

  if (!medicine) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Medicine Not Found</h2>
        <Button variant="primary" onClick={() => navigate('/medicines')}>
          Back to Medicines
        </Button>
      </div>
    );
  }

  // Calculate remaining days based on daily usage
  const daysRemaining =
    medicine.enableStockTracking && medicine.dailyUsage > 0
      ? Math.floor(medicine.currentStock / medicine.dailyUsage)
      : null;

  // Filter history for this specific medicine
  const medicineHistory = history.filter((h) => h.medicineId === medicine.id);

  const handleDelete = () => {
    deleteMedicine(medicine.id);
    navigate('/medicines');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/medicines')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Medicines
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleMedicineActive(medicine.id)}
          >
            <Power className="w-4 h-4" />
            {medicine.active ? 'Pause Schedule' : 'Activate Schedule'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/medicines/${medicine.id}/edit`)}
          >
            <Edit2 className="w-4 h-4" /> Edit
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Main Details Hero Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-brand-100 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold shrink-0 shadow-md">
              <Pill className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {medicine.name}
                </h1>
                <Badge variant={medicine.active ? 'success' : 'neutral'}>
                  {medicine.active ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mt-1">
                {medicine.dosageAmount} {medicine.dosageUnit} • <span className="capitalize">{medicine.type}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Schedule Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" /> Schedule Details
            </h3>

            <div className="space-y-2 text-sm bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex justify-between py-1 border-b border-slate-200/40 dark:border-slate-700/40">
                <span className="text-slate-500 dark:text-slate-400">Frequency:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {medicine.frequency.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/40 dark:border-slate-700/40">
                <span className="text-slate-500 dark:text-slate-400">Reminder Times:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {medicine.times.map((t) => formatTimeDisplay(t, settings.timeFormat === '12h')).join(', ')}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Active Duration:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDateDisplay(medicine.startDate)} → {medicine.endDate ? formatDateDisplay(medicine.endDate) : 'Ongoing'}
                </span>
              </div>
            </div>
          </div>

          {/* Stock Tracking */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" /> Stock Level & Refill
            </h3>

            {medicine.enableStockTracking ? (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Current Remaining:</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {medicine.currentStock} {medicine.dosageUnit}s
                  </span>
                </div>

                {daysRemaining !== null && (
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    Estimated ~{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} of supply remaining.
                  </p>
                )}

                {medicine.currentStock <= medicine.lowStockThreshold && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                    Low stock threshold reached! Please order refill.
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl">
                Stock tracking is disabled for this medicine.
              </p>
            )}
          </div>
        </div>

        {/* Guidance Instructions & Notes */}
        {(medicine.instructions || medicine.notes) && (
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
            {medicine.instructions && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-sm">
                <strong>Instructions:</strong> {medicine.instructions}
              </div>
            )}
            {medicine.notes && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-sm">
                <strong>Notes:</strong> {medicine.notes}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* History Log for this Medicine */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          Recent Intake History
        </h2>

        {medicineHistory.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 p-6 bg-white dark:bg-slate-800 rounded-2xl text-center border border-slate-200 dark:border-slate-700">
            No history logs recorded for this medicine yet.
          </p>
        ) : (
          <div className="space-y-2">
            {medicineHistory.slice(0, 10).map((h) => (
              <Card key={h.id} className="p-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  {h.status === 'taken' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Scheduled {formatTimeDisplay(h.scheduledTime, settings.timeFormat === '12h')} on {h.scheduledDate}
                    </p>
                    {h.takenAt && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Taken at {formatDateTimeDisplay(h.takenAt, settings.timeFormat === '12h')}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={h.status === 'taken' ? 'success' : 'danger'}>
                  {h.status.toUpperCase()}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Medicine?"
        message={`Are you sure you want to delete ${medicine.name}? All history logs for this medicine will remain intact.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
