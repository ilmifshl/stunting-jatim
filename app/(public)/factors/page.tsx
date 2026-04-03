'use client';

import RiskRadarChart from '@/components/charts/RiskRadarChart';
import RiskBarChart from '@/components/charts/RiskBarChart';
import { AlertTriangle, TrendingUp, Users, Info, ShieldCheck, HeartPulse, Droplets, Activity } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function RiskFactorsPage() {
  const { lang, t } = useLanguage();

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-blue-100">
            <Info className="w-3 h-3" />
            {t.factors.contentAnalysis}
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight uppercase tracking-tighter">
            {t.factors.title.split('Risiko Stunting')[0]} <span className="text-blue-600">Risiko Stunting</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl leading-relaxed font-medium">
            {t.factors.subtitle}
          </p>
        </div>
      </div>

      {/* Determinan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="group bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-red-50/50">
            <Activity className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{t.factors.directRisk}</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            {t.factors.directRiskDesc}
          </p>
        </div>

        <div className="group bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-blue-50/50">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{t.factors.effectivePrevention}</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            {t.factors.effectivePreventionDesc}
          </p>
        </div>

        <div className="group bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-emerald-50/50">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{t.factors.maternalHealth}</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            {t.factors.maternalHealthDesc}
          </p>
        </div>

        <div className="group bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-indigo-50/50">
            <Droplets className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{t.factors.environment}</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            {t.factors.environmentDesc}
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
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{t.factors.riskBalance}</h2>
                    <p className="text-xs text-gray-400 font-bold">{t.factors.avgProvince}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">RADAR CHART</span>
                </div>
                <RiskRadarChart />
              </div>

              <div className="bg-white p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{t.factors.regionalComparison}</h2>
                    <p className="text-xs text-gray-400 font-bold">{t.factors.mainIndicators}</p>
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
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-4">{t.factors.knowTriggerTitle}</h2>
          <p className="text-gray-500 font-medium">{t.factors.knowTriggerDesc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-red-600 uppercase mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t.factors.directRisk}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">BBLR (Berat Badan Lahir Rendah) / LBW (Low Birth Weight)</h4>
                <p className="text-sm text-gray-500 leading-relaxed italic">
                  {lang === 'id' ? 'Bayi yang lahir dengan berat di bawah 2.500 gram memiliki cadangan gizi yang terbatas dan organ yang belum sepenuhnya matang. Tanpa pemantauan dan intervensi gizi ekstra, mereka lebih berisiko mengalami gagal tumbuh.' : 'Babies born weighing under 2,500 grams have limited nutritional reserves and organs that are not yet fully mature. Without extra nutritional monitoring and intervention, they are at higher risk of growth failure.'}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <h4 className="font-bold text-gray-900 mb-2">{lang === 'id' ? 'Inisiasi Menyusu Dini (IMD) yang Gagal' : 'Failed Early Initiation of Breastfeeding (EIB)'}</h4>
                <p className="text-sm text-gray-500 leading-relaxed italic">
                  {lang === 'id' ? 'Pemberian ASI dalam satu jam pertama kelahiran memungkinkan bayi mendapatkan kolostrum yang kaya akan antibodi. Kegagalan IMD menghilangkan proteksi dini ini, membuat bayi lebih rentan terhadap infeksi sejak hari pertama kehidupan.' : 'Breastfeeding within the first hour of birth allows the baby to get colostrum which is rich in antibodies. Failure of EIB eliminates this early protection, making the baby more susceptible to infections from the first day of life.'}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <h4 className="font-bold text-gray-900 mb-2">{lang === 'id' ? 'Kurangnya ASI Eksklusif' : 'Lack of Exclusive Breastfeeding'}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {lang === 'id' ? 'ASI adalah benteng pertahanan pertama anak. Tanpa ASI eksklusif selama 6 bulan, bayi kehilangan antibodi alami sehingga lebih mudah sakit. Infeksi yang berulang inilah yang menjadi salah satu pemicu utama stunting.' : "Breast milk is a child's first line of defense. Without exclusive breastfeeding for 6 months, babies lose natural antibodies so they get sick more easily. These repeated infections are one of the main triggers for stunting."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-blue-600 uppercase mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              {t.factors.effectivePrevention}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">{lang === 'id' ? 'Imunisasi Dasar Lengkap (IDL) yang Terlewat' : 'Missed Complete Basic Immunization (CBI)'}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {lang === 'id' ? 'Penyakit yang sebenarnya bisa dicegah (seperti campak) akan memaksa tubuh anak menggunakan seluruh energinya untuk melawan kuman. Akibatnya, gizi yang seharusnya dipakai untuk tumbuh tinggi justru habis untuk masa penyembuhan.' : 'Diseases that are actually preventable (such as measles) will force the child\'s body to use all its energy to fight germs. As a result, nutrition that should be used for growing tall is instead used up for the recovery period.'}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <h4 className="font-bold text-gray-900 mb-2">{lang === 'id' ? 'Defisiensi Vitamin A' : 'Vitamin A Deficiency'}</h4>
                <p className="text-sm text-gray-500 leading-relaxed italic">
                  {lang === 'id' ? 'Kekurangan Vitamin A membuat lapisan pelindung organ tubuh anak melemah. Hal ini membuat mereka sangat rentan terkena diare dan infeksi saluran pernapasan, yang secara drastis menguras nutrisi tubuh.' : 'Vitamin A deficiency weakens the protective layer of the child\'s body organs. This makes them very susceptible to diarrhea and respiratory tract infections, which drastically deplete the body\'s nutrients.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-emerald-600 uppercase mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t.factors.maternalHealth}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">{lang === 'id' ? 'Anemia Ibu (Kurang Tablet Tambah Darah)' : 'Maternal Anemia (Lack of Blood Addition Tablets)'}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {lang === 'id' ? 'Anemia mengurangi suplai oksigen dan zat besi ke janin. Pertumbuhan dalam kandungan yang terhambat (IUGR) adalah akar dari anak yang lahir "pendek".' : 'Anemia reduces the supply of oxygen and iron to the fetus. Intrautreine growth restriction (IUGR) is the root of children being born "short".'}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <h4 className="font-bold text-gray-900 mb-2">{lang === 'id' ? 'Kesiapan Gizi Calon Pengantin' : 'Nutritional Readiness of Prospective Brides'}</h4>
                <p className="text-sm text-gray-500 leading-relaxed italic">
                  {lang === 'id' ? 'Pencegahan stunting dimulai sebelum kehamilan. Calon ibu dengan status gizi buruk (seperti Kurang Energi Kronis) memiliki risiko tinggi melahirkan bayi stunting. Persiapan gizi harus dilakukan sejak dini.' : 'Stunting prevention begins before pregnancy. Prospective mothers with poor nutritional status (such as Chronic Energy Deficiency) have a high risk of giving birth to stunting babies. Nutritional preparation must be done early.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-indigo-600 uppercase mb-6 flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              {t.factors.environment}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">{lang === 'id' ? 'Akses Jamban Tidak Layak' : 'Inadequate Latrine Access'}</h4>
                <p className="text-sm text-gray-500 leading-relaxed italic">
                  {lang === 'id' ? 'Lingkungan yang tercemar kotoran memicu diare kronis. Saat diare, tubuh anak membuang cairan dan nutrisi penting jauh lebih cepat daripada kemampuan usus untuk menyerap makanan baru.' : 'Environments contaminated with waste trigger chronic diarrhea. During diarrhea, a child\'s body discards fluids and essential nutrients much faster than the intestines\' ability to absorb new food.'}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <h4 className="font-bold text-gray-900 mb-2">{lang === 'id' ? 'Lingkungan Non-STBM (Sanitasi Buruk)' : 'Non-STBM Environment (Poor Sanitation)'}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {lang === 'id' ? 'Paparan bakteri kotor yang terus-menerus bisa memicu peradangan usus kronis pada anak. Akibatnya, meskipun anak makan dengan porsi dan gizi yang cukup, ususnya kesulitan menyerap nutrisi tersebut dengan baik.' : 'Continuous exposure to dirty bacteria can trigger chronic intestinal inflammation in children. As a result, even if the child eats enough portions and nutrition, the intestines have difficulty absorbing those nutrients well.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
