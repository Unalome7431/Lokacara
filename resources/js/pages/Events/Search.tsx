import { Head, usePage, router } from '@inertiajs/react';
import {
    ChevronRight,
    ChevronLeft,
    Calendar,
    MapPin,
    ChevronDown,
    Filter,
    X,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import DefaultCover from '@/../../public/covers/default_cover.jpg';
import Button from '@/components/ui/Button';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';

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

    const updateUnderline = () => {
        let activeRef = tabAllRef;
        if (activeType === 'online') activeRef = tabOnlineRef;
        if (activeType === 'offline') activeRef = tabOfflineRef;

        if (activeRef.current) {
            setUnderlineStyle({
                left: activeRef.current.offsetLeft,
                width: activeRef.current.offsetWidth,
            });
        }
    };

    useEffect(() => {
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
    const formatShortDate = (dateString: string) => {
        const dateObj = new Date(dateString);
        return (
            new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(dateObj) + ' WIB'
        );
    };

    const handleFilterChange = (newFilters: Record<string, any>) => {
        const mergedFilters = {
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

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    const page = usePage();
    const pageFilters = (page.props.filters as any) || {};
    const currentKeyword = pageFilters.keyword || '';

    // Title label requirement
    const searchLabel = currentKeyword
        ? `Pencarian untuk '${currentKeyword}'`
        : 'Jelajah Event';

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

            <div className="flex-grow">
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

                                {/* Kategori */}
                                <div className="flex flex-col gap-3">
                                    <h5 className="text-small font-extrabold tracking-wider text-neutral-400 uppercase">
                                        Kategori
                                    </h5>
                                    <div className="flex flex-row flex-wrap items-start gap-x-4 gap-y-3.5 lg:flex-col lg:gap-3">
                                        {categories.map((cat) => {
                                            const isActive = activeCategory === cat.id;
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => {
                                                        handleFilterChange({
                                                            category_id: isActive ? null : cat.id,
                                                        });
                                                    }}
                                                    className="group flex cursor-pointer items-center gap-3 text-sm font-semibold text-neutral-600 transition-colors hover:text-primary-500"
                                                >
                                                    <div
                                                        className={`h-3.5 w-3.5 rounded-sm border-2 transition-all duration-200 ${
                                                            isActive
                                                                ? 'border-secondary-500 bg-secondary-500'
                                                                : 'border-secondary-400 bg-white group-hover:border-secondary-500'
                                                        }`}
                                                    ></div>
                                                    <span>{cat.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Harga */}
                                <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5">
                                    <h5 className="text-small font-extrabold tracking-wider text-neutral-400 uppercase">
                                        Harga
                                    </h5>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-bold text-neutral-500">
                                                Harga Minimum
                                            </span>
                                            <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 transition-colors duration-150 focus-within:border-primary-500">
                                                <span className="text-sm font-bold text-neutral-400">
                                                    Rp
                                                </span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={tempMinPrice}
                                                    onChange={(e) => setTempMinPrice(e.target.value)}
                                                    className="w-full text-sm font-semibold text-neutral-800 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-bold text-neutral-500">
                                                Harga Maksimum
                                            </span>
                                            <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 transition-colors duration-150 focus-within:border-primary-500">
                                                <span className="text-sm font-bold text-neutral-400">
                                                    Rp
                                                </span>
                                                <input
                                                    type="number"
                                                    placeholder="Maks"
                                                    value={tempMaxPrice}
                                                    onChange={(e) => setTempMaxPrice(e.target.value)}
                                                    className="w-full text-sm font-semibold text-neutral-800 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleFilterChange({
                                                        min_price: tempMinPrice || null,
                                                        max_price: tempMaxPrice || null,
                                                    });
                                                }}
                                                className="w-full cursor-pointer rounded-xl bg-primary-500 py-2 text-center text-xs font-bold text-white shadow-xs transition-colors duration-150 hover:bg-primary-600"
                                            >
                                                Terapkan Harga
                                            </button>
                                            {(filters.min_price || filters.max_price) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTempMinPrice('');
                                                        setTempMaxPrice('');
                                                        handleFilterChange({
                                                            min_price: null,
                                                            max_price: null,
                                                        });
                                                    }}
                                                    className="cursor-pointer rounded-xl border border-neutral-300 px-3 py-2 text-center text-xs font-bold text-neutral-600 transition-colors duration-150 hover:bg-neutral-50"
                                                >
                                                    Reset
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tanggal */}
                                <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5">
                                    <h5 className="text-small font-extrabold tracking-wider text-neutral-400 uppercase">
                                        Tanggal
                                    </h5>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-bold text-neutral-500">
                                                Dari
                                            </span>
                                            <input
                                                type="date"
                                                min={todayString}
                                                value={tempStartDate}
                                                onChange={(e) => setTempStartDate(e.target.value)}
                                                className="w-full cursor-pointer rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition-colors duration-150 outline-none focus:border-primary-500"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-bold text-neutral-500">
                                                Sampai
                                            </span>
                                            <input
                                                type="date"
                                                min={tempStartDate || todayString}
                                                value={tempEndDate}
                                                onChange={(e) => setTempEndDate(e.target.value)}
                                                className="w-full cursor-pointer rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition-colors duration-150 outline-none focus:border-primary-500"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleFilterChange({
                                                        start_date: tempStartDate || null,
                                                        end_date: tempEndDate || null,
                                                    });
                                                }}
                                                className="w-full cursor-pointer rounded-xl bg-primary-500 py-2 text-center text-xs font-bold text-white shadow-xs transition-colors duration-150 hover:bg-primary-600"
                                            >
                                                Terapkan Tanggal
                                            </button>
                                            {(filters.start_date || filters.end_date) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTempStartDate('');
                                                        setTempEndDate('');
                                                        handleFilterChange({
                                                            start_date: null,
                                                            end_date: null,
                                                        });
                                                    }}
                                                    className="cursor-pointer rounded-xl border border-neutral-300 px-3 py-2 text-center text-xs font-bold text-neutral-600 transition-colors duration-150 hover:bg-neutral-50"
                                                >
                                                    Reset
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Listing Grid */}
                            <div className="flex flex-grow flex-col gap-8">
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
                                            <div
                                                key={event.id}
                                                className="border-neutral-150 group relative flex h-[160px] w-full flex-row justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:mx-auto sm:h-[400px] sm:w-full sm:flex-col"
                                            >
                                                <div className="absolute top-3 left-3 z-10 rounded-md bg-secondary-400 px-3 py-1 text-[0.6275rem] font-extrabold text-secondary-900 shadow-sm sm:top-4">
                                                    {event.price === 0
                                                        ? 'GRATIS'
                                                        : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                                                </div>

                                                <div className="sm:aspect-none relative aspect-square h-full w-[160px] shrink-0 overflow-hidden border-r border-gray-100 bg-gray-50 sm:h-[210px] sm:w-full sm:border-r-0 sm:border-b">
                                                    <img
                                                        src={event.poster_url || DefaultCover}
                                                        alt={event.title}
                                                        draggable="false"
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                </div>

                                                <div className="flex flex-grow flex-col justify-between gap-1 overflow-hidden p-3 sm:h-[190px] sm:flex-none sm:shrink-0 sm:p-4">
                                                    <div className="flex flex-col gap-1 sm:gap-1.5">
                                                        <h4 className="line-clamp-2 h-[36px] overflow-hidden text-small leading-snug font-extrabold text-primary-500 group-hover:text-primary-600 sm:h-[48px] sm:text-base">
                                                            {event.title}
                                                        </h4>

                                                        <div className="flex flex-col gap-0.5 border-t border-gray-100/50 pt-1 text-[10px] font-semibold text-gray-400 sm:gap-1 sm:pt-1.5 sm:text-micro">
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar
                                                                    size={12}
                                                                    className="shrink-0 text-gray-400"
                                                                />
                                                                {formatShortDate(event.start_datetime)}
                                                            </span>
                                                            <span className="flex items-start gap-1.5">
                                                                <MapPin
                                                                    size={12}
                                                                    className="mt-0.5 shrink-0 text-gray-400"
                                                                />
                                                                <span className="line-clamp-2 overflow-hidden">
                                                                    {event.type === 'online'
                                                                        ? 'Online'
                                                                        : event.location_name ||
                                                                          'Lokasi Offline'}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="pt-1">
                                                        <Button
                                                            href={`/events/${event.id}`}
                                                            className="w-full py-1 text-[10px] sm:py-2 sm:text-small"
                                                        >
                                                            Detail Event
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-6">
                                        <span className="text-micro font-semibold text-gray-400">
                                            Halaman {currentPage} dari {totalPages}
                                        </span>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                                                    if (totalPages <= 3) return false;
                                                    if (currentPage === 1) return pageNumber > 3;
                                                    if (currentPage === totalPages) return pageNumber < totalPages - 2;
                                                    return Math.abs(pageNumber - currentPage) > 1;
                                                })();

                                                return (
                                                    <button
                                                        key={pageNumber}
                                                        type="button"
                                                        onClick={() => handlePageChange(pageNumber)}
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
                                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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
                                )}
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

                        <div className="flex flex-col gap-6">
                            {/* Mobile Kategori */}
                            <div className="flex flex-col gap-3">
                                <h5 className="text-small font-extrabold tracking-wider text-neutral-400 uppercase">
                                    Kategori
                                </h5>
                                <div className="flex flex-col gap-3">
                                    {categories.map((cat) => {
                                        const isActive = activeCategory === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => {
                                                    handleFilterChange({
                                                        category_id: isActive ? null : cat.id,
                                                    });
                                                }}
                                                className="group flex cursor-pointer items-center gap-3 text-sm font-semibold text-neutral-600 transition-colors hover:text-primary-500"
                                            >
                                                <div
                                                    className={`h-3.5 w-3.5 rounded-sm border-2 transition-all duration-200 ${
                                                        isActive
                                                            ? 'border-secondary-500 bg-secondary-500'
                                                            : 'border-secondary-400 bg-white group-hover:border-secondary-500'
                                                    }`}
                                                ></div>
                                                <span>{cat.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Mobile Harga */}
                            <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5">
                                <h5 className="text-small font-extrabold tracking-wider text-neutral-400 uppercase">
                                    Harga
                                </h5>
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-bold text-neutral-500">
                                            Harga Minimum
                                        </span>
                                        <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 transition-colors duration-150 focus-within:border-primary-500">
                                            <span className="text-sm font-bold text-neutral-400">Rp</span>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={tempMinPrice}
                                                onChange={(e) => setTempMinPrice(e.target.value)}
                                                className="w-full text-sm font-semibold text-neutral-800 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-bold text-neutral-500">
                                            Harga Maksimum
                                        </span>
                                        <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 transition-colors duration-150 focus-within:border-primary-500">
                                            <span className="text-sm font-bold text-neutral-400">Rp</span>
                                            <input
                                                type="number"
                                                placeholder="Maks"
                                                value={tempMaxPrice}
                                                onChange={(e) => setTempMaxPrice(e.target.value)}
                                                className="w-full text-sm font-semibold text-neutral-800 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleFilterChange({
                                                    min_price: tempMinPrice || null,
                                                    max_price: tempMaxPrice || null,
                                                });
                                                setIsMobileFilterOpen(false);
                                            }}
                                            className="w-full cursor-pointer rounded-xl bg-primary-500 py-2 text-center text-xs font-bold text-white shadow-xs transition-colors duration-150 hover:bg-primary-600"
                                        >
                                            Terapkan
                                        </button>
                                        {(filters.min_price || filters.max_price) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTempMinPrice('');
                                                    setTempMaxPrice('');
                                                    handleFilterChange({
                                                        min_price: null,
                                                        max_price: null,
                                                    });
                                                    setIsMobileFilterOpen(false);
                                                }}
                                                className="cursor-pointer rounded-xl border border-neutral-300 px-3 py-2 text-center text-xs font-bold text-neutral-600 transition-colors duration-150 hover:bg-neutral-50"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Tanggal */}
                            <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5">
                                <h5 className="text-xs font-extrabold tracking-wider text-neutral-400 uppercase">
                                    Tanggal
                                </h5>
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-bold text-neutral-500">Dari</span>
                                        <input
                                            type="date"
                                            min={todayString}
                                            value={tempStartDate}
                                            onChange={(e) => setTempStartDate(e.target.value)}
                                            className="w-full cursor-pointer rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition-colors duration-150 outline-none focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-bold text-neutral-500">Sampai</span>
                                        <input
                                            type="date"
                                            min={tempStartDate || todayString}
                                            value={tempEndDate}
                                            onChange={(e) => setTempEndDate(e.target.value)}
                                            className="w-full cursor-pointer rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition-colors duration-150 outline-none focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleFilterChange({
                                                    start_date: tempStartDate || null,
                                                    end_date: tempEndDate || null,
                                                });
                                                setIsMobileFilterOpen(false);
                                            }}
                                            className="w-full cursor-pointer rounded-xl bg-primary-500 py-2 text-center text-xs font-bold text-white shadow-xs transition-colors duration-150 hover:bg-primary-600"
                                        >
                                            Terapkan
                                        </button>
                                        {(filters.start_date || filters.end_date) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTempStartDate('');
                                                    setTempEndDate('');
                                                    handleFilterChange({
                                                        start_date: null,
                                                        end_date: null,
                                                    });
                                                    setIsMobileFilterOpen(false);
                                                }}
                                                className="cursor-pointer rounded-xl border border-neutral-300 px-3 py-2 text-center text-xs font-bold text-neutral-600 transition-colors duration-150 hover:bg-neutral-50"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
