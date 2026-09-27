import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Power,
  Package,
  Calendar,
  Clock,
} from 'lucide-react';
import { useMedicineStore } from '../store/medicineStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatTimeDisplay, formatDateDisplay } from '../utils/dateUtils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const MedicinesPage: React.FC = () => {
  const navigate = useNavigate();
  const { medicines, filters, setFilters, deleteMedicine, toggleMedicineActive, refillStock } = useMedicineStore();
  const { settings } = useSettingsStore();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [refillTarget, setRefillTarget] = useState<{ id: string; name: string; current: number } | null>(null);
  const [refillAmountInput, setRefillAmountInput] = useState<string>('30');

  // Filter medicines based on search and selected filter status
  const filteredMedicines = medicines.filter((med) => {
    // Search
    const searchMatch =
      !filters.search ||
      med.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      med.type.toLowerCase().includes(filters.search.toLowerCase()) ||
      (med.instructions && med.instructions.toLowerCase().includes(filters.search.toLowerCase()));

    if (!searchMatch) return false;

    // Status filter
    if (filters.status === 'active') return med.active;
    if (filters.status === 'paused') return !med.active;
    if (filters.status === 'low_stock') {
      return med.active && med.enableStockTracking && med.currentStock <= med.lowStockThreshold;
    }

    return true;
  });

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteMedicine(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const handleRefillConfirm = () => {
    if (refillTarget) {
      const amount = parseInt(refillAmountInput, 10);
      if (!isNaN(amount) && amount > 0) {
        refillStock(refillTarget.id, refillTarget.current + amount);
      }
      setRefillTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>My Medications</span>
            <Badge variant="brand">{medicines.length}</Badge>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your daily prescriptions, dosages, schedules, and stock levels.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/medicines/add')}
          className="shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Medicine
        </Button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Search medicine by name, type, or instructions..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'paused', label: 'Paused' },
            { key: 'low_stock', label: '⚠️ Low Stock' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilters({ status: tab.key as any })}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filters.status === tab.key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Medicine Grid */}
      {filteredMedicines.length === 0 ? (
        <EmptyState
          title="No Medicines Found"
          description={
            filters.search || filters.status !== 'all'
              ? 'No medicines match your current search or filter criteria. Try resetting filters.'
              : 'You haven\'t added any medicines yet. Click below to create your first medicine schedule!'
          }
          actionLabel="+ Add Medicine"
          onAction={() => navigate('/medicines/add')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedicines.map((med) => {
            const isLowStock =
              med.enableStockTracking && med.currentStock <= med.lowStockThreshold;

            return (
              <Card
                key={med.id}
                hoverEffect
                className={`p-5 flex flex-col justify-between space-y-4 relative ${
                  !med.active ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/50' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold shrink-0 shadow-sm">
                        <Pill className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {med.name}
                        </h3>
                        <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                          {med.dosageAmount} {med.dosageUnit} • <span className="capitalize">{med.type}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleMedicineActive(med.id)}
                      className={`p-1.5 rounded-xl border transition-colors ${
                        med.active
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700'
                      }`}
                      title={med.active ? 'Pause Medicine' : 'Activate Medicine'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scheduled Times */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      <span>
                        Reminders ({med.times.length}):{' '}
                        {med.times
                          .map((t) => formatTimeDisplay(t, settings.timeFormat === '12h'))
                          .join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        From {formatDateDisplay(med.startDate)}{' '}
                        {med.endDate ? `to ${formatDateDisplay(med.endDate)}` : '(Ongoing)'}
                      </span>
                    </div>
                  </div>

                  {/* Stock Tracking */}
                  {med.enableStockTracking && (
                    <div
                      className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                        isLowStock
                          ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300'
                          : 'bg-slate-50 border-slate-200/60 text-slate-600 dark:bg-slate-800/60 dark:border-slate-700/60 dark:text-slate-400'
                      }`}
                    >
                      <span className="flex items-center gap-1 font-medium">
                        {isLowStock && <Package className="w-4 h-4 text-rose-500 shrink-0" />}
                        {med.currentStock} {med.dosageUnit}s remaining
                      </span>
                      <button
                        onClick={() =>
                          setRefillTarget({ id: med.id, name: med.name, current: med.currentStock })
                        }
                        className="font-bold underline text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        + Refill
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Action Menu */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <Badge variant={med.active ? 'success' : 'neutral'}>
                    {med.active ? 'Active' : 'Paused'}
                  </Badge>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/medicines/${med.id}`)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/medicines/${med.id}/edit`)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Edit Medicine"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(med.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                      title="Delete Medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Medicine?"
        message="Are you sure you want to delete this medicine? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      {/* Refill Dialog Modal */}
      {refillTarget && (
        <ConfirmDialog
          isOpen={Boolean(refillTarget)}
          onClose={() => setRefillTarget(null)}
          onConfirm={handleRefillConfirm}
          title={`Refill ${refillTarget.name}`}
          message={`Current stock: ${refillTarget.current}. Enter quantity to add:`}
          confirmText="Confirm Refill"
          variant="primary"
        />
      )}
    </div>
  );
};
