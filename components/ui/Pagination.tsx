import React, { memo } from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pageNumbers = new Set<number | string>();
        pageNumbers.add(1);

        if (currentPage > 3) {
            pageNumbers.add('...');
        }
        if (currentPage > 2) {
            pageNumbers.add(currentPage - 1);
        }
        if (currentPage !== 1 && currentPage !== totalPages) {
            pageNumbers.add(currentPage);
        }
        if (currentPage < totalPages - 1) {
            pageNumbers.add(currentPage + 1);
        }
        if (currentPage < totalPages - 2) {
            pageNumbers.add('...');
        }
        
        pageNumbers.add(totalPages);

        return Array.from(pageNumbers);
    }

    return (
        <div className="flex justify-center items-center space-x-1 sm:space-x-2 mt-12">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Sebelumnya
            </button>
            {getPageNumbers().map((page, index) =>
                typeof page === 'number' ? (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                            currentPage === page
                                ? 'bg-brand-primary text-white shadow-sm'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                ) : (
                    <span key={index} className="px-2 sm:px-4 py-2 text-gray-500 hidden sm:inline">
                        {page}
                    </span>
                )
            )}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Berikutnya
            </button>
        </div>
    );
};

export default memo(Pagination);