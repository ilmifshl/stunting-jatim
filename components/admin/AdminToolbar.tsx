'use client';

import { Search } from 'lucide-react';

interface AdminToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  // Year Filter
  years?: string[];
  filterYear?: string;
  onYearChange?: (value: string) => void;
  // Region Filter
  regions?: { id: string; name: string }[];
  filterRegion?: string;
  onRegionChange?: (value: string) => void;
  // Category Filter
  categories?: string[];
  filterCategory?: string;
  onCategoryChange?: (value: string) => void;
  // Styling
  accentColor?: 'blue' | 'green' | 'orange';
}

export default function AdminToolbar({
  searchTerm,
  onSearchChange,
  totalCount,
  years,
  filterYear,
  onYearChange,
  regions,
  filterRegion,
  onRegionChange,
  categories,
  filterCategory,
  onCategoryChange,
  accentColor = 'blue',
}: AdminToolbarProps) {
  
  const accentClasses = {
    blue: 'focus:ring-blue-500/10 focus:border-blue-500 text-blue-600',
    green: 'focus:ring-green-500/10 focus:border-green-500 text-green-600',
    orange: 'focus:ring-orange-500/10 focus:border-orange-500 text-orange-600',
  };

  return (
    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center animate-in fade-in duration-500">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Cari..." 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:ring-4 transition-all outline-none placeholder:text-gray-400 ${accentClasses[accentColor]}`}
        />
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        {/* Year Filter */}
        {onYearChange && years && (
          <select 
            value={filterYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="flex-1 lg:flex-none px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 focus:bg-white focus:ring-4 outline-none transition-all cursor-pointer min-w-[120px]"
          >
            <option value="all">Semua Tahun</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}

        {/* Region Filter */}
        {onRegionChange && regions && (
          <select 
            value={filterRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className="flex-1 lg:flex-none px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 focus:bg-white focus:ring-4 outline-none transition-all cursor-pointer min-w-[180px]"
          >
            <option value="all">Semua Wilayah</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        )}

        {/* Category Filter */}
        {onCategoryChange && categories && (
          <select 
            value={filterCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="flex-1 lg:flex-none px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 focus:bg-white focus:ring-4 outline-none transition-all cursor-pointer min-w-[160px]"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {/* Counter */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 ml-2">
          Total: <span className={accentClasses[accentColor].split(' ')[2]}>{totalCount} Data</span>
        </div>
      </div>
    </div>
  );
}
