import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);


interface CarouselProps {
    imageUrls: string[];
    onImageClick?: (index: number) => void;
}

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
    }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
};

const Carousel: React.FC<CarouselProps> = ({ imageUrls, onImageClick }) => {
    const [[page, direction], setPage] = useState([0, 0]);

    const imageIndex = page % imageUrls.length;

    const paginate = (newDirection: number) => {
        setPage([page + newDirection, newDirection]);
    };

    const goToSlide = (slideIndex: number) => {
        const newDirection = slideIndex > page ? 1 : -1;
        setPage([slideIndex, newDirection]);
    };

    return (
        <div className="relative w-full h-full bg-brand-dark rounded-lg overflow-hidden flex items-center justify-center group">
            <AnimatePresence initial={false} custom={direction}>
                <motion.img
                    key={page}
                    src={imageUrls[imageIndex]}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);
                        if (swipe < -swipeConfidenceThreshold) {
                            paginate(1);
                        } else if (swipe > swipeConfidenceThreshold) {
                            paginate(-1);
                        }
                    }}
                    onClick={() => onImageClick?.(imageIndex)}
                    className={`absolute w-full h-full object-cover ${onImageClick ? 'cursor-pointer' : ''}`}
                />
            </AnimatePresence>

            {/* Zoom Icon Indicator */}
            {onImageClick && (
                <div className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                </div>
            )}

            {/* Next Button */}
            <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10">
                <button
                    onClick={() => paginate(1)}
                    className="bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors"
                    aria-label="Next image"
                >
                    <ChevronRightIcon />
                </button>
            </div>

            {/* Previous Button */}
            <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10">
                <button
                    onClick={() => paginate(-1)}
                    className="bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors"
                    aria-label="Previous image"
                >
                    <ChevronLeftIcon />
                </button>
            </div>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
                {imageUrls.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${index === imageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default memo(Carousel);