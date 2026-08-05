import React from 'react';
import { motion } from 'framer-motion';
import { BLOG_ARTICLES, BlogArticle } from '../lib/blog';
import { Calendar, Clock, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

interface BlogPageProps {
    onOpenArticle: (article: BlogArticle) => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onOpenArticle }) => {
    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        Media & Wawasan
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-100 mt-4 mb-4">
                        Blog Tapak Pamungkas
                    </h1>
                    <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
                        Artikel seputar perawatan pusaka, media bertuah, keilmuan, dan tradisi spiritual Nusantara dari para pengasuh sanggar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {BLOG_ARTICLES.map((article, idx) => (
                        <motion.article
                            key={article.slug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => onOpenArticle(article)}
                            className="glass-panel p-6 rounded-3xl border border-amber-500/20 hover:border-amber-500/50 transition-all shadow-xl cursor-pointer flex flex-col h-full group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                                    {article.category}
                                </span>
                                <div className="flex items-center gap-3 text-[10px] font-mono text-stone-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(article.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {article.readingTime}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full aspect-[16/7] rounded-2xl overflow-hidden bg-stone-900 mb-4 relative">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
                                />
                            </div>

                            <h2 className="font-serif font-bold text-lg text-stone-100 group-hover:text-amber-300 transition-colors mb-2 leading-snug">
                                {article.title}
                            </h2>
                            <p className="text-xs text-stone-400 leading-relaxed line-clamp-3 mb-4 flex-grow">
                                {article.excerpt}
                            </p>

                            <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                                <span className="font-mono text-stone-500 flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                                    Baca Artikel
                                </span>
                                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.article>
                    ))}
                </div>

                <div className="mt-14 max-w-2xl mx-auto glass-panel p-6 rounded-3xl border border-emerald-500/30 text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-400 mb-2">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-serif font-bold text-stone-100">Butuh Konsultasi Pribadi?</span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                        Artikel ini hanya wawasan umum. Untuk pemaharan pusaka dan bimbingan yang sesuai kebutuhan Anda, silakan konsultasi langsung dengan admin sanggar.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
