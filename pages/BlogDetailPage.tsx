import React from 'react';
import { BlogArticle, BLOG_ARTICLES } from '../lib/blog';
import { ArrowLeft, Calendar, Clock, BookOpen } from 'lucide-react';

interface BlogDetailPageProps {
    article: BlogArticle;
    onOpenArticle: (article: BlogArticle) => void;
    onBack: () => void;
}

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ article, onOpenArticle, onBack }) => {
    const related = BLOG_ARTICLES.filter(a => a.slug !== article.slug).slice(0, 3);

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-10 sm:py-14">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={onBack}
                    className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-stone-800 text-stone-300 hover:text-amber-400 text-xs font-mono transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Blog
                </button>

                <article className="max-w-3xl mx-auto">
                    <header className="mb-8">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                {article.category}
                            </span>
                            <span className="text-xs font-mono text-stone-400 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(article.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="text-xs font-mono text-stone-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {article.readingTime}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-100 leading-tight mb-4">
                            {article.title}
                        </h1>
                        <div className="w-full aspect-[16/8] rounded-3xl overflow-hidden bg-stone-900 border border-amber-500/20">
                            <img src={article.image} alt={article.title} className="w-full h-full object-cover opacity-80" />
                        </div>
                    </header>

                    <div className="space-y-5">
                        {article.content.map((paragraph, idx) => (
                            <p key={idx} className="text-sm sm:text-base text-stone-300 leading-relaxed text-justify">
                                {paragraph}
                            </p>
                        ))}
                    </div>

                    <div className="mt-10 glass-panel p-6 rounded-3xl border border-amber-500/20">
                        <h3 className="font-serif font-bold text-stone-100 mb-3 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-amber-400" />
                            Penafian
                        </h3>
                        <p className="text-xs text-stone-400 leading-relaxed">
                            Konten ini bersifat edukatif berdasarkan tradisi dan pengalaman sanggar. Setiap keputusan pemaharan sebaiknya dikonsultasikan langsung kepada pengasuh Tapak Pamungkas agar sesuai dengan kebutuhan dan keimanan Anda.
                        </p>
                    </div>
                </article>

                {related.length > 0 && (
                    <section className="max-w-4xl mx-auto mt-14">
                        <h2 className="text-xl font-serif font-bold text-stone-100 mb-6">Artikel Lainnya</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {related.map(rel => (
                                <div
                                    key={rel.slug}
                                    onClick={() => onOpenArticle(rel)}
                                    className="glass-panel p-5 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer group"
                                >
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">{rel.category}</span>
                                    <h3 className="font-serif font-semibold text-sm text-stone-100 mt-2 mb-2 leading-snug group-hover:text-amber-300 transition-colors line-clamp-2">
                                        {rel.title}
                                    </h3>
                                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">{rel.excerpt}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default BlogDetailPage;
