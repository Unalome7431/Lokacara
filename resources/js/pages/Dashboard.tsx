import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    Bookmark,
    Award,
    Search,
    MapPin,
    Plus,
    FileText,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import defaultAvatar from '@/../../public/avatars/default.png';
import DefaultCover from '@/../../public/covers/default_cover.jpg';
import Button from '@/components/ui/Button';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';

interface Category {
    id: number;
    name: string;
}

interface Event {
    id: number;
    title: string;
    poster_url?: string;
    type: 'online' | 'offline';
    location_name?: string;
    platform_name?: string;
    start_datetime: string;
    category?: Category;
    price?: number;
}

interface EventRegistration {
    id: number;
    event?: Event;
}

interface Certificate {
    id: number;
    eventRegistration?: {
        event?: {
            title: string;
        };
    };
}

interface DashboardProps {
    hosted_events: Event[];
    joined_events: EventRegistration[];
    certificates: Certificate[];
    auth: {
        user: {
            name: string;
            email: string;
            avatar_url?: string;
            role?: string;
        };
    };
}

export default function Dashboard({
    hosted_events = [],
    joined_events = [],
    certificates = [],
    auth,
}: DashboardProps) {
    const user = auth?.user;
    const [activeTab, setActiveTab] = useState<
        'Event Terbuat' | 'Event Tersimpan' | 'Sertifikat'
    >('Event Terbuat');
    const [timeFilter, setTimeFilter] = useState<'mendatang' | 'lalu'>(
        'mendatang',
    );
    const [searchQuery, setSearchQuery] = useState('');

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

    // Client-side searches and time filtering
    const now = new Date();

    const filteredHostedEvents = hosted_events.filter((event) => {
        const matchesSearch = event.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());

        if (!event.start_datetime) {
            return matchesSearch;
        }

        const eventDate = new Date(event.start_datetime);
        const matchesTime =
            timeFilter === 'mendatang' ? eventDate >= now : eventDate < now;

        return matchesSearch && matchesTime;
    });

    const filteredJoinedEvents = joined_events.filter((reg) => {
        if (!reg.event) {
return false;
}

        const matchesSearch = reg.event.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());

        if (!reg.event.start_datetime) {
return matchesSearch;
}

        const eventDate = new Date(reg.event.start_datetime);
        const matchesTime =
            timeFilter === 'mendatang' ? eventDate >= now : eventDate < now;

        return matchesSearch && matchesTime;
    });

    const filteredCertificates = certificates.filter((cert) =>
        cert.eventRegistration?.event?.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
    );

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    useEffect(() => {
        const handleResize = () => {
            let size = 12;

            if (activeTab === 'Sertifikat') {
                size = 9;
            } else {
                const width = window.innerWidth;

                if (width >= 1024) {
                    size = 12; // 4 card per row viewport = 3x4 per page
                } else if (width >= 768) {
                    size = 9; // 3 card per row viewport = 3x3 per page
                } else if (width >= 640) {
                    size = 8; // 2 card per row viewport = 2x4 per page
                } else {
                    size = 9; // horizontal card viewport = 9 card per page
                }
            }

            setItemsPerPage(size);

            let listLength = 0;

            if (activeTab === 'Event Terbuat') {
                listLength = filteredHostedEvents.length;
            } else if (activeTab === 'Event Tersimpan') {
                listLength = filteredJoinedEvents.length;
            } else {
                listLength = filteredCertificates.length;
            }

            const total = Math.ceil(listLength / size);

            if (total > 0) {
                setCurrentPage((prev) => (prev > total ? total : prev));
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [
        activeTab,
        filteredHostedEvents.length,
        filteredJoinedEvents.length,
        filteredCertificates.length,
    ]);

    // Total pages calculation
    const getActiveTabTotalPages = () => {
        if (activeTab === 'Event Terbuat') {
            return Math.ceil(filteredHostedEvents.length / itemsPerPage);
        } else if (activeTab === 'Event Tersimpan') {
            return Math.ceil(filteredJoinedEvents.length / itemsPerPage);
        } else {
            return Math.ceil(filteredCertificates.length / itemsPerPage);
        }
    };

    const totalPages = getActiveTabTotalPages();

    // Paginated slices
    const paginatedHostedEvents = filteredHostedEvents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const paginatedJoinedEvents = filteredJoinedEvents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const paginatedCertificates = filteredCertificates.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

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

    const renderPagination = () => {
        if (totalPages <= 1) {
            return null;
        }

        return (
            <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-6">
                <span className="text-micro font-semibold text-gray-400">
                    Halaman {currentPage} dari {totalPages}
                </span>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
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
                                onClick={() => setCurrentPage(pageNumber)}
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
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1),
                            )
                        }
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
    };

    return (
        <div className="flex min-h-screen flex-col justify-between bg-neutral-50/50">
            <div className="flex-grow">
                <NavBar />
                <Head title="Dashboard Saya - Lokacara" />

                {/* Main Dashboard Layout */}
                <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 md:px-8">
                    {/* User profile section */}
                    <div className="mb-10 flex flex-col items-center gap-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:flex-row md:p-8">
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-primary-100">
                            <img
                                src={user?.avatar_url || defaultAvatar}
                                alt={user?.name || 'User'}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="flex-grow text-center md:text-left">
                            <div className="mb-1.5 flex flex-col justify-center gap-2 md:flex-row md:items-center md:justify-start">
                                <h2 className="font-brand text-h2-mobile leading-none font-black tracking-tight text-neutral-900 lg:text-h3-web">
                                    {user?.name || 'Pengguna Lokacara'}
                                </h2>
                                {user?.role === 'admin' && (
                                    <span className="self-center rounded-md bg-red-100 px-2.5 py-0.5 text-[0.65rem] font-extrabold tracking-wider text-red-800 uppercase">
                                        ADMIN
                                    </span>
                                )}
                            </div>
                            <p className="mb-4 text-small leading-none font-semibold text-gray-500">
                                {user?.email}
                            </p>
                            <div className="flex items-center justify-center gap-2 md:justify-start">
                                <Link
                                    href="/settings"
                                    className="rounded-full bg-neutral-100 px-4 py-2 text-micro font-bold text-neutral-800 transition-colors duration-150 hover:bg-neutral-200"
                                >
                                    Edit Profile & Kata Sandi
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Navigation & Toggles */}
                    <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        {/* Tab Toggles */}
                        <div className="relative flex w-full shrink-0 gap-0 overflow-hidden rounded-2xl bg-neutral-100 p-1 sm:w-[500px] md:w-[540px]">
                            {/* Moving highlight pill */}
                            <div
                                className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm transition-all duration-300 ease-in-out"
                                style={{
                                    left: `calc(${['Event Terbuat', 'Event Tersimpan', 'Sertifikat'].indexOf(activeTab)} * (100% / 3) + 4px)`,
                                    width: `calc(100% / 3 - 8px)`,
                                }}
                            />
                            {(
                                [
                                    'Event Terbuat',
                                    'Event Tersimpan',
                                    'Sertifikat',
                                ] as const
                            ).map((tab) => {
                                const isActive = activeTab === tab;
                                let count = 0;

                                if (tab === 'Event Terbuat') {
                                    count = hosted_events.length;
                                } else if (tab === 'Event Tersimpan') {
                                    count = joined_events.length;
                                } else if (tab === 'Sertifikat') {
                                    count = certificates.length;
                                }

                                return (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            setSearchQuery('');
                                            setCurrentPage(1);
                                        }}
                                        className={`relative z-10 flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-0 px-2 py-2.5 text-xs font-bold whitespace-nowrap transition-colors duration-300 sm:gap-2 sm:px-4 sm:text-small ${
                                            isActive
                                                ? 'text-primary-500'
                                                : 'text-gray-500 hover:text-neutral-900'
                                        }`}
                                    >
                                        <span>{tab}</span>
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold transition-colors duration-300 sm:text-micro ${
                                                isActive
                                                    ? 'bg-primary-50 text-primary-600'
                                                    : 'bg-neutral-200 text-gray-600'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Lalu / Mendatang Toggler */}
                        {activeTab !== 'Sertifikat' && (
                            <div className="relative flex w-full shrink-0 gap-0 overflow-hidden rounded-2xl bg-neutral-100 p-1 sm:w-[240px]">
                                {/* Moving highlight pill */}
                                <div
                                    className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm transition-all duration-300 ease-in-out"
                                    style={{
                                        left: `calc(${['mendatang', 'lalu'].indexOf(timeFilter)} * (100% / 2) + 4px)`,
                                        width: `calc(100% / 2 - 8px)`,
                                    }}
                                />
                                {(
                                    [
                                        {
                                            key: 'mendatang',
                                            label: 'Mendatang',
                                        },
                                        { key: 'lalu', label: 'Lalu' },
                                    ] as const
                                ).map((item) => {
                                    const isActive = timeFilter === item.key;

                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => {
                                                setTimeFilter(item.key);
                                                setCurrentPage(1);
                                            }}
                                            className={`relative z-10 flex flex-1 cursor-pointer items-center justify-center py-2.5 text-xs font-bold transition-colors duration-300 sm:text-small ${
                                                isActive
                                                    ? 'text-primary-500'
                                                    : 'text-gray-500 hover:text-neutral-900'
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Search Box (Full Width) */}
                    <div className="mb-8 w-full border-b border-neutral-200 pb-6">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder={
                                    activeTab === 'Sertifikat'
                                        ? 'Cari nama sertifikat...'
                                        : 'Cari nama event...'
                                }
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pr-10 pl-4 text-base font-medium text-gray-700 placeholder-gray-400 transition-colors focus:border-primary-500 focus:ring-0 focus:outline-none"
                            />
                            <Search
                                size={16}
                                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Content Tab Bodies */}
                    <div className="min-h-[300px]">
                        {/* Event Terbuat Tab */}
                        {activeTab === 'Event Terbuat' &&
                            (hosted_events.length === 0 ? (
                                <div className="animate-in fade-in flex flex-col items-center justify-center gap-4 rounded-3xl border border-neutral-200 bg-white px-4 py-20 text-center shadow-sm duration-200">
                                    <div className="bg-primary-50 flex h-16 w-16 items-center justify-center rounded-full text-primary-500">
                                        <Calendar size={28} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-h6-mobile font-bold text-neutral-800 lg:text-h6-web">
                                            Belum Ada Event
                                        </h4>
                                        <p className="max-w-[280px] text-small text-gray-400">
                                            Anda belum menyelenggarakan event
                                            apapun.
                                        </p>
                                    </div>
                                    <Link
                                        href="/create"
                                        className="flex items-center gap-1.5 rounded-full bg-primary-500 px-6 py-2.5 text-small font-bold text-white shadow-md transition-all hover:bg-primary-600"
                                    >
                                        <Plus size={16} />
                                        <span>Buat Event Baru</span>
                                    </Link>
                                </div>
                            ) : filteredHostedEvents.length === 0 ? (
                                <div className="animate-in fade-in flex h-[325px] w-full flex-col items-center justify-center gap-4 rounded-3xl border border-neutral-200 bg-white px-4 text-center shadow-sm duration-200 sm:h-[370px] lg:h-[400px]">
                                    <Search
                                        size={28}
                                        className="animate-pulse text-gray-400"
                                    />
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-h6-mobile font-bold text-neutral-800 lg:text-h6-web">
                                            {searchQuery
                                                ? 'Event Tidak Ditemukan'
                                                : `Belum Ada Event ${timeFilter === 'mendatang' ? 'Mendatang' : 'Lalu'}`}
                                        </h4>
                                        <p className="max-w-[280px] text-small text-gray-400">
                                            {searchQuery
                                                ? 'Tidak ada event yang cocok dengan kata kunci pencarian Anda.'
                                                : `Anda tidak memiliki event ${timeFilter === 'mendatang' ? 'mendatang' : 'lalu'} saat ini.`}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    <div className="animate-in fade-in grid grid-cols-1 gap-4 duration-200 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                        {paginatedHostedEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                className="border-neutral-150 group relative flex h-[160px] w-full flex-row justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:h-[370px] sm:flex-col lg:mx-auto lg:h-[400px] lg:w-full lg:max-w-[300px]"
                                            >
                                                {/* "FREE" or price Badge on Top-Left of image */}
                                                <div className="absolute top-3 left-3 z-10 rounded-md bg-secondary-400 px-3 py-1 text-[0.6275rem] font-extrabold text-secondary-900 shadow-sm sm:top-4 sm:left-4">
                                                    {event.price === 0
                                                        ? 'FREE'
                                                        : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                                                </div>

                                                <div className="sm:aspect-none relative aspect-square h-full w-[160px] shrink-0 overflow-hidden border-r border-gray-100 bg-gray-50 sm:h-[190px] sm:w-full sm:border-r-0 sm:border-b lg:h-[210px]">
                                                    <img
                                                        src={
                                                            event.poster_url ||
                                                            DefaultCover
                                                        }
                                                        alt={event.title}
                                                        draggable="false"
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                </div>
                                                <div className="flex flex-grow flex-col justify-between gap-1 overflow-hidden p-3 sm:h-[180px] sm:flex-none sm:shrink-0 sm:p-4 lg:h-[190px]">
                                                    <div className="flex flex-col gap-1 sm:gap-1.5">
                                                        <h4 className="line-clamp-2 h-[36px] overflow-hidden text-xs leading-snug font-extrabold text-primary-500 group-hover:text-primary-600 sm:h-[40px] sm:text-sm lg:h-[48px] lg:text-base">
                                                            {event.title}
                                                        </h4>
                                                        <div className="flex flex-col gap-0.5 border-t border-gray-100/50 pt-1 text-[10px] font-semibold text-gray-400 sm:gap-1 sm:pt-1.5 sm:text-micro">
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar
                                                                    size={12}
                                                                    className="shrink-0 text-gray-400"
                                                                />
                                                                {formatShortDate(
                                                                    event.start_datetime,
                                                                )}
                                                            </span>
                                                            <span className="flex items-start gap-1.5">
                                                                <MapPin
                                                                    size={12}
                                                                    className="mt-0.5 shrink-0 text-gray-400"
                                                                />
                                                                <span className="line-clamp-2 overflow-hidden">
                                                                    {event.type ===
                                                                    'online'
                                                                        ? 'Online'
                                                                        : event.location_name ||
                                                                          'Lokasi Offline'}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="pt-1">
                                                        <Button
                                                            href={`/dashboard/events/${event.id}`}
                                                            className="w-full py-1 text-[10px] sm:py-2 sm:text-small"
                                                        >
                                                            Detail Event
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {renderPagination()}
                                </div>
                            ))}

                        {/* Event Tersimpan Tab */}
                        {activeTab === 'Event Tersimpan' &&
                            (joined_events.length === 0 ? (
                                <div className="animate-in fade-in flex flex-col items-center justify-center gap-4 rounded-3xl border border-neutral-200 bg-white px-4 py-20 text-center shadow-sm duration-200">
                                    <div className="bg-primary-50 flex h-16 w-16 items-center justify-center rounded-full text-primary-500">
                                        <Bookmark size={28} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-h6-mobile font-bold text-neutral-800 lg:text-h6-web">
                                            Belum Ada Event Terdaftar
                                        </h4>
                                        <p className="max-w-[280px] text-small text-gray-400">
                                            Anda belum mendaftar ke event apa
                                            pun.
                                        </p>
                                    </div>
                                    <Link
                                        href="/"
                                        className="rounded-full bg-primary-500 px-6 py-2.5 text-small font-bold text-white shadow-md transition-all hover:bg-primary-600"
                                    >
                                        Cari Event Menarik
                                    </Link>
                                </div>
                            ) : filteredJoinedEvents.length === 0 ? (
                                <div className="animate-in fade-in flex h-[325px] w-full flex-col items-center justify-center gap-4 rounded-3xl border border-neutral-200 bg-white px-4 text-center shadow-sm duration-200 sm:h-[370px] lg:h-[400px]">
                                    <Search
                                        size={28}
                                        className="animate-pulse text-gray-400"
                                    />
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-h6-mobile font-bold text-neutral-800 lg:text-h6-web">
                                            {searchQuery
                                                ? 'Event Tidak Ditemukan'
                                                : `Belum Ada Event ${timeFilter === 'mendatang' ? 'Mendatang' : 'Lalu'}`}
                                        </h4>
                                        <p className="max-w-[280px] text-small text-gray-400">
                                            {searchQuery
                                                ? 'Tidak ada event yang cocok dengan kata kunci pencarian Anda.'
                                                : `Anda tidak memiliki event ${timeFilter === 'mendatang' ? 'mendatang' : 'lalu'} yang terdaftar.`}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    <div className="animate-in fade-in grid grid-cols-1 gap-4 duration-200 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                        {paginatedJoinedEvents.map((reg) => {
                                            const event = reg.event;

                                            if (!event) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    key={reg.id}
                                                    className="border-neutral-150 group relative flex h-[160px] w-full flex-row justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:h-[370px] sm:flex-col lg:mx-auto lg:h-[400px] lg:w-full lg:max-w-[300px]"
                                                >
                                                    {/* "FREE" or price Badge on Top-Left of image */}
                                                    <div className="absolute top-3 left-3 z-10 rounded-md bg-secondary-400 px-3 py-1 text-[0.6275rem] font-extrabold text-secondary-900 shadow-sm sm:top-4 sm:left-4">
                                                        {event.price === 0
                                                            ? 'FREE'
                                                            : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                                                    </div>

                                                    <div className="sm:aspect-none relative aspect-square h-full w-[160px] shrink-0 overflow-hidden border-r border-gray-100 bg-gray-50 sm:h-[190px] sm:w-full sm:border-r-0 sm:border-b lg:h-[210px]">
                                                        <img
                                                            src={
                                                                event.poster_url ||
                                                                DefaultCover
                                                            }
                                                            alt={event.title}
                                                            draggable="false"
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    </div>
                                                    <div className="flex flex-grow flex-col justify-between gap-1 overflow-hidden p-3 sm:h-[180px] sm:flex-none sm:shrink-0 sm:p-4 lg:h-[190px]">
                                                        <div className="flex flex-col gap-1 sm:gap-1.5">
                                                            <h4 className="line-clamp-2 h-[36px] overflow-hidden text-xs leading-snug font-extrabold text-primary-500 group-hover:text-primary-600 sm:h-[40px] sm:text-sm lg:h-[48px] lg:text-base">
                                                                {event.title}
                                                            </h4>
                                                            <div className="flex flex-col gap-0.5 border-t border-gray-100/50 pt-1 text-[10px] font-semibold text-gray-400 sm:gap-1 sm:pt-1.5 sm:text-micro">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Calendar
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="shrink-0 text-gray-400"
                                                                    />
                                                                    {formatShortDate(
                                                                        event.start_datetime,
                                                                    )}
                                                                </span>
                                                                <span className="flex items-start gap-1.5">
                                                                    <MapPin
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="mt-0.5 shrink-0 text-gray-400"
                                                                    />
                                                                    <span className="line-clamp-2 overflow-hidden">
                                                                        {event.type ===
                                                                        'online'
                                                                            ? 'Online'
                                                                            : event.location_name ||
                                                                              'Lokasi Offline'}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 pt-1">
                                                            <Link
                                                                href={`/events/${event.id}`}
                                                                className="flex flex-grow items-center justify-center rounded-full bg-primary-500 py-1 text-center text-[10px] font-bold text-white transition-colors hover:bg-primary-600 sm:py-2 sm:text-small"
                                                            >
                                                                Detail Event
                                                            </Link>
                                                            <Link
                                                                href={`/events/${event.id}/ticket`}
                                                                className="flex items-center justify-center rounded-full bg-neutral-100 px-3 text-neutral-800 transition-colors hover:bg-neutral-200"
                                                                title="Lihat Tiket QR"
                                                            >
                                                                <FileText
                                                                    size={14}
                                                                />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {renderPagination()}
                                </div>
                            ))}

                        {/* Sertifikat Tab */}
                        {activeTab === 'Sertifikat' &&
                            (certificates.length === 0 ? (
                                <div className="animate-in fade-in flex flex-col items-center justify-center gap-4 rounded-3xl border border-neutral-200 bg-white px-4 py-20 text-center shadow-sm duration-200">
                                    <div className="bg-primary-50 flex h-16 w-16 items-center justify-center rounded-full text-primary-500">
                                        <Award size={28} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-h6-mobile font-bold text-neutral-800 lg:text-h6-web">
                                            Belum Ada Sertifikat
                                        </h4>
                                        <p className="max-w-[280px] text-small text-gray-400">
                                            Sertifikat event Anda akan muncul di
                                            sini setelah didistribusikan oleh
                                            penyelenggara.
                                        </p>
                                    </div>
                                </div>
                            ) : filteredCertificates.length === 0 ? (
                                <div className="animate-in fade-in flex h-[325px] w-full flex-col items-center justify-center gap-4 rounded-3xl border border-neutral-200 bg-white px-4 text-center shadow-sm duration-200 sm:h-[370px] lg:h-[400px]">
                                    <Search
                                        size={28}
                                        className="animate-pulse text-gray-400"
                                    />
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-h6-mobile font-bold text-neutral-800 lg:text-h6-web">
                                            Sertifikat Tidak Ditemukan
                                        </h4>
                                        <p className="max-w-[280px] text-small text-gray-400">
                                            Tidak ada sertifikat yang cocok
                                            dengan kata kunci pencarian Anda.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    <div className="animate-in fade-in grid grid-cols-1 gap-4 duration-200 md:grid-cols-2 lg:grid-cols-3">
                                        {paginatedCertificates.map((cert) => (
                                            <div
                                                key={cert.id}
                                                className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-primary-200"
                                            >
                                                <div className="bg-primary-50 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-primary-500">
                                                    <Award size={22} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-micro font-bold tracking-wider text-gray-400 uppercase">
                                                        E-SERTIFIKAT RESMI
                                                    </span>
                                                    <h4 className="text-h6-mobile leading-tight font-extrabold text-neutral-900 lg:text-h6-web">
                                                        {cert.eventRegistration
                                                            ?.event?.title ||
                                                            'Event Lokacara'}
                                                    </h4>
                                                </div>

                                                <a
                                                    href={`/certificates/${cert.id}/download`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-full bg-primary-500 py-2 text-center text-micro font-bold text-white shadow-md transition-colors hover:bg-primary-600"
                                                >
                                                    <span>Unduh PDF</span>
                                                    <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                    {renderPagination()}
                                </div>
                            ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
