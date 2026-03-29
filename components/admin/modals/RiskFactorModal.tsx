'use client';

import { useState, useEffect } from 'react';
import { X, Check, ChevronDown } from 'lucide-react';
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
  const [openGroups, setOpenGroups] = useState<string[]>(['langsung']);
  const [formData, setFormData] = useState({
    region_id: '',
    year: new Date().getFullYear(),
    bblr_count: 0, bblr_rate: 0,
    imd_count: 0, imd_rate: 0,
    asi_count: 0, asi_rate: 0,
    idl_count: 0, idl_rate: 0,
    vita_count: 0, vita_rate: 0,
    ttd_count: 0, ttd_rate: 0,
    catin_count: 0, catin_rate: 0,
    jamban_count: 0, jamban_rate: 0,
    stbm_count: 0, stbm_rate: 0,
  });

  useEffect(() => {
    if (editRecord) {
      setFormData({
        region_id: editRecord.region_id || '',
        year: editRecord.year || new Date().getFullYear(),
        bblr_count: editRecord.bblr_count || 0, bblr_rate: editRecord.bblr_rate || 0,
        imd_count: editRecord.imd_count || 0, imd_rate: editRecord.imd_rate || 0,
        asi_count: editRecord.asi_count || 0, asi_rate: editRecord.asi_rate || 0,
        idl_count: editRecord.idl_count || 0, idl_rate: editRecord.idl_rate || 0,
        vita_count: editRecord.vita_count || 0, vita_rate: editRecord.vita_rate || 0,
        ttd_count: editRecord.ttd_count || 0, ttd_rate: editRecord.ttd_rate || 0,
        catin_count: editRecord.catin_count || 0, catin_rate: editRecord.catin_rate || 0,
        jamban_count: editRecord.jamban_count || 0, jamban_rate: editRecord.jamban_rate || 0,
        stbm_count: editRecord.stbm_count || 0, stbm_rate: editRecord.stbm_rate || 0,
      });
    } else {
      setFormData({
        region_id: '',
        year: new Date().getFullYear(),
        bblr_count: 0, bblr_rate: 0,
        imd_count: 0, imd_rate: 0,
        asi_count: 0, asi_rate: 0,
        idl_count: 0, idl_rate: 0,
        vita_count: 0, vita_rate: 0,
        ttd_count: 0, ttd_rate: 0,
        catin_count: 0, catin_rate: 0,
        jamban_count: 0, jamban_rate: 0,
        stbm_count: 0, stbm_rate: 0,
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
          .from('stunting_factors')
          .update(formData)
          .eq('id', editRecord.id);

        if (error) throw error;
        toast.success('Data faktor risiko berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('stunting_factors')
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

            <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2 space-y-3">
              {/* Group 1: Faktor Risiko Langsung */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setOpenGroups(prev => prev.includes('langsung') ? prev.filter(g => g !== 'langsung') : [...prev, 'langsung'])}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left transition-all ${openGroups.includes('langsung') ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}
                >
                  <span className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em]">1. Faktor Risiko Langsung</span>
                  <ChevronDown className={`w-4 h-4 text-green-600 transition-transform duration-300 ${openGroups.includes('langsung') ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out px-5 overflow-hidden ${openGroups.includes('langsung') ? 'py-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">BBLR/Prematur (Jml)</label>
                      <input type="number" required min="0" value={formData.bblr_count} onChange={(e) => setFormData({ ...formData, bblr_count: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">BBLR/Prematur (%)</label>
                      <input type="number" step="0.01" required min="0" max="100" value={formData.bblr_rate} onChange={(e) => setFormData({ ...formData, bblr_rate: parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">IMD (Jml)</label>
                      <input type="number" required min="0" value={formData.imd_count} onChange={(e) => setFormData({ ...formData, imd_count: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">IMD (%)</label>
                      <input type="number" step="0.01" required min="0" max="100" value={formData.imd_rate} onChange={(e) => setFormData({ ...formData, imd_rate: parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">ASI Eksklusif (Jml)</label>
                      <input type="number" required min="0" value={formData.asi_count} onChange={(e) => setFormData({ ...formData, asi_count: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">ASI (6 bln) (%)</label>
                      <input type="number" step="0.01" required min="0" max="100" value={formData.asi_rate} onChange={(e) => setFormData({ ...formData, asi_rate: parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Faktor Pencegahan */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setOpenGroups(prev => prev.includes('pencegahan') ? prev.filter(g => g !== 'pencegahan') : [...prev, 'pencegahan'])}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left transition-all ${openGroups.includes('pencegahan') ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}
                >
                  <span className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em]">2. Faktor Pencegahan</span>
                  <ChevronDown className={`w-4 h-4 text-green-600 transition-transform duration-300 ${openGroups.includes('pencegahan') ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out px-5 overflow-hidden ${openGroups.includes('pencegahan') ? 'py-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">IDL (Jml)</label>
                      <input type="number" required min="0" value={formData.idl_count} onChange={(e) => setFormData({ ...formData, idl_count: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">IDL (%)</label>
                      <input type="number" step="0.01" required min="0" max="100" value={formData.idl_rate} onChange={(e) => setFormData({ ...formData, idl_rate: parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Vit A (Jml)</label>
                      <input type="number" required min="0" value={formData.vita_count} onChange={(e) => setFormData({ ...formData, vita_count: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Vit A (%)</label>
                      <input type="number" step="0.01" required min="0" max="100" value={formData.vita_rate} onChange={(e) => setFormData({ ...formData, vita_rate: parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 3: Faktor Risiko Ibu */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setOpenGroups(prev => prev.includes('ibu') ? prev.filter(g => g !== 'ibu') : [...prev, 'ibu'])}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left transition-all ${openGroups.includes('ibu') ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}
                >
                  <span className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em]">3. Faktor Risiko Ibu</span>
                  <ChevronDown className={`w-4 h-4 text-green-600 transition-transform duration-300 ${openGroups.includes('ibu') ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out px-5 overflow-hidden ${openGroups.includes('ibu') ? 'py-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tablet TTD (Jml)</label>
                      <input type="number" required min="0" value={formData.ttd_count} onChange={(e) => setFormData({ ...formData, ttd_count: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tablet TTD (%)</label>
                      <input type="number" step="0.01" required min="0" max="100" value={formData.ttd_rate} onChange={(e) => setFormData({ ...formData, ttd_rate: parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Catin Dilayani (Jml)</label>
                      <input type="number" required min="0" value={formData.catin_count} onChange={(e) => setFormData({ ...formData, catin_count: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Catin Dilayani (%)</label>
                      <input type="number" step="0.01" required min="0" max="100" value={formData.catin_rate} onChange={(e) => setFormData({ ...formData, catin_rate: parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 4: Faktor Lingkungan */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setOpenGroups(prev => prev.includes('lingkungan') ? prev.filter(g => g !== 'lingkungan') : [...prev, 'lingkungan'])}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left transition-all ${openGroups.includes('lingkungan') ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}
                >
                  <span className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em]">4. Faktor Lingkungan</span>
                  <ChevronDown className={`w-4 h-4 text-green-600 transition-transform duration-300 ${openGroups.includes('lingkungan') ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out px-5 overflow-hidden ${openGroups.includes('lingkungan') ? 'py-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Jamban Sehat (Jml)</label>
                      <input type="number" required min="0" value={formData.jamban_count} onChange={(e) => setFormData({ ...formData, jamban_count: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Jamban Sehat (%)</label>
                      <input type="number" step="0.01" required min="0" max="100" value={formData.jamban_rate} onChange={(e) => setFormData({ ...formData, jamban_rate: parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">STBM & Rumah (Jml)</label>
                      <input type="number" required min="0" value={formData.stbm_count} onChange={(e) => setFormData({ ...formData, stbm_count: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                    <div className="space-y-1.5"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">STBM & Rumah (%)</label>
                      <input type="number" step="0.01" required min="0" max="100" value={formData.stbm_rate} onChange={(e) => setFormData({ ...formData, stbm_rate: parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-slate-500" />
                    </div>
                  </div>
                </div>
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
