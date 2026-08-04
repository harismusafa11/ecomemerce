import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageLightboxProps {
    images: string[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, initialIndex, isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex, isOpen]);

    // Reset loading state when image changes
    useEffect(() => {
        if (isOpen) {
            setImageLoading(true);
            setImageError(false);
            console.log('Loading image:', images[currentIndex]);
        }
    }, [currentIndex, isOpen, images]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                handlePrevious();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
        console.log('Image loaded successfully');
    };

    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
        console.error('Failed to load image:', images[currentIndex]);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
                    onClick={onClose}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 text-white hover:text-brand-gold transition-colors bg-black/50 rounded-full"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Image Counter */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/50 px-4 py-2 rounded-full text-white font-semibold">
                        {currentIndex + 1} / {images.length}
                    </div>

                    {/* Previous Button */}
                    {images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrevious();
                            }}
                            className="absolute left-4 z-50 p-3 text-white hover:text-brand-gold transition-colors bg-black/50 rounded-full hover:bg-black/70"
                            aria-label="Previous"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    {/* Next Button */}
                    {images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNext();
                            }}
                            className="absolute right-4 z-50 p-3 text-white hover:text-brand-gold transition-colors bg-black/50 rounded-full hover:bg-black/70"
                            aria-label="Next"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}

                    {/* Image Container */}
                    <div
                        className="absolute inset-0 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        {/* Loading Spinner */}
                        {imageLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
                                <p className="mt-4 text-white">Loading image...</p>
                            </div>
                        )}

                        {/* Error Message */}
                        {imageError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-xl">Failed to load image</p>
                                <p className="text-sm text-gray-400 mt-2 px-4 text-center break-all">URL: {images[currentIndex]}</p>
                            </div>
                        )}

                        <motion.img
                            key={currentIndex}
                            src={images[currentIndex]}
                            alt={`Product image ${currentIndex + 1}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: imageLoading ? 0 : 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-[92vw] max-h-[88vh] sm:max-w-[85vw] sm:max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                            style={{ display: imageError ? 'none' : 'block' }}
                        />
                    </div>

                    {/* Thumbnail Navigation */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-black/50 p-3 rounded-full max-w-[90vw] overflow-x-auto scrollbar-hide">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(idx);
                                    }}
                                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === currentIndex
                                        ? 'border-brand-gold scale-110'
                                        : 'border-transparent hover:border-white/50'
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ImageLightbox;
