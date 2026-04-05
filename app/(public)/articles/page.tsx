'use client';

import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Calendar, ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useState, useEffect } from 'react';

export default function ArticlesPage() {
  const { lang, t } = useLanguage();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setArticles(data);
      }
      setLoading(false);
    };
    fetchArticles();
  }, []);

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-orange-100">
            <BookOpen className="w-3 h-3" />
            {t.articles.educationNews}
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight uppercase tracking-tighter">
            {t.articles.title.split('&')[0]} <span className="text-blue-600">&</span> {t.articles.title.split('&')[1]}
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl leading-relaxed font-medium">
            {t.articles.subtitle}
          </p>
        </div>
      </div>

      {loading ? (
         <div className="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
           <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{t.common.loading}</p>
         </div>
      ) : !articles || articles.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{t.articles.noArticles}</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article key={article.id} className="group flex flex-col bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="relative">
                {article.image_url ? (
                  <div className="flex-shrink-0 h-56 bg-gray-200">
                    <img className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src={article.image_url} alt={article.title} />
                  </div>
                ) : (
                  <div className="flex-shrink-0 h-56 bg-blue-50 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-blue-100" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase text-blue-600 shadow-sm border border-white">
                    {t.common.latest}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-8 flex flex-col justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-md">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-md text-blue-500">
                      <Tag className="w-3 h-3" />
                      {(() => {
                        const cat = article.category?.toLowerCase();
                        if (cat === 'kesehatan') return t.categories.health;
                        if (cat === 'berita') return t.categories.news;
                        if (cat === 'kebijakan') return t.categories.policy;
                        return t.categories.insight;
                      })()}
                    </span>
                  </div>

                  <Link href={`/articles/${article.id}`}>
                    <h3 className="text-xl font-black text-gray-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-4">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium line-clamp-3 leading-relaxed">
                      {article.content.replace(/<[^>]*>?/gm, '').substring(0, 160)}...
                    </p>
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <Link href={`/articles/${article.id}`} className="inline-flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-wider group/link">
                    {t.common.readMore}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase">5 min</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
