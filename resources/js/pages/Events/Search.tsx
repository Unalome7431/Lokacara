import { Head, usePage, router } from '@inertiajs/react';
import {
    ChevronDown,
    Filter,
    X,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';
import EventCard from '@/components/ui/EventCard';
import Pagination from '@/components/ui/Pagination';
import FilterPanel from '@/components/ui/FilterPanel';

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

interface Category {
    id: number;
    name: string;
    slug: string;
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
    latitude?: number | null;
    longitude?: number | null;
}

interface SearchProps {
    events: PaginatedEvents;
    categories: Category[];
    filters: SearchFilters;
}

export default function SearchPage({
    events,
    categories,
    filters = {},
}: SearchProps) {
    const todayString = useMemo(() => new Date().toISOString().split('T')[0], []);

    // 1. Filter States
    const activeCategory = filters.category_id || null;
    const activeType = filters.type || 'all';
    const sortBy = filters.sort_by || 'popular';

    // 2. Dropdown & Drawer state
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // 3. Price range inputs
    const [tempMinPrice, setTempMinPrice] = useState(filters.min_price || '');
    const [tempMaxPrice, setTempMaxPrice] = useState(filters.max_price || '');

    // 4. Date range inputs
    const [tempStartDate, setTempStartDate] = useState(filters.start_date || '');
    const [tempEndDate, setTempEndDate] = useState(filters.end_date || '');

    // 5. User geolocation state
    const [userCoords, setUserCoords] = useState<{
        lat: number;
        lng: number;
    } | null>(() => {
        if (filters.latitude && filters.longitude) {
            return { lat: Number(filters.latitude), lng: Number(filters.longitude) };
        }

        return null;
    });

    // Sync input states when url filters change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTempMinPrice(filters.min_price || '');
        setTempMaxPrice(filters.max_price || '');
        setTempStartDate(filters.start_date || '');
        setTempEndDate(filters.end_date || '');
    }, [filters.min_price, filters.max_price, filters.start_date, filters.end_date]);

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

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 6. Sliding underline tab style
    const tabAllRef = useRef<HTMLButtonElement>(null);
    const tabOnlineRef = useRef<HTMLButtonElement>(null);
    const tabOfflineRef = useRef<HTMLButtonElement>(null);
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

    useEffect(() => {
        const updateUnderline = () => {
            let activeRef = tabAllRef;

            if (activeType === 'online') {
                activeRef = tabOnlineRef;
            }

            if (activeType === 'offline') {
                activeRef = tabOfflineRef;
            }

            if (activeRef.current) {
                setUnderlineStyle({
                    left: activeRef.current.offsetLeft,
                    width: activeRef.current.offsetWidth,
                });
            }
        };

        // Run updateUnderline after DOM paints
        const timer = setTimeout(() => {
            updateUnderline();
        }, 50);

        window.addEventListener('resize', updateUnderline);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateUnderline);
        };
    }, [activeType]);

    // Helper functions
    // Date formatting helpers imported from @/lib/utils

    const handleFilterChange = (newFilters: Record<string, any>) => {
        const mergedFilters: Record<string, any> = {
            ...filters,
            ...newFilters,
            page: 1, // Reset page to 1 when changing filters
        };

        // Clean up empty parameters
        Object.keys(mergedFilters).forEach((key) => {
            if (
                mergedFilters[key] === null ||
                mergedFilters[key] === undefined ||
                mergedFilters[key] === ''
            ) {
                delete (mergedFilters as any)[key];
            }
        });

        router.get('/events/search', mergedFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/events/search',
            {
                ...filters,
                page,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleSortChange = (value: string) => {
        if (value === 'nearest') {
            if (userCoords) {
                handleFilterChange({
                    sort_by: value,
                    latitude: userCoords.lat,
                    longitude: userCoords.lng,
                });
            } else {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const lat = position.coords.latitude;
                            const lng = position.coords.longitude;
                            setUserCoords({ lat, lng });
                            handleFilterChange({
                                sort_by: value,
                                latitude: lat,
                                longitude: lng,
                            });
                        },
                        (error) => {
                            alert('Tidak dapat memuat lokasi Anda untuk mengurutkan berdasarkan jarak.');
                            console.warn('Geolocation failed', error);
                        },
                    );
                } else {
                    alert('Geolocation tidak didukung oleh browser Anda.');
                }
            }
        } else {
            // Remove lat/lng when sorting by non-proximity criteria
            const newParams = { sort_by: value, latitude: null, longitude: null };
            handleFilterChange(newParams);
        }
    };

    // Sort options mapping
    const sortOptions = [
        { value: 'popular', label: 'Terpopuler' },
        { value: 'nearest', label: 'Lokasi Terdekat' },
        { value: 'date_asc', label: 'Tanggal Terdekat' },
        { value: 'date_desc', label: 'Tanggal Terjauh' },
        { value: 'price_asc', label: 'Harga Termurah' },
        { value: 'price_desc', label: 'Harga Termahal' },
    ] as const;

    const totalPages = events.last_page;
    const currentPage = events.current_page;


    const page = usePage();
    const pageFilters = (page.props.filters as any) || {};
    const currentKeyword = pageFilters.keyword || '';

    return (
        <div className="flex min-h-screen flex-col justify-between bg-white">
            <Head
                title={
                    currentKeyword
                        ? `Pencarian: "${currentKeyword}" - Lokacara`
                        : 'Jelajah Event - Lokacara'
                }
            />
            <NavBar />

            <div className="grow">
                <div className="mx-auto w-full max-w-[1280px] px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                    {/* Catalog section */}
                    <div id="catalog" className="flex flex-col gap-6">
                        <h3 className="font-brand text-h3-mobile font-black text-neutral-900 lg:text-h3-web">
                            {currentKeyword ? (
                                <>
                                    Pencarian untuk <span className="text-secondary-500" style={{ color: '#ffaa00' }}>'{currentKeyword}'</span>
                                </>
                            ) : (
                                'Jelajah Event'
                            )}
                        </h3>

                        <div className="flex flex-col gap-10 lg:flex-row">
                            {/* Left Sidebar Preferences */}
                            <div className="hidden flex-col gap-6 border-b border-neutral-150 pb-8 lg:flex lg:w-1/4 lg:border-r lg:border-b-0 lg:pr-10 lg:pb-0">
                                <h4 className="font-brand text-h4-mobile font-black text-primary-500 lg:text-h4-web">
                                    Preferensi
                                </h4>

                                <FilterPanel
                                    categories={categories}
                                    activeCategory={activeCategory}
                                    onCategorySelect={(id) => {
                                        handleFilterChange({ category_id: id });
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
                                    }}
                                    onResetPrice={() => {
                                        setTempMinPrice('');
                                        setTempMaxPrice('');
                                        handleFilterChange({
                                            min_price: null,
                                            max_price: null,
                                        });
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
                                    }}
                                    onResetDate={() => {
                                        setTempStartDate('');
                                        setTempEndDate('');
                                        handleFilterChange({
                                            start_date: null,
                                            end_date: null,
                                        });
                                    }}
                                    hasAppliedDate={!!(filters.start_date || filters.end_date)}
                                    todayString={todayString}
                                />
                            </div>

                            {/* Right Listing Grid */}
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
                                            ref={tabAllRef}
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
                                            ref={tabOnlineRef}
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
                                            ref={tabOfflineRef}
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
                                        {/* Mobile Filter Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => setIsMobileFilterOpen(true)}
                                            className="border-neutral-350 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white text-xs font-bold text-neutral-600 shadow-xs transition-all duration-200 outline-none hover:border-primary-500 hover:text-primary-500 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-1.5 lg:hidden"
                                        >
                                            <Filter size={14} className="text-neutral-400" />
                                            <span className="hidden sm:inline">Filter</span>
                                        </button>

                                        {/* Custom Sort Dropdown */}
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
                                                    className={`text-neutral-400 transition-transform duration-250 ${
                                                        isSortDropdownOpen ? 'rotate-180' : ''
                                                    }`}
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="animate-in fade-in fixed inset-0 bg-neutral-900/60 backdrop-blur-xs duration-200"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />
                    <div className="animate-in slide-in-from-right relative z-50 flex h-full w-full max-w-xs flex-col gap-6 overflow-y-auto bg-white p-6 shadow-2xl duration-200">
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

                        <FilterPanel
                            categories={categories}
                            activeCategory={activeCategory}
                            onCategorySelect={(id) => {
                                handleFilterChange({ category_id: id });
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
                                setIsMobileFilterOpen(false);
                            }}
                            onResetPrice={() => {
                                setTempMinPrice('');
                                setTempMaxPrice('');
                                handleFilterChange({
                                    min_price: null,
                                    max_price: null,
                                });
                                setIsMobileFilterOpen(false);
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
                                setIsMobileFilterOpen(false);
                            }}
                            onResetDate={() => {
                                setTempStartDate('');
                                setTempEndDate('');
                                handleFilterChange({
                                    start_date: null,
                                    end_date: null,
                                });
                                setIsMobileFilterOpen(false);
                            }}
                            hasAppliedDate={!!(filters.start_date || filters.end_date)}
                            todayString={todayString}
                        />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
