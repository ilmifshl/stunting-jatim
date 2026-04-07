'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  Map as MapIcon,
  TrendingDown,
  Users,
  AlertCircle,
  FileText,
  ChevronRight,
  Target,
  BarChart3
} from 'lucide-react';
import { Suspense, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Dynamically import the map for dashboard
const MiniMap = dynamic(() => import('@/components/map/EastJavaMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white/50 rounded-2xl animate-pulse">
      <span className="text-gray-400 text-sm font-medium">Memuat Peta...</span>
    </div>
  ),
});

interface StatItem {
  label: string;
  value: string;
  trend?: string | null;
  icon: any;
  color: string;
  bg: string;
}

export default function Home() {
  const { lang, t } = useLanguage();
  const [stats, setStats] = useState<StatItem[]>([
    { label: t.home.avgPrevalence, value: '...', trend: null, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    { label: t.home.totalCases, value: '...', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t.home.reductionTarget, value: '14.0%', icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
    { label: t.home.monitoredRegions, value: '...', icon: MapIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [clusterMapData, setClusterMapData] = useState<Record<string, string> | null>(null);
  const [clusterMeta, setClusterMeta] = useState<any[] | null>(null);

  // Fetch Clustering Data for MiniMap (Year 2024)
  useEffect(() => {
    const fetchClusterData = async () => {
      try {
        const res = await fetch('/api/clustering?year=2024&mode=prevalence');
        if (res.ok) {
          const data = await res.json();
          setClusterMapData(data.clusters);
          setClusterMeta(data.clusterMeta);
        }
      } catch (err) {
        console.error('Error fetching cluster data for minimap:', err);
      }
    };
    fetchClusterData();
  }, []);


  const [recentArticles, setRecentArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const currentYear = 2024; 
      const prevYear = 2023;

      // 1. Get stunting data for current and prev year
      const { data: currentData } = await supabase
        .from('stunting_data')
        .select('prevalence, stunting_cases')
        .eq('year', currentYear);

      const { data: prevData } = await supabase
        .from('stunting_data')
        .select('prevalence')
        .eq('year', prevYear);

      // 2. Count regions
      const { count: regionCount } = await supabase
        .from('regions')
        .select('*', { count: 'exact', head: true });

      // 3. Get latest 3 articles
      const { data: articlesData } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (articlesData) {
        setRecentArticles(articlesData);
      }

      if (currentData && currentData.length > 0) {
        const avgPrev = currentData.reduce((acc, curr) => acc + curr.prevalence, 0) / currentData.length;
        const totalCases = currentData.reduce((acc, curr) => acc + curr.stunting_cases, 0);

        let avgPrevPrev = 0;
        if (prevData && prevData.length > 0) {
          avgPrevPrev = prevData.reduce((acc, curr) => acc + curr.prevalence, 0) / prevData.length;
        }

        const trendValue = avgPrev - avgPrevPrev;
        const trendText = trendValue > 0 ? `+${trendValue.toFixed(1)}%` : `${trendValue.toFixed(1)}%`;

        setStats([
          {
            label: t.home.avgPrevalence,
            value: `${avgPrev.toFixed(1)}%`,
            trend: trendText,
            icon: TrendingDown,
            color: trendValue > 0 ? 'text-red-600' : 'text-green-600',
            bg: trendValue > 0 ? 'bg-red-50' : 'bg-green-50'
          },
          {
            label: t.home.totalCases,
            value: totalCases.toLocaleString(),
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
          },
          {
            label: t.home.reductionTarget,
            value: '14.0%',
            icon: Target,
            color: 'text-green-600',
            bg: 'bg-green-50'
          },
          {
            label: t.home.monitoredRegions,
            value: regionCount?.toString() || '38',
            icon: MapIcon,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
          },
        ]);
      } else {
        // Fallback or retry with 2023 if 2024 has no data yet
        console.warn('No 2024 data found, you might want to check the database or use 2023.');
      }
      setIsLoading(false);
    };

    fetchData();
  }, [t]);


  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-12 gap-x-8 gap-y-10">

        {/* Kolom Utama Dashboard */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          {/* Header Dashboard */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                {t.home.title}
              </h1>
              <p className="text-gray-500 text-sm mt-1">{t.home.subtitle}</p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                    {stat.trend && <span className="text-[10px] font-bold text-green-600">{stat.trend}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mini Map Container */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[520px]">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-blue-600" />
                {t.home.geospatialDistribution}
              </h3>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-xl font-bold text-xs transition-colors"
              >
                {t.home.fullMap}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex-1 relative">
              <Suspense fallback={<div>Loading Map...</div>}>
                <MiniMap 
                  isMini={true} 
                  year={2024}
                  clusterData={clusterMapData}
                  clusterMeta={clusterMeta}
                />
              </Suspense>


              {/* Overlay Legend Kecil */}
              <div className="absolute bottom-4 right-4 z-[999] bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-gray-100 hidden md:block">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{t.home.prevalenceLegend}</p>
                <div className="flex gap-3 text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-[10px] font-medium">&gt;20%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <span className="text-[10px] font-medium">14-20%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] font-medium">&lt;14%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Sidebar */}
        <div className="col-span-12 lg:col-span-3 h-fit sticky top-10 space-y-6">
          {/* Artikel Terkait */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col pb-6">
            <div className="px-6 pt-6 pb-2 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                {t.home.relatedArticles}
              </h3>
              <Link href="/articles" className="text-xs font-bold text-blue-600 hover:underline">{t.common.seeAll}</Link>
            </div>

            <div className="px-4 pt-2 space-y-4 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
              {recentArticles.length > 0 ? recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.id}`}
                  className="group block p-4 rounded-2xl border border-[#ececec] hover:bg-white transition-all hover:border-blue-100"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <span className="inline-block text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full mb-2 uppercase">
                      {(() => {
                        const cat = article.category?.toLowerCase();
                        if (cat === 'kesehatan') return t.categories.health;
                        if (cat === 'berita') return t.categories.news;
                        if (cat === 'kebijakan') return t.categories.policy;
                        return t.categories.insight;
                      })()}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-2 leading-relaxed font-medium">
                    {article.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between mt-2 border-t border-gray-50/50">
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(article.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-500 transform group-hover:translateX(2px) transition-all" />
                  </div>
                </Link>
              )) : (
                <div className="py-10 text-center">
                  <p className="text-gray-400 text-xs font-bold uppercase">{t.home.loadingArticles}</p>
                </div>
              )}
            </div>
          </div>

          {/* Aksi Cepat Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                <Target className="w-5 h-5 text-white" />
              </div>
              <p className="text-[10px] font-bold text-blue-100 uppercase mb-1 tracking-widest">{t.home.strategicActionLabel}</p>
              <h4 className="font-extrabold text-base mb-4 leading-tight">{t.home.strategicActionTitle}</h4>
              <Link
                href="/factors"
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-50 transition-all hover:shadow-lg shadow-blue-900/20"
              >
                {t.home.openRiskFactors}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <AlertCircle className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 transition-transform group-hover:scale-110 group-hover:text-white/[0.15] duration-700" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
}
