'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { factor: 'Akses Sanitasi', value: 75, fullMark: 100 },
  { factor: 'Air Bersih', value: 85, fullMark: 100 },
  { factor: 'Pendidikan Ibu', value: 65, fullMark: 100 },
  { factor: 'Status Gizi', value: 60, fullMark: 100 },
  { factor: 'Akses Kesehatan', value: 80, fullMark: 100 },
];

export default function RiskRadarChart() {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="factor" tick={{ fill: '#4b5563', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar name="Skor Faktor (0-100)" dataKey="value" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
