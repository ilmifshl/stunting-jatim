import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Share2, HeartPulse } from 'lucide-react';
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
      <Link href="/articles" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-black text-[10px] uppercase tracking-widest group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Kembali ke Daftar Artikel
      </Link>

      <article className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#242424] leading-tight mb-6">
            {article.title}
          </h1>
          <div className="flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                SJ
              </div>
              <div className="flex flex-col text-[14px]">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#242424]">Tim Redaksi</span>
                </div>
                <div className="flex items-center gap-2 text-[#6B6B6B]">
                  <span>5 Menit Baca</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-[#6B6B6B]" />
                  <span>{new Date(article.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            {article.category && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                {article.category}
              </div>
            )}
          </div>

        </header>

        {article.image_url && (
          <div className="w-full mb-12">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-auto rounded-sm border border-gray-100"
            />
          </div>
        )}

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
      </article>
    </div>
  );
}
