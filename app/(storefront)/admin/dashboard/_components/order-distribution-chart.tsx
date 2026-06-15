'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DistributionData {
  pending_payment: number;
  processing: number;
  completed: number;
  rejected: number;
}

export function OrderDistributionChart({ data }: { data: DistributionData }) {
  // Ubah objek dari API menjadi array yang dikenali oleh Recharts
  const chartData = [
    { name: 'Selesai', value: data.completed, color: '#10b981' }, // Emerald
    { name: 'Pending', value: data.pending_payment, color: '#f59e0b' }, // Amber
    { name: 'Diproses', value: data.processing, color: '#3b82f6' }, // Blue
    { name: 'Dibatalkan', value: data.rejected, color: '#f43f5e' }, // Rose
  ];

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
      <div className="space-y-1">
        <h2 className="text-xs font-black text-slate-800 uppercase tracking-[0.15em]">
          Komposisi Status Transaksi
        </h2>
        <p className="text-[11px] font-semibold text-slate-400">Persentase status nota pesanan masuk.</p>
      </div>

      <div className="w-full h-56 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60} // Membuat efek Donut (bolong di tengah)
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [`${value} Transaksi (${((value / total) * 100).toFixed(1)}%)`, 'Status']}
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Teks Total di Tengah Donut */}
        <div className="absolute text-center select-none pointer-events-none">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total</p>
          <p className="text-xl font-black text-slate-800 font-mono">{total}</p>
        </div>
      </div>

      {/* Keterangan Warna Manual agar Desain Selaras dengan Sahabat Sport */}
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}