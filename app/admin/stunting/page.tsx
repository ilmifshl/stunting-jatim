'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Edit, Trash2, ArrowUpDown, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import StuntingModal from '@/components/admin/modals/StuntingModal';
import DeleteConfirmModal from '@/components/admin/modals/DeleteConfirmModal';
import AdminToolbar from '@/components/admin/AdminToolbar';
import { toast } from 'sonner';

export default function StuntingManagement() {
  const [records, setRecords] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: 'year',
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
      const { data: stuntingData } = await supabase
        .from('stunting_data')
        .select('id, year, stunting_cases, prevalence, region_id, regions(name)');

      const { data: regionsData } = await supabase
        .from('regions')
        .select('id, name')
        .order('name');

      if (stuntingData) setRecords(stuntingData);
      if (regionsData) setRegions(regionsData);
    } catch (err) {
      toast.error('Gagal mengambil data');
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

    // Year filter
    if (filterYear !== 'all') {
      items = items.filter(r => r.year.toString() === filterYear);
    }

    // Region filter
    if (filterRegion !== 'all') {
      items = items.filter(r => r.region_id?.toString() === filterRegion);
    }

    // Search filter
    if (searchTerm) {
      items = items.filter(r => 
        r.regions?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.year.toString().includes(searchTerm) ||
        r.stunting_cases?.toString().includes(searchTerm) ||
        r.prevalence?.toString().includes(searchTerm)
      );
    }

    if (sortConfig.direction !== null) {
      items.sort((a, b) => {
        let aValue = sortConfig.key === 'region' ? a.regions?.name : a[sortConfig.key];
        let bValue = sortConfig.key === 'region' ? b.regions?.name : b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [records, sortConfig, searchTerm, filterYear, filterRegion]);

  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(records.map(r => r.year.toString())));
    return uniqueYears.sort((a, b) => b.localeCompare(a));
  }, [records]);

  const handleDelete = async () => {
    if (!selectedRecord) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('stunting_data').delete().eq('id', selectedRecord.id);
      if (error) throw error;
      toast.success('Data berhasil dihapus');
      fetchData();
      setIsDeleteOpen(false);
    } catch (err) {
      toast.error('Gagal menghapus data');
    } finally {
      setIsLoading(false);
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="w-3 h-3 text-gray-300" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-blue-600" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-blue-100">
            <Filter className="w-3 h-3" /> Manajemen Tabel
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">Data Stunting</h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">Monitoring prevalensi dan jumlah kasus tahunan per wilayah.</p>
        </div>
        <button
          onClick={() => { setSelectedRecord(null); setIsModalOpen(true); }}
          className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3.5 text-xs font-black text-white uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:translate-y-[-2px] active:translate-y-0 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Data
        </button>
      </div>

      <AdminToolbar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={sortedRecords.length}
        years={years}
        filterYear={filterYear}
        onYearChange={setFilterYear}
        regions={regions}
        filterRegion={filterRegion}
        onRegionChange={setFilterRegion}
        accentColor="blue"
      />

      <div className="bg-white shadow-sm ring-1 ring-gray-100 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                {[
                  { label: 'Wilayah', key: 'region' },
                  { label: 'Tahun', key: 'year' },
                  { label: 'Jumlah Kasus', key: 'stunting_cases' },
                  { label: 'Prevalensi (%)', key: 'prevalence' },
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
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-bold uppercase tracking-widest text-[10px]">Memuat Data...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-sm text-gray-500 font-bold uppercase tracking-widest">Belum ada data stunting.</td>
                </tr>
              ) : (
                sortedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="whitespace-nowrap px-6 py-5 text-sm font-bold text-gray-900">{record.regions?.name || 'Unknown'}</td>
                    <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-gray-500">{record.year}</td>
                    <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-gray-500">{(record.stunting_cases ?? 0).toLocaleString()}</td>
                    <td className="whitespace-nowrap px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.prevalence > 20 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {record.prevalence}%
                      </span>
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

      <StuntingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        regions={regions}
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
