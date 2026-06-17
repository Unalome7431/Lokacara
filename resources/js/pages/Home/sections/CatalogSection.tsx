import { useState, useMemo, useRef, useEffect } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import EventCard from '@/components/ui/EventCard';
import FilterPanel from '@/components/ui/FilterPanel';
import Pagination from '@/components/ui/Pagination';
import useSlidingUnderline from '@/hooks/useSlidingUnderline';
import { calculateDistance } from '@/lib/geocoding';

interface Event {
    id: number;
    title: string;
    description: string;
    type: 'online' | 'offline';
    poster_url?: string;
    location_name?: string;
    latitude?: number;
    longitude?: number;
    distance?: number;
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

interface CatalogSectionProps {
    events: Event[];
    categories: Category[];
    userCoords: { lat: number; lng: number } | null;
}

export default function CatalogSection({ events = [], categories = [], userCoords }: CatalogSectionProps) {
    const todayString = useMemo(() => new Date().toISOString().split('T')[0], []);

    // 1. Filter States
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [activeType, setActiveType] = useState<'all' | 'online' | 'offline'>('all');
    const [sortBy, setSortBy] = useState<'popular' | 'nearest' | 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc'>('popular');

    // Price range filters
    const [tempMinPrice, setTempMinPrice] = useState('');
    const [tempMaxPrice, setTempMaxPrice] = useState('');
    const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
    const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);

    // Date range filters
    const [tempStartDate, setTempStartDate] = useState('');
    const [tempEndDate, setTempEndDate] = useState('');
    const [appliedStartDate, setAppliedStartDate] = useState<string | null>(null);
    const [appliedEndDate, setAppliedEndDate] = useState<string | null>(null);

    // Dropdown / Drawer States
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    const sortOptions = [
        { value: 'popular', label: 'Terpopuler' },
        { value: 'nearest', label: 'Lokasi Terdekat' },
        { value: 'date_asc', label: 'Tanggal Terdekat' },
        { value: 'date_desc', label: 'Tanggal Terjauh' },
        { value: 'price_asc', label: 'Harga Termurah' },
        { value: 'price_desc', label: 'Harga Termahal' },
    ] as const;

    // Sliding Underline hook
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

    // Main Catalog filtering and sorting logic
    const filteredCatalogEvents = useMemo(() => {
        const result = events.filter((e) => {
            const matchesCategory =
                activeCategory === null || e.category?.id === activeCategory;
            const matchesType = activeType === 'all' || e.type === activeType;

            // Price range filter
            const matchesMinPrice =
                appliedMinPrice === null || e.price >= appliedMinPrice;
            const matchesMaxPrice =
                appliedMaxPrice === null || e.price <= appliedMaxPrice;

            // Date range filter
            let matchesDate = true;
            if (appliedStartDate || appliedEndDate) {
                const eventDate = new Date(e.start_datetime).setHours(0, 0, 0, 0);

                if (appliedStartDate) {
                    const start = new Date(appliedStartDate).setHours(0, 0, 0, 0);
                    if (eventDate < start) {
                        matchesDate = false;
                    }
                }

                if (appliedEndDate) {
                    const end = new Date(appliedEndDate).setHours(23, 59, 59, 999);
                    if (eventDate > end) {
                        matchesDate = false;
                    }
                }
            }

            return (
                matchesCategory &&
                matchesType &&
                matchesMinPrice &&
                matchesMaxPrice &&
                matchesDate
            );
        });

        if (sortBy === 'popular') {
            result.sort((a, b) => {
                const ratioA = (a.view_count || 0) / (a.capacity || 1);
                const ratioB = (b.view_count || 0) / (b.capacity || 1);
                return ratioB - ratioA;
            });
        } else if (sortBy === 'nearest') {
            result.sort((a, b) => {
                const distA =
                    a.type === 'offline' &&
                    a.latitude !== null &&
                    a.longitude !== null &&
                    userCoords
                        ? calculateDistance(
                              userCoords.lat,
                              userCoords.lng,
                              Number(a.latitude),
                              Number(a.longitude),
                          )
                        : Infinity;
                const distB =
                    b.type === 'offline' &&
                    b.latitude !== null &&
                    b.longitude !== null &&
                    userCoords
                        ? calculateDistance(
                              userCoords.lat,
                              userCoords.lng,
                              Number(b.latitude),
                              Number(b.longitude),
                          )
                        : Infinity;
                return distA - distB;
            });
        } else if (sortBy === 'date_asc') {
            result.sort(
                (a, b) =>
                    new Date(a.start_datetime).getTime() -
                    new Date(b.start_datetime).getTime(),
            );
        } else if (sortBy === 'date_desc') {
            result.sort(
                (a, b) =>
                    new Date(b.start_datetime).getTime() -
                    new Date(a.start_datetime).getTime(),
            );
        } else if (sortBy === 'price_asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_desc') {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [
        events,
        activeCategory,
        activeType,
        sortBy,
        userCoords,
        appliedMinPrice,
        appliedMaxPrice,
        appliedStartDate,
        appliedEndDate,
    ]);

    // Pagination State & Logic
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 9;
    const totalPages = Math.ceil(filteredCatalogEvents.length / eventsPerPage);
    const paginatedCatalogEvents = filteredCatalogEvents.slice(
        (currentPage - 1) * eventsPerPage,
        currentPage * eventsPerPage,
    );

    return (
        <div id="catalog" className="mt-12 flex scroll-mt-24 flex-col gap-6">
            <h3 className="font-brand text-h3-mobile font-black text-neutral-900 lg:text-h3-web">
                Jelajah Event
            </h3>
            <div className="flex flex-col gap-10 lg:flex-row">
                {/* Left Column: Sidebar Category Filter */}
                <div className="hidden flex-col gap-6 border-b border-neutral-150 pb-8 lg:flex lg:w-1/4 lg:border-r lg:border-b-0 lg:pr-10 lg:pb-0">
                    <h4 className="font-brand text-h4-mobile font-black text-primary-500 lg:text-h4-web">
                        Preferensi
                    </h4>

                    <FilterPanel
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategorySelect={(id) => {
                            setActiveCategory(id);
                            setCurrentPage(1);
                        }}
                        tempMinPrice={tempMinPrice}
                        setTempMinPrice={setTempMinPrice}
                        tempMaxPrice={tempMaxPrice}
                        setTempMaxPrice={setTempMaxPrice}
                        onApplyPrice={() => {
                            const minVal = tempMinPrice === '' ? null : Number(tempMinPrice);
                            const maxVal = tempMaxPrice === '' ? null : Number(tempMaxPrice);
                            setAppliedMinPrice(minVal);
                            setAppliedMaxPrice(maxVal);
                            setCurrentPage(1);
                        }}
                        onResetPrice={() => {
                            setTempMinPrice('');
                            setTempMaxPrice('');
                            setAppliedMinPrice(null);
                            setAppliedMaxPrice(null);
                            setCurrentPage(1);
                        }}
                        hasAppliedPrice={appliedMinPrice !== null || appliedMaxPrice !== null}
                        tempStartDate={tempStartDate}
                        setTempStartDate={setTempStartDate}
                        tempEndDate={tempEndDate}
                        setTempEndDate={setTempEndDate}
                        onApplyDate={() => {
                            setAppliedStartDate(tempStartDate || null);
                            setAppliedEndDate(tempEndDate || null);
                            setCurrentPage(1);
                        }}
                        onResetDate={() => {
                            setTempStartDate('');
                            setTempEndDate('');
                            setAppliedStartDate(null);
                            setAppliedEndDate(null);
                            setCurrentPage(1);
                        }}
                        hasAppliedDate={appliedStartDate !== null || appliedEndDate !== null}
                        todayString={todayString}
                    />
                </div>

                {/* Right Column: Events Catalogue Listing */}
                <div className="flex grow flex-col gap-8">
                    {/* Tab Filter Type */}
                    <div className="flex items-end justify-between border-b border-neutral-100">
                        <div className="scrollbar-none relative flex items-center gap-6 overflow-x-auto sm:gap-8">
                            {/* Sliding underline */}
                            <div
                                className="absolute bottom-0 h-0.75 rounded-full bg-primary-500 transition-all duration-300 ease-out"
                                style={{
                                    left: `${underlineStyle.left}px`,
                                    width: `${underlineStyle.width}px`,
                                }}
                            />

                            <button
                                ref={registerRef('all')}
                                onClick={() => {
                                    setActiveType('all');
                                    setCurrentPage(1);
                                }}
                                className={`cursor-pointer pb-3 text-sm font-bold transition-colors duration-300 sm:text-base ${activeType === 'all' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                Semua
                            </button>
                            <button
                                ref={registerRef('online')}
                                onClick={() => {
                                    setActiveType('online');
                                    setCurrentPage(1);
                                }}
                                className={`cursor-pointer pb-3 text-sm font-bold transition-colors duration-300 sm:text-base ${activeType === 'online' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                Online
                            </button>
                            <button
                                ref={registerRef('offline')}
                                onClick={() => {
                                    setActiveType('offline');
                                    setCurrentPage(1);
                                }}
                                className={`cursor-pointer pb-3 text-sm font-bold transition-colors duration-300 sm:text-base ${activeType === 'offline' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                Offline
                            </button>
                        </div>

                        <div className="flex items-center gap-3 pb-1.5">
                            {/* Mobile Filter Trigger Button */}
                            <button
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="border-neutral-350 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white text-xs font-bold text-neutral-600 shadow-xs transition-all duration-200 outline-none hover:border-primary-500 hover:text-primary-500 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-1.5 lg:hidden"
                            >
                                <Filter size={14} className="text-neutral-400" />
                                <span className="hidden sm:inline">Filter</span>
                            </button>

                            {/* Custom Dropdown Sort Filter */}
                            <div className="relative" ref={sortDropdownRef}>
                                <button
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
                                                onClick={() => {
                                                    setSortBy(opt.value);
                                                    setIsSortDropdownOpen(false);
                                                    setCurrentPage(1);
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
                                        onClick={() => setIsMobileFilterOpen(false)}
                                        className="cursor-pointer rounded-full p-1 text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-600"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Drawer Filters */}
                                <FilterPanel
                                    categories={categories}
                                    activeCategory={activeCategory}
                                    onCategorySelect={(id) => {
                                        setActiveCategory(id);
                                        setCurrentPage(1);
                                    }}
                                    tempMinPrice={tempMinPrice}
                                    setTempMinPrice={setTempMinPrice}
                                    tempMaxPrice={tempMaxPrice}
                                    setTempMaxPrice={setTempMaxPrice}
                                    onApplyPrice={() => {
                                        const minVal = tempMinPrice === '' ? null : Number(tempMinPrice);
                                        const maxVal = tempMaxPrice === '' ? null : Number(tempMaxPrice);
                                        setAppliedMinPrice(minVal);
                                        setAppliedMaxPrice(maxVal);
                                        setCurrentPage(1);
                                        setIsMobileFilterOpen(false);
                                    }}
                                    onResetPrice={() => {
                                        setTempMinPrice('');
                                        setTempMaxPrice('');
                                        setAppliedMinPrice(null);
                                        setAppliedMaxPrice(null);
                                        setCurrentPage(1);
                                        setIsMobileFilterOpen(false);
                                    }}
                                    hasAppliedPrice={appliedMinPrice !== null || appliedMaxPrice !== null}
                                    tempStartDate={tempStartDate}
                                    setTempStartDate={setTempStartDate}
                                    tempEndDate={tempEndDate}
                                    setTempEndDate={setTempEndDate}
                                    onApplyDate={() => {
                                        setAppliedStartDate(tempStartDate || null);
                                        setAppliedEndDate(tempEndDate || null);
                                        setCurrentPage(1);
                                        setIsMobileFilterOpen(false);
                                    }}
                                    onResetDate={() => {
                                        setTempStartDate('');
                                        setTempEndDate('');
                                        setAppliedStartDate(null);
                                        setAppliedEndDate(null);
                                        setCurrentPage(1);
                                        setIsMobileFilterOpen(false);
                                    }}
                                    hasAppliedDate={appliedStartDate !== null || appliedEndDate !== null}
                                    todayString={todayString}
                                />
                            </div>
                        </div>
                    )}

                    {/* Catalogue Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {paginatedCatalogEvents.length === 0 ? (
                            <div className="col-span-full py-20 text-center font-semibold text-gray-400">
                                Tidak ada event yang ditemukan untuk filter ini.
                            </div>
                        ) : (
                            paginatedCatalogEvents.map((event) => (
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
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
}
