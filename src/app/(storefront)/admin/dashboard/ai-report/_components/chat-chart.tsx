'use client';

import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import type { ChatChartData } from '../actions';

// Fixed categorical order, reused from the admin dashboard charts — never
// reassigned per-render, so the same series always gets the same color.
const SERIES_COLORS = ['#165dfc', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#0ea5e9'];

const MAX_CATEGORIES = 15;

function formatCompact(value: number) {
  return new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

const tooltipStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: 700 as const,
};

const axisTick = { fontSize: 10, fontWeight: 700 as const, fill: '#94a3b8' };
const legendStyle = { fontSize: 10, fontWeight: 700 as const };

export function ChatChart({ chart }: { chart: ChatChartData }) {
  if (!chart.labels.length || !chart.datasets.length) return null;

  const truncated = chart.labels.length > MAX_CATEGORIES;
  const labels = truncated ? chart.labels.slice(0, MAX_CATEGORIES) : chart.labels;
  const rows = labels.map((label, i) => {
    const row: Record<string, string | number> = { label };
    chart.datasets.forEach((ds) => {
      row[ds.label] = ds.data[i];
    });
    return row;
  });
  const showLegend = chart.datasets.length > 1;

  return (
    <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-4">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === 'pie' ? (
            <PieChart>
              <Pie
                data={rows}
                dataKey={chart.datasets[0].label}
                nameKey="label"
                innerRadius={48}
                outerRadius={78}
                paddingAngle={3}
              >
                {rows.map((_, i) => (
                  <Cell key={i} fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCompact(Number(value))} />
              <Legend wrapperStyle={legendStyle} />
            </PieChart>
          ) : chart.type === 'line' ? (
            <LineChart data={rows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCompact(Number(value))} />
              {showLegend && <Legend wrapperStyle={legendStyle} />}
              {chart.datasets.map((ds, i) => (
                <Line
                  key={ds.label}
                  type="monotone"
                  dataKey={ds.label}
                  stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={rows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCompact(Number(value))} cursor={{ fill: '#f8fafc' }} />
              {showLegend && <Legend wrapperStyle={legendStyle} />}
              {chart.datasets.map((ds, i) => (
                <Bar key={ds.label} dataKey={ds.label} fill={SERIES_COLORS[i % SERIES_COLORS.length]} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      {truncated && (
        <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menampilkan {MAX_CATEGORIES} dari {chart.labels.length} kategori — lihat tabel untuk data lengkap
        </p>
      )}
    </div>
  );
}
