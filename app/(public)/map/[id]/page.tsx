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
import type { ClusterMeta } from '@/lib/kmedoids';
import AdminTrendChart from '@/components/admin/AdminTrendChart';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Table } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [aiUsedModel, setAiUsedModel] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [sectorStories, setSectorStories] = useState<{ [key: string]: string }>({});
  const [sectorUsedModels, setSectorUsedModels] = useState<{ [key: string]: string }>({});
  const [isSectorLoading, setIsSectorLoading] = useState<{ [key: string]: boolean }>({});
  const [selectedModel, setSelectedModel] = useState<string>('auto');
  const [clusterInfo, setClusterInfo] = useState<ClusterMeta | null>(null);
  const [isClusterLoading, setIsClusterLoading] = useState(false);
  const [activeTrendTab, setActiveTrendTab] = useState<'prevalence' | 'direct_risk' | 'prevention_risk' | 'maternal_risk' | 'environment_risk'>('prevalence');
  const [isTableMinimized, setIsTableMinimized] = useState(false);
  const [yoyStory, setYoyStory] = useState<string | null>(null);
  const [yoyUsedModel, setYoyUsedModel] = useState<string | null>(null);
  const [isYoyLoading, setIsYoyLoading] = useState(false);

  const AI_MODELS = [
    { value: 'auto',                          label: '🔄 Auto (Fallback)',           group: 'Auto' },
    { value: 'groq/llama-3.3-70b-versatile',  label: '🦙 Llama 3.3 70B',            group: 'Groq' },
    { value: 'groq/llama-3.1-8b-instant',     label: '⚡ Llama 3.1 8B Instant',     group: 'Groq' },
    { value: 'gemini/gemini-2.5-flash',        label: '✨ Gemini 2.5 Flash',          group: 'Gemini' },
    { value: 'gemini/gemini-2.5-flash-lite',   label: '💡 Gemini 2.5 Flash Lite',    group: 'Gemini' },
    { value: 'gemini/gemini-1.5-flash',        label: '🌟 Gemini 1.5 Flash',         group: 'Gemini' },
  ];

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

  // Fetch cluster info for this region whenever activeYear changes (prevalence mode)
  useEffect(() => {
    const fetchClusterInfo = async () => {
      setIsClusterLoading(true);
      setClusterInfo(null);
      try {
        const res = await fetch(`/api/clustering?year=${activeYear}&mode=prevalence`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const clusterId = data.clusters?.[regionName] ?? null;
        if (clusterId !== null) {
          const meta = data.clusterMeta?.find((m: ClusterMeta) => m.id === clusterId) ?? null;
          setClusterInfo(meta);
        }
      } catch (err) {
        console.error('Error fetching cluster info:', err);
      } finally {
        setIsClusterLoading(false);
      }
    };

    fetchClusterInfo();
  }, [activeYear, regionName]);

  const handleGenerateAiStory = async () => {
    setIsAiLoading(true);
    setAiStory(null);
    try {
      const response = await fetch('/api/ai/storytelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regionName,
          year: activeYear,
          language: lang,
          selectedModel: selectedModel === 'auto' ? undefined : selectedModel,
        }),
      });
      const data = await response.json();
      if (data.story) {
        setAiStory(data.story);
        setAiUsedModel(data.usedModel);
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
          language: lang,
          selectedModel: selectedModel === 'auto' ? undefined : selectedModel,
        }),
      });
      const data = await response.json();
      if (data.story) {
        setSectorStories(prev => ({ ...prev, [category]: data.story }));
        setSectorUsedModels(prev => ({ ...prev, [category]: data.usedModel || '' }));
      } else {
        throw new Error(data.error || (lang === 'id' ? 'Gagal mengambil cerita' : 'Failed to get story'));
      }
    } catch (err) {
      console.error('Sector AI Error:', err);
      setSectorStories(prev => ({ ...prev, [category]: lang === 'id' ? 'Gagal memuat analisis sektoral.' : 'Failed to load sectoral analysis.' }));
      setSectorUsedModels(prev => ({ ...prev, [category]: '' }));
    } finally {
      setIsSectorLoading(prev => ({ ...prev, [category]: false }));
    }
  };

  const handleGenerateYoyStory = async () => {
    setIsYoyLoading(true);
    setYoyStory(null);
    try {
      const response = await fetch('/api/ai/storytelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regionName,
          year: activeYear,
          category: 'yoy_trend',
          categoryData: yoyData,
          language: lang,
          selectedModel: selectedModel === 'auto' ? undefined : selectedModel,
        }),
      });
      const data = await response.json();
      if (data.story) {
        setYoyStory(data.story);
        setYoyUsedModel(data.usedModel);
      } else {
        throw new Error(data.error || (lang === 'id' ? 'Gagal mengambil analisis tren' : 'Failed to get trend analysis'));
      }
    } catch (err) {
      console.error('YoY AI Error:', err);
      setYoyStory(lang === 'id'
        ? 'Gagal memuat analisis tren AI. Pastikan API Key Anda sudah terkonfigurasi dengan benar.'
        : 'Failed to load AI trend analysis. Please ensure your API Key is configured correctly.');
    } finally {
      setIsYoyLoading(false);
    }
  };

  const renderFormattedText = (text: string | null) => {
    if (!text) return null;

    // Split by **text** pattern
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const cleanText = part.slice(2, -2);
        return (
          <strong key={index} className="font-bold text-blue-700 bg-blue-50/50 px-1 py-0.2 rounded-md mx-0.5 shadow-sm border border-blue-100/50 inline-block not-italic">
            {cleanText}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
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

  // Prepare YoY (Year-over-Year) merged data
  const yoyData = [...availableYears]
    .sort((a, b) => a - b)
    .map(y => {
      const sData = regionData.stunting_data?.find((s: any) => s.year === y);
      const fData = regionData.stunting_factors?.find((f: any) => f.year === y);
      return {
        year: y.toString(),
        // Prevalence
        prevalence: sData?.prevalence ?? 0,
        cases: sData?.stunting_cases ?? 0,
        // Direct Risk
        bblr_rate: fData?.bblr_rate ?? 0,
        bblr_count: fData?.bblr_count ?? 0,
        imd_rate: fData?.imd_rate ?? 0,
        imd_count: fData?.imd_count ?? 0,
        asi_rate: fData?.asi_rate ?? 0,
        asi_count: fData?.asi_count ?? 0,
        // Prevention
        idl_rate: fData?.idl_rate ?? 0,
        idl_count: fData?.idl_count ?? 0,
        vita_rate: fData?.vita_rate ?? 0,
        vita_count: fData?.vita_count ?? 0,
        // Maternal
        ttd_rate: fData?.ttd_rate ?? 0,
        ttd_count: fData?.ttd_count ?? 0,
        catin_rate: fData?.catin_rate ?? 0,
        catin_count: fData?.catin_count ?? 0,
        // Environment
        jamban_rate: fData?.jamban_rate ?? 0,
        jamban_count: fData?.jamban_count ?? 0,
        stbm_rate: fData?.stbm_rate ?? 0,
        stbm_count: fData?.stbm_count ?? 0,
      };
    });

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

  const renderChartLines = () => {
    switch (activeTrendTab) {
      case 'prevalence':
        return (
          <>
            <Line yAxisId="left" type="monotone" dataKey="prevalence" name={lang === 'id' ? 'Prevalensi (%)' : 'Prevalence (%)'} stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
            <Line yAxisId="right" type="monotone" dataKey="cases" name={lang === 'id' ? 'Jumlah Kasus' : 'Total Cases'} stroke="#f97316" strokeWidth={3} activeDot={{ r: 8 }} />
          </>
        );
      case 'direct_risk':
        return (
          <>
            <Line type="monotone" dataKey="bblr_rate" name={lang === 'id' ? 'BBLR (%)' : 'LBW (%)'} stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="imd_rate" name={lang === 'id' ? 'IMD (%)' : 'EIB (%)'} stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="asi_rate" name={lang === 'id' ? 'ASI Eksklusif (%)' : 'Exclusive Breastfeeding (%)'} stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
          </>
        );
      case 'prevention_risk':
        return (
          <>
            <Line type="monotone" dataKey="idl_rate" name={lang === 'id' ? 'Imunisasi Lengkap (%)' : 'Basic Immunization (%)'} stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="vita_rate" name={lang === 'id' ? 'Vitamin A (%)' : 'Vitamin A (%)'} stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
          </>
        );
      case 'maternal_risk':
        return (
          <>
            <Line type="monotone" dataKey="ttd_rate" name={lang === 'id' ? 'TTD 90 Tablet (%)' : 'BAT 90 Tablets (%)'} stroke="#ec4899" strokeWidth={3} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="catin_rate" name={lang === 'id' ? 'Layanan Catin (%)' : 'Bride Health (%)'} stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
          </>
        );
      case 'environment_risk':
        return (
          <>
            <Line type="monotone" dataKey="jamban_rate" name={lang === 'id' ? 'Jamban Sehat (%)' : 'Healthy Latrine (%)'} stroke="#06b6d4" strokeWidth={3} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="stbm_rate" name={lang === 'id' ? 'Stop BABS (%)' : 'Open Defecation Free (%)'} stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
          </>
        );
      default:
        return null;
    }
  };

  const renderTableContent = () => {
    switch (activeTrendTab) {
      case 'prevalence':
        return {
          headers: lang === 'id' 
            ? ['Tahun', 'Prevalensi Stunting', 'Jumlah Kasus'] 
            : ['Year', 'Stunting Prevalence', 'Total Cases'],
          rows: yoyData.map(d => [
            d.year,
            `${d.prevalence}%`,
            d.cases.toLocaleString()
          ])
        };
      case 'direct_risk':
        return {
          headers: lang === 'id'
            ? ['Tahun', 'BBLR (%)', 'BBLR (Kasus)', 'IMD (%)', 'IMD (Kasus)', 'ASI Ekskl. (%)', 'ASI (Kasus)']
            : ['Year', 'LBW (%)', 'LBW (Cases)', 'EIB (%)', 'EIB (Cases)', 'ASI (%)', 'ASI (Cases)'],
          rows: yoyData.map(d => [
            d.year,
            `${d.bblr_rate}%`,
            d.bblr_count.toLocaleString(),
            `${d.imd_rate}%`,
            d.imd_count.toLocaleString(),
            `${d.asi_rate}%`,
            d.asi_count.toLocaleString()
          ])
        };
      case 'prevention_risk':
        return {
          headers: lang === 'id'
            ? ['Tahun', 'Imunisasi (%)', 'Imunisasi (Kasus)', 'Vitamin A (%)', 'Vitamin A (Kasus)']
            : ['Year', 'Immunization (%)', 'Immunization (Cases)', 'Vitamin A (%)', 'Vitamin A (Cases)'],
          rows: yoyData.map(d => [
            d.year,
            `${d.idl_rate}%`,
            d.idl_count.toLocaleString(),
            `${d.vita_rate}%`,
            d.vita_count.toLocaleString()
          ])
        };
      case 'maternal_risk':
        return {
          headers: lang === 'id'
            ? ['Tahun', 'TTD 90 Tablet (%)', 'TTD (Kasus)', 'Layanan Catin (%)', 'Catin (Kasus)']
            : ['Year', 'BAT 90 Tablets (%)', 'BAT (Cases)', 'Bride Services (%)', 'Bride (Cases)'],
          rows: yoyData.map(d => [
            d.year,
            `${d.ttd_rate}%`,
            d.ttd_count.toLocaleString(),
            `${d.catin_rate}%`,
            d.catin_count.toLocaleString()
          ])
        };
      case 'environment_risk':
        return {
          headers: lang === 'id'
            ? ['Tahun', 'Jamban Sehat (%)', 'Jamban (Kasus)', 'Stop BABS (%)', 'SBS (Kasus)']
            : ['Year', 'Healthy Latrine (%)', 'Latrine (Cases)', 'ODF HH (%)', 'ODF (Cases)'],
          rows: yoyData.map(d => [
            d.year,
            `${d.jamban_rate}%`,
            d.jamban_count.toLocaleString(),
            `${d.stbm_rate}%`,
            d.stbm_count.toLocaleString()
          ])
        };
      default:
        return { headers: [], rows: [] };
    }
  };

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
              {/* Cluster Badge */}
              <div className="mt-2 flex items-center gap-2">
                {isClusterLoading ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {lang === 'id' ? 'Memuat kluster...' : 'Loading cluster...'}
                    </span>
                  </div>
                ) : clusterInfo ? (
                  <div
                    className="flex items-center gap-2 px-3 py-1 rounded-full border font-black text-[10px] uppercase tracking-widest shadow-sm transition-all"
                    style={{
                      backgroundColor: `${clusterInfo.color}18`,
                      borderColor: `${clusterInfo.color}55`,
                      color: clusterInfo.color,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: clusterInfo.color }}
                    />
                    {lang === 'id' ? 'Kluster Prevalensi' : 'Prevalence Cluster'}:
                    <span className="font-black">{clusterInfo.label}</span>
                    <span
                      className="ml-1 opacity-60 font-bold text-[9px]"
                    >
                      ({activeYear})
                    </span>
                  </div>
                ) : null}
              </div>
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

            {/* AI Insight Section */}
            <div className="mt-4 pt-4 border-t border-slate-100 relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    {t.mapDetail.aiStorytellingTitle}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold tracking-wider mt-1">{t.mapDetail.aiStorytellingDesc}</p>
                </div>

                {/* ── Model Selector (testing) ─────────────────── */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200/70 rounded-xl px-3 py-1.5">
                    <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Model</span>
                    <select
                      id="ai-model-selector"
                      value={selectedModel}
                      onChange={(e) => {
                        setSelectedModel(e.target.value);
                        setAiStory(null);
                        setSectorStories({});
                        setSectorUsedModels({});
                      }}
                      className="bg-transparent text-[10px] font-black text-slate-600 outline-none cursor-pointer pr-1"
                    >
                      {AI_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  {!aiStory && !isAiLoading && (
                    <button
                      onClick={handleGenerateAiStory}
                      className="group/btn flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl font-black text-[10px] tracking-widest hover:shadow-xl hover:shadow-blue-200 transition-all duration-300 transform active:scale-95"
                    >
                      <Info className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                      {t.mapDetail.generateAnalysis}
                    </button>
                  )}

                  {isAiLoading && (
                    <div className="flex items-center gap-4 text-blue-600 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-black tracking-widest animate-pulse">{t.mapDetail.aiGenerating}</span>
                    </div>
                  )}
                </div>
              </div>

              {aiStory && (
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-[2rem] p-8 border border-slate-100 relative group/ai shadow-inner">
                  <div className="absolute top-0 right-0 p-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-600 tracking-[0.2em]">{t.mapDetail.liveInsight}</span>
                  </div>

                  <div className="flex gap-6">
                    <div className="hidden md:flex mt-1">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-slate-100">
                        <LayoutDashboard className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg text-slate-700 font-medium leading-relaxed italic md:pr-20">
                        "{renderFormattedText(aiStory)}"
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2">
                        <p className="text-[9px] font-bold text-slate-400 tracking-widest">
                          {t.mapDetail.modelInfo} {aiUsedModel || 'Gemini'} • {lang === 'id' ? 'Bahasa Indonesia' : 'English'}
                        </p>
                        <button
                          onClick={handleGenerateAiStory}
                          className="text-[9px] font-black text-blue-600 tracking-widest hover:underline decoration-2 underline-offset-4 transition-all"
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
                  <p className="text-xs font-bold text-slate-400 tracking-widest text-center">
                    {lang === 'id' ? 'Klik tombol di atas untuk mendapatkan' : 'Click the button above to get'}<br />{lang === 'id' ? 'insight data secara otomatis' : 'data insights automatically'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-slate-200/60 shadow-2xl shadow-blue-900/5 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-gray-900 tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                {t.mapDetail.prevalenceTrend}
              </h3>
              <span className="text-[10px] font-black text-slate-400 tracking-widest">{t.mapDetail.multiYear}</span>
            </div>
            <div className="flex-1 min-h-[220px]">
              <AdminTrendChart data={stuntingHistory} />
            </div>
          </div>
        </div>

        {/* Detailed Factors Grid */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t.mapDetail.deterministicAnalysis}</h2>
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
                      <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">{group.title}</h3>
                      <p className="text-[10px] text-slate-500 font-bold tracking-wider">{group.description}</p>
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
                            <span className="text-[9px] font-bold text-gray-500">
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
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-50 text-slate-500 ${colors.btnHover} border border-dashed border-slate-200 transition-all font-black text-[10px] tracking-widest`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {t.mapDetail.sectoralStorytelling}
                      </button>
                    )}

                    {isGroupLoading && (
                      <div className="flex items-center justify-center gap-3 py-3 text-blue-600 animate-pulse">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[9px] font-black tracking-widest">{t.mapDetail.craftingNarrative}</span>
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
                              "{renderFormattedText(sectorStories[group.title])}"
                            </p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <button
                                onClick={() => handleGenerateSectorStory(group.title, group.items)}
                                className="text-[12px] font-black text-blue-600 tracking-widest hover:underline"
                              >
                                {t.mapDetail.refreshAnalysis || (lang === 'id' ? 'Perbarui Analisis' : 'Refresh Analysis')}
                              </button>
                              {sectorUsedModels[group.title] && (
                                <>
                                  <span className="text-slate-300 text-[10px]">•</span>
                                  <span className="text-[9px] font-bold text-slate-400 tracking-widest">
                                    {t.mapDetail.modelInfo} {sectorUsedModels[group.title]}
                                  </span>
                                </>
                              )}
                            </div>
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

        {/* YoY Trend and History Analysis Section */}
        <div className="space-y-8 mt-12">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {lang === 'id' ? 'Analisis Tren Perkembangan Tahunan' : 'Annual Development Trend Analysis'}
            </h2>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-slate-200/60 shadow-2xl shadow-blue-900/5 flex flex-col gap-6">
            {/* Header: Title, Subtitle & Minimize button */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-gray-900 tracking-tight mb-1 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  {lang === 'id' ? 'Grafik Perkembangan Multi-Tahun' : 'Multi-Year Development Chart'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'id' 
                    ? 'Perbandingan tren prevalensi stunting dan faktor-faktor risiko determinan secara historis' 
                    : 'Historical comparison of stunting prevalence trends and determining risk factors'}
                </p>
              </div>

              {/* Table Toggle Button */}
              <button
                onClick={() => setIsTableMinimized(!isTableMinimized)}
                className="flex items-center justify-center gap-2 self-start px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-all font-black text-[10px] tracking-widest uppercase"
              >
                <Table className="w-3.5 h-3.5" />
                {isTableMinimized 
                  ? (lang === 'id' ? 'Tampilkan Tabel Ringkasan' : 'Show Summary Table') 
                  : (lang === 'id' ? 'Sembunyikan Tabel' : 'Hide Table')}
              </button>
            </div>

            {/* Tab switchers */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
              {[
                { id: 'prevalence', label: lang === 'id' ? 'Prevalensi Stunting' : 'Stunting Prevalence', color: 'text-blue-600', activeBg: 'bg-blue-50', border: 'border-blue-100' },
                { id: 'direct_risk', label: lang === 'id' ? 'Risiko Langsung' : 'Direct Risk', color: 'text-orange-600', activeBg: 'bg-orange-50', border: 'border-orange-100' },
                { id: 'prevention_risk', label: lang === 'id' ? 'Pencegahan Efektif' : 'Effective Prevention', color: 'text-emerald-600', activeBg: 'bg-emerald-50', border: 'border-emerald-100' },
                { id: 'maternal_risk', label: lang === 'id' ? 'Kesehatan Ibu' : 'Maternal Health', color: 'text-rose-600', activeBg: 'bg-rose-50', border: 'border-rose-100' },
                { id: 'environment_risk', label: lang === 'id' ? 'Kesehatan Lingkungan' : 'Environmental Health', color: 'text-cyan-600', activeBg: 'bg-cyan-50', border: 'border-cyan-100' },
              ].map((tab) => {
                const isActive = activeTrendTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTrendTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded-xl text-[11px] font-black tracking-wider uppercase transition-all whitespace-nowrap border ${
                      isActive 
                        ? `${tab.activeBg} ${tab.color} ${tab.border} shadow-sm font-extrabold` 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Split layout (Chart & Table) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Chart container */}
              <div className={`transition-all duration-300 ${isTableMinimized ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
                <div className="w-full h-[320px] pr-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yoyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="year" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                        dy={10}
                      />
                      <YAxis 
                        yAxisId="left" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                        domain={activeTrendTab === 'prevalence' ? [0, 'auto'] : [0, 100]}
                        unit={activeTrendTab === 'prevalence' ? '' : '%'}
                      />
                      {activeTrendTab === 'prevalence' && (
                        <YAxis 
                          yAxisId="right" 
                          orientation="right"
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                        />
                      )}
                      <RechartsTooltip 
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          padding: '12px'
                        }}
                        itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                        labelStyle={{ fontWeight: 800, fontSize: '10px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', fontWeight: 800 }}
                      />
                      {renderChartLines()}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary Table container */}
              {!isTableMinimized && (
                <div className="lg:col-span-1 space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                      {lang === 'id' ? 'Ringkasan Data Historis' : 'Historical Data Summary'}
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          {renderTableContent()?.headers.map((h, i) => (
                            <th key={i} className="px-3 py-2.5 font-black text-slate-500 uppercase tracking-wider text-[9px]">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {renderTableContent()?.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                            {row.map((val, cIdx) => (
                              <td key={cIdx} className={`px-3 py-2.5 font-bold ${cIdx === 0 ? 'text-blue-600' : 'text-slate-700'}`}>
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* YoY AI Storytelling Section */}
            <div className="mt-4 pt-6 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                  {lang === 'id' ? 'Analisis Tren Berbasis AI' : 'AI-Based Trend Analysis'}
                </h4>
                
                {!yoyStory && !isYoyLoading && (
                  <button
                    onClick={handleGenerateYoyStory}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-black text-[10px] tracking-widest uppercase shadow-md shadow-blue-500/10 self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {lang === 'id' ? 'Mulai Analisis AI' : 'Generate AI Analysis'}
                  </button>
                )}
              </div>

              {isYoyLoading && (
                <div className="flex items-center justify-center gap-3 py-10 text-blue-600 animate-pulse bg-slate-50/50 rounded-[2rem] border border-slate-100">
                  <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.mapDetail.craftingNarrative}</span>
                </div>
              )}

              {yoyStory && !isYoyLoading && (
                <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 relative group/story animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-500 shadow-md flex items-center justify-center text-white border border-white">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-slate-700 font-medium leading-relaxed italic md:pr-20">
                        "{renderFormattedText(yoyStory)}"
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2">
                        <p className="text-[9px] font-bold text-slate-400 tracking-widest">
                          {t.mapDetail.modelInfo} {yoyUsedModel || 'Gemini'} • {lang === 'id' ? 'Bahasa Indonesia' : 'English'}
                        </p>
                        <button
                          onClick={handleGenerateYoyStory}
                          className="text-[9px] font-black text-blue-600 tracking-widest hover:underline decoration-2 underline-offset-4 transition-all"
                        >
                          {t.common.updateAnalysis}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!yoyStory && !isYoyLoading && (
                <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                  <Info className="w-8 h-8 text-slate-200 mb-2" />
                  <p className="text-[11px] font-bold text-slate-400 tracking-widest text-center leading-relaxed">
                    {lang === 'id' ? 'Klik tombol di atas untuk mendapatkan narasi analisis tren perkembangan' : 'Click the button above to generate a developmental trend narrative'}<br />{lang === 'id' ? 'stunting secara otomatis berbasis AI' : 'automatically powered by AI'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info/call to action */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-[3rem] p-12 text-white shadow-2xl shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl text-center md:text-left">
            <h4 className="font-extrabold text-base mb-2 leading-tight">{t.mapDetail.needIntervention}</h4>
            <p className="text-blue-100 text-sm font-medium leading-relaxed">
              {t.mapDetail.interventionDesc}
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
