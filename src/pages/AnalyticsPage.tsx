import React from 'react';
import {
  BarChart3,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { subDays, format, parseISO } from 'date-fns';
import { useHistoryStore } from '../store/historyStore';
import { useMedicineStore } from '../store/medicineStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const AnalyticsPage: React.FC = () => {
  const { history } = useHistoryStore();
  const { medicines } = useMedicineStore();

  const totalLogs = history.length;
  const takenLogs = history.filter((h) => h.status === 'taken').length;
  const missedLogs = history.filter((h) => h.status === 'missed').length;
  const skippedLogs = history.filter((h) => h.status === 'skipped').length;

  const overallAdherence = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;

  // Compute 7-day adherence chart data
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayName = format(d, 'EEE');

    const dayLogs = history.filter((h) => h.scheduledDate === dateStr);
    const dayTaken = dayLogs.filter((h) => h.status === 'taken').length;
    const dayTotal = dayLogs.length;

    const rate = dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : 100;

    return {
      day: dayName,
      date: dateStr,
      taken: dayTaken,
      total: dayTotal,
      rate,
    };
  });

  // Compute Pie Chart Data
  const pieData = [
    { name: 'Taken', value: takenLogs || 1, color: '#10b981' },
    { name: 'Missed', value: missedLogs, color: '#f43f5e' },
    { name: 'Skipped', value: skippedLogs, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  // Compute per-medicine adherence breakdown
  const medicineBreakdown = medicines.map((med) => {
    const medHistory = history.filter((h) => h.medicineId === med.id);
    const medTaken = medHistory.filter((h) => h.status === 'taken').length;
    const medTotal = medHistory.length;
    const rate = medTotal > 0 ? Math.round((medTaken / medTotal) * 100) : 100;

    return {
      medicine: med,
      taken: medTaken,
      total: medTotal,
      rate,
    };
  });

  // Calculate Streak
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const logs = history.filter((h) => h.scheduledDate === dateStr);
    if (logs.length === 0) continue;
    const missed = logs.some((h) => h.status === 'missed');
    if (!missed && logs.some((h) => h.status === 'taken')) {
      streak++;
    } else if (missed) {
      break;
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <span>Adherence Analytics</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Track your medication consistency, trends, and health streak performance.
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-6 flex items-center gap-4 border-l-4 border-brand-500">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overall Adherence
            </p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {overallAdherence}%
            </h3>
            <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-1">
              Target: 80%+ consistency
            </p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4 border-l-4 border-amber-500">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-8 h-8 fill-current" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Current Streak
            </p>
            <h3 className="text-3xl font-black text-amber-500 flex items-center gap-2">
              🔥 {streak} Day{streak !== 1 ? 's' : ''}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Keep taking doses on time!
            </p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Taken Doses
            </p>
            <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {takenLogs}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              {missedLogs} missed doses recorded
            </p>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: 7-Day Adherence */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              7-Day Adherence Rate (%)
            </h3>
            <Badge variant="brand">Last 7 Days</Badge>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData}>
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="rate" fill="#3A9295" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut Chart: Taken vs Missed */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            Distribution Breakdown
          </h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span>{d.value} doses</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Per-Medicine Breakdown List */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Medicine Specific Consistency
        </h3>

        {medicineBreakdown.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">No medicines available.</p>
        ) : (
          <div className="space-y-4">
            {medicineBreakdown.map(({ medicine, taken, total, rate }) => (
              <div key={medicine.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-slate-900 dark:text-slate-100">{medicine.name}</span>
                  <span className="text-brand-600 dark:text-brand-400">
                    {rate}% ({taken}/{total || 1} doses)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
