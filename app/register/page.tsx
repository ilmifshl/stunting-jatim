'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Halaman Tidak Tersedia</h1>
        <p className="text-gray-600">Pendaftaran akun hanya dapat dilakukan oleh Super Admin.</p>
      </div>
    </div>
  );
}
