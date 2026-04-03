'use client';

import { Info, TrendingDown, TrendingUp, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function InsightBox() {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Info className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{t.insights.title}</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-50">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{t.insights.featureRegion}</h3>
          <p className="text-gray-900 font-medium leading-relaxed">
            {t.insights.featureDesc
              .replace('{year}', '2023')
              .split(/(\{year\}|\{region\})/g)
              .map((part: string, i: number) => {
                if (part === '{year}') return <span key={i} className="font-bold text-blue-600">2023</span>;
                if (part === '{region}') return <span key={i} className="font-bold">Surabaya</span>;
                return part;
              })
            }
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-50">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{t.insights.changeTrend}</h3>
          <div className="flex items-start gap-3">
            <div className="mt-1 bg-green-100 text-green-600 p-1.5 rounded-full shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <p className="text-gray-900 leading-relaxed text-sm">
              {t.insights.changeDesc
                .split(/(\{pct\}|\{count\})/g)
                .map((part: string, i: number) => {
                  if (part === '{pct}') return <span key={i} className="font-bold text-green-600">2.5%</span>;
                  if (part === '{count}') return <span key={i} className="font-bold">4</span>;
                  return part;
                })
              }
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-50">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{t.insights.dominantFactors}</h3>
          <ul className="space-y-3 mt-3">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0"></span>
              {t.insights.sanitationFactor}
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 shrink-0"></span>
              {t.insights.nutritionFactor}
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 flex items-center justify-center p-4 bg-blue-100/50 rounded-xl text-blue-800 text-sm font-medium">
        <HelpCircle className="w-4 h-4 mr-2" />
        {t.insights.selectInstruction}
      </div>
    </div>
  );
}
