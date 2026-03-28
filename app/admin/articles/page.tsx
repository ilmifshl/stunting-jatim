'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Edit, Trash2, ArrowUpDown, ChevronUp, ChevronDown, FileText, ImageIcon } from 'lucide-react';
import ArticleModal from '@/components/admin/modals/ArticleModal';
import DeleteConfirmModal from '@/components/admin/modals/DeleteConfirmModal';
import AdminToolbar from '@/components/admin/AdminToolbar';
import { toast } from 'sonner';

export default function ArticlesManagement() {
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: 'created_at',
    direction: 'desc',
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const supabase = createClient();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('articles')
        .select('*');
      if (data) setRecords(data);
    } catch (err) {
      toast.error('Gagal mengambil artikel');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const sortedRecords = useMemo(() => {
    let items = [...records];
    
    // Category filter
    if (filterCategory !== 'all') {
      items = items.filter(r => r.category === filterCategory);
    }

    if (searchTerm) {
      items = items.filter(r => 
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig.direction !== null) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [records, sortConfig, searchTerm, filterCategory]);

  const categories = useMemo(() => {
    return Array.from(new Set(records.map(r => r.category).filter(Boolean)));
  }, [records]);

  const handleDelete = async () => {
    if (!selectedRecord) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('articles').delete().eq('id', selectedRecord.id);
      if (error) throw error;
      toast.success('Artikel berhasil dihapus');
      fetchData();
      setIsDeleteOpen(false);
    } catch (err) {
      toast.error('Gagal menghapus artikel');
    } finally {
      setIsLoading(false);
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="w-3 h-3 text-gray-300" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-orange-600" /> : <ChevronDown className="w-3 h-3 text-orange-600" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-orange-100">
            <FileText className="w-3 h-3" /> Publikasi & Edukasi
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">Manajemen Artikel</h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">Kelola konten edukasi, berita, dan kebijakan stunting.</p>
        </div>
        <button 
          onClick={() => { setSelectedRecord(null); setIsModalOpen(true); }}
          className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-6 py-3.5 text-xs font-black text-white uppercase tracking-widest shadow-xl shadow-orange-200 hover:bg-orange-700 hover:translate-y-[-2px] active:translate-y-0 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tulis Artikel Baru
        </button>
      </div>

      <AdminToolbar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={sortedRecords.length}
        categories={categories}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        accentColor="orange"
      />

      <div className="bg-white shadow-sm ring-1 ring-gray-100 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Cover</th>
                {[
                  { label: 'Judul Artikel', key: 'title' },
                  { label: 'Kategori', key: 'category' },
                  { label: 'Tanggal', key: 'created_at' },
                ].map((col) => (
                  <th 
                    key={col.key} 
                    onClick={() => handleSort(col.key)}
                    className="group px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-white transition-all"
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      <SortIcon column={col.key} />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {isLoading && records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-bold uppercase tracking-widest text-[10px]">Memuat Artikel...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-sm text-gray-500 font-bold uppercase tracking-widest">Belum ada artikel.</td>
                </tr>
              ) : (
                sortedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-5">
                      {record.image_url ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                          <img src={record.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-900 truncate max-w-xs">{record.title}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">Author Admin</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {record.category || 'General'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-gray-500">
                      {new Date(record.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <button 
                        onClick={() => { setSelectedRecord(record); setIsModalOpen(true); }}
                        className="p-2.5 bg-gray-50 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all shadow-sm border border-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedRecord(record); setIsDeleteOpen(true); }}
                        className="p-2.5 bg-gray-50 text-red-600 rounded-xl hover:bg-red-50 transition-all shadow-sm border border-gray-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ArticleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
        editRecord={selectedRecord}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}
