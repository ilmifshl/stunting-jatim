'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminRegionChartProps {
  data: { name: string; prevalence: number }[];
}

export default function AdminRegionChart({ data }: AdminRegionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
        barSize={12}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis 
          type="number" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#475569', fontWeight: 800 }}
          width={80}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '16px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            padding: '12px'
          }}
          itemStyle={{ fontWeight: 800, fontSize: '12px' }}
          labelStyle={{ fontWeight: 800, fontSize: '10px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}
          cursor={{ fill: '#f8fafc' }}
        />
        <Bar 
          dataKey="prevalence" 
          name="Prevalensi (%)" 
          radius={[0, 10, 10, 0]}
          animationDuration={1500}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#f87171'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
