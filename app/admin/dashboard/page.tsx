import { Activity, Users, Map, FileText, TrendingDown, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import AdminTrendChart from '@/components/admin/AdminTrendChart';
import AdminRegionChart from '@/components/admin/AdminRegionChart';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Fetch counts
  const { count: regionCount } = await supabase.from('regions').select('*', { count: 'exact', head: true });
  const { count: articleCount } = await supabase.from('articles').select('*', { count: 'exact', head: true });
  const { count: stuntingCount } = await supabase.from('stunting_data').select('*', { count: 'exact', head: true });
  const { count: riskCount } = await supabase.from('risk_factors').select('*', { count: 'exact', head: true });

  // 2. Fetch trend data (Avg prevalence per year)
  const { data: trendDataRaw } = await supabase
    .from('stunting_data')
    .select('year, prevalence');
  
  const trendMap: Record<number, { year: number; total: number; count: number }> = {};
  trendDataRaw?.forEach(item => {
    if (!trendMap[item.year]) {
      trendMap[item.year] = { year: item.year, total: 0, count: 0 };
    }
    trendMap[item.year].total += item.prevalence;
    trendMap[item.year].count += 1;
  });

  const trendData = Object.values(trendMap)
    .map(t => ({
      year: t.year.toString(),
      prevalence: parseFloat((t.total / t.count).toFixed(2))
    }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

  // 3. Fetch top 5 regions by prevalence (latest available year)
  const latestYear = trendData.length > 0 ? parseInt(trendData[trendData.length - 1].year) : 2023;
  const { data: regionDataRaw } = await supabase
    .from('stunting_data')
    .select('prevalence, regions ( name )')
    .eq('year', latestYear)
    .order('prevalence', { ascending: false })
    .limit(5);

  const regionData = regionDataRaw?.map((item: any) => ({
    name: (Array.isArray(item.regions) ? item.regions[0]?.name : item.regions?.name)?.replace('Kabupaten ', 'Kab. ')?.replace('Kota ', 'Ktg. ') || 'Unknown',
    prevalence: item.prevalence
  })) || [];

  const stats = [
    { name: 'Data Stunting', stat: stuntingCount?.toString() || '0', sub: 'Total Record', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Faktor Risiko', stat: riskCount?.toString() || '0', sub: 'Total Record', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Wilayah Terdaftar', stat: regionCount?.toString() || '38', sub: 'Kabupaten/Kota', icon: Map, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Artikel Publikasi', stat: articleCount?.toString() || '0', sub: 'Draft & Publish', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan data stunting Provinsi Jawa Timur secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-[2rem] border border-gray-100 p-6 flex items-center gap-5 transition-all hover:shadow-md">
              <div className={`${item.bg} ${item.color} p-4 rounded-2xl`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <dt className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">{item.name}</dt>
                <dd className="mt-0.5">
                  <div className="text-2xl font-black text-gray-900 leading-tight">{item.stat}</div>
                  <div className="text-[10px] font-semibold text-gray-400">{item.sub}</div>
                </dd>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Trend Prevalensi
            </h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rata-rata %</span>
          </div>
          <div className="h-[300px] w-full">
            <AdminTrendChart data={trendData} />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Wilayah Tertinggi ({latestYear})
            </h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top 5 Wilayah</span>
          </div>
          <div className="h-[300px] w-full">
            <AdminRegionChart data={regionData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Aksi Cepat
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/admin/stunting" className="group p-6 bg-blue-50/50 border border-blue-100 rounded-3xl hover:bg-blue-600 hover:border-blue-700 transition-all duration-300">
              <div className="text-blue-600 group-hover:text-white mb-4 transition-colors">
                <Users className="w-8 h-8" />
              </div>
              <p className="text-sm font-black text-gray-800 group-hover:text-white uppercase transition-colors">Input Data Stunting</p>
              <p className="text-[10px] text-gray-400 group-hover:text-blue-100 mt-1 transition-colors">Kelola statistik tahunan</p>
            </Link>
            <Link href="/admin/risk-factors" className="group p-6 bg-green-50/50 border border-green-100 rounded-3xl hover:bg-green-600 hover:border-green-700 transition-all duration-300">
              <div className="text-green-600 group-hover:text-white mb-4 transition-colors">
                <Activity className="w-8 h-8" />
              </div>
              <p className="text-sm font-black text-gray-800 group-hover:text-white uppercase transition-colors">Update Faktor Risiko</p>
              <p className="text-[10px] text-gray-400 group-hover:text-green-100 mt-1 transition-colors">Analisis determinan lokal</p>
            </Link>
            <Link href="/admin/articles" className="group p-6 bg-orange-50/50 border border-orange-100 rounded-3xl hover:bg-orange-600 hover:border-orange-700 transition-all duration-300">
              <div className="text-orange-600 group-hover:text-white mb-4 transition-colors">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-sm font-black text-gray-800 group-hover:text-white uppercase transition-colors">Tulis Artikel Baru</p>
              <p className="text-[10px] text-gray-400 group-hover:text-orange-100 mt-1 transition-colors">Publikasi kebijakan & berita</p>
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2">Pantau & Analisis Melalui Peta</h3>
            <p className="text-blue-100 text-xs font-medium leading-relaxed">Gunakan fitur pemetaan untuk melihat sebaran stunting secara visual di seluruh Jawa Timur.</p>
          </div>
          <Link href="/map" className="mt-8 bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">
            Buka Peta Publik
            <Map className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
