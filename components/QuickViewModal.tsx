import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, MessageCircle, CheckCircle2, ShieldCheck, ZoomIn } from 'lucide-react';
import LazyImage from './ui/LazyImage';
import ImageLightbox from './ui/ImageLightbox';
import { useTranslations } from '../hooks/useTranslations';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, startRect: DOMRect) => void;
  isInWishlist: boolean;
  onToggleWishlist: (productId: number) => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isInWishlist,
  onToggleWishlist
}) => {
  const { t } = useTranslations();
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imgContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLightboxOpen(false);
  }, [product?.id]);

  if (!product) return null;

  const handleAddCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imgContainerRef.current) {
      onAddToCart(product, imgContainerRef.current.getBoundingClientRect());
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWhatsAppOrder = () => {
    const message = encodeURIComponent(
      `Halo Tapak Pamungkas, saya tertarik dengan produk:\n\n*${product.name}*\nHarga: Rp ${product.price.toLocaleString('id-ID')}\nKategori: ${product.category}\n\nApakah produk ini masih tersedia?`
    );
    window.open(`https://wa.me/6281234567890?text=${message}`, '_blank');
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl glass-panel rounded-3xl overflow-hidden shadow-2xl z-10 border border-amber-500/30 text-stone-100 my-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-900/80 hover:bg-amber-500 text-stone-300 hover:text-stone-950 transition-all border border-stone-700"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
            {/* Gallery Section */}
            <div className="flex flex-col gap-4">
              <div ref={imgContainerRef} onClick={() => setIsLightboxOpen(true)} className="relative aspect-square w-full rounded-2xl bg-stone-950/80 border border-amber-500/20 overflow-hidden flex items-center justify-center p-4 cursor-zoom-in">
                <LazyImage
                  src={product.imageUrls[selectedImgIndex] || product.imageUrls[0]}
                  alt={product.name}
                  className="w-full h-full object-contain filter drop-shadow-xl"
                />
                <div className="absolute bottom-4 right-4 z-20 bg-stone-900/80 text-stone-300 border border-stone-700 p-2 rounded-full opacity-0 group-hover:opacity-100 hover:text-amber-400 transition-all pointer-events-none" title="Perbesar Foto">
                  <ZoomIn className="w-4 h-4" />
                </div>
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`absolute top-4 left-4 p-2.5 rounded-full border transition-all ${
                    isInWishlist
                      ? 'bg-rose-600/90 text-white border-rose-500 shadow-lg'
                      : 'bg-stone-900/80 text-stone-300 border-stone-700 hover:text-rose-400'
                  }`}
                >
                  <Heart className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Thumbnails */}
              {product.imageUrls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-stone-900 ${
                        selectedImgIndex === idx ? 'border-amber-400 scale-105' : 'border-stone-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <LazyImage src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    {product.category}
                  </span>
                  {product.stock > 0 ? (
                    <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Stok: {product.stock}
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400">
                      Stok Habis
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 mb-2 leading-tight">
                  {product.name}
                </h2>

                <div className="text-2xl font-bold gold-gradient-text mb-4">
                  Rp {product.price.toLocaleString('id-ID')}
                </div>

                <div className="border-t border-b border-stone-800/80 py-4 mb-4">
                  <h4 className="text-xs uppercase tracking-wider font-mono text-amber-400/80 mb-2 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Deskripsi & Tuah Pusaka
                  </h4>
                  <p className="text-sm text-stone-300 leading-relaxed max-h-48 overflow-y-auto pr-2">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddCart}
                    disabled={product.stock <= 0}
                    className={`flex-1 py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                      isAdded
                        ? 'bg-emerald-500 text-stone-950 font-bold'
                        : product.stock > 0
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 hover:from-amber-300 hover:to-amber-400 gold-glow'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {isAdded ? 'Tersimpan di Keranjang!' : t('productCard.addToCart')}
                  </button>
                </div>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  Tanya / Pesan via WhatsApp Direct
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400 pt-2 font-mono">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Pusaka Otentik & Terjamin 100% Asli Tapak Pamungkas
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      </AnimatePresence>

      {/* Image Lightbox */}
      <ImageLightbox
        images={product.imageUrls}
        initialIndex={selectedImgIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  );
};

export default QuickViewModal;
