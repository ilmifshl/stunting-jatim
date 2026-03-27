'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Map as MapIcon, BookOpen, AlertCircle } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Beranda', path: '/', icon: Activity },
    { name: 'Peta Interaktif', path: '/map', icon: MapIcon },
    { name: 'Faktor Risiko', path: '/factors', icon: AlertCircle },
    { name: 'Artikel', path: '/articles', icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 w-full h-16 bg-white border-b border-gray-100 z-[9999] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">Stunting Jatim</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`
                      flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="h-6 w-px bg-gray-100 mx-2"></div>

            <Link
              href="/login"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 
              text-white font-semibold rounded-lg 
              shadow-lg shadow-blue-500/30 
              hover:shadow-blue-500/50 hover:-translate-y-0.5 
              active:translate-y-0 active:scale-95
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                ADMIN LOGIN
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
