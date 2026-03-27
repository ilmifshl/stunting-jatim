import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft, Clock, User, Share2 } from 'lucide-react';
import Link from 'next/link';

export default async function ArticleDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !article) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/articles" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-10 font-black text-[10px] uppercase tracking-widest group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Kembali ke Daftar Artikel
      </Link>
      
      <article>
        <header className="mb-12">
          <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              <Calendar className="w-3 h-3 text-blue-500" />
              {new Date(article.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              <Clock className="w-3 h-3 text-blue-500" />
              5 Menit Baca
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] uppercase tracking-tighter mb-8">
            {article.title}
          </h1>

          <div className="flex items-center justify-between py-6 border-y border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase shadow-lg shadow-blue-200">
                SJ
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-wider">Tim Redaksi</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Stunting Jatim</p>
              </div>
            </div>
            <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {article.image_url && (
          <div className="w-full aspect-video bg-gray-100 rounded-[3rem] overflow-hidden mb-12 shadow-2xl border-8 border-white ring-1 ring-gray-100">
            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg prose-blue prose-p:text-gray-600 prose-p:leading-[1.8] prose-p:font-medium text-gray-700">
            <div className="whitespace-pre-wrap leading-relaxed">
              {article.content}
            </div>
          </div>
          
          <div className="mt-16 p-10 bg-blue-600 rounded-[3rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Mari Berkontribusi</h3>
              <p className="text-blue-100 text-sm font-medium mb-6 leading-relaxed">
                Bagikan artikel ini untuk menyebarkan kesadaran tentang pentingnya pencegahan stunting di lingkungan Anda.
              </p>
              <button className="bg-white text-blue-600 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all">
                Bagikan Sekarang
              </button>
            </div>
            <HeartPulse className="absolute -right-10 -bottom-10 w-48 h-48 text-white/10" />
          </div>
        </div>
      </article>
    </div>
  );
}

import { HeartPulse } from 'lucide-react';
