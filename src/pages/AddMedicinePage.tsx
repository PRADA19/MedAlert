import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Pill,
  Clock,
  Calendar,
  Package,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useMedicineStore } from '../store/medicineStore';
import { useToastStore } from '../store/toastStore';
import { MedicineType, FrequencyType, DosageUnit } from '../types/medicine';
import { getTodayDateString } from '../utils/dateUtils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface FormValues {
  name: string;
  type: MedicineType;
  dosageAmount: number;
  dosageUnit: DosageUnit;
  frequency: FrequencyType;
  times: { time: string }[];
  startDate: string;
  hasEndDate: boolean;
  endDate?: string | null;
  instructions?: string;
  notes?: string;
  enableStockTracking: boolean;
  currentStock: number;
  dailyUsage: number;
  lowStockThreshold: number;
}

const MEDICINE_TYPES: { key: MedicineType; label: string; icon: string }[] = [
  { key: 'tablet', label: 'Tablet', icon: '💊' },
  { key: 'capsule', label: 'Capsule', icon: '💊' },
  { key: 'syrup', label: 'Syrup', icon: '🧪' },
  { key: 'injection', label: 'Injection', icon: '💉' },
  { key: 'drops', label: 'Drops', icon: '💧' },
  { key: 'cream', label: 'Cream', icon: '🧴' },
  { key: 'other', label: 'Other', icon: '📦' },
];

const DOSAGE_UNITS: DosageUnit[] = [
  'Tablet',
  'Capsule',
  'ml',
  'mg',
  'Drops',
  'Pills',
  'Units',
  'Spoons',
  'Application',
];

export const AddMedicinePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const { medicines, addMedicine, updateMedicine } = useMedicineStore();
  const { showToast } = useToastStore();

  const existingMed = isEditMode ? medicines.find((m) => m.id === id) : null;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: existingMed
      ? {
          name: existingMed.name,
          type: existingMed.type,
          dosageAmount: existingMed.dosageAmount,
          dosageUnit: existingMed.dosageUnit,
          frequency: existingMed.frequency,
          times: existingMed.times.map((t) => ({ time: t })),
          startDate: existingMed.startDate,
          hasEndDate: Boolean(existingMed.endDate),
          endDate: existingMed.endDate || '',
          instructions: existingMed.instructions || '',
          notes: existingMed.notes || '',
          enableStockTracking: existingMed.enableStockTracking,
          currentStock: existingMed.currentStock,
          dailyUsage: existingMed.dailyUsage,
          lowStockThreshold: existingMed.lowStockThreshold,
        }
      : {
          name: '',
          type: 'tablet',
          dosageAmount: 1,
          dosageUnit: 'Tablet',
          frequency: 'once_daily',
          times: [{ time: '08:00' }],
          startDate: getTodayDateString(),
          hasEndDate: false,
          endDate: '',
          instructions: '',
          notes: '',
          enableStockTracking: true,
          currentStock: 30,
          dailyUsage: 1,
          lowStockThreshold: 5,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'times',
  });

  const selectedType = watch('type');
  const frequency = watch('frequency');
  const hasEndDate = watch('hasEndDate');
  const enableStockTracking = watch('enableStockTracking');

  // Handle frequency presets
  useEffect(() => {
    if (isEditMode) return; // Don't overwrite when editing existing
    switch (frequency) {
      case 'once_daily':
        setValue('times', [{ time: '08:00' }]);
        break;
      case 'twice_daily':
        setValue('times', [{ time: '08:00' }, { time: '20:00' }]);
        break;
      case 'thrice_daily':
        setValue('times', [{ time: '08:00' }, { time: '14:00' }, { time: '20:00' }]);
        break;
      case 'four_times_daily':
        setValue('times', [
          { time: '08:00' },
          { time: '12:00' },
          { time: '16:00' },
          { time: '20:00' },
        ]);
        break;
    }
  }, [frequency, setValue, isEditMode]);

  const onSubmit = (data: FormValues) => {
    const timesArray = data.times.map((t) => t.time).filter(Boolean);

    if (timesArray.length === 0) {
      showToast('Validation Error', 'Please specify at least one reminder time.', 'error');
      return;
    }

    if (data.hasEndDate && data.endDate && data.endDate < data.startDate) {
      showToast('Validation Error', 'End date cannot be earlier than start date.', 'error');
      return;
    }

    const payload = {
      name: data.name.trim(),
      type: data.type,
      dosageAmount: Number(data.dosageAmount),
      dosageUnit: data.dosageUnit,
      frequency: data.frequency,
      times: timesArray,
      startDate: data.startDate,
      endDate: data.hasEndDate ? data.endDate || null : null,
      instructions: data.instructions?.trim() || '',
      notes: data.notes?.trim() || '',
      enableStockTracking: data.enableStockTracking,
      currentStock: data.enableStockTracking ? Number(data.currentStock) : 0,
      dailyUsage: data.enableStockTracking ? Number(data.dailyUsage) : 0,
      lowStockThreshold: data.enableStockTracking ? Number(data.lowStockThreshold) : 0,
      active: true,
    };

    if (isEditMode && id) {
      updateMedicine(id, payload);
      showToast('✓ Updated', `${data.name} updated successfully.`, 'success');
    } else {
      addMedicine(payload);
      showToast('✓ Created', `${data.name} added to schedule!`, 'success');
    }

    navigate('/medicines');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isEditMode ? 'Edit Medicine' : 'Add New Medicine'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure prescription details, schedule frequency, and stock warnings.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card className="p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <Pill className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            1. Medicine Information
          </h3>

          <div className="space-y-4">
            {/* Medicine Name */}
            <Input
              label="Medicine Name *"
              placeholder="e.g. Vitamin D3, Amoxicillin, Paracetamol"
              {...register('name', { required: 'Medicine name is required' })}
              error={errors.name?.message}
            />

            {/* Medicine Type Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Medicine Type
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {MEDICINE_TYPES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setValue('type', t.key)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                      selectedType === t.key
                        ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/80 dark:border-brand-500 dark:text-brand-300 ring-2 ring-brand-500/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl mb-1">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dosage Amount & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                step="any"
                min="0.1"
                label="Dosage Amount *"
                placeholder="e.g. 1 or 500"
                {...register('dosageAmount', {
                  required: 'Dosage amount required',
                  min: { value: 0.1, message: 'Must be greater than 0' },
                })}
                error={errors.dosageAmount?.message}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Dosage Unit
                </label>
                <select
                  {...register('dosageUnit')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {DOSAGE_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Reminder Schedule */}
        <Card className="p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            2. Reminder Schedule
          </h3>

          <div className="space-y-4">
            {/* Frequency preset */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Frequency Pattern
              </label>
              <select
                {...register('frequency')}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="once_daily">Once Daily</option>
                <option value="twice_daily">Twice Daily</option>
                <option value="thrice_daily">Three Times Daily</option>
                <option value="four_times_daily">Four Times Daily</option>
                <option value="custom">Custom Schedule</option>
              </select>
            </div>

            {/* Dynamic Times List */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Reminder Times (24h)
              </label>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      type="time"
                      {...register(`times.${index}.time` as const, {
                        required: 'Time is required',
                      })}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    />
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ time: '12:00' })}
                className="mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Time
              </Button>
            </div>

            {/* Start & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                type="date"
                label="Start Date *"
                {...register('startDate', { required: 'Start date required' })}
                error={errors.startDate?.message}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  End Date
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="hasEndDate"
                    {...register('hasEndDate')}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="hasEndDate" className="text-xs text-slate-600 dark:text-slate-300">
                    Set specific end date
                  </label>
                </div>
                {hasEndDate && (
                  <Input
                    type="date"
                    {...register('endDate', { required: hasEndDate ? 'End date is required' : false })}
                    error={errors.endDate?.message}
                  />
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: Stock Tracking & Instructions */}
        <Card className="p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            3. Stock Tracking & Special Instructions
          </h3>

          <div className="space-y-4">
            {/* Stock Tracking Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Enable Stock Tracking
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Receive low stock warnings before running out of medicine.
                </p>
              </div>
              <input
                type="checkbox"
                {...register('enableStockTracking')}
                className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </div>

            {enableStockTracking && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <Input
                  type="number"
                  label="Current Stock"
                  placeholder="30"
                  {...register('currentStock')}
                />
                <Input
                  type="number"
                  label="Daily Usage"
                  placeholder="1"
                  {...register('dailyUsage')}
                />
                <Input
                  type="number"
                  label="Low Stock Warning At"
                  placeholder="5"
                  helperText="Warn when remaining count reaches this number."
                  {...register('lowStockThreshold')}
                />
              </div>
            )}

            {/* Instructions */}
            <Input
              label="Instructions / Special Guidance"
              placeholder="e.g. Take with water after breakfast. Do not crush."
              {...register('instructions')}
            />

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Personal Notes
              </label>
              <textarea
                rows={2}
                placeholder="Prescribing doctor, refill notes, etc."
                {...register('notes')}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => navigate('/medicines')}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="lg" className="shadow-lg shadow-brand-600/20">
            <CheckCircle2 className="w-5 h-5" />
            {isEditMode ? 'Save Changes' : 'Create Medicine'}
          </Button>
        </div>
      </form>
    </div>
  );
};
