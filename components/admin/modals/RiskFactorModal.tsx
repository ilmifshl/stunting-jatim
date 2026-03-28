'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface Region {
  id: string;
  name: string;
}

interface RiskFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  regions: Region[];
  editRecord?: any;
}

export default function RiskFactorModal({
  isOpen,
  onClose,
  onSuccess,
  regions,
  editRecord = null,
}: RiskFactorModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    region_id: '',
    year: new Date().getFullYear(),
    sanitation: 0,
    clean_water: 0,
    mother_education: 0,
    nutrition_status: 0,
  });

  useEffect(() => {
    if (editRecord) {
      setFormData({
        region_id: editRecord.region_id || '',
        year: editRecord.year || new Date().getFullYear(),
        sanitation: editRecord.sanitation || 0,
        clean_water: editRecord.clean_water || 0,
        mother_education: editRecord.mother_education || 0,
        nutrition_status: editRecord.nutrition_status || 0,
      });
    } else {
      setFormData({
        region_id: '',
        year: new Date().getFullYear(),
        sanitation: 0,
        clean_water: 0,
        mother_education: 0,
        nutrition_status: 0,
      });
    }
  }, [editRecord, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();

    try {
      if (editRecord) {
        const { error } = await supabase
          .from('risk_factors')
          .update(formData)
          .eq('id', editRecord.id);

        if (error) throw error;
        toast.success('Data faktor risiko berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('risk_factors')
          .insert([formData]);

        if (error) throw error;
        toast.success('Data faktor risiko baru berhasil ditambahkan');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              {editRecord ? 'Edit Faktor Risiko' : 'Tambah Faktor Risiko'}
            </h3>
            <button onClick={onClose} className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-400 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Wilayah</label>
                <select
                  required
                  value={formData.region_id}
                  onChange={(e) => setFormData({ ...formData, region_id: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all appearance-none text-slate-500"
                >
                  <option value="" className='text-gray-800'>Pilih Wilayah...</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Tahun</label>
                <input
                  type="number"
                  required
                  min="2000"
                  max="2100"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Sanitasi (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  max="100"
                  placeholder="Contoh: 85.0"
                  value={formData.sanitation}
                  onChange={(e) => setFormData({ ...formData, sanitation: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Air Bersih (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  max="100"
                  placeholder="Contoh: 92.5"
                  value={formData.clean_water}
                  onChange={(e) => setFormData({ ...formData, clean_water: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Pendidikan Ibu (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  max="100"
                  placeholder="Contoh: 78.2"
                  value={formData.mother_education}
                  onChange={(e) => setFormData({ ...formData, mother_education: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Status Gizi (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  max="100"
                  placeholder="Contoh: 88.0"
                  value={formData.nutrition_status}
                  onChange={(e) => setFormData({ ...formData, nutrition_status: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 text-slate-500"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl text-xs font-black text-gray-600 uppercase hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-green-200 hover:bg-green-700 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
