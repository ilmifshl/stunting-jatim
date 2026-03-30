'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { region: 'Kab. Bojonegoro', langsung: 65, pencegahan: 80, ibu: 70, sanitasi: 75 },
  { region: 'Kab. Bangkalan', langsung: 40, pencegahan: 65, ibu: 55, sanitasi: 50 },
  { region: 'Kota Surabaya', langsung: 92, pencegahan: 95, ibu: 88, sanitasi: 94 },
  { region: 'Kab. Malang', langsung: 70, pencegahan: 85, ibu: 75, sanitasi: 80 },
  { region: 'Kab. Jember', langsung: 60, pencegahan: 75, ibu: 65, sanitasi: 70 },
];

export default function RiskBarChart() {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="region" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip 
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
          <Bar dataKey="langsung" name="Risiko Langsung" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pencegahan" name="Pencegahan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="ibu" name="Kesehatan Ibu" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="sanitasi" name="Sanitasi" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
