'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { factor: 'Risiko Langsung', value: 65, fullMark: 100 },
  { factor: 'Pencegahan', value: 82, fullMark: 100 },
  { factor: 'Status Ibu', value: 70, fullMark: 100 },
  { factor: 'Sanitasi', value: 78, fullMark: 100 },
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
