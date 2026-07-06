'use client';

import { useState, useEffect } from 'react';
import { FileText as FileTextIcon, Printer as PrinterIcon, Download as DownloadIcon, ArrowLeft as ArrowLeftIcon, Search as SearchIcon, CheckCircle2 as CheckIcon, AlertTriangle as AlertIcon, Info as InfoIcon, MapPin as MapPinIcon, BarChart2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

interface ClusterData {
  clusters: Record<string, string>;
  clusterMeta: Array<{
    id: string;
    label: string;
    color: string;
  }>;
}

interface YearlyData {
  [year: number]: ClusterData | null;
}

type ViewMode = 'prevalence' | 'comprehensive_risk';

export default function RekapKlasterPage() {
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('prevalence');
  const [data, setData] = useState<YearlyData>({
    2022: null,
    2023: null,
    2024: null,
  });
  const [allRegions, setAllRegions] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const years = [2022, 2023, 2024];
        const results = await Promise.all(
          years.map(year =>
            fetch(`/api/clustering?year=${year}&mode=${viewMode}`)
              .then(res => res.ok ? res.json() : null)
              .catch(() => null)
          )
        );

        const newData: YearlyData = {};
        const regionsSet = new Set<string>();

        results.forEach((res, index) => {
          const year = years[index];
          if (res && res.success) {
            newData[year] = {
              clusters: res.clusters,
              clusterMeta: res.clusterMeta,
            };
            Object.keys(res.clusters).forEach(reg => regionsSet.add(reg));
          } else {
            newData[year] = null;
          }
        });

        setData(newData);
        setAllRegions(Array.from(regionsSet).sort());
      } catch (error) {
        console.error('Failed to fetch clustering data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [viewMode]);

  const filteredRegions = allRegions.filter(region =>
    region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getClusterDisplay = (year: number, region: string) => {
    const yearData = data[year];
    if (!yearData) return null;

    const clusterId = yearData.clusters[region];
    if (clusterId === undefined) return null;

    const meta = yearData.clusterMeta.find(m => m.id === clusterId);
    return meta || null;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const modeName = viewMode === 'prevalence' ? 'Prevalensi' : 'Komprehensif';
    const headers = ['No', 'Kabupaten/Kota', `Cluster 2022 (${modeName})`, `Cluster 2023 (${modeName})`, `Cluster 2024 (${modeName})`];
    const rows = filteredRegions.map((region, index) => {
      const c2022 = getClusterDisplay(2022, region)?.label || '-';
      const c2023 = getClusterDisplay(2023, region)?.label || '-';
      const c2024 = getClusterDisplay(2024, region)?.label || '-';
      return [index + 1, region, c2022, c2023, c2024];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap_klaster_${viewMode}_jatim_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-100 pt-10 pb-12 print:pt-4 print:pb-8 print:border-b-2 print:border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Link
                href="/map"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors print:hidden"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                {t.common.back} {lang === 'id' ? 'ke Peta' : 'to Map'}
              </Link>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-2xl print:hidden">
                  <FileTextIcon className="w-8 h-8 text-white" />
                </div>
                {t.rekapKlaster.title}
              </h1>
              <p className="text-lg text-gray-500 max-w-2xl font-medium leading-relaxed">
                {t.rekapKlaster.subtitle}
              </p>
            </div>

            <div className="flex gap-3 print:hidden">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
              >
                <DownloadIcon className="w-4 h-4" />
                {t.rekapKlaster.exportCSV}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
              >
                <PrinterIcon className="w-4 h-4" />
                {t.rekapKlaster.printReport}
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="mt-10 flex bg-gray-100/50 p-1.5 rounded-2xl w-fit print:hidden">
            <button
              onClick={() => setViewMode('prevalence')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'prevalence'
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-100'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {t.rekapKlaster.modePrevalence}
            </button>
            <button
              onClick={() => setViewMode('comprehensive_risk')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'comprehensive_risk'
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-100'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {t.rekapKlaster.modeComprehensive}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 print:mt-0">
        {/* Stats Summary / Legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-white flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
              <MapPinIcon className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t.home.monitoredRegions}</p>
              <p className="text-3xl font-black text-gray-900">{allRegions.length}</p>
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-white">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <InfoIcon className="w-4 h-4 text-blue-500" />
              {t.rekapKlaster.clusterInfo} ({viewMode === 'prevalence' ? t.rekapKlaster.modePrevalence : t.rekapKlaster.modeComprehensive})
            </p>
            <div className="flex flex-wrap gap-4">
              {data[2024]?.clusterMeta.map(m => (
                <div key={m.id} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-xs font-bold text-gray-700">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 print:hidden">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder={t.map.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/30 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium"
            />
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/60 border border-white overflow-hidden print:shadow-none print:border-gray-200">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-gray-400 font-bold animate-pulse">{t.rekapKlaster.loadingData}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest w-16">{t.rekapKlaster.tableNo}</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">{t.rekapKlaster.tableRegion}</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">2022</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">2023</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">2024</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRegions.map((region, idx) => (
                    <tr key={region} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-300 group-hover:text-blue-400 transition-colors">{idx + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-blue-100 rounded-full group-hover:bg-blue-500 transition-all opacity-0 group-hover:opacity-100 -ml-1" />
                          <span className="font-bold text-gray-900">{region}</span>
                        </div>
                      </td>
                      {[2022, 2023, 2024].map(year => {
                        const cluster = getClusterDisplay(year, region);
                        return (
                          <td key={year} className="px-6 py-4 text-center">
                            {cluster ? (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all"
                                style={{
                                  backgroundColor: `${cluster.color}10`,
                                  borderColor: `${cluster.color}30`,
                                  color: cluster.color
                                }}
                              >
                                <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: cluster.color }} />
                                <span className="text-xs font-bold leading-none">{cluster.label}</span>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-gray-300 italic">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {!loading && (
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-500" />
              {t.rekapKlaster.lastUpdated}: {new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <AlertIcon className="w-4 h-4 text-amber-500" />
              {lang === 'id'
                ? `Klasterisasi Relatif Berbasis ${viewMode === 'prevalence' ? 'Prevalensi' : 'Risiko Komprehensif'}`
                : `Relative Clustering based on ${viewMode === 'prevalence' ? 'Prevalence' : 'Comprehensive Risk'}`}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          nav, .print\\:hidden {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .max-w-7xl {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          .rounded-\\[32px\\] {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
