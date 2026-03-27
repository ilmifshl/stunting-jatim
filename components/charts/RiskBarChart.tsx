'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { region: 'Kab. Bojonegoro', sanitasi: 65, pendidikan: 55, gizi: 60 },
  { region: 'Kab. Bangkalan', sanitasi: 40, pendidikan: 45, gizi: 50 },
  { region: 'Kota Surabaya', sanitasi: 95, pendidikan: 90, gizi: 85 },
  { region: 'Kab. Malang', sanitasi: 70, pendidikan: 75, gizi: 65 },
  { region: 'Kab. Jember', sanitasi: 60, pendidikan: 60, gizi: 55 },
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
          <XAxis dataKey="region" tick={{ fill: '#4b5563', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#4b5563', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip 
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="sanitasi" name="Akses Sanitasi" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pendidikan" name="Pendidikan Ibu" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="gizi" name="Status Gizi" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
