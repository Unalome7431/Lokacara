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
} from 'lucide-react';
import { useState } from 'react';
import defaultAvatar from '@/../../public/avatars/default.png';
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

    // Client-side searches
    const filteredHostedEvents = hosted_events.filter((event) =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const filteredJoinedEvents = joined_events.filter((reg) =>
        reg.event?.title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

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
                        <div className="flex shrink-0 gap-2 self-start overflow-x-auto rounded-2xl bg-neutral-100 p-1">
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
                                        }}
                                        className={`flex cursor-pointer items-center gap-2 rounded-xl border-0 px-5 py-2.5 text-small font-bold whitespace-nowrap transition-all duration-150 ${
                                            isActive
                                                ? 'bg-white text-primary-500 shadow-sm'
                                                : 'bg-transparent text-gray-500 hover:text-neutral-900'
                                        }`}
                                    >
                                        <span>{tab}</span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-micro font-extrabold ${
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
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
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
                            (filteredHostedEvents.length === 0 ? (
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
                            ) : (
                                <div className="animate-in fade-in grid grid-cols-1 gap-6 duration-200 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredHostedEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:border-primary-200"
                                        >
                                            <div className="relative aspect-video w-full border-b border-neutral-100 bg-neutral-100">
                                                <img
                                                    src={
                                                        event.poster_url ||
                                                        '/covers/default_cover.jpg'
                                                    }
                                                    alt={event.title}
                                                    className="h-full w-full object-cover"
                                                />
                                                <div
                                                    className={`absolute top-3 left-3 z-10 rounded-md px-2.5 py-0.5 text-[0.6rem] font-extrabold tracking-wide uppercase shadow-xs ${
                                                        event.type === 'online'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}
                                                >
                                                    {event.type}
                                                </div>
                                            </div>

                                            <div className="flex flex-grow flex-col gap-3 p-6">
                                                <div>
                                                    {event.category && (
                                                        <span className="text-micro font-extrabold tracking-wide text-secondary-600 uppercase">
                                                            {
                                                                event.category
                                                                    .name
                                                            }
                                                        </span>
                                                    )}
                                                    <h4 className="mt-0.5 line-clamp-1 text-base leading-snug font-extrabold text-neutral-900">
                                                        {event.title}
                                                    </h4>
                                                </div>

                                                <div className="flex flex-col gap-1 text-small font-semibold text-gray-500">
                                                    <span className="flex items-center gap-1.5 truncate">
                                                        <MapPin
                                                            size={12}
                                                            className="shrink-0 text-gray-400"
                                                        />
                                                        <span>
                                                            {event.type ===
                                                            'online'
                                                                ? 'Online'
                                                                : event.location_name ||
                                                                  'Offline'}
                                                        </span>
                                                    </span>
                                                    <span className="text-micro font-medium text-gray-400">
                                                        {formatShortDate(
                                                            event.start_datetime,
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="mt-auto flex gap-2 border-t border-gray-100 pt-4">
                                                    <Link
                                                        href={`/dashboard/events/${event.id}`}
                                                        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-micro font-bold text-white transition-colors hover:bg-primary-600"
                                                    >
                                                        <span>
                                                            Detail Event
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}

                        {/* Event Tersimpan Tab */}
                        {activeTab === 'Event Tersimpan' &&
                            (filteredJoinedEvents.length === 0 ? (
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
                            ) : (
                                <div className="animate-in fade-in grid grid-cols-1 gap-6 duration-200 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredJoinedEvents.map((reg) => {
                                        const event = reg.event;

                                        if (!event) {
                                            return null;
                                        }

                                        return (
                                            <div
                                                key={reg.id}
                                                className="flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:border-primary-200"
                                            >
                                                <div className="relative aspect-video w-full border-b border-neutral-100 bg-neutral-100">
                                                    <img
                                                        src={
                                                            event.poster_url ||
                                                            '/covers/default_cover.jpg'
                                                        }
                                                        alt={event.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <div
                                                        className={`absolute top-3 left-3 z-10 rounded-md px-2.5 py-0.5 text-[0.6rem] font-extrabold tracking-wide uppercase shadow-xs ${
                                                            event.type ===
                                                            'online'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-green-100 text-green-800'
                                                        }`}
                                                    >
                                                        {event.type}
                                                    </div>
                                                </div>

                                                <div className="flex flex-grow flex-col gap-3 p-6">
                                                    <div>
                                                        {event.category && (
                                                            <span className="text-micro font-extrabold tracking-wide text-secondary-600 uppercase">
                                                                {
                                                                    event
                                                                        .category
                                                                        .name
                                                                }
                                                            </span>
                                                        )}
                                                        <h4 className="mt-0.5 line-clamp-1 text-base leading-snug font-extrabold text-neutral-900">
                                                            {event.title}
                                                        </h4>
                                                    </div>

                                                    <div className="flex flex-col gap-1 text-small font-semibold text-gray-500">
                                                        <span className="flex items-center gap-1.5 truncate">
                                                            <MapPin
                                                                size={12}
                                                                className="shrink-0 text-gray-400"
                                                            />
                                                            <span>
                                                                {event.type ===
                                                                'online'
                                                                    ? 'Online'
                                                                    : event.location_name ||
                                                                      'Offline'}
                                                            </span>
                                                        </span>
                                                        <span className="text-micro font-medium text-gray-400">
                                                            {formatShortDate(
                                                                event.start_datetime,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-auto flex gap-2 border-t border-gray-100 pt-4">
                                                        <Link
                                                            href={`/events/${event.id}`}
                                                            className="flex flex-grow items-center justify-center gap-1 rounded-full bg-primary-500 px-4 py-2 text-micro font-bold text-white transition-colors hover:bg-primary-600"
                                                        >
                                                            <span>
                                                                Lihat Detail
                                                                Event
                                                            </span>
                                                        </Link>
                                                        <Link
                                                            href={`/events/${event.id}/ticket`}
                                                            className="flex items-center justify-center rounded-full bg-neutral-100 p-2 text-neutral-800 transition-colors hover:bg-neutral-200"
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
                                <div className="animate-in fade-in grid grid-cols-1 gap-6 duration-200 md:grid-cols-2 lg:grid-cols-3">
                                    {certificates.map((cert) => (
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
                            ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
