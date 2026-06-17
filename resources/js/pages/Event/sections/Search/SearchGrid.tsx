import { Filter, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import EventCard from '@/components/ui/EventCard';
import Pagination from '@/components/ui/Pagination';
import useSlidingUnderline from '@/hooks/useSlidingUnderline';

interface Event {
    id: number;
    title: string;
    description: string;
    type: 'online' | 'offline';
    poster_url?: string;
    location_name?: string;
    latitude?: number;
    longitude?: number;
    start_datetime: string;
    category?: {
        id: number;
        name: string;
    };
    price: number;
    view_count?: number;
    capacity?: number;
}

interface PaginatedEvents {
    current_page: number;
    data: Event[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface SearchFilters {
    keyword?: string;
    category_id?: number | null;
    type?: 'all' | 'online' | 'offline';
    min_price?: string;
    max_price?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: 'popular' | 'nearest' | 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc';
}

interface SearchGridProps {
    events: PaginatedEvents;
    filters: SearchFilters;
    handleFilterChange: (newFilters: Record<string, any>) => void;
    handleSortChange: (value: any) => void;
    handlePageChange: (page: number) => void;
    setIsMobileFilterOpen: (open: boolean) => void;
}

export default function SearchGrid({
    events,
    filters,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    setIsMobileFilterOpen,
}: SearchGridProps) {
    const activeType = filters.type || 'all';
    const sortBy = filters.sort_by || 'popular';

    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    const sortOptions = [
        { value: 'popular', label: 'Terpopuler' },
        { value: 'nearest', label: 'Lokasi Terdekat' },
        { value: 'date_asc', label: 'Tanggal Terdekat' },
        { value: 'date_desc', label: 'Tanggal Terjauh' },
        { value: 'price_asc', label: 'Harga Termurah' },
        { value: 'price_desc', label: 'Harga Termahal' },
    ] as const;

    const { registerRef, underlineStyle } = useSlidingUnderline<HTMLButtonElement>(activeType);

    // Close sort dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                sortDropdownRef.current &&
                !sortDropdownRef.current.contains(e.target as Node)
            ) {
                setIsSortDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const totalPages = events.last_page;
    const currentPage = events.current_page;

    return (
        <div className="flex grow flex-col gap-8">
            {/* Tab selection and sorting controls */}
            <div className="flex items-end justify-between border-b border-neutral-100">
                <div className="scrollbar-none relative flex items-center gap-6 overflow-x-auto sm:gap-8">
                    <div
                        className="absolute bottom-0 h-0.75 rounded-full bg-primary-500 transition-all duration-300 ease-out"
                        style={{
                            left: `${underlineStyle.left}px`,
                            width: `${underlineStyle.width}px`,
                        }}
                    />

                    <button
                        ref={registerRef('all')}
                        type="button"
                        onClick={() => handleFilterChange({ type: 'all' })}
                        className={`cursor-pointer pb-3 text-sm font-bold transition-colors duration-300 sm:text-base ${
                            activeType === 'all'
                                ? 'text-primary-500'
                                : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                    >
                        Semua
                    </button>
                    <button
                        ref={registerRef('online')}
                        type="button"
                        onClick={() => handleFilterChange({ type: 'online' })}
                        className={`cursor-pointer pb-3 text-sm font-bold transition-colors duration-300 sm:text-base ${
                            activeType === 'online'
                                ? 'text-primary-500'
                                : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                    >
                        Online
                    </button>
                    <button
                        ref={registerRef('offline')}
                        type="button"
                        onClick={() => handleFilterChange({ type: 'offline' })}
                        className={`cursor-pointer pb-3 text-sm font-bold transition-colors duration-300 sm:text-base ${
                            activeType === 'offline'
                                ? 'text-primary-500'
                                : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                    >
                        Offline
                    </button>
                </div>

                <div className="flex items-center gap-3 pb-1.5">
                    {/* Mobile Filter Trigger Button */}
                    <button
                        type="button"
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="border-neutral-350 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white text-xs font-bold text-neutral-600 shadow-xs transition-all duration-200 outline-none hover:border-primary-500 hover:text-primary-500 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-1.5 lg:hidden"
                    >
                        <Filter size={14} className="text-neutral-400" />
                        <span className="hidden sm:inline">Filter</span>
                    </button>

                    {/* Custom Dropdown Sort Filter */}
                    <div className="relative" ref={sortDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                            className="border-neutral-350 flex cursor-pointer items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-xs font-bold text-neutral-600 shadow-xs transition-all duration-200 outline-none hover:border-primary-500 hover:text-primary-500"
                        >
                            <span>
                                {sortOptions.find((opt) => opt.value === sortBy)?.label}
                            </span>
                            <ChevronDown
                                size={14}
                                className={`text-neutral-400 transition-transform duration-250 ${isSortDropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {isSortDropdownOpen && (
                            <div className="animate-in fade-in slide-in-from-top-2 absolute top-full right-0 z-50 mt-1 w-48 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg duration-150">
                                {sortOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            handleSortChange(opt.value);
                                            setIsSortDropdownOpen(false);
                                        }}
                                        className={`w-full cursor-pointer rounded-xl px-3.5 py-2 text-left text-xs font-semibold transition-colors duration-150 ${
                                            sortBy === opt.value
                                                ? 'bg-primary-50 font-bold text-primary-500'
                                                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Catalog Listing Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {events.data.length === 0 ? (
                    <div className="col-span-full py-20 text-center font-semibold text-gray-400">
                        Tidak ada event yang ditemukan untuk filter ini.
                    </div>
                ) : (
                    events.data.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            variant="grid"
                            detailUrl={`/events/${event.id}`}
                        />
                    ))
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
}
