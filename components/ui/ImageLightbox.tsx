import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageLightboxProps {
    images: string[];
    initialIndex: number;
                            {
    images.map((img, idx) => (
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
    ))
}
                        </div >
                    )}
                </motion.div >
            )}
        </AnimatePresence >
    );
};

export default ImageLightbox;
