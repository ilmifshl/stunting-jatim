'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Data Stunting', path: '/admin/stunting', icon: Users },
    { name: 'Faktor Risiko', path: '/admin/risk-factors', icon: Settings },
    { name: 'Artikel', path: '/admin/articles', icon: FileText },
  ];

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen fixed top-0 left-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="text-white text-lg font-bold">Admin Panel</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="flex-shrink-0 border-t border-slate-800 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 flex-shrink-0 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
