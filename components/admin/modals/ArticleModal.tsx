'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Check, Image as ImageIcon, Upload, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { uploadFile } from '@/utils/supabase/upload';
import { toast } from 'sonner';
import TiptapEditor from '../TiptapEditor';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRecord?: any;
}

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

export default function ArticleModal({
  isOpen,
  onClose,
  onSuccess,
  editRecord = null,
}: ArticleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Kebijakan',
    image_url: '',
  });

  useEffect(() => {
    if (editRecord) {
      setFormData({
        title: editRecord.title || '',
        content: editRecord.content || '',
        category: editRecord.category || 'Kebijakan',
        image_url: editRecord.image_url || '',
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'Kebijakan',
        image_url: '',
      });
    }
  }, [editRecord, isOpen]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const mockEvent = { target: { files: [file] } } as any;
      handleFileUpload(mockEvent);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diizinkan');
      return;
    }

    setIsUploading(true);
    try {
      const publicUrl = await uploadFile(file);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Gambar berhasil diunggah');
    } catch (err: any) {
      toast.error('Gagal mengunggah gambar: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();

    // Use default cover if none uploaded
    const finalData = {
      ...formData,
      image_url: formData.image_url || DEFAULT_COVER
    };

    try {
      if (editRecord) {
        const { error } = await supabase
          .from('articles')
          .update(finalData)
          .eq('id', editRecord.id);

        if (error) throw error;
        toast.success('Artikel berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([finalData]);

        if (error) throw error;
        toast.success('Artikel baru berhasil diterbitkan');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan artikel');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex flex-col h-[90vh] max-h-[800px]">
          {/* Header */}
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              {editRecord ? 'Edit Artikel' : 'Tulis Artikel Baru'}
            </h3>
            <button onClick={onClose} className="p-2 border border-gray-100 rounded-xl hover:bg-white text-gray-400 transition-all shadow-sm">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <form id="article-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Judul Artikel</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Strategi Penurunan Stunting di Jawa Timur 2024"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold text-gray-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Kategori</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="Kebijakan">Kebijakan</option>
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Berita">Berita</option>
                    <option value="Edukasi">Edukasi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Cover Image</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-5 py-4 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-sm font-bold text-gray-500 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : formData.image_url ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        Ganti Gambar
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                        Upload / Drag Cover
                      </>
                    )}
                  </div>
                </div>
              </div>

              {formData.image_url && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preview Cover</p>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors"
                    >
                      Batal Pilih
                    </button>
                  </div>
                  <div className="w-full aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 group relative">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-[10px] font-black uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">Siap Diterbitkan</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Isi Artikel</label>
                <TiptapEditor 
                  content={formData.content} 
                  onChange={(content) => setFormData({ ...formData, content })} 
                />
              </div>

              {!formData.image_url && !editRecord && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-[11px] text-blue-700 leading-normal font-medium">
                    Jika tidak mengunggah gambar, sistem akan menggunakan <span className="font-black italic">Default Healthcare Banner</span> sebagai cover artikel ini.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex justify-end items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              form="article-form"
              type="submit"
              disabled={isLoading || isUploading}
              className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-8 py-3.5 text-xs font-black text-white uppercase tracking-widest shadow-xl shadow-orange-200 hover:bg-orange-700 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {editRecord ? 'Simpan Perubahan' : 'Terbitkan Artikel'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
