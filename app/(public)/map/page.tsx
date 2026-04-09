'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Info, MapPin, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import type { EastJavaMapProps } from '@/components/map/EastJavaMap';

import { useLanguage } from '@/lib/i18n/LanguageContext';

const EastJavaMap = dynamic<EastJavaMapProps>(() => import('@/components/map/EastJavaMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/50 animate-pulse">
      <span className="text-gray-500 font-medium tracking-wider">Loading...</span>
    </div>
  ),
});

import { createClient } from '@/utils/supabase/client';
import type { ClusterResult, ClusterMeta } from '@/lib/kmedoids';

export default function MapPage() {
  const { lang, t } = useLanguage();
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [year, setYear] = useState(2024);
  const [years, setYears] = useState<number[]>([2019, 2020, 2021, 2022, 2023, 2024]);
  
  // Dynamic filters: clusterId -> boolean
  const [clusterFilters, setClusterFilters] = useState<Record<string, boolean>>({});
  
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Heatmap View Mode
  const [viewMode, setViewMode] = useState<'prevalence' | 'direct_risk' | 'prevention_risk' | 'maternal_risk' | 'environment_risk' | 'comprehensive_risk' | 'trend'>('prevalence');

  // Trend Data for 'trend' mode
  const [trendData, setTrendData] = useState<Record<string, 'naik' | 'turun' | 'tetap' | null>>({});
  const [trendStats, setTrendStats] = useState({ naik: 0, turun: 0, tetap: 0, noData: 0 });
  const [trendFilters, setTrendFilters] = useState<Record<string, boolean>>({
    naik: true,
    turun: true,
    tetap: true,
    noData: true
  });

  // K-Medoids: one result per active view, with a ref-cache keyed by "year-mode"
  const [clusterResult, setClusterResult] = useState<ClusterResult | null>(null);
  const [isClusterLoading, setIsClusterLoading] = useState(false);
  const clusterCacheRef = useRef<Map<string, ClusterResult>>(new Map());

  const translateClusterLabel = useCallback((label: string) => {
    const map: Record<string, string> = {
      'Sangat Rendah': t.clusterLabels.veryLow,
      'Rendah': t.clusterLabels.low,
      'Menengah': t.clusterLabels.medium,
      'Cukup Rendah': t.clusterLabels.quiteLow,
      'Cukup Tinggi': t.clusterLabels.quiteHigh,
      'Tinggi': t.clusterLabels.high,
      'Sangat Tinggi': t.clusterLabels.veryHigh,
      'Waspada Rendah': t.clusterLabels.alertLow,
      'Waspada Tinggi': t.clusterLabels.alertHigh,
    };
    return map[label] || label;
  }, [t]);

  // Fetch available years from DB
  useEffect(() => {
    const fetchYears = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('stunting_data')
        .select('year')
        .order('year', { ascending: false });

      if (data && data.length > 0) {
        const uniqueYears = Array.from(new Set(data.map((d: { year: number }) => d.year))).sort((a, b) => (a as number) - (b as number)) as number[];
        setYears(uniqueYears);
        const latestYear = uniqueYears[uniqueYears.length - 1];
        if (latestYear) setYear(latestYear);
      }
    };
    fetchYears();
  }, []);

  // Fetch K-Medoids whenever year or viewMode changes
  useEffect(() => {
    if (viewMode === 'trend') {
      setClusterResult(null);
      return;
    }

    const cacheKey = `v8-${year}-${viewMode}`;
    if (clusterCacheRef.current.has(cacheKey)) {
      const cached = clusterCacheRef.current.get(cacheKey)!;
      setClusterResult(cached);
      // Reset filters when mode/year changes
      const initialFilters: Record<string, boolean> = {};
      cached.clusterMeta.forEach(m => { initialFilters[m.id] = true; });
      setClusterFilters(initialFilters);
      return;
    }

    const fetchClusters = async () => {
      const startTime = performance.now();
      setIsClusterLoading(true);
      try {
        const res = await fetch(`/api/clustering?year=${year}&mode=${viewMode}`);
        if (!res.ok) throw Error(`HTTP ${res.status}`);
        const data: ClusterResult = await res.json();
        
        // Translate labels
        const translatedMeta = data.clusterMeta.map(m => ({
          ...m,
          label: translateClusterLabel(m.label)
        }));
        const translatedData = { ...data, clusterMeta: translatedMeta };

        clusterCacheRef.current.set(cacheKey, translatedData);
        setClusterResult(translatedData);
        
        // Initialize filters
        const initialFilters: Record<string, boolean> = {};
        translatedData.clusterMeta.forEach(m => { initialFilters[m.id] = true; });
        setClusterFilters(initialFilters);
        
        const duration = performance.now() - startTime;
        console.log(`[MapPage] 🕒 Clustering API (${viewMode}, ${year}): ${duration.toFixed(2)}ms`);
      } catch (err) {
        console.error('[MapPage] Failed to load cluster data:', err);
        setClusterResult(null);
      } finally {
        setIsClusterLoading(false);
      }
    };
    fetchClusters();
  }, [year, viewMode]);

  // Fetch Trends whenever year changes
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const supabase = createClient();
        
        // Fetch current and previous year data
        const { data: currentData } = await supabase.from('stunting_data').select('prevalence, regions:regions(name)').eq('year', year);
        const { data: prevData } = await supabase.from('stunting_data').select('prevalence, regions:regions(name)').eq('year', year - 1);

        const currMap = new Map((currentData as any[])?.map(d => [d.regions?.name, d.prevalence]));
        const prevMap = new Map((prevData as any[])?.map(d => [d.regions?.name, d.prevalence]));

        const trends: Record<string, 'naik' | 'turun' | 'tetap' | null> = {};
        let naik = 0, turun = 0, tetap = 0, noData = 0;

        currMap.forEach((currVal, name) => {
          if (name) {
            const prevVal = prevMap.get(name);
            if (prevVal === undefined || prevVal === null) {
              trends[name] = null;
              noData++;
            } else {
              if (currVal > prevVal) {
                trends[name] = 'naik';
                naik++;
              } else if (currVal < prevVal) {
                trends[name] = 'turun';
                turun++;
              } else {
                trends[name] = 'tetap';
                tetap++;
              }
            }
          }
        });

        setTrendData(trends);
        setTrendStats({ naik, turun, tetap, noData });
      } catch (err) {
        console.error('Failed to calculate trends:', err);
      }
    };
    fetchTrends();
  }, [year]);

  // Map selection handler
  const handleSelectRegion = useCallback((regionName: string) => {
    if (selectedRegion?.name === regionName) return;
    setIsDetailLoading(true);
    setSelectedRegion({ name: regionName });
  }, [selectedRegion?.name]);

  // Fetch detail data when region or year changes
  useEffect(() => {
    if (!selectedRegion?.name) return;

    const fetchDetailData = async () => {
      setIsDetailLoading(true);

      try {
        const supabase = createClient();

        const { data: regionData, error: regionError } = await supabase
          .from('regions')
          .select(`
            id,
            name,
            stunting_data (
              prevalence,
              stunting_cases,
              year
            ),
            stunting_factors (
              bblr_rate,
              imd_rate,
              asi_rate,
              year
            )
          `)
          .eq('name', selectedRegion.name)
          .single();

        if (regionError || !regionData) throw regionError || new Error('Region not found');

        const currentStunting = regionData.stunting_data?.find((s: any) => s.year === year);
        const prevStunting = regionData.stunting_data?.find((s: any) => s.year === year - 1);
        const currentFactors = regionData.stunting_factors?.find((f: any) => f.year === year);

        let trend = 'tetap';
        if (currentStunting && prevStunting) {
          trend = currentStunting.prevalence > prevStunting.prevalence ? 'naik' : 
                  currentStunting.prevalence < prevStunting.prevalence ? 'turun' : 'tetap';
        }

        // Determine cluster metadata from K-Medoids result
        const clusterId = clusterResult?.clusters?.[regionData.name] ?? null;
        const clusterMeta = clusterId !== null ? clusterResult?.clusterMeta.find(m => m.id === clusterId) : null;

        setSelectedRegion({
          name: regionData.name,
          prevalence: currentStunting?.prevalence || 0,
          cases: currentStunting?.stunting_cases ?? null,
          trend,
          clusterId,
          clusterMeta,
          factors: {
            bblr: currentFactors?.bblr_rate || 0,
            imd: currentFactors?.imd_rate || 0,
            asi: currentFactors?.asi_rate || 0,
          }
        });
      } catch (err) {
        console.error('Error fetching region details:', err);
      } finally {
        setIsDetailLoading(false);
      }
    };

    fetchDetailData();
  }, [selectedRegion?.name, year, clusterResult]);

  // Helper: status label + color from K-Medoids cluster meta
  const getStatusDisplay = (meta: ClusterMeta | null, prevalence: number) => {
    if (meta) {
      return { text: meta.label, color: 'text-gray-900', textColor: meta.color };
    }
    // Fallback if no cluster data
    if (prevalence > 20) return { text: 'Sangat Rawan', color: 'text-red-500', textColor: '#ef4444' };
    if (prevalence > 14) return { text: 'Cukup Rawan', color: 'text-yellow-600', textColor: '#facc15' };
    if (prevalence > 0) return { text: 'Aman', color: 'text-green-600', textColor: '#22c55e' };
    return { text: 'Belum Ada Data', color: 'text-gray-400', textColor: '#94a3b8' };
  };

  // Dynamic legend labels
  const thresholds = clusterResult?.thresholds;
  const unit = viewMode === 'prevalence' ? '%' : '';

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
      {/* Full Background Map */}
      <Suspense fallback={<div>Loading...</div>}>
        <EastJavaMap
          selectedRegion={selectedRegion?.name}
          setSelectedRegion={handleSelectRegion}
          year={year}
          searchQuery={searchQuery}
          clusterFilters={clusterFilters}
          clusterData={clusterResult?.clusters ?? null}
          clusterMeta={clusterResult?.clusterMeta ?? null}
          scores={clusterResult?.scores ?? null}
          viewMode={viewMode}
          trendData={trendData}
          trendFilters={trendFilters}
        />
      </Suspense>

      {/* Floating View Mode Switcher (Top Center) */}
      <div 
        className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300"
      >
        <div className="flex gap-1">
          {[
            { id: 'prevalence', label: t.mapLegend.prevalence, color: 'text-blue-600', activeBg: 'bg-blue-50' },
            { id: 'direct_risk', label: t.factors.directRisk, color: 'text-orange-600', activeBg: 'bg-orange-50' },
            { id: 'prevention_risk', label: t.factors.effectivePrevention, color: 'text-emerald-600', activeBg: 'bg-emerald-50' },
            { id: 'maternal_risk', label: t.factors.maternalHealth, color: 'text-purple-600', activeBg: 'bg-purple-50' },
            { id: 'environment_risk', label: t.factors.environment, color: 'text-cyan-600', activeBg: 'bg-cyan-50' },
            { id: 'comprehensive_risk', label: lang === 'id' ? 'Komprehensif' : 'Comprehensive', color: 'text-indigo-600', activeBg: 'bg-indigo-50' },
            { id: 'trend', label: t.map.annualTrend, color: 'text-amber-600', activeBg: 'bg-amber-50' },
          ].map((modeItem) => (
            <button
              key={modeItem.id}
              onClick={() => setViewMode(modeItem.id as any)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 whitespace-nowrap ${
                viewMode === modeItem.id 
                  ? `${modeItem.activeBg} ${modeItem.color} shadow-sm ring-1 ring-inset ring-gray-100` 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
              }`}
            >
              {modeItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Left Panel (Filter) */}
      <div
        className={`absolute left-4 top-4 bottom-4 z-[1000] w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 flex flex-col transition-all duration-300 ${isFilterOpen ? 'translate-x-0' : '-translate-x-[calc(100%+16px)]'
          }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`absolute -right-10 top-1/2 -translate-y-1/2 bg-white p-2 rounded-r-xl shadow-md border-r border-t border-b border-gray-100 text-gray-700 hover:text-blue-600 focus:outline-none z-50`}
        >
          {isFilterOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        <div className="p-5 flex-1 flex flex-col min-h-0">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 shrink-0">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            {t.map.filterData}
          </h2>

          <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-2">
            {/* 1. Search Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.map.search}</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t.map.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                />
              </div>
            </div>

            {/* 2. Year Slider */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.map.year}: {year}</label>
              <div className="px-2">
                <input
                  type="range"
                  min={years[0]}
                  max={years[years.length - 1]}
                  step="1"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                  {years.map((y) => (
                    <span key={y} className={y === year ? 'text-blue-600 font-bold' : ''}>
                      {y}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. K-Medoids Dynamic Checkboxes (hidden in trend mode) */}
            <div className={`transition-all duration-300 ${viewMode === 'trend' ? 'opacity-0 h-0 overflow-hidden pointer-events-none' : 'opacity-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {viewMode === 'prevalence' ? t.map.prevalenceLevel : t.map.riskLevel}
                </label>
                {(isClusterLoading || isDetailLoading) && (
                  <div className="flex items-center gap-2 px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100 animate-pulse">
                    <div className="w-2 h-2 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">{t.map.aligning}</span>
                  </div>
                )}
              </div>
              <div className="mb-2 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                  <span className="text-[10px] text-blue-600 font-semibold tracking-wide">
                    Optimal K: {clusterResult?.bestK ?? '...'} ({year})
                  </span>
                </div>
                {clusterResult && (
                  <Link 
                    href={`/map/kmedoids-calculation?year=${year}&mode=${viewMode}`}
                    className="text-[10px] font-bold text-blue-700 hover:underline flex items-center gap-0.5"
                  >
                    <Info className="w-2.5 h-2.5" />
                    {lang === 'id' ? 'Detail' : 'Details'}
                  </Link>
                )}
              </div>
              <div className="space-y-2">
                {clusterResult?.clusterMeta.map((meta, idx) => (
                  <label key={meta.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={clusterFilters[meta.id] ?? true}
                      onChange={() => setClusterFilters(f => ({ ...f, [meta.id]: !f[meta.id] }))}
                      className="w-4 h-4 border-gray-300 rounded focus:ring-blue-500"
                      style={{ color: meta.color }}
                    />
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span className="text-sm text-gray-700 font-medium">
                        {meta.label} <span className="text-gray-400 font-normal text-[10px]">
                          {thresholds && thresholds[idx-1] !== undefined && thresholds[idx] !== undefined ? `(${thresholds[idx-1]}${unit} – ${thresholds[idx]}${unit})` : 
                           thresholds && idx === 0 ? `(< ${thresholds[0]}${unit})` : 
                           thresholds && idx === (clusterResult?.bestK || 0) - 1 ? `(> ${thresholds[idx-1]}${unit})` : ''}
                        </span>
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* K-Medoids Medoid Info (hidden in trend mode) */}
            {clusterResult?.clusterMeta && viewMode !== 'trend' && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 mt-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {viewMode === 'prevalence' ? t.map.medoidValue : t.map.medoidScore} ({year})
                </p>
                <div className="space-y-1">
                  {clusterResult.clusterMeta.map((meta) => (
                    <div key={meta.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                        <span className="text-gray-600">{meta.label}</span>
                      </div>
                      <span className="font-bold text-gray-800">
                        {(() => {
                          const val = meta.medoid;
                          if (Array.isArray(val)) {
                            return (val.reduce((a, b: number) => a + b, 0) / val.length).toFixed(1);
                          }
                          return typeof val === 'number' ? val.toFixed(1) : '0.0';
                        })()}
                        {viewMode === 'prevalence' ? '%' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Trend Summary - Interactive Filters (only for trend mode) */}
            {viewMode === 'trend' && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300 mt-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-orange-600" />
                  {t.map.trendSummary} ({year})
                </h3>
                <div className="space-y-1">
                  <label className="flex justify-between items-center p-2 hover:bg-white rounded-lg cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={trendFilters.naik}
                        onChange={() => setTrendFilters(f => ({ ...f, naik: !f.naik }))}
                        className="w-4 h-4 border-gray-300 rounded text-red-600 focus:ring-red-500"
                      />
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
                        <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900">{t.map.trendRising}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-50/50 px-2 py-0.5 rounded-md">{trendStats.naik}</span>
                  </label>

                  <label className="flex justify-between items-center p-2 hover:bg-white rounded-lg cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={trendFilters.turun}
                        onChange={() => setTrendFilters(f => ({ ...f, turun: !f.turun }))}
                        className="w-4 h-4 border-gray-300 rounded text-green-600 focus:ring-green-500"
                      />
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" />
                        <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900">{t.map.trendFalling}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50/50 px-2 py-0.5 rounded-md">{trendStats.turun}</span>
                  </label>

                  <label className="flex justify-between items-center p-2 hover:bg-white rounded-lg cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={trendFilters.tetap}
                        onChange={() => setTrendFilters(f => ({ ...f, tetap: !f.tetap }))}
                        className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                        <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900">{t.map.trendSteady}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-md">{trendStats.tetap}</span>
                  </label>

                  {trendStats.noData > 0 && (
                    <label className="flex justify-between items-center p-2 hover:bg-white rounded-lg cursor-pointer transition-colors group border-t border-gray-100/50 pt-3 mt-1">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={trendFilters.noData}
                          onChange={() => setTrendFilters(f => ({ ...f, noData: !f.noData }))}
                          className="w-3.5 h-3.5 border-gray-300 rounded text-gray-400 focus:ring-gray-300"
                        />
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                          <span className="text-[10px] text-gray-400 font-medium italic group-hover:text-gray-600">{t.map.trendNoData}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">{trendStats.noData}</span>
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Left Legend (dynamic) */}
      <div className={`absolute bottom-4 z-[999] bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100 flex flex-col gap-2 transition-all duration-300 ${isFilterOpen ? 'left-[352px]' : 'left-4'
        }`}>
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
          {viewMode === 'prevalence' ? t.mapLegend.prevalence : 
           viewMode === 'direct_risk' ? t.mapLegend.directRisk : 
           viewMode === 'prevention_risk' ? t.mapLegend.preventionRisk : 
           viewMode === 'maternal_risk' ? t.mapLegend.maternalRisk : 
           viewMode === 'environment_risk' ? t.mapLegend.environmentRisk :
           viewMode === 'trend' ? t.mapLegend.annualTrend :
           t.mapLegend.comprehensiveRisk}
        </h4>
        <div className="flex items-center gap-4 flex-wrap max-w-sm">
          {viewMode === 'trend' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-red-500" />
                <span className="text-[10px] font-medium text-gray-600 whitespace-nowrap">{t.mapLegend.trendRising}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-green-500" />
                <span className="text-[10px] font-medium text-gray-600 whitespace-nowrap">{t.mapLegend.trendFalling}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-blue-500" />
                <span className="text-[10px] font-medium text-gray-600 whitespace-nowrap">{t.mapLegend.trendSteady}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-gray-400" />
                <span className="text-[10px] font-medium text-gray-600 whitespace-nowrap">{t.mapLegend.trendNoComparison}</span>
              </div>
            </>
          ) : (
            clusterResult?.clusterMeta.map((meta, idx) => (
              <div key={meta.id} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md" style={{ backgroundColor: meta.color }} />
                <span className="text-[10px] font-medium text-gray-600 whitespace-nowrap">
                  {meta.label} {thresholds && thresholds[idx-1] !== undefined && thresholds[idx] !== undefined ? `(${thresholds[idx-1]}${unit}–${thresholds[idx]}${unit})` : 
                             thresholds && idx === 0 ? `(<${thresholds[0]}${unit})` : 
                             thresholds && idx === (clusterResult?.bestK || 0) - 1 ? `(>${thresholds[idx-1]}${unit})` : ''}
                </span>
              </div>
            ))
          )}
        </div>
        {clusterResult && viewMode !== 'trend' && (
          <p className="text-[10px] text-blue-500 font-semibold tracking-wide text-center mt-0.5">
            ✦ {t.map.silhouetteOptimization} (K={clusterResult.bestK})
          </p>
        )}
      </div>

      {/* Floating Right Panel (Brief Details) */}
      {selectedRegion && (
        <div className="absolute right-4 top-4 bottom-4 z-[1000] w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
          {isDetailLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-6">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-400 font-sans">{t.map.fetchingRegionData}</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 pb-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    {selectedRegion.name}
                  </h2>
                  <button
                    onClick={() => setSelectedRegion(null)}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 pointer-events-none" />
                  </button>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-blue-600 uppercase">{t.map.prevalence} ({year})</span>
                      <p className="text-3xl font-black text-blue-900 mt-1">
                        {selectedRegion.prevalence > 0 ? `${selectedRegion.prevalence}%` : 'N/A'}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      (selectedRegion.trend === 'naik' || selectedRegion.trend === 'up') ? 'bg-red-100 text-red-700' :
                      (selectedRegion.trend === 'turun' || selectedRegion.trend === 'down') ? 'bg-green-100 text-green-700' :
                      (selectedRegion.trend === 'tetap' || selectedRegion.trend === 'steady') ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                      {t.map.trend} {(selectedRegion.trend === 'naik' || selectedRegion.trend === 'up') ? '↑' : (selectedRegion.trend === 'turun' || selectedRegion.trend === 'down') ? '↓' : (selectedRegion.trend === 'tetap' || selectedRegion.trend === 'steady') ? '—' : '?'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-center">
                      <span className="text-xs text-gray-500">{t.map.casesCount}</span>
                      <p className="text-xl font-bold text-gray-800">
                        {typeof selectedRegion.cases === 'number' ? selectedRegion.cases.toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl text-center">
                      <span className="text-xs text-gray-500">{t.map.status}</span>
                      {(() => {
                        const status = getStatusDisplay(selectedRegion.clusterMeta, selectedRegion.prevalence);
                        return (
                          <p className={`text-sm font-bold mt-1`} style={{ color: status.textColor }}>
                            {status.text}
                          </p>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Cluster badge */}
                  {selectedRegion.clusterMeta && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                        K-Medoids Cluster:
                      </span>
                      <span className="text-xs font-bold capitalize" style={{ color: selectedRegion.clusterMeta.color }}>
                        {selectedRegion.clusterMeta.label}
                      </span>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.map.directRiskFactors}</h4>
                    <div className="space-y-4 pt-2">
                      {[
                        { label: lang === 'id' ? 'BBLR / Prematur' : 'LBW / Premature', value: selectedRegion.factors?.bblr, color: 'bg-red-500', reverse: false },
                        { label: lang === 'id' ? 'Cakupan IMD' : 'EIB Coverage', value: selectedRegion.factors?.imd, color: 'bg-green-500', reverse: true },
                        { label: lang === 'id' ? 'ASI Eksklusif' : 'Exclusive Breastfeeding', value: selectedRegion.factors?.asi, color: 'bg-blue-500', reverse: true },
                      ].map((f) => (
                        <div key={f.label}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-gray-600 font-medium">{f.label}</span>
                            <span className="font-bold text-gray-900">{f.value ?? 0}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${f.color}`} 
                              style={{ width: `${f.value ?? 0}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-4 bg-gray-50 border-t border-gray-100 shrink-0">
                <Link
                  href={`/map/${encodeURIComponent(selectedRegion.name)}`}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-200"
                >
                  {t.map.viewFullDetail}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
