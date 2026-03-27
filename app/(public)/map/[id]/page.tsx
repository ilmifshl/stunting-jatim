'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, TrendingDown, Users, AlertTriangle, Droplet, Info, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function RegionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const regionName = params.id ? decodeURIComponent(params.id as string) : 'Wilayah';

  // Mock data for detail illustration
  const mockDetail = {
    name: regionName,
    prevalence: 15.2,
    cases: 420,
    year: 2023,
    status: 'Cukup Rawan',
    factors: [
      { name: 'Akses Sanitasi Layak', score: 62, status: 'Kurang', icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
      { name: 'Air Bersih', score: 85, status: 'Baik', icon: Droplet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
      { name: 'Pendidikan Ibu', score: 70, status: 'Cukup', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    ],
    description: `Wilayah ${regionName} menunjukkan tren penurunan kasus sebesar 1.5% dari tahun sebelumnya. Intervensi lanjutan diperlukan terutama pada peningkatan sanitasi lingkungan dan edukasi gizi bagi ibu hamil.`,
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-black text-[10px] uppercase tracking-widest group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Kembali ke Peta Interaktif
      </button>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-5">
            <div className="bg-blue-600 p-5 rounded-[2rem] text-white shadow-xl shadow-blue-200">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Profil Wilayah</span>
                <div className="h-px w-8 bg-blue-100"></div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none">{mockDetail.name}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
             <div className="px-4 py-2 bg-white rounded-xl shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Tahun Data</p>
                <p className="text-sm font-black text-gray-900">{mockDetail.year}</p>
             </div>
             <div className="px-4 py-2 bg-white rounded-xl shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Status</p>
                <p className={`text-sm font-black ${
                  mockDetail.prevalence > 20 ? 'text-red-500' : mockDetail.prevalence > 14 ? 'text-yellow-600' : 'text-emerald-600'
                }`}>
                  {mockDetail.status.toUpperCase()}
                </p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Deskripsi & Insight */}
          <div className="lg:col-span-12">
            <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-50">
               <div className="flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Ringkasan Analisis</h3>
               </div>
               <p className="text-gray-600 text-lg leading-relaxed font-medium">
                {mockDetail.description}
              </p>
            </div>
          </div>

          {/* Highlight Stats Cards */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prevalensi Stunting</span>
              <div className="mt-8 flex items-end justify-between">
                <p className="text-5xl font-black text-gray-900 leading-none">{mockDetail.prevalence}%</p>
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg">
                  <TrendingDown className="w-3 h-3" />
                  -1.5%
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jumlah Kasus Terdata</span>
              <div className="mt-8 flex items-end justify-between">
                <p className="text-5xl font-black text-gray-900 leading-none">{mockDetail.cases}</p>
                <Users className="w-8 h-8 text-gray-100" />
              </div>
            </div>
          </div>

          {/* Analisis Faktor Kritis */}
          <div className="lg:col-span-8">
            <div className="bg-gray-50/50 p-8 rounded-[3rem] border border-gray-50 h-full">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-8">Determinan Kritis</h3>
              <div className="space-y-6">
                {mockDetail.factors.map((factor, index) => {
                  const Icon = factor.icon;
                  return (
                    <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 group hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${factor.bg} ${factor.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-black text-gray-900 text-sm uppercase tracking-tight">{factor.name}</span>
                        </div>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                          factor.status === 'Baik' ? 'bg-emerald-50 text-emerald-600' : 
                          factor.status === 'Cukup' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {factor.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              factor.score > 80 ? 'bg-emerald-500' : factor.score > 60 ? 'bg-blue-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${factor.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-black text-gray-900 w-10 text-right">{factor.score}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
