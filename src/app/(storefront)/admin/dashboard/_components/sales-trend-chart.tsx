'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface TrendData {
  month: string;
  orders: number;
  revenue: number;
}

export function SalesTrendChart({ data }: { data: TrendData[] }) {
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatMonth = (item: string) => {
    const [year, month] = item.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'short' });
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
      <div className="space-y-1">
        <h2 className="text-xs font-black text-slate-800 uppercase tracking-[0.15em]">
          Grafik Tren Pendapatan Bulanan
        </h2>
        <p className="text-[11px] font-semibold text-slate-400">Visualisasi pertumbuhan omset dan pesanan.</p>
      </div>

      {/* Container agar Chart Responsif di Mobile & Desktop */}
      <div className="w-full h-64 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#165dfc" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#165dfc" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              tickFormatter={formatMonth} 
              tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(value) => `Rp ${value / 1000000}M`}
              tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              formatter={(value: any) => [formatRupiah(value), 'Pendapatan']}
            //   labelFormatter={formatMonth}
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#165dfc" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}