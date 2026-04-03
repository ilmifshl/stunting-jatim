'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Calculator,
  Info,
  Target,
  ArrowRight,
  Sigma,
  Box,
  MapPin,
  ChevronDown,
  LayoutDashboard,
  CircleQuestionMark,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { distance } from '@/lib/kmedoids';
import type { ClusterResult } from '@/lib/kmedoids';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function KMedoidsCalculationPage() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  const year = parseInt(searchParams.get('year') ?? '2024');
  const mode = (searchParams.get('mode') ?? 'prevalence') as any;

  const [data, setData] = useState<ClusterResult & { totalRegions: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSimRegion, setSelectedSimRegion] = useState<string | null>(null);

  const translateClusterLabel = (label: string) => {
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
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/clustering?year=${year}&mode=${mode}`);
        if (!res.ok) throw new Error(`${t.calculation.error} (${res.status})`);
        const json: ClusterResult = await res.json();
        
        // Translate labels in meta
        const translatedMeta = json.clusterMeta.map(m => ({
          ...m,
          label: translateClusterLabel(m.label)
        }));
        
        setData({ ...json, clusterMeta: translatedMeta } as any);
        // Default simulation to first region
        if (json.scores) {
          setSelectedSimRegion(Object.keys(json.scores).sort()[0]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [year, mode, t]);

  const modeMetadata = useMemo(() => {
    switch (mode) {
      case 'direct_risk':
        return {
          title: t.factors.directRisk,
          indicators: ['BBLR (%)', '100 - IMD (%)', '100 - ASI Eksklusif (%)'],
          formula: 'Dist(A, B) = |BBLR_A - BBLR_B| + |IMD_A - IMD_B| + |ASI_A - ASI_B|',
          description: t.factors.directRiskDesc
        };
      case 'prevention_risk':
        return {
          title: t.factors.effectivePrevention,
          indicators: ['100 - IDL (%)', '100 - Vitamin A (%)'],
          formula: 'Dist(A, B) = |IDL_A - IDL_B| + |VitA_A - VitA_B|',
          description: t.factors.effectivePreventionDesc
        };
      case 'maternal_risk':
        return {
          title: t.factors.maternalHealth,
          indicators: ['100 - TTD 90 (%)', '100 - Layanan Catin (%)'],
          formula: 'Dist(A, B) = |TTD_A - TTD_B| + |Catin_A - Catin_B|',
          description: t.factors.maternalHealthDesc
        };
      case 'environment_risk':
        return {
          title: t.factors.environment,
          indicators: ['100 - Jamban Sehat (%)', '100 - SBS/STBM (%)'],
          formula: 'Dist(A, B) = |Jamban_A - Jamban_B| + |STBM_A - STBM_B|',
          description: t.factors.environmentDesc
        };
      case 'comprehensive_risk':
        return {
          title: lang === 'id' ? 'Komprehensif (Semua Faktor)' : 'Comprehensive (All Factors)',
          indicators: ['Prev', 'BBLR', 'IMD', 'ASI', 'IDL', 'VitA', 'TTD', 'Catin', 'Jamban', 'STBM'],
          formula: 'Dist(A, B) = Σ |Indikator_A - Indikator_B| (10 Dimensi)',
          description: lang === 'id' ? 'Analisis menyeluruh menggabungkan prevalensi stunting dengan seluruh 9 faktor risiko.' : 'Comprehensive analysis combining stunting prevalence with all 9 risk factors.'
        };
      default:
        return {
          title: t.mapLegend.prevalence,
          indicators: ['Prevalensi (%)'],
          formula: 'Dist(A, B) = |Prev_A - Prev_B|',
          description: lang === 'id' ? 'Mengelompokkan wilayah berdasarkan persentase kasus stunting yang ditemukan.' : 'Grouping regions based on the percentage of stunting cases found.'
        };
    }
  }, [mode, t, lang]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t.calculation.calculating}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border border-red-100">
          <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-900 mb-2">{t.calculation.error}</h2>
          <p className="text-gray-500 text-sm mb-6">{error || t.mapLegend.noData}</p>
          <button onClick={() => router.back()} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest">{t.common.back}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Sticky */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-50">
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
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-1.5 py-0.5 rounded">{t.calculation.methodology}</span>
              </div>
              <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                {t.calculation.title} ({year})
              </h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'id' ? 'Mode Aktif' : 'Active Mode'}</p>
              <p className="text-xs font-black text-gray-800">{modeMetadata.title}</p>
            </div>
            <div className="h-8 w-px bg-gray-100" />
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Silhouette ({lang === 'id' ? 'Optimal K' : 'Optimal K'}={data.bestK})</p>
              <p className={`text-xs font-black ${data.silhouetteScore > 0.5 ? 'text-green-600' : 'text-orange-600'}`}>
                {data.silhouetteScore.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-12">

        {/* New Step 1: Evaluasi K */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-emerald-200">1</div>
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{t.calculation.silhouetteTitle}</h2>
              <p className="text-xs text-gray-500 font-medium">{t.calculation.silhouetteDesc}</p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {t.calculation.silhouetteDetail}
                </p>
                <div className="space-y-3">
                  {data.allKResults.map((res) => (
                    <div key={res.k} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${res.k === data.bestK ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500 ring-offset-2' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-black ${res.k === data.bestK ? 'text-emerald-700' : 'text-gray-400'}`}>K = {res.k}</span>
                        {res.k === data.bestK && (
                          <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter flex items-center gap-1">
                            <Award className="w-3 h-3" /> {t.calculation.optimalK}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full ${res.k === data.bestK ? 'bg-emerald-500' : 'bg-gray-400'}`}
                            style={{ width: `${Math.max(0, res.silhouetteScore * 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-black ${res.k === data.bestK ? 'text-emerald-700' : 'text-gray-600'}`}>
                          {res.silhouetteScore.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 mb-4">
                  <CircleQuestionMark className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  {t.calculation.whyK.replace('{k}', data.bestK.toString())}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  {t.calculation.whyKDesc.replace('{year}', year.toString()).replace('{k}', data.bestK.toString())}
                </p>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{t.calculation.inputK}</p>
                    <p className="text-2xl font-black text-gray-900">2-7</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase">{t.calculation.selectedK}</p>
                    <p className="text-2xl font-black text-emerald-600">{data.bestK}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Penyiapan Data */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-200">2</div>
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{t.calculation.vectorTitle}</h2>
              <p className="text-xs text-gray-500 font-medium">{modeMetadata.description}</p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">No</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.calculation.wilayah}</th>
                    {modeMetadata.indicators.map(ind => (
                      <th key={ind} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{ind}</th>
                    ))}
                    <th className="px-6 py-4 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50/50">{t.calculation.vektor} [X, Y, ...]</th>
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
                      ... {lang === 'id' ? `Menampilkan 5 dari ${data.totalRegions} Wilayah` : `Showing 5 of ${data.totalRegions} Regions`} ...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Step 3: Inisialisasi Medoid */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-200">3</div>
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                {t.calculation.medoidSelection.replace('{k}', data.bestK.toString())}
              </h2>
              <p className="text-xs text-gray-500 font-medium">{t.calculation.medoidDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.clusterMeta.map((meta) => (
              <div key={meta.id} className="p-6 rounded-[2rem] border bg-white border-gray-100 shadow-xl shadow-slate-100 transition-all hover:-translate-y-1">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-800">{meta.label}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 shadow-sm text-indigo-600">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tighter">{t.calculation.medoidVector}</p>
                <div className="text-xl font-black text-slate-800 tracking-tighter truncate">
                  [{Array.isArray(meta.medoid) ? meta.medoid.join(', ') : meta.medoid}]
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t.calculation.members}</span>
                  <span className="text-sm font-black text-slate-700">{meta.count} {t.calculation.wilayah}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step 4: Simulasi Perhitungan */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-orange-200">4</div>
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{t.calculation.manhattanTitle}</h2>
              <p className="text-xs text-gray-500 font-medium">{t.calculation.manhattanDesc.replace('{k}', data.bestK.toString())}</p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Selector & Raw Info */}
              <div className="w-full md:w-1/3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.calculation.selectReg}</label>
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
                        <p className="text-[10px] font-black text-gray-400 uppercase">{t.calculation.inputVector}</p>
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
                      {/* Added Average Score to match map tooltip */}
                      {Array.isArray(data.scores[selectedSimRegion]) && (
                        <div className="pt-3 border-t border-slate-200 mt-2 flex justify-between items-center text-xs">
                          <span className="text-blue-600 font-bold uppercase tracking-tighter">{t.calculation.avgScore}</span>
                          <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {((data.scores[selectedSimRegion] as number[]).reduce((a, b) => a + b, 0) / (data.scores[selectedSimRegion] as number[]).length).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Math Display */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Sigma className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.calculation.formulaTitle}</span>
                </div>
                <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl font-mono text-sm mb-8 overflow-x-auto">
                  <div className="text-blue-400 opacity-60 mb-2"># {modeMetadata.formula}</div>
                  <div className="space-y-4">
                    {selectedSimRegion && (
                      data.clusterMeta.map((meta) => {
                        const medVector = meta.medoid;
                        const regVector = data.scores[selectedSimRegion];
                        const distValue = distance(
                          Array.isArray(regVector) ? regVector : [regVector],
                          Array.isArray(medVector) ? medVector : [medVector]
                        );

                        return (
                          <div key={meta.id} className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                              <span className="text-white font-bold capitalize">{meta.label}:</span>
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
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{t.calculation.resultTitle}</p>
                      <p className="text-sm font-medium text-gray-700 leading-relaxed">
                        {(() => {
                          const clusterIdx = parseInt(data.clusters[selectedSimRegion]);
                          const medVector = data.clusterMeta[clusterIdx].medoid;
                          const regVector = data.scores[selectedSimRegion];
                          const distValue = distance(
                            Array.isArray(regVector) ? regVector : [regVector],
                            Array.isArray(medVector) ? medVector : [medVector]
                          );
                          const label = data.clusterMeta[clusterIdx].label;
                          const color = data.clusterMeta[clusterIdx].color;
                          
                          return t.calculation.resultDesc
                            .split(/(\{dist\}|\{label\}|\{region\}|\{target\})/g)
                            .map((part: string, i: number) => {
                              if (part === '{dist}') return <b key={i} className="text-blue-600">{distValue.toFixed(2)}</b>;
                              if (part === '{label}') return <b key={i}>{label}</b>;
                              if (part === '{region}') return <b key={i}>{selectedSimRegion}</b>;
                              if (part === '{target}') return (
                                <span key={i} className="ml-2 px-3 py-1 rounded-full text-[10px] font-black uppercase text-white" style={{ backgroundColor: color }}>
                                  {label}
                                </span>
                              );
                              return part;
                            });
                        })()}
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
                <p className="text-[10px] font-black text-gray-400 uppercase">{lang === 'id' ? 'Skor Silhouette Global' : 'Global Silhouette Score'}</p>
                <p className="text-xl font-black text-gray-900">{data.silhouetteScore.toFixed(4)}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">{t.calculation.selectedK}</p>
                <p className="text-xl font-black text-gray-900">{data.bestK} {lang === 'id' ? 'Kelompok' : 'Groups'}</p>
              </div>
            </div>
          </div>

          <Link
            href="/map"
            className="group flex items-center gap-3 bg-gray-900 text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 hover:shadow-blue-200"
          >
            {t.calculation.finished}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </footer>

      </div>
    </div>
  );
}
