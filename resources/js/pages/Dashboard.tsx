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
import { useState } from 'react';
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

    const [currentPage, setCurrentPage] = useState(1);

    // Items per page based on active tab
    const itemsPerPage = activeTab === 'Sertifikat' ? 9 : 12;

    // Client-side searches
    const filteredHostedEvents = hosted_events.filter((event) =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const filteredJoinedEvents = joined_events.filter((reg) =>
        reg.event?.title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Total pages calculation
    const getActiveTabTotalPages = () => {
        if (activeTab === 'Event Terbuat') {
            return Math.ceil(filteredHostedEvents.length / itemsPerPage);
        } else if (activeTab === 'Event Tersimpan') {
            return Math.ceil(filteredJoinedEvents.length / itemsPerPage);
        } else {
            return Math.ceil(certificates.length / itemsPerPage);
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

    const paginatedCertificates = certificates.slice(
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
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-micro font-bold ${
                            currentPage === 1
                                ? 'border-neutral-150 cursor-not-allowed bg-neutral-50 text-gray-300'
                                : 'cursor-pointer border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                        }`}
                        title="Sebelumnya"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {getPageNumbers().map((pageNumber) => (
                        <button
                            key={pageNumber}
                            type="button"
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-micro font-bold ${
                                currentPage === pageNumber
                                    ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
                                    : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                            }`}
                        >
                            {pageNumber}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1),
                            )
                        }
                        disabled={currentPage === totalPages}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-micro font-bold ${
                            currentPage === totalPages
                                ? 'border-neutral-150 cursor-not-allowed bg-neutral-50 text-gray-300'
                                : 'cursor-pointer border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                        }`}
                        title="Selanjutnya"
                    >
                        <ChevronRight size={16} />
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
                                <h2 className="font-brand text-2xl leading-none font-black tracking-tight text-neutral-900">
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

                    {/* Dashboard Navigation & Search */}
                    <div className="mb-8 flex flex-col justify-between gap-6 border-b border-neutral-200 pb-4 md:flex-row md:items-center">
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

                        {/* Search Box */}
                        {activeTab !== 'Sertifikat' && (
                            <div className="relative w-full md:max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Cari nama event..."
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
                        )}
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
                                        <h4 className="text-base font-bold text-neutral-800">
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
                                        <h4 className="text-base font-bold text-neutral-800">
                                            Event Tidak Ditemukan
                                        </h4>
                                        <p className="max-w-[280px] text-small text-gray-400">
                                            Tidak ada event yang cocok dengan
                                            kata kunci pencarian Anda.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    <div className="animate-in fade-in grid grid-cols-1 gap-6 duration-200 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                        {paginatedHostedEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                className="border-neutral-150 group relative mx-auto flex h-[340px] w-full max-w-[300px] flex-col justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:h-[370px] lg:h-[400px]"
                                            >
                                                {/* "FREE" or price Badge on Top-Left of image */}
                                                <div className="absolute top-4 left-4 z-10 rounded-md bg-secondary-400 px-3 py-1 text-[0.6275rem] font-extrabold text-secondary-900 shadow-sm">
                                                    {event.price === 0
                                                        ? 'FREE'
                                                        : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                                                </div>

                                                <div className="relative h-[170px] w-full shrink-0 overflow-hidden border-b border-gray-100 bg-gray-50 sm:h-[190px] lg:h-[210px]">
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
                                                <div className="flex h-[170px] shrink-0 flex-col justify-between p-4 sm:h-[180px] lg:h-[190px]">
                                                    <div className="flex flex-col gap-1.5">
                                                        <h4 className="line-clamp-2 h-[34px] overflow-hidden text-xs leading-snug font-extrabold text-primary-500 group-hover:text-primary-600 sm:h-[40px] sm:text-sm lg:h-[48px] lg:text-base">
                                                            {event.title}
                                                        </h4>
                                                        <div className="flex flex-col gap-1 border-t border-gray-100/50 pt-1.5 text-[10px] font-semibold text-gray-400 sm:text-micro">
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
                                                            className="w-full py-1.5 text-[10px] sm:py-2 sm:text-small"
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
                                        <h4 className="text-base font-bold text-neutral-800">
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
                                        <h4 className="text-base font-bold text-neutral-800">
                                            Event Tidak Ditemukan
                                        </h4>
                                        <p className="max-w-[280px] text-small text-gray-400">
                                            Tidak ada event yang cocok dengan
                                            kata kunci pencarian Anda.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    <div className="animate-in fade-in grid grid-cols-1 gap-6 duration-200 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                        {paginatedJoinedEvents.map((reg) => {
                                            const event = reg.event;

                                            if (!event) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    key={reg.id}
                                                    className="border-neutral-150 group relative mx-auto flex h-[340px] w-full max-w-[300px] flex-col justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:h-[370px] lg:h-[400px]"
                                                >
                                                    {/* "FREE" or price Badge on Top-Left of image */}
                                                    <div className="absolute top-4 left-4 z-10 rounded-md bg-secondary-400 px-3 py-1 text-[0.6275rem] font-extrabold text-secondary-900 shadow-sm">
                                                        {event.price === 0
                                                            ? 'FREE'
                                                            : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                                                    </div>

                                                    <div className="relative h-[170px] w-full shrink-0 overflow-hidden border-b border-gray-100 bg-gray-50 sm:h-[190px] lg:h-[210px]">
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
                                                    <div className="flex h-[170px] shrink-0 flex-col justify-between p-4 sm:h-[180px] lg:h-[190px]">
                                                        <div className="flex flex-col gap-1.5">
                                                            <h4 className="line-clamp-2 h-[34px] overflow-hidden text-xs leading-snug font-extrabold text-primary-500 group-hover:text-primary-600 sm:h-[40px] sm:text-sm lg:h-[48px] lg:text-base">
                                                                {event.title}
                                                            </h4>
                                                            <div className="flex flex-col gap-1 border-t border-gray-100/50 pt-1.5 text-[10px] font-semibold text-gray-400 sm:text-micro">
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
                                                                className="flex flex-grow items-center justify-center rounded-full bg-primary-500 py-1.5 text-center text-[10px] font-bold text-white transition-colors hover:bg-primary-600 sm:py-2 sm:text-small"
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
                                        <h4 className="text-base font-bold text-neutral-800">
                                            Belum Ada Sertifikat
                                        </h4>
                                        <p className="max-w-[280px] text-small text-gray-400">
                                            Sertifikat event Anda akan muncul di
                                            sini setelah didistribusikan oleh
                                            penyelenggara.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    <div className="animate-in fade-in grid grid-cols-1 gap-6 duration-200 md:grid-cols-2 lg:grid-cols-3">
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
                                                    <h4 className="text-base leading-tight font-extrabold text-neutral-900">
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
