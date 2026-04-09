'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrafficChartProps {
  data: { date: string; pv: number }[];
}

export function TrafficChart({ data }: TrafficChartProps) {
  const formatted = data.map(d => ({ ...d, date: d.date.slice(5) }));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#2c2c2e', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
          itemStyle={{ color: '#1aff8c' }}
        />
        <Line type="monotone" dataKey="pv" stroke="#1aff8c" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
