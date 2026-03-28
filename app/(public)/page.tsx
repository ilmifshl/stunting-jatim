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
  const [stats, setStats] = useState<StatItem[]>([
    { label: 'Rata-rata Prevalensi', value: '...', trend: null, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Kasus Terdata', value: '...', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Target Penurunan 2024', value: '14.0%', icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Wilayah Terpantau', value: '...', icon: MapIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const currentYear = 2023; // Assuming 2023 is the latest full data year
      const prevYear = 2022;

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

      if (currentData) {
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
            label: 'Rata-rata Prevalensi', 
            value: `${avgPrev.toFixed(1)}%`, 
            trend: trendText, 
            icon: TrendingDown, 
            color: trendValue > 0 ? 'text-red-600' : 'text-green-600', 
            bg: trendValue > 0 ? 'bg-red-50' : 'bg-green-50' 
          },
          { 
            label: 'Total Kasus Terdata', 
            value: totalCases.toLocaleString(), 
            icon: Users, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
          },
          { 
            label: 'Target Penurunan 2024', 
            value: '14.0%', 
            icon: Target, 
            color: 'text-green-600', 
            bg: 'bg-green-50' 
          },
          { 
            label: 'Wilayah Terpantau', 
            value: regionCount?.toString() || '38', 
            icon: MapIcon, 
            color: 'text-purple-600', 
            bg: 'bg-purple-50' 
          },
        ]);
      }
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  // Mock articles for the right panel
  const recentArticles = [
    { id: 1, title: 'Strategi Penurunan Stunting di Jawa Timur 2024', date: '24 Mar 2024', category: 'Kebijakan' },
    { id: 2, title: 'Pentingnya Sanitasi Layak dalam Pencegahan Stunting', date: '22 Mar 2024', category: 'Kesehatan' },
    { id: 3, title: 'Program Pemberian Makanan Tambahan di Desa Tertinggal', date: '20 Mar 2024', category: 'Berita' },
  ];

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      {/* Header Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Dashboard Ringkasan Stunting
          </h1>
          <p className="text-gray-500 text-sm mt-1">Provinsi Jawa Timur - Data Terakhir: Maret 2024</p>
        </div>
        <Link
          href="/map"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all hover:translate-y-[-2px]"
        >
          Eksplorasi Peta Penuh
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid Utama Dashboard */}
      <div className="grid grid-cols-12 gap-6">

        {/* Kolom Kiri & Tengah: Stats & Map */}
        <div className="col-span-12 lg:col-span-9 space-y-6">

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
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-blue-600" />
                Sebaran Geospasial (Mini Map)
              </h3>
              <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-bold uppercase">Interaktif Terbatas</span>
            </div>
            <div className="flex-1 relative">
              <Suspense fallback={<div>Loading Map...</div>}>
                <MiniMap isMini={true} />
              </Suspense>

              {/* Overlay Legend Kecil */}
              <div className="absolute bottom-4 right-4 z-[999] bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-gray-100 hidden md:block">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Prevalensi</p>
                <div className="flex gap-3">
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

        {/* Kolom Kanan: Artikel Terkait */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full lg:min-h-[600px]">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                Artikel Terkait
              </h3>
              <Link href="/articles" className="text-xs font-bold text-blue-600 hover:underline">Lihat Semua</Link>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.id}`}
                  className="group block p-4 rounded-2xl border border-[#ececec] hover:bg-white transition-all hover:border-blue-100"
                >
                  <span className="inline-block text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full mb-2 uppercase">
                    {article.category}
                  </span>
                  <h4 className="font-bold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h4>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-gray-400 font-medium">{article.date}</span>
                    <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-500 transform group-hover:translateX(2px) transition-all" />
                  </div>
                </Link>
              ))}

              <div className="pt-4 border-t border-gray-50">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-blue-100 uppercase mb-1">Aksi Cepat</p>
                    <h4 className="font-bold text-sm mb-4 leading-tight">Pelajari Cara Menanggulangi Stunting di Wilayah Anda</h4>
                    <Link
                      href="/factors"
                      className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-xl text-[10px] font-bold hover:bg-blue-50 transition-colors"
                    >
                      Buka Faktor Risiko
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <AlertCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
