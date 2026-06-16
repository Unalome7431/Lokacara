import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
}: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    // Get the page numbers to display, limiting to a maximum of 5 pages
    const getPageNumbers = () => {
        const maxPageButtons = 5;

        if (totalPages <= maxPageButtons) {
            return Array.from({ length: totalPages }, (_, idx) => idx + 1);
        }

        let startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        return Array.from(
            { length: endPage - startPage + 1 },
            (_, idx) => startPage + idx,
        );
    };

    return (
        <div className={`mt-4 flex items-center justify-between border-t border-neutral-100 pt-6 ${className}`}>
            <span className="text-micro font-semibold text-gray-400">
                Halaman {currentPage} dari {totalPages}
            </span>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold sm:h-9 sm:w-9 sm:text-micro ${
                        currentPage === 1
                            ? 'border-neutral-150 cursor-not-allowed bg-neutral-50 text-gray-300'
                            : 'cursor-pointer border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                    }`}
                    title="Sebelumnya"
                >
                    <ChevronLeft size={14} className="sm:h-4 sm:w-4" />
                </button>

                {getPageNumbers().map((pageNumber) => {
                    const isMobileHidden = (() => {
                        if (totalPages <= 3) {
                            return false;
                        }

                        if (currentPage === 1) {
                            return pageNumber > 3;
                        }

                        if (currentPage === totalPages) {
                            return pageNumber < totalPages - 2;
                        }

                        return Math.abs(pageNumber - currentPage) > 1;
                    })();

                    return (
                        <button
                            key={pageNumber}
                            type="button"
                            onClick={() => onPageChange(pageNumber)}
                            className={`h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-[10px] font-bold sm:h-9 sm:w-9 sm:text-micro ${
                                isMobileHidden ? 'hidden sm:flex' : 'flex'
                            } ${
                                currentPage === pageNumber
                                    ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
                                    : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                            }`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}

                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold sm:h-9 sm:w-9 sm:text-micro ${
                        currentPage === totalPages
                            ? 'border-neutral-150 cursor-not-allowed bg-neutral-50 text-gray-300'
                            : 'cursor-pointer border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                    }`}
                    title="Selanjutnya"
                >
                    <ChevronRight size={14} className="sm:h-4 sm:w-4" />
                </button>
            </div>
        </div>
    );
}
