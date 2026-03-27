import RiskRadarChart from '@/components/charts/RiskRadarChart';
import RiskBarChart from '@/components/charts/RiskBarChart';
import { AlertTriangle, TrendingUp, Users, Info, ShieldCheck, HeartPulse } from 'lucide-react';

export default function RiskFactorsPage() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-blue-100">
            <Info className="w-3 h-3" />
            Analisis Konten
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight uppercase tracking-tighter">
            Faktor Penentu <span className="text-blue-600">Risiko Stunting</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl leading-relaxed font-medium">
            Menganalisis variabel utama yang memengaruhi prevalensi stunting di Jawa Timur melalui visualisasi data komparatif.
          </p>
        </div>
      </div>

      {/* Determinan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="group bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-indigo-50/50">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Sanitasi & Air</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">Akses air bersih dan sanitasi layak secara signifikan memengaruhi kesehatan anak dan prevalensi penyakit infeksi.</p>
        </div>

        <div className="group bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-blue-50/50">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Pendidikan Ibu</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">Literasi kesehatan ibu berkorelasi kuat dengan pola asuh dan kualitas nutrisi yang diberikan pada masa pertumbuhan emas.</p>
        </div>

        <div className="group bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-emerald-50/50">
            <HeartPulse className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Status Gizi</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">Intervensi nutrisi pada 1000 Hari Pertama Kehidupan (HPK) adalah kunci pencegahan stunting secara permanen.</p>
        </div>
      </div>

      {/* Visualisasi Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <div className="bg-gray-900/5 p-1 rounded-[2.5rem]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-gray-200 overflow-hidden rounded-[2.2rem] border border-gray-200 shadow-inner">
              <div className="bg-white p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Profil Risiko Nasional</h2>
                  <span className="text-[10px] font-bold text-gray-400">RADAR CHART</span>
                </div>
                <RiskRadarChart />
              </div>

              <div className="bg-white p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Komparasi antar Wilayah</h2>
                  <span className="text-[10px] font-bold text-gray-400">BAR CHART</span>
                </div>
                <RiskBarChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
