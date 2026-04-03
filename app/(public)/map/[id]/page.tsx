'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowLeft, MapPin, TrendingDown, TrendingUp, Users,
  AlertTriangle, Droplet, Info, LayoutDashboard,
  Baby, Heart, ShieldCheck, Home, GlassWater, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import AdminTrendChart from '@/components/admin/AdminTrendChart';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const colorStyles: { [key: string]: any } = {
  blue: {
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
    btnHover: 'hover:bg-blue-50 hover:text-blue-600',
    storyBg: 'bg-blue-50/30',
    storyBorder: 'border-blue-100',
    storyIconText: 'text-blue-600',
    storyIconBorder: 'border-blue-100',
  },
  amber: {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    btnHover: 'hover:bg-amber-50 hover:text-amber-600',
    storyBg: 'bg-amber-50/30',
    storyBorder: 'border-amber-100',
    storyIconText: 'text-amber-600',
    storyIconBorder: 'border-amber-100',
  },
  rose: {
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-600',
    btnHover: 'hover:bg-rose-50 hover:text-rose-600',
    storyBg: 'bg-rose-50/30',
    storyBorder: 'border-rose-100',
    storyIconText: 'text-rose-600',
    storyIconBorder: 'border-rose-100',
  },
  emerald: {
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
    btnHover: 'hover:bg-emerald-50 hover:text-emerald-600',
    storyBg: 'bg-emerald-50/30',
    storyBorder: 'border-emerald-100',
    storyIconText: 'text-emerald-600',
    storyIconBorder: 'border-emerald-100',
  }
};

export default function RegionDetailPage() {
  const { lang, t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const regionName = params.id ? decodeURIComponent(params.id as string) : (lang === 'id' ? 'Wilayah' : 'Region');

  const [activeYear, setActiveYear] = useState(2024);
  const [availableYears, setAvailableYears] = useState<number[]>([2024, 2023, 2022]);
  const [regionData, setRegionData] = useState<any>(null);
  const [stuntingHistory, setStuntingHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiStory, setAiStory] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [sectorStories, setSectorStories] = useState<{ [key: string]: string }>({});
  const [isSectorLoading, setIsSectorLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();

        // 1. Fetch Region and Data for all available years
        const { data: region, error: regionError } = await supabase
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
              *
            )
          `)
          .eq('name', regionName)
          .single();

        if (regionError || !region) throw regionError || new Error(lang === 'id' ? 'Wilayah tidak ditemukan' : 'Region not found');

        setRegionData(region);

        // Prepare history for chart
        const history = (region.stunting_data || [])
          .sort((a: any, b: any) => a.year - b.year)
          .map((d: any) => ({
            year: d.year.toString(),
            prevalence: d.prevalence
          }));
        setStuntingHistory(history);

        // Get unique years from factors
        const factorYears = Array.from(new Set((region.stunting_factors || []).map((f: any) => f.year)))
          .sort((a: any, b: any) => b - a) as number[];

        if (factorYears.length > 0) {
          setAvailableYears(factorYears);
          if (!factorYears.includes(activeYear)) {
            setActiveYear(factorYears[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching region details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [regionName]);

  const handleGenerateAiStory = async () => {
    setIsAiLoading(true);
    setAiStory(null);
    try {
      const response = await fetch('/api/ai/storytelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regionName, year: activeYear, language: lang }),
      });
      const data = await response.json();
      if (data.story) {
        setAiStory(data.story);
      } else {
        throw new Error(data.error || (lang === 'id' ? 'Gagal mengambil cerita' : 'Failed to get story'));
      }
    } catch (err) {
      console.error('AI Error:', err);
      setAiStory(lang === 'id' 
        ? 'Maaf, saat ini sistem tidak bisa menghasilkan analisis AI. Pastikan API Key sudah terkonfigurasi.' 
        : 'Sorry, the system cannot generate AI analysis at this time. Please ensure the API Key is configured.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateSectorStory = async (category: string, categoryData: any) => {
    setIsSectorLoading(prev => ({ ...prev, [category]: true }));
    try {
      const response = await fetch('/api/ai/storytelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regionName,
          year: activeYear,
          category,
          categoryData,
          language: lang
        }),
      });
      const data = await response.json();
      if (data.story) {
        setSectorStories(prev => ({ ...prev, [category]: data.story }));
      } else {
        throw new Error(data.error || (lang === 'id' ? 'Gagal mengambil cerita' : 'Failed to get story'));
      }
    } catch (err) {
      console.error('Sector AI Error:', err);
      setSectorStories(prev => ({ ...prev, [category]: lang === 'id' ? 'Gagal memuat analisis sektoral.' : 'Failed to load sectoral analysis.' }));
    } finally {
      setIsSectorLoading(prev => ({ ...prev, [category]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            {t.common.loading} {regionName}...
          </p>
        </div>
      </div>
    );
  }

  if (!regionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
            {lang === 'id' ? 'Wilayah Tidak Ditemukan' : 'Region Not Found'}
          </h1>
          <button onClick={() => router.back()} className="text-blue-600 font-bold uppercase text-xs tracking-widest">
            {t.common.back}
          </button>
        </div>
      </div>
    );
  }

  const currentStunting = regionData.stunting_data?.find((s: any) => s.year === activeYear);
  const prevStunting = regionData.stunting_data?.find((s: any) => s.year === activeYear - 1);
  const currentFactors = regionData.stunting_factors?.find((f: any) => f.year === activeYear);

  const prevalenceDiff = currentStunting && prevStunting
    ? parseFloat((currentStunting.prevalence - prevStunting.prevalence).toFixed(2))
    : null;

  // Grouped Factors for display
  const factorGroups = [
    {
      title: t.factors.directRisk,
      icon: Baby,
      color: 'blue',
      description: t.factors.directRiskDesc,
      items: [
        { label: lang === 'id' ? 'BBLR / Prematur' : 'LBW / Premature', count: currentFactors?.bblr_count, rate: currentFactors?.bblr_rate, unit: lang === 'id' ? '% Balita' : '% Toddlers' },
        { label: lang === 'id' ? 'Cakupan IMD' : 'EIB Coverage', count: currentFactors?.imd_count, rate: currentFactors?.imd_rate, unit: lang === 'id' ? '% Bayi' : '% Babies' },
        { label: lang === 'id' ? 'ASI Eksklusif' : 'Exclusive Breastfeeding', count: currentFactors?.asi_count, rate: currentFactors?.asi_rate, unit: lang === 'id' ? '% Bayi < 6 Bln' : '% Babies < 6 Mo' },
      ]
    },
    {
      title: t.factors.effectivePrevention,
      icon: ShieldCheck,
      color: 'amber',
      description: t.factors.effectivePreventionDesc,
      items: [
        { label: lang === 'id' ? 'Imunisasi Dasar Lengkap' : 'Complete Basic Immunization', count: currentFactors?.idl_count, rate: currentFactors?.idl_rate, unit: lang === 'id' ? '% Bayi' : '% Babies' },
        { label: lang === 'id' ? 'Vitamin A' : 'Vitamin A', count: currentFactors?.vita_count, rate: currentFactors?.vita_rate, unit: lang === 'id' ? '% Balita' : '% Toddlers' },
      ]
    },
    {
      title: t.factors.maternalHealth,
      icon: Heart,
      color: 'rose',
      description: t.factors.maternalHealthDesc,
      items: [
        { label: lang === 'id' ? 'TTD 90 Tablet' : 'BAT 90 Tablets', count: currentFactors?.ttd_count, rate: currentFactors?.ttd_rate, unit: lang === 'id' ? '% Ibu Hamil' : '% Pregnant Mothers' },
        { label: lang === 'id' ? 'Layanan Kes. Catin' : 'Prospective Brides Services', count: currentFactors?.catin_count, rate: currentFactors?.catin_rate, unit: lang === 'id' ? '% Catin' : '% Brides' },
      ]
    },
    {
      title: t.factors.environment,
      icon: Home,
      color: 'emerald',
      description: t.factors.environmentDesc,
      items: [
        { label: lang === 'id' ? 'Akses Jamban Sehat' : 'Healthy Latrine Access', count: currentFactors?.jamban_count, rate: currentFactors?.jamban_rate, unit: '% KK' },
        { label: lang === 'id' ? 'KK SBS (Stop BABS)' : 'Open Defecation Free HH', count: currentFactors?.stbm_count, rate: currentFactors?.stbm_rate, unit: '% KK' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-[1400px] mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.back()}
              className="p-3 rounded-2xl bg-slate-100/80 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all group border border-slate-200/50"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{t.mapDetail.analysisProfile}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                <MapPin className="w-6 h-6 text-blue-600" />
                {regionName}
              </h1>
            </div>
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-2xl overflow-hidden shadow-inner">
            {availableYears.map((y) => (
              <button
                key={y}
                onClick={() => setActiveYear(y)}
                className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeYear === y
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-10 space-y-10">
        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[3rem] px-8 py-4 border border-slate-200/60 shadow-2xl shadow-blue-900/5 relative overflow-hidden group transition-all hover:shadow-blue-900/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="flex-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">{t.mapDetail.performanceYear} {activeYear}</span>
                <div className="flex items-baseline gap-4 mt-2">
                  <span className="text-7xl font-black text-gray-900 tracking-tighter">
                    {currentStunting?.prevalence || 0}%
                  </span>
                  {prevalenceDiff !== null && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${prevalenceDiff > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                      {prevalenceDiff > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(prevalenceDiff)}% {t.mapDetail.fromPreviousYear} {activeYear - 1}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full md:w-64 h-40 bg-blue-50/40 rounded-[2.5rem] p-6 flex flex-col justify-between border border-blue-100/50 shadow-inner group/card hover:bg-blue-50/60 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 group-hover/card:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 text-right leading-tight">{t.mapDetail.totalRegisteredCases.split(' ').slice(0, 2).join(' ')}<br />{t.mapDetail.totalRegisteredCases.split(' ').slice(2).join(' ')}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900 tracking-tighter">
                    {currentStunting?.stunting_cases?.toLocaleString() || 'N/A'}
                  </span>
                  <span className="text-[10px] font-black text-blue-600/60 uppercase">{t.mapDetail.childrenUnit}</span>
                </div>
              </div>
            </div>

            {/* AI Insight Section - Now inside the same section card, at the bottom tier */}
            <div className="mt-4 pt-4 border-t border-slate-100 relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    {t.mapDetail.aiStorytellingTitle}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{t.mapDetail.aiStorytellingDesc}</p>
                </div>

                {!aiStory && !isAiLoading && (
                  <button
                    onClick={handleGenerateAiStory}
                    className="group/btn flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-blue-200 transition-all duration-300 transform active:scale-95"
                  >
                    <Info className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                    {t.mapDetail.generateAnalysis}
                  </button>
                )}

                {isAiLoading && (
                  <div className="flex items-center gap-4 text-blue-600 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">{t.mapDetail.aiGenerating}</span>
                  </div>
                )}
              </div>

              {aiStory && (
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-[2rem] p-8 border border-slate-100 relative group/ai shadow-inner">
                  <div className="absolute top-0 right-0 p-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">{t.mapDetail.liveInsight}</span>
                  </div>

                  <div className="flex gap-6">
                    <div className="hidden md:flex mt-1">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-slate-100">
                        <LayoutDashboard className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg text-slate-700 font-medium leading-relaxed italic md:pr-20">
                        "{aiStory}"
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.mapDetail.modelInfo}</p>
                        <button
                          onClick={handleGenerateAiStory}
                          className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all"
                        >
                          {t.common.updateAnalysis}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!aiStory && !isAiLoading && (
                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                  <Info className="w-10 h-10 text-slate-200 mb-4" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                    {lang === 'id' ? 'Klik tombol di atas untuk mendapatkan' : 'Click the button above to get'}<br />{lang === 'id' ? 'insight data secara otomatis' : 'data insights automatically'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-slate-200/60 shadow-2xl shadow-blue-900/5 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                {t.mapDetail.prevalenceTrend}
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.mapDetail.multiYear}</span>
            </div>
            <div className="flex-1 min-h-[220px]">
              <AdminTrendChart data={stuntingHistory} />
            </div>
          </div>
        </div>

        {/* Detailed Factors Grid */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{t.mapDetail.deterministicAnalysis}</h2>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {factorGroups.map((group) => {
              const Icon = group.icon;
              const hasStory = !!sectorStories[group.title];
              const isGroupLoading = !!isSectorLoading[group.title];

              // Explicit color mapping to avoid Tailwind purging dynamic classes
              const colorConfig: { [key: string]: any } = {
                blue: { 
                  bar: 'bg-blue-600', 
                  bg: 'bg-blue-50', 
                  text: 'text-blue-600', 
                  border: 'border-blue-100',
                  btnHover: 'hover:bg-blue-50 hover:text-blue-600',
                  storyBg: 'bg-blue-50/30'
                },
                amber: { 
                  bar: 'bg-amber-600', 
                  bg: 'bg-amber-50', 
                  text: 'text-amber-600', 
                  border: 'border-amber-100',
                  btnHover: 'hover:bg-amber-50 hover:text-amber-600',
                  storyBg: 'bg-amber-50/30'
                },
                rose: { 
                  bar: 'bg-rose-600', 
                  bg: 'bg-rose-50', 
                  text: 'text-rose-600', 
                  border: 'border-rose-100',
                  btnHover: 'hover:bg-rose-50 hover:text-rose-600',
                  storyBg: 'bg-rose-50/30'
                },
                emerald: { 
                  bar: 'bg-emerald-600', 
                  bg: 'bg-emerald-50', 
                  text: 'text-emerald-600', 
                  border: 'border-emerald-100',
                  btnHover: 'hover:bg-emerald-50 hover:text-emerald-600',
                  storyBg: 'bg-emerald-50/30'
                },
              };

              const colors = colorConfig[group.color] || colorConfig.blue;

              return (
                <div key={group.title} className="bg-white rounded-[3rem] p-8 border border-slate-200/60 shadow-2xl shadow-blue-900/5 group/parent flex flex-col">
                  <div className="flex items-center gap-5 mb-8">
                    <div className={`p-4 rounded-[1.5rem] ${colors.bg} ${colors.text} group-hover/parent:scale-105 transition-transform duration-500 shadow-sm`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{group.title}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{group.description}</p>
                    </div>
                  </div>

                  {/* Restored Progress Bar Style */}
                  <div className="space-y-6 flex-1">
                    {group.items.map((item) => (
                      <div key={item.label} className="group">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-bold text-gray-600">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-gray-900 italic tracking-widest underline decoration-blue-200 underline-offset-4 decoration-2">
                              {item.count?.toLocaleString() || 0}
                            </span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase">
                              {item.unit.replace('% ', '')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden p-[2px]">
                            <div
                              className={`h-full transition-all duration-1000 ${colors.bar} rounded-full group-hover:brightness-110 shadow-sm`}
                              style={{ width: `${item.rate ?? 0}%` }}
                            ></div>
                          </div>
                          <div className="text-[10px] font-black text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-xl tabular-nums border border-slate-200/50">
                            {item.rate ?? 0}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sector Storytelling Section Kept */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    {!hasStory && !isGroupLoading && (
                      <button
                        onClick={() => handleGenerateSectorStory(group.title, group.items)}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-50 text-slate-500 ${colors.btnHover} border border-dashed border-slate-200 transition-all font-black text-[10px] uppercase tracking-widest`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {t.mapDetail.sectoralStorytelling}
                      </button>
                    )}

                    {isGroupLoading && (
                      <div className="flex items-center justify-center gap-3 py-3 text-blue-600 animate-pulse">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{t.mapDetail.craftingNarrative}</span>
                      </div>
                    )}

                    {hasStory && (
                      <div className={`${colors.storyBg} rounded-2xl p-4 border ${colors.border} relative group/story`}>
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center ${colors.text} border ${colors.border} flex-shrink-0`}>
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-base text-slate-600 font-medium leading-relaxed italic">
                              "{sectorStories[group.title]}"
                            </p>
                            <button 
                              onClick={() => handleGenerateSectorStory(group.title, group.items)}
                              className="mt-2 text-[12px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                            >
                              {t.mapDetail.refreshAnalysis || (lang === 'id' ? 'Perbarui Analisis' : 'Refresh Analysis')}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* Footer info/call to action */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-[3rem] p-12 text-white shadow-2xl shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl text-center md:text-left">
            <h4 className="font-extrabold text-base mb-2 leading-tight">{t.mapDetail.needIntervention}</h4>
            <p className="text-blue-100 text-sm font-medium leading-relaxed">
              {t.mapDetail.interventionDesc.replace('{year}', activeYear.toString()).replace('{factor}', factorGroups[0].title)}
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Link href="/map" className="flex-1 md:flex-none px-10 py-4 bg-white text-blue-700 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-50 transition-all text-center">
              {t.mapDetail.monitorOtherRegions}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
