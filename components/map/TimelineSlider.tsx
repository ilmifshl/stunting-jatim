'use client';

import { useState } from 'react';

export default function TimelineSlider() {
  const [year, setYear] = useState(2023);
  const years = [2019, 2020, 2021, 2022, 2023, 2024];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Tahun Data</h3>
      <div className="relative pt-1">
        <input
          type="range"
          min={years[0]}
          max={years[years.length - 1]}
          step="1"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {years.map((y) => (
            <span key={y} className={y === year ? 'font-bold text-blue-600 text-sm' : ''}>
              {y}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
