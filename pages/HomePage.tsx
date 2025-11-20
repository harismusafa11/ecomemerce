import React, { useRef, useMemo } from 'react';
// Fix: Import Variants type from framer-motion to resolve type error.
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { Product, Page } from '../types';
import ProductCard from '../components/ProductCard';
import { FallingPattern } from '../components/ui/falling-pattern';
import { HoverEffect } from '../components/ui/card-hover-effect';
import { useTranslations } from '../hooks/useTranslations';


interface HomePageProps {
    products: Product[];
    onProductClick: (product: Product) => void;
    onNavigate: (page: Page) => void;
    onAddToCart: (product: Product, startRect: DOMRect) => void;
    wishlistItems: number[];
    onToggleWishlist: (productId: number) => void;
}

const QuoteIcon = () => (
    <svg className="w-10 h-10 text-brand-accent/50 absolute top-4 left-4" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.09,11.35a2.79,2.79,0,0,0-2.82,2.82v5.64a2.79,2.79,0,0,0,2.82,2.82H14.73V11.35Zm11.29,0a2.79,2.79,0,0,0-2.82,2.82v5.64a2.79,2.79,0,0,0,2.82,2.82h5.64V11.35Z" />
    </svg>
);


const HomePage: React.FC<HomePageProps> = ({
    products,
    onProductClick,
    onNavigate,
    onAddToCart,
    wishlistItems,
    onToggleWishlist
}) => {
    const { t } = useTranslations();
    const heroTitleWords = useMemo(() => t('home.heroTitle').split(' '), [t]);

    const categoryItems = [
        {
            title: t('home.categoryKeilmuanTitle'),
            description: t('home.categoryKeilmuanDesc'),
            link: "#",
        },
        {
            title: t('home.categoryMediaBertuahTitle'),
            description: t('home.categoryMediaBertuahDesc'),
            link: "#",
        },
        {
            title: t('home.categoryMediaHerbalTitle'),
            description: t('home.categoryMediaHerbalDesc'),
            link: "#",
        },
    ];

    const testimonialItems = [
        {
            user: "@PecintaPusaka",
            quote: t('home.testimonial1'),
        },
        {
            user: "@SpiritualNusantara",
            quote: t('home.testimonial2'),
        },
        {
            user: "@BudayaJawi",
            quote: t('home.testimonial3'),
        }
    ];

    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    const sectionVariants: Variants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const heroContainerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const heroItemVariants: Variants = {
        hidden: { y: 20, opacity: 0, filter: 'blur(5px)' },
        visible: {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            transition: {
                duration: 0.8,
                ease: 'anticipate',
            },
        },
    };

    const productGridVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const productItemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: 'easeOut'
            }
        }
    };


    const testimonialContainerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const testimonialItemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };


    return (
        <div>
            {/* Hero Section */}
            <section ref={heroRef} className="relative bg-brand-dark text-white h-[90vh] min-h-[700px] overflow-hidden">
                <FallingPattern
                    className="absolute inset-0 h-full w-full"
                    color="#c5a47e" // brand-gold
                    backgroundColor="#211c18" // brand-dark
                    blurIntensity="0.5em"
                    density={0.8}
                />
                <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
                <motion.div style={{ y }} className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center">
                    <motion.div
                        className="container mx-auto px-4 sm:px-6 lg:px-8"
                        variants={heroContainerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="p-4">
                            <motion.h2
                                variants={heroItemVariants}
                                className="text-2xl md:text-3xl text-brand-gold"
                                style={{
                                    fontFamily: "'Lora', serif",
                                    fontWeight: 500,
                                    textShadow: '0 0 5px rgba(197, 164, 126, 0.3)'
                                }}
                            >
                                {t('home.heroWelcome')}
                            </motion.h2>
                            <motion.h1
                                className="text-6xl md:text-8xl font-serif font-bold text-white my-2"
                            >
                                {heroTitleWords.map((word, i) => (
                                    <motion.span key={i} variants={heroItemVariants} className="inline-block">
                                        {word}&nbsp;
                                    </motion.span>
                                ))}
                            </motion.h1>
                            <motion.p
                                variants={heroItemVariants}
                                className="text-lg text-brand-accent max-w-2xl mx-auto"
                            >
                                {t('home.heroSubtitle')}
                            </motion.p>
                        </div>
                        <motion.div variants={heroItemVariants}>
                            <motion.button
                                onClick={() => onNavigate('allProducts')}
                                className="mt-6 bg-brand-gold text-brand-dark font-bold py-3 px-8 rounded-lg transition-all duration-300 transform shadow-lg"
                                animate={{
                                    scale: [1, 1.03, 1],
                                    boxShadow: [
                                        "0 0 0 0 rgba(197, 164, 126, 0.4)",
                                        "0 0 0 10px rgba(197, 164, 126, 0)",
                                        "0 0 0 0 rgba(197, 164, 126, 0)"
                                    ]
                                }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1.5 // Delay after initial page load animation
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {t('home.heroButton')}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
                <div className="absolute bottom-[-1px] left-0 w-full z-30 leading-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 150">
                        <path fill="#faf8f6" fillOpacity="1" d="M0,96L80,85.3C160,75,320,53,480,58.7C640,64,800,96,960,101.3C1120,107,1280,85,1360,74.7L1440,64L1440,150L1360,150C1280,150,1120,150,960,150C800,150,640,150,480,150C320,150,160,150,80,150L0,150Z"></path>
                    </svg>
                </div>
            </section>

            {/* Categories Section */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="pt-8 pb-16 bg-brand-light"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-serif font-bold text-center text-brand-dark mb-2">{t('home.categoriesTitle')}</h2>
                    <HoverEffect items={categoryItems} className="grid-cols-1 md:grid-cols-3" />
                </div>
            </motion.section>

            {/* Recommended Products Section */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="py-16 bg-brand-dark bg-cover bg-center relative"
                style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-wood.png')" }}
            >
                <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <h2 className="text-3xl font-serif font-bold text-center text-white mb-10">{t('home.recommendationsTitle')}</h2>
                    <motion.div
                        variants={productGridVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[500px]"
                    >
                        {products.slice(0, 3).map(product => (
                            <motion.div key={product.id} variants={productItemVariants}>
                                <ProductCard
                                    product={product}
                                    onClick={() => onProductClick(product)}
                                    onAddToCart={onAddToCart}
                                    isInWishlist={wishlistItems.includes(product.id)}
                                    onToggleWishlist={onToggleWishlist}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* Social Buzz Section */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="py-16 bg-brand-light"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <button
                            onClick={() => onNavigate('allProducts')}
                            className="relative inline-flex h-14 overflow-hidden rounded-lg p-[2px] focus:outline-none group"
                        >
                            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#c5a47e_0%,#3a322b_50%,#c5a47e_100%)] group-hover:animate-[spin_1.5s_linear_infinite]" />
                            <span className="relative z-10 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-brand-light group-hover:bg-brand-dark px-8 py-3 text-lg font-bold text-brand-primary group-hover:text-brand-gold transition-all duration-300">
                                {t('home.viewAllProducts')}
                            </span>
                        </button>
                    </div>

                    <h2 className="text-3xl font-serif font-bold text-center text-brand-dark mb-10">{t('home.testimonialsTitle')}</h2>
                    <motion.div
                        variants={testimonialContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {testimonialItems.map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={testimonialItemVariants}
                                whileHover={{ y: -5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-brand-gold relative overflow-hidden"
                            >
                                <QuoteIcon />
                                <p className="relative z-10 text-gray-600 mb-4 italic">"{item.quote}"</p>
                                <p className="relative z-10 text-right font-semibold text-brand-primary font-serif">{item.user}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="bg-brand-dark py-16"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h2 className="text-3xl font-serif font-bold mb-3">{t('home.ctaTitle')}</h2>
                    <p className="text-brand-accent max-w-xl mx-auto mb-8">{t('home.ctaSubtitle')}</p>
                    <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder={t('home.ctaPlaceholder')}
                            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-brand-accent/70 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                        />
                        <button
                            type="submit"
                            className="bg-brand-gold text-brand-dark font-bold py-3 px-6 rounded-md hover:bg-white transition-colors"
                        >
                            {t('home.ctaButton')}
                        </button>
                    </form>
                </div>
            </motion.section>
        </div>
    );
};

export default HomePage;