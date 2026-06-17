import { Link } from '@inertiajs/react';
import {
    Calendar,
    Bookmark,
    Award,
    Search,
    Plus,
    FileText,
    ExternalLink,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import EventCard from '@/components/ui/EventCard';
import Pagination from '@/components/ui/Pagination';
import SegmentedToggle from '@/components/ui/SegmentedToggle';

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
    end_datetime?: string;
    category?: Category;
    price?: number;
    status?: string;
}

interface EventRegistration {
    id: number;
    event?: Event;
    status?: string;
}

interface Certificate {
    id: number;
    event_registration?: {
        event?: {
            title: string;
        };
    };
    eventRegistration?: {
        event?: {
            title: string;
        };
    };
}

interface DashboardCatalogProps {
    hosted_events: Event[];
    joined_events: EventRegistration[];
    certificates: Certificate[];
}

export default function DashboardCatalog({
    hosted_events = [],
    joined_events = [],
    certificates = [],
}: DashboardCatalogProps) {
    const [activeTab, setActiveTab] = useState<'Event Terbuat' | 'Event Tersimpan' | 'Sertifikat'>('Event Terbuat');
    const [timeFilter, setTimeFilter] = useState<'mendatang' | 'lalu' | 'dibatalkan'>('mendatang');
    const [searchQuery, setSearchQuery] = useState('');

    const now = new Date();

    // Client-side searches and time filtering
    const filteredHostedEvents = hosted_events.filter((event) => {
        const matchesSearch = event.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());

        if (timeFilter === 'dibatalkan') {
            return matchesSearch && event.status === 'cancelled';
        }

        if (event.status === 'cancelled') {
            return false;
        }

        const startDateTime = event.start_datetime ? new Date(event.start_datetime) : null;
        const endDateTime = event.end_datetime ? new Date(event.end_datetime) : null;

        let isPast = false;

        if (endDateTime) {
            isPast = endDateTime < now;
        } else if (startDateTime) {
            isPast = startDateTime < now;
        }

        const matchesTime = timeFilter === 'mendatang' ? !isPast : isPast;

        return matchesSearch && matchesTime;
    });

    const filteredJoinedEvents = joined_events.filter((reg) => {
        if (!reg.event) {
            return false;
        }

        const matchesSearch = reg.event.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());

        if (timeFilter === 'dibatalkan') {
            return matchesSearch && (reg.event.status === 'cancelled' || reg.status === 'cancelled');
        }

        if (reg.event.status === 'cancelled' || reg.status === 'cancelled') {
            return false;
        }

        const startDateTime = reg.event.start_datetime ? new Date(reg.event.start_datetime) : null;
        const endDateTime = reg.event.end_datetime ? new Date(reg.event.end_datetime) : null;

        let isPast = false;

        if (endDateTime) {
            isPast = endDateTime < now;
        } else if (startDateTime) {
            isPast = startDateTime < now;
        }

        const matchesTime = timeFilter === 'mendatang' ? !isPast : isPast;

        return matchesSearch && matchesTime;
    });

    const filteredCertificates = certificates.filter((cert) => {
        const title = cert.event_registration?.event?.title || cert.eventRegistration?.event?.title;

        return title?.toLowerCase().includes(searchQuery.toLowerCase());
    });

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

    const renderPagination = () => {
        return (
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        );
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Dashboard Navigation & Toggles */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                {/* Tab Toggles */}
                <SegmentedToggle
                    options={[
                        { key: 'Event Terbuat', label: 'Event Terbuat', badge: hosted_events.length },
                        { key: 'Event Tersimpan', label: 'Event Tersimpan', badge: joined_events.length },
                        { key: 'Sertifikat', label: 'Sertifikat', badge: certificates.length },
                    ]}
                    value={activeTab}
                    onChange={(val) => {
                        setActiveTab(val);
                        setSearchQuery('');
                        setCurrentPage(1);
                    }}
                    className="md:w-[450px] lg:w-[540px]"
                />

                {/* Lalu / Mendatang Toggler */}
                {activeTab !== 'Sertifikat' && (
                    <SegmentedToggle
                        options={[
                            { key: 'mendatang', label: 'Mendatang' },
                            { key: 'lalu', label: 'Lalu' },
                            { key: 'dibatalkan', label: 'Dibatalkan' },
                        ]}
                        value={timeFilter}
                        onChange={(val) => {
                            setTimeFilter(val);
                            setCurrentPage(1);
                        }}
                        className="md:w-[300px] lg:w-[360px]"
                    />
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
                                    Anda belum menyelenggarakan event apapun.
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
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        variant="dashboard"
                                        detailUrl={`/dashboard/events/${event.id}`}
                                    />
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
                                    Anda belum mendaftar ke event apa pun.
                                </p>
                            </div>
                            <Link
                                href="/"
                                className="rounded-full bg-primary-500 px-6 py-2.5 text-small font-bold text-white shadow-md transition-all hover:bg-primary-600"
                            >
                                / Cari Event Menarik
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
                                        <EventCard
                                            key={reg.id}
                                            event={event}
                                            variant="dashboard"
                                            footer={
                                                <div className="flex gap-2 pt-1">
                                                    <Link
                                                        href={`/events/${event.id}`}
                                                        className="flex grow items-center justify-center rounded-full bg-primary-500 py-1 text-center text-[10px] font-bold text-white transition-colors hover:bg-primary-600 sm:py-2 sm:text-small"
                                                    >
                                                        Detail Event
                                                    </Link>
                                                    <Link
                                                        href={`/events/${event.id}/ticket`}
                                                        className="flex items-center justify-center rounded-full bg-neutral-100 px-3 text-neutral-800 transition-colors hover:bg-neutral-200"
                                                        title="Lihat Tiket QR"
                                                    >
                                                        <FileText size={14} />
                                                    </Link>
                                                </div>
                                            }
                                        />
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
                                    Sertifikat event Anda akan muncul di sini setelah didistribusikan oleh penyelenggara.
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
                                    Tidak ada sertifikat yang cocok dengan kata kunci pencarian Anda.
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
                                                {cert.event_registration?.event?.title ||
                                                    cert.eventRegistration?.event?.title ||
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
    );
}
