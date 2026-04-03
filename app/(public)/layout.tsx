'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMapPage = pathname?.startsWith('/map');

  return (
    <LanguageProvider>
      <Navbar />
      <main className={`flex-1 w-full ${isMapPage && pathname === '/map' ? 'h-[calc(100vh-4rem)] overflow-hidden' : ''}`}>
        {children}
      </main>
      {!isMapPage && <Footer />}
    </LanguageProvider>
  );
}
