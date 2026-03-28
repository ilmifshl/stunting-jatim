'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Berhasil keluar dari panel admin');
      router.push('/');
    } catch (err) {
      toast.error('Gagal keluar, silakan coba lagi');
    }
  };

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Data Stunting', href: '/admin/stunting', icon: Users },
    { name: 'Faktor Risiko', href: '/admin/risk-factors', icon: Settings },
    { name: 'Manajemen Artikel', href: '/admin/articles', icon: FileText },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Stunting Jatim</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <div className="pb-4 mb-4 border-b border-gray-100">
            <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 mt-6">Main Menu</p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-3 text-sm font-bold rounded-[1rem] transition-all group ${isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div>
            <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Public Tools</p>
            <Link
              href="/map"
              target="_blank"
              className="flex items-center px-3 py-3 text-sm font-bold rounded-[1rem] text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all group"
            >
              <Users className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-900" />
              Buka Peta Interaktif
            </Link>
          </div>
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 p-4 bg-white/80 backdrop-blur-md">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-black text-gray-500 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all group"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
          Keluar (Logout)
        </button>
      </div>
    </div>
  );
}
