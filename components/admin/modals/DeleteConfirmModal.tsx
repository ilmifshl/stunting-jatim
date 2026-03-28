'use client';

import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Hapus',
  message = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
  isLoading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-inner shadow-red-200/50">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button onClick={onClose} className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-400 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">{title}</h3>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">{message}</p>

          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3.5 border border-gray-200 rounded-2xl text-sm font-black text-gray-600 uppercase hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-2xl text-sm font-black uppercase shadow-lg shadow-red-200 hover:bg-red-700 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus Sekarang'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
