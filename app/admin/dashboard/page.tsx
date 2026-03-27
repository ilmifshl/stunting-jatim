import { Activity, Users, Map, FileText } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  // Real implementation would fetch actual counts from DB:
  // const { count: regionCount } = await supabase.from('regions').select('*', { count: 'exact', head: true });
  // const { count: articleCount } = await supabase.from('articles').select('*', { count: 'exact', head: true });

  const stats = [
    { name: 'Total Data Stunting', stat: '100+', icon: Users, color: 'bg-blue-500' },
    { name: 'Data Faktor Risiko', stat: '100+', icon: Activity, color: 'bg-green-500' },
    { name: 'Wilayah Terdaftar', stat: '38', icon: Map, color: 'bg-purple-500' },
    { name: 'Artikel Publikasi', stat: '12', icon: FileText, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-md ${item.color} text-white`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                      <dd>
                        <div className="text-2xl font-bold text-gray-900">{item.stat}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow-sm rounded-lg border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/stunting" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center text-sm font-medium text-gray-700">
              Input Data Stunting
            </Link>
            <Link href="/admin/risk-factors" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center text-sm font-medium text-gray-700">
              Update Faktor Risiko
            </Link>
            <Link href="/admin/articles" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center text-sm font-medium text-gray-700">
              Tulis Artikel Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
