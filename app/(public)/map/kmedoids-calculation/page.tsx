'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calculator, 
  Info, 
  Table, 
  Target, 
  ArrowRight,
  Sigma,
  Box,
  MapPin,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { distance } from '@/lib/kmedoids';
import type { ClusterResult, ClusterLabel } from '@/lib/kmedoids';

export default function KMedoidsCalculationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const year = parseInt(searchParams.get('year') ?? '2024');
  const mode = (searchParams.get('mode') ?? 'prevalence') as 'prevalence' | 'direct_risk' | 'prevention_risk';
  
  const [data, setData] = useState<ClusterResult & { totalRegions: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSimRegion, setSelectedSimRegion] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/clustering?year=${year}&mode=${mode}`);
        if (!res.ok) throw new Error(`Gagal mengambil data clustering (${res.status})`);
        const json = await res.json();
        setData(json);
        // Default simulation to first region
        if (json.scores) {
          setSelectedSimRegion(Object.keys(json.scores)[0]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [year, mode]);

  const modeMetadata = useMemo(() => {
    switch (mode) {
      case 'direct_risk':
        return {
          title: 'Faktor Risiko Langsung',
          indicators: ['BBLR (%)', '100 - IMD (%)', '100 - ASI Eksklusif (%)'],
          formula: 'Dist(A, B) = |BBLR_A - BBLR_B| + |IMD_A - IMD_B| + |ASI_A - ASI_B|',
          description: 'Mengelompokkan wilayah berdasarkan tingkat risiko biologis/langsung pada bayi.'
        };
      case 'prevention_risk':
        return {
          title: 'Faktor Risiko Pencegahan',
          indicators: ['100 - IDL (%)', '100 - Vitamin A (%)'],
          formula: 'Dist(A, B) = |IDL_A - IDL_B| + |VitA_A - VitA_B|',
          description: 'Mengelompokkan wilayah berdasarkan tingkat risiko kegagalan intervensi preventif.'
        };
      default:
        return {
          title: 'Prevalensi Stunting',
          indicators: ['Prevalensi (%)'],
          formula: 'Dist(A, B) = |Prev_A - Prev_B|',
          description: 'Mengelompokkan wilayah berdasarkan persentase kasus stunting yang ditemukan.'
        };
    }
  }, [mode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Menghitung K-Medoids...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border border-red-100">
          <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-900 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-500 text-sm mb-6">{error || 'Data tidak tersedia.'}</p>
          <button onClick={() => router.back()} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Sticky */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-200/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-1.5 py-0.5 rounded">Metodologi K-Medoids</span>
              </div>
              <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                Detail Perhitungan ({year})
              </h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Mode Aktif</p>
                <p className="text-xs font-black text-gray-800">{modeMetadata.title}</p>
             </div>
             <div className="h-8 w-px bg-gray-100" />
             <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Silhouette Score</p>
                <p className={`text-xs font-black ${data.silhouetteScore > 0.5 ? 'text-green-600' : 'text-orange-600'}`}>
                  {data.silhouetteScore.toFixed(4)}
                </p>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-10">
        
        {/* Step 1: Penyiapan Data */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-200">1</div>
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Penyiapan Vektor Fitur</h2>
              <p className="text-xs text-gray-500 font-medium">{modeMetadata.description}</p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">No</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Wilayah</th>
                    {modeMetadata.indicators.map(ind => (
                      <th key={ind} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{ind}</th>
                    ))}
                    <th className="px-6 py-4 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50/50">Vektor [X, Y, ...]</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {Object.entries(data.scores).slice(0, 5).map(([name, score], idx) => (
                    <tr key={name} className="border-b border-gray-50 hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-400">{idx + 1}</td>
                      <td className="px-6 py-4 font-black text-gray-800">{name}</td>
                      {Array.isArray(score) ? score.map((s, i) => (
                        <td key={i} className="px-6 py-4 font-medium text-gray-600">{s}</td>
                      )) : (
                        <td className="px-6 py-4 font-medium text-gray-600">{score}</td>
                      )}
                      <td className="px-6 py-4 bg-blue-50/30">
                        <code className="text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-1 rounded-lg">
                          [{Array.isArray(score) ? score.join(', ') : score}]
                        </code>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/30">
                    <td colSpan={modeMetadata.indicators.length + 3} className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                      ... Menampilkan 5 dari {data.totalRegions} Wilayah ...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Step 2: Inisialisasi Medoid */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-200">2</div>
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Seleksi Medoid Final</h2>
              <p className="text-xs text-gray-500 font-medium">Titik pusat representative hasil iterasi PAM (Partitioning Around Medoids).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Rendah', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', value: data.medoids[0] },
              { label: 'Menengah', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', value: data.medoids[1] },
              { label: 'Tinggi', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', value: data.medoids[2] },
            ].map((m) => (
              <div key={m.label} className={`p-6 rounded-[2rem] border ${m.bg} ${m.border} shadow-lg shadow-slate-100 transition-all hover:-translate-y-1`}>
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${m.color}`}>Cluster {m.label}</span>
                  <div className={`p-2 rounded-xl bg-white shadow-sm ${m.color}`}>
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-tighter">Vektor Medoid</p>
                <div className="text-2xl font-black text-slate-800 tracking-tighter">
                  [{Array.isArray(m.value) ? m.value.join(', ') : m.value}]
                </div>
                <div className="mt-4 pt-4 border-t border-white/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Anggota</span>
                  <span className="text-sm font-black text-slate-700">{data.clusterStats[m.label.toLowerCase() as ClusterLabel].count} Wilayah</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step 3: Simulasi Perhitungan */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-orange-200">3</div>
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Simulasi Jarak Manhattan</h2>
              <p className="text-xs text-gray-500 font-medium">Bagaimana satu wilayah menentukan klasternya berdasarkan jarak terdekat ke medoid.</p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Selector & Raw Info */}
              <div className="w-full md:w-1/3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Pilih Wilayah Simulasi</label>
                <div className="relative mb-6">
                  <select 
                    value={selectedSimRegion || ''} 
                    onChange={(e) => setSelectedSimRegion(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-gray-900 font-black text-sm rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    {Object.keys(data.scores).sort().map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {selectedSimRegion && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Input Vektor</p>
                        <p className="text-sm font-black text-gray-800">{selectedSimRegion}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                       {modeMetadata.indicators.map((ind, i) => (
                         <div key={ind} className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium">{ind}</span>
                            <span className="font-black text-gray-800">
                              {Array.isArray(data.scores[selectedSimRegion]) 
                                ? (data.scores[selectedSimRegion] as number[])[i] 
                                : data.scores[selectedSimRegion]}
                            </span>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Math Display */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Sigma className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rumus Manhattan Distance</span>
                </div>
                <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl font-mono text-sm mb-8 overflow-x-auto">
                   <div className="text-blue-400 opacity-60 mb-2"># {modeMetadata.formula}</div>
                   <div className="space-y-4">
                      {selectedSimRegion && (
                        ['rendah', 'menengah', 'tinggi'].map((label, idx) => {
                          const medVector = data.medoids[idx];
                          const regVector = data.scores[selectedSimRegion];
                          const distValue = distance(
                            Array.isArray(regVector) ? regVector : [regVector],
                            Array.isArray(medVector) ? medVector : [medVector]
                          );

                          return (
                            <div key={label} className="flex flex-col gap-1">
                               <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Dist to</span>
                                  <span className="text-white font-bold capitalize">{label}:</span>
                               </div>
                               <div className="text-xs overflow-wrap-anywhere">
                                  Σ |[{Array.isArray(regVector) ? regVector.join(', ') : regVector}] - [{Array.isArray(medVector) ? medVector.join(', ') : medVector}]| = 
                                  <span className="text-yellow-400 font-bold ml-2">{distValue.toFixed(2)}</span>
                               </div>
                            </div>
                          )
                        })
                      )}
                   </div>
                </div>

                {selectedSimRegion && (
                  <div className="flex items-center gap-4 p-5 bg-blue-50 border border-blue-100 rounded-3xl">
                     <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                        <Box className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Hasil Klasifikasi</p>
                        <p className="text-sm font-medium text-gray-700 leading-relaxed">
                          Jarak terendah adalah ke medoid <b className="text-blue-700 capitalize">{data.clusters[selectedSimRegion]}</b>. 
                          Maka, <b className="text-gray-900">{selectedSimRegion}</b> ditetapkan masuk ke cluster 
                          <span className={`ml-2 px-3 py-1 rounded-full text-[10px] font-black uppercase text-white ${
                            data.clusters[selectedSimRegion] === 'tinggi' ? 'bg-red-500' : 
                            data.clusters[selectedSimRegion] === 'menengah' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}>
                            {data.clusters[selectedSimRegion]}
                          </span>
                        </p>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Global Stats Footer */}
        <footer className="pt-10 flex flex-col md:flex-row items-center gap-6 justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
           <div className="flex items-center gap-6">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Sigma className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Avg Cluster Silhouette</p>
                    <p className="text-xl font-black text-gray-900">{data.silhouetteScore.toFixed(4)}</p>
                 </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <LayoutDashboard className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Total Entitas</p>
                    <p className="text-xl font-black text-gray-900">{data.totalRegions} Wilayah</p>
                 </div>
              </div>
           </div>
           
           <Link 
            href="/map" 
            className="group flex items-center gap-3 bg-gray-900 text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 hover:shadow-blue-200"
          >
             Selesai & Tutup
             <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </Link>
        </footer>

      </div>
    </div>
  );
}
