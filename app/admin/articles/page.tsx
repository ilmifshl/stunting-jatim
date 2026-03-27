import { createClient } from '@/utils/supabase/server';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default async function ArticlesManagement() {
  const supabase = await createClient();
  
  const { data: records, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Artikel</h1>
          <p className="mt-2 text-sm text-gray-700">Kelola artikel edukasi dan publikasi terkait stunting.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Tulis Artikel Baru
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-300 sm:rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Judul Artikel</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tanggal Publikasi</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {error || !records || records.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-sm text-gray-500">Belum ada artikel.</td>
              </tr>
            ) : (
              records.map((record: any) => (
                <tr key={record.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    <div className="truncate max-w-sm">{record.title}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(record.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center">
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900 inline-flex items-center">
                      <Trash2 className="w-4 h-4 mr-1" /> Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
