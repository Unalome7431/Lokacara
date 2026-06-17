import { X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import FilterPanel from '@/components/ui/FilterPanel';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface SearchFilters {
    keyword?: string;
    category_id?: number | null;
    type?: 'all' | 'online' | 'offline';
    min_price?: string;
    max_price?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
}

interface SearchSidebarProps {
    categories: Category[];
    filters: SearchFilters;
    handleFilterChange: (newFilters: Record<string, any>) => void;
    isMobileFilterOpen: boolean;
    setIsMobileFilterOpen: (open: boolean) => void;
}

export default function SearchSidebar({
    categories = [],
    filters = {},
    handleFilterChange,
    isMobileFilterOpen,
    setIsMobileFilterOpen,
}: SearchSidebarProps) {
    const todayString = useMemo(() => new Date().toISOString().split('T')[0], []);

    const activeCategory = filters.category_id || null;

    // Price range inputs
    const [tempMinPrice, setTempMinPrice] = useState(filters.min_price || '');
    const [tempMaxPrice, setTempMaxPrice] = useState(filters.max_price || '');

    // Date range inputs
    const [tempStartDate, setTempStartDate] = useState(filters.start_date || '');
    const [tempEndDate, setTempEndDate] = useState(filters.end_date || '');

    // Sync input states when url filters change
    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect */
        setTempMinPrice(filters.min_price || '');
        setTempMaxPrice(filters.max_price || '');
        setTempStartDate(filters.start_date || '');
        setTempEndDate(filters.end_date || '');
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [filters.min_price, filters.max_price, filters.start_date, filters.end_date]);

    // Lock body scroll when mobile filter is open
    useEffect(() => {
        if (isMobileFilterOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileFilterOpen]);

    const filterPanelElement = (isMobile = false) => (
        <FilterPanel
            categories={categories}
            activeCategory={activeCategory}
            onCategorySelect={(id) => {
                handleFilterChange({ category_id: id });

                if (isMobile) {
                    setIsMobileFilterOpen(false);
                }
            }}
            tempMinPrice={tempMinPrice}
            setTempMinPrice={setTempMinPrice}
            tempMaxPrice={tempMaxPrice}
            setTempMaxPrice={setTempMaxPrice}
            onApplyPrice={() => {
                handleFilterChange({
                    min_price: tempMinPrice || null,
                    max_price: tempMaxPrice || null,
                });

                if (isMobile) {
                    setIsMobileFilterOpen(false);
                }
            }}
            onResetPrice={() => {
                setTempMinPrice('');
                setTempMaxPrice('');
                handleFilterChange({
                    min_price: null,
                    max_price: null,
                });

                if (isMobile) {
                    setIsMobileFilterOpen(false);
                }
            }}
            hasAppliedPrice={!!(filters.min_price || filters.max_price)}
            tempStartDate={tempStartDate}
            setTempStartDate={setTempStartDate}
            tempEndDate={tempEndDate}
            setTempEndDate={setTempEndDate}
            onApplyDate={() => {
                handleFilterChange({
                    start_date: tempStartDate || null,
                    end_date: tempEndDate || null,
                });

                if (isMobile) {
                    setIsMobileFilterOpen(false);
                }
            }}
            onResetDate={() => {
                setTempStartDate('');
                setTempEndDate('');
                handleFilterChange({
                    start_date: null,
                    end_date: null,
                });

                if (isMobile) {
                    setIsMobileFilterOpen(false);
                }
            }}
            hasAppliedDate={!!(filters.start_date || filters.end_date)}
            todayString={todayString}
        />
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden flex-col gap-6 border-b border-neutral-150 pb-8 lg:flex lg:w-1/4 lg:border-r lg:border-b-0 lg:pr-10 lg:pb-0">
                <h4 className="font-brand text-h4-mobile font-black text-primary-500 lg:text-h4-web">
                    Preferensi
                </h4>
                {filterPanelElement(false)}
            </div>

            {/* Mobile Filter Drawer Overlay */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="animate-in fade-in fixed inset-0 bg-neutral-900/60 backdrop-blur-xs duration-200"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />

                    {/* Drawer Panel */}
                    <div className="animate-in slide-in-from-right relative z-50 flex h-full w-full max-w-xs flex-col gap-6 overflow-y-auto bg-white p-6 shadow-2xl duration-200">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                            <h4 className="font-brand text-h4-mobile font-black text-primary-500 lg:text-h4-web">
                                Preferensi
                            </h4>
                            <button
                                type="button"
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="cursor-pointer rounded-full p-1 text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-600"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {filterPanelElement(true)}
                    </div>
                </div>
            )}
        </>
    );
}
