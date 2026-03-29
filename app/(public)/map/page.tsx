'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Info, MapPin, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import type { EastJavaMapProps } from '@/components/map/EastJavaMap';

const EastJavaMap = dynamic<EastJavaMapProps>(() => import('@/components/map/EastJavaMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/50 animate-pulse">
      <span className="text-gray-500 font-medium tracking-wider">Memuat Peta Jawa Timur...</span>
    </div>
  ),
});

import { createClient } from '@/utils/supabase/client';
import type { ClusterResult } from '@/lib/kmedoids';

export default function MapPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [year, setYear] = useState(2024);
  const [years, setYears] = useState<number[]>([2019, 2020, 2021, 2022, 2023, 2024]);
  const [prevalenceFilters, setPrevalenceFilters] = useState({
    tinggi: true,
    menengah: true,
    rendah: true,
  });
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // K-Medoids cluster result for the current year
  const [clusterResult, setClusterResult] = useState<ClusterResult | null>(null);
  const [isClusterLoading, setIsClusterLoading] = useState(false);

  // Fetch available years from DB
  useEffect(() => {
    const fetchYears = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('stunting_data')
        .select('year')
        .order('year', { ascending: false });

      if (data && data.length > 0) {
        const uniqueYears = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);
        setYears(uniqueYears);
        const latestYear = uniqueYears[uniqueYears.length - 1];
        if (latestYear) setYear(latestYear);
      }
    };
    fetchYears();
  }, []);

  // Fetch K-Medoids clustering results whenever year changes
  useEffect(() => {
    const fetchClusters = async () => {
      setIsClusterLoading(true);
      try {
        const res = await fetch(`/api/clustering?year=${year}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ClusterResult & { year: number; totalRegions: number } = await res.json();
        setClusterResult(data);
      } catch (err) {
        console.error('[MapPage] Failed to load cluster data:', err);
        setClusterResult(null);
      } finally {
        setIsClusterLoading(false);
      }
    };
    fetchClusters();
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

        let skorLangsung = 0;
        if (currentFactors) {
          const bblr = currentFactors.bblr_rate || 0;
          const imd = currentFactors.imd_rate || 0;
          const asi = currentFactors.asi_rate || 0;
          skorLangsung = Math.round((bblr + (100 - imd) + (100 - asi)) / 3);
        }

        let trend = 'tetap';
        if (currentStunting && prevStunting) {
          trend = currentStunting.prevalence > prevStunting.prevalence ? 'naik' : 'turun';
        }

        // Determine cluster label from K-Medoids result
        const clusterLabel = clusterResult?.clusters?.[regionData.name] ?? null;

        setSelectedRegion({
          name: regionData.name,
          prevalence: currentStunting?.prevalence || 0,
          cases: currentStunting?.stunting_cases ?? null,
          trend,
          clusterLabel,
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

  // Helper: status label + color from K-Medoids cluster label
  const getStatusDisplay = (clusterLabel: string | null, prevalence: number) => {
    if (clusterLabel === 'tinggi') return { text: 'Sangat Rawan', color: 'text-red-500' };
    if (clusterLabel === 'menengah') return { text: 'Cukup Rawan', color: 'text-yellow-600' };
    if (clusterLabel === 'rendah') return { text: 'Aman', color: 'text-green-600' };
    // Fallback if no cluster data
    if (prevalence > 20) return { text: 'Sangat Rawan', color: 'text-red-500' };
    if (prevalence > 14) return { text: 'Cukup Rawan', color: 'text-yellow-600' };
    if (prevalence > 0) return { text: 'Aman', color: 'text-green-600' };
    return { text: 'Belum Ada Data', color: 'text-gray-400' };
  };

  // Dynamic legend labels from K-Medoids thresholds
  const thresholds = clusterResult?.thresholds;
  const legendLabels = {
    tinggi: thresholds ? `> ${thresholds.menengahMax}%` : '> 20%',
    menengah: thresholds
      ? `${thresholds.rendahMax}% – ${thresholds.menengahMax}%`
      : '14% – 20%',
    rendah: thresholds ? `< ${thresholds.rendahMax}%` : '< 14%',
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
      {/* Full Background Map */}
      <Suspense fallback={<div>Loading...</div>}>
        <EastJavaMap
          selectedRegion={selectedRegion?.name}
          setSelectedRegion={handleSelectRegion}
          year={year}
          searchQuery={searchQuery}
          prevalenceFilters={prevalenceFilters}
          clusterData={clusterResult?.clusters ?? null}
        />
      </Suspense>

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

        <div className="p-5 flex-1 flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            Filter Data
          </h2>

          <div className="space-y-6 flex-1 overflow-y-auto pr-1">
            {/* 1. Search Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pencarian</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari wilayah atau lainnya"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                />
              </div>
            </div>

            {/* 2. Year Slider */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun: {year}</label>
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

            {/* 3. Prevalence Checkboxes — labels are dynamic from K-Medoids thresholds */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Tingkat Prevalensi</label>
                {isClusterLoading && (
                  <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              {/* Badge: K-Medoids active */}
              <div className="mb-2 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                <span className="text-[10px] text-blue-600 font-semibold tracking-wide">
                  Klasifikasi K-Medoids {clusterResult ? `(${year})` : '— memuat...'}
                </span>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={prevalenceFilters.tinggi}
                    onChange={() => setPrevalenceFilters(f => ({ ...f, tinggi: !f.tinggi }))}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-sm text-gray-700">Tinggi ({legendLabels.tinggi})</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={prevalenceFilters.menengah}
                    onChange={() => setPrevalenceFilters(f => ({ ...f, menengah: !f.menengah }))}
                    className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <span className="text-sm text-gray-700">Menengah ({legendLabels.menengah})</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={prevalenceFilters.rendah}
                    onChange={() => setPrevalenceFilters(f => ({ ...f, rendah: !f.rendah }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-700">Rendah ({legendLabels.rendah})</span>
                  </div>
                </label>
              </div>
            </div>

            {/* K-Medoids Medoid Info (collapsible info card) */}
            {clusterResult?.medoids && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Nilai Medoid K-Medoids ({year})
                </p>
                <div className="space-y-1">
                  {[
                    { label: 'Rendah', color: 'bg-green-400', value: clusterResult.medoids[0] },
                    { label: 'Menengah', color: 'bg-yellow-400', value: clusterResult.medoids[1] },
                    { label: 'Tinggi', color: 'bg-red-400', value: clusterResult.medoids[2] },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${m.color}`} />
                        <span className="text-gray-600">{m.label}</span>
                      </div>
                      <span className="font-bold text-gray-800">{m.value?.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Left Legend (dynamic) */}
      <div className={`absolute bottom-4 z-[999] bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100 flex flex-col gap-2 transition-all duration-300 ${isFilterOpen ? 'left-[352px]' : 'left-4'
        }`}>
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">Keterangan Prevalensi</h4>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 bg-red-500 rounded-md" />
            <span className="text-xs font-medium text-gray-600">{legendLabels.tinggi}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 bg-yellow-400 rounded-md" />
            <span className="text-xs font-medium text-gray-600">{legendLabels.menengah}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 bg-green-500 rounded-md" />
            <span className="text-xs font-medium text-gray-600">{legendLabels.rendah}</span>
          </div>
        </div>
        {clusterResult && (
          <p className="text-[10px] text-blue-500 font-semibold tracking-wide text-center mt-0.5">
            ✦ Diklasifikasikan oleh K-Medoids
          </p>
        )}
      </div>

      {/* Floating Right Panel (Brief Details) */}
      {selectedRegion && (
        <div className="absolute right-4 top-4 bottom-4 z-[1000] w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col justify-between">
          {isDetailLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-400 font-sans">Mengambil Data Wilayah...</p>
            </div>
          ) : (
            <>
              <div>
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
                      <span className="text-xs font-semibold text-blue-600 uppercase">Prevalensi ({year})</span>
                      <p className="text-3xl font-black text-blue-900 mt-1">
                        {selectedRegion.prevalence > 0 ? `${selectedRegion.prevalence}%` : 'N/A'}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${selectedRegion.trend === 'naik' ? 'bg-red-100 text-red-700' :
                      selectedRegion.trend === 'turun' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                      Trend {selectedRegion.trend === 'naik' ? '↑' : selectedRegion.trend === 'turun' ? '↓' : '—'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-center">
                      <span className="text-xs text-gray-500">Jumlah Kasus</span>
                      <p className="text-xl font-bold text-gray-800">
                        {typeof selectedRegion.cases === 'number' ? selectedRegion.cases.toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl text-center">
                      <span className="text-xs text-gray-500">Status</span>
                      {(() => {
                        const status = getStatusDisplay(selectedRegion.clusterLabel, selectedRegion.prevalence);
                        return (
                          <p className={`text-sm font-bold mt-1 ${status.color}`}>
                            {status.text}
                          </p>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Cluster badge */}
                  {selectedRegion.clusterLabel && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                        K-Medoids Cluster:
                      </span>
                      <span className={`text-xs font-bold capitalize ${selectedRegion.clusterLabel === 'tinggi' ? 'text-red-600' :
                        selectedRegion.clusterLabel === 'menengah' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                        {selectedRegion.clusterLabel}
                      </span>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Faktor Risiko Langsung</h4>
                    <div className="space-y-4 pt-2">
                      {[
                        { label: 'BBLR / Prematur', value: selectedRegion.factors?.bblr, color: 'bg-red-500', reverse: false },
                        { label: 'Cakupan IMD', value: selectedRegion.factors?.imd, color: 'bg-green-500', reverse: true },
                        { label: 'ASI Eksklusif', value: selectedRegion.factors?.asi, color: 'bg-blue-500', reverse: true },
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

              <div className="mt-8">
                <Link
                  href={`/map/${encodeURIComponent(selectedRegion.name)}`}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-200"
                >
                  Lihat detail lengkap
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
