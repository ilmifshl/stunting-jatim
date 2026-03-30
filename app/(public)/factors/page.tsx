import RiskRadarChart from '@/components/charts/RiskRadarChart';
import RiskBarChart from '@/components/charts/RiskBarChart';
import { AlertTriangle, TrendingUp, Users, Info, ShieldCheck, HeartPulse, Droplets, Activity } from 'lucide-react';

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
            Menganalisis berbagai variabel yang memengaruhi prevalensi stunting di Jawa Timur melalui empat dimensi risiko utama.
          </p>
        </div>
      </div>

      {/* Determinan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="group bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-red-50/50">
            <Activity className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Risiko Langsung</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            Faktor biologis pada anak seperti BBLR (Berat Badan Lahir Rendah), IMD, dan cakupan ASI Eksklusif.
          </p>
        </div>

        <div className="group bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-blue-50/50">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Pencegahan Efektif</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            Layanan kesehatan dasar preventif termasuk Imunisasi Dasar Lengkap (IDL) dan asupan Vitamin A.
          </p>
        </div>

        <div className="group bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-emerald-50/50">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Kesehatan Ibu</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            Intervensi pada ibu hamil melalui Tablet Tambah Darah (TTD) dan kesiapan kesehatan Calon Pengantin.
          </p>
        </div>

        <div className="group bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-indigo-50/50">
            <Droplets className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Lingkungan</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            Akses terhadap infrastruktur dasar seperti Jamban Layak dan program STBM di lingkungan masyarakat.
          </p>
        </div>
      </div>

      {/* Visualisasi Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        <div className="lg:col-span-12">
          <div className="bg-gray-900/5 p-1 rounded-[2.5rem]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-gray-200 overflow-hidden rounded-[2.2rem] border border-gray-200 shadow-inner">
              <div className="bg-white p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Keseimbangan Faktor Risiko</h2>
                    <p className="text-xs text-gray-400 font-bold">RERATA PROVINSI</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">RADAR CHART</span>
                </div>
                <RiskRadarChart />
              </div>

              <div className="bg-white p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Komparasi antar Wilayah</h2>
                    <p className="text-xs text-gray-400 font-bold">4 INDIKATOR UTAMA</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">BAR CHART</span>
                </div>
                <RiskBarChart />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Explainer Section */}
      <div className="space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-4">Mengenal Faktor Pemicu Stunting</h2>
          <p className="text-gray-500 font-medium">Setiap anak berhak tumbuh optimal. Mari kenali berbagai faktor kesehatan, lingkungan, dan pola asuh yang dapat menghambat tumbuh kembang mereka.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-red-600 uppercase mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Risiko Biologis Langsung
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">BBLR (Berat Badan Lahir Rendah)</h4>
                <p className="text-sm text-gray-500 leading-relaxed italic">
                  Bayi yang lahir dengan berat di bawah 2.500 gram memiliki cadangan gizi yang terbatas dan organ yang belum sepenuhnya matang. Tanpa pemantauan dan intervensi gizi ekstra, mereka lebih berisiko mengalami gagal tumbuh.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <h4 className="font-bold text-gray-900 mb-2">Kurangnya ASI Eksklusif</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  ASI adalah benteng pertahanan pertama anak. Tanpa ASI eksklusif selama 6 bulan, bayi kehilangan antibodi alami sehingga lebih mudah sakit. Infeksi yang berulang inilah yang menjadi salah satu pemicu utama stunting.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-blue-600 uppercase mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Layanan Pencegahan
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Imunisasi Dasar Lengkap (IDL) yang Terlewat</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Penyakit yang sebenarnya bisa dicegah (seperti campak) akan memaksa tubuh anak menggunakan seluruh energinya untuk melawan kuman. Akibatnya, gizi yang seharusnya dipakai untuk tumbuh tinggi justru habis untuk masa penyembuhan.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <h4 className="font-bold text-gray-900 mb-2">Defisiensi Vitamin A</h4>
                <p className="text-sm text-gray-500 leading-relaxed italic">
                  Kekurangan Vitamin A membuat lapisan pelindung organ tubuh anak melemah. Hal ini membuat mereka sangat rentan terkena diare dan infeksi saluran pernapasan, yang secara drastis menguras nutrisi tubuh.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-emerald-600 uppercase mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Kesehatan Ibu & Calon Pengantin (Catin)
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Anemia Ibu pada (Kurang Tablet Tambah Darah)</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Anemia mengurangi suplai oksigen dan zat besi ke janin. Pertumbuhan dalam kandungan yang terhambat (IUGR) adalah akar dari anak yang lahir "pendek".
                </p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <h4 className="font-bold text-gray-900 mb-2">Kesiapan Gizi Calon Pengantin</h4>
                <p className="text-sm text-gray-500 leading-relaxed italic">
                  Pencegahan stunting dimulai sebelum kehamilan. Calon ibu dengan status gizi buruk (seperti Kurang Energi Kronis) memiliki risiko tinggi melahirkan bayi stunting. Persiapan gizi harus dilakukan sejak dini.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-indigo-600 uppercase mb-6 flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              Sanitasi & Lingkungan
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Akses Jamban Tidak Layak</h4>
                <p className="text-sm text-gray-500 leading-relaxed italic">
                  Lingkungan yang tercemar kotoran memicu diare kronis. Saat diare, tubuh anak membuang cairan dan nutrisi penting jauh lebih cepat daripada kemampuan usus untuk menyerap makanan baru.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <h4 className="font-bold text-gray-900 mb-2">Lingkungan Non-STBM (Sanitasi Buruk)</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Paparan bakteri kotor yang terus-menerus bisa memicu peradangan usus kronis pada anak. Akibatnya, meskipun anak makan dengan porsi dan gizi yang cukup, ususnya kesulitan menyerap nutrisi tersebut dengan baik.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
