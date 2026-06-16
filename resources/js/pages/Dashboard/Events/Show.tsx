import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    MapPin,
    Edit,
    Users,
    ArrowUpRight,
    Camera,
    Eye,
    Award,
} from 'lucide-react';
import TicketScannerModal from '@/components/ui/TicketScannerModal';
import React, { useState } from 'react';
import DefaultCover from '@/../../public/covers/default_cover.jpg';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';
import { formatIndonesianDate as formatLongDate, parseDescription, getContactDetails } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface Event {
    id: number;
    title: string;
    poster_url?: string;
    description: string;
    type: 'online' | 'offline';
    location_name?: string;
    address?: string;
    platform_name?: string;
    link?: string;
    start_datetime: string;
    end_datetime: string;
    capacity?: number;
    category?: Category;
    price: number;
    user?: User;
    view_count: number;
}

interface ShowProps {
    event: Event;
    total_attendees: number;
    checked_in_attendees: number;
    remaining_capacity: number | null;
}

export default function Show({
    event,
    total_attendees,
    checked_in_attendees,
}: ShowProps) {
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);

    // parseDescription helper imported from @/lib/utils

    const { cleanDesc, organizer, contacts } = parseDescription(
        event.description,
    );

    const parsedContacts = contacts
        ? (contacts
              .split('\n')
              .map((line) => {
                  const match = line.match(/^-\s*([^:]+):\s*(.*)/);

                  if (match) {
                      return {
                          name: match[1].trim(),
                          info: match[2].trim(),
                      };
                  }

                  return null;
              })
              .filter(Boolean) as { name: string; info: string }[])
        : [];

    // getContactDetails helper imported from @/lib/utils

    const descriptionText = cleanDesc || event.description || '';
    const descLines = descriptionText.split('\n');
    const hasMoreThan10Lines = descLines.length > 10;
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const displayDescription =
        hasMoreThan10Lines && !isDescExpanded
            ? descLines.slice(0, 10).join('\n') + '...'
            : descriptionText;

    // formatLongDate helper imported from @/lib/utils

    const formatTime = (dateString: string) => {
        const dateObj = new Date(dateString);

        return (
            new Intl.DateTimeFormat('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
            }).format(dateObj) + ' WIB'
        );
    };

    return (
        <div className="bg-primary-50/20 animate-in fade-in flex min-h-screen flex-col justify-between duration-200">
            <div className="grow">
                <NavBar />
                <Head title={`Detail Event - ${event.title}`} />

                <div className="mx-auto max-w-7xl px-4 pt-28 pb-28 md:px-8 lg:pb-16">
                    {/* Layout Grid */}
                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                        {/* Left Panel: Poster & Info Details */}
                        <div className="flex flex-col gap-8 lg:col-span-2">
                            {/* Main Header Container */}
                            <div className="flex flex-col gap-6 rounded-3xl border border-neutral-300 bg-white p-6 shadow-sm md:p-8">
                                {/* Cover Image */}
                                <div className="border-neutral-150 relative aspect-video w-full overflow-hidden rounded-2xl border bg-neutral-100">
                                    <img
                                        src={event.poster_url || DefaultCover}
                                        alt={event.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                {/* Title & Category Stacked */}
                                <div className="flex flex-col gap-2">
                                    <h1 className="font-brand text-h1-mobile leading-tight font-black text-neutral-900 lg:text-h1-web">
                                        {event.title}
                                    </h1>
                                    {event.category && (
                                        <div className="flex">
                                            <span className="rounded-full bg-secondary-500 px-3 py-1 font-brand text-xs font-black tracking-wider text-neutral-900 uppercase select-none">
                                                {event.category.name}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Horizontal Info Row */}
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-neutral-100 pb-5 text-sm font-semibold text-neutral-500">
                                    {/* Organizer */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200">
                                            <Users
                                                size={12}
                                                className="text-neutral-500"
                                            />
                                        </div>
                                        <span>
                                            oleh{' '}
                                            <span className="font-bold text-neutral-800">
                                                {event.user?.name ||
                                                    organizer ||
                                                    'Arrivo zul Group'}
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                {/* Waktu & Lokasi */}
                                <div className="flex flex-col gap-4">
                                    <h4 className="font-brand text-h4-mobile font-black text-neutral-900 lg:text-h4-web">
                                        Waktu & Lokasi
                                    </h4>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {/* Tanggal & Waktu */}
                                        <div className="flex flex-col gap-4">
                                            {/* Tanggal */}
                                            <div className="flex items-start gap-3.5">
                                                <div className="mt-1 shrink-0 text-neutral-400">
                                                    <Calendar
                                                        size={20}
                                                        className="stroke-[1.5]"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                                        Tanggal
                                                    </span>
                                                    <span className="mt-0.5 text-base font-bold text-neutral-800">
                                                        {formatLongDate(
                                                            event.start_datetime,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Waktu */}
                                            <div className="flex items-start gap-3.5">
                                                <div className="mt-1 shrink-0 text-neutral-400">
                                                    <svg
                                                        className="h-5 w-5 stroke-[1.5] text-neutral-400"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                        />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                                        Waktu
                                                    </span>
                                                    <span className="mt-0.5 text-base font-bold text-neutral-800">
                                                        {formatTime(
                                                            event.start_datetime,
                                                        )}{' '}
                                                        -{' '}
                                                        {formatTime(
                                                            event.end_datetime,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lokasi */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="mt-1 shrink-0 text-neutral-400">
                                                <MapPin
                                                    size={20}
                                                    className="stroke-[1.5]"
                                                />
                                            </div>

                                            {event.type === 'offline' ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                                        Lokasi
                                                    </span>
                                                    <span className="mt-0.5 text-base font-bold text-neutral-800">
                                                        {event.location_name ||
                                                            'Tidak Ditentukan'}
                                                    </span>
                                                    {event.address && (
                                                        <span className="mt-1 text-sm leading-relaxed font-semibold text-gray-500">
                                                            {event.address}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                                        Platform Online
                                                    </span>
                                                    <span className="mt-0.5 text-base font-bold text-neutral-800">
                                                        {event.platform_name ||
                                                            'Webinar Online'}
                                                    </span>
                                                    {event.link && (
                                                        <a
                                                            href={event.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-1.5 inline-flex items-center gap-1 text-sm font-bold text-primary-500 hover:text-primary-600"
                                                        >
                                                            <span>
                                                                Gabung Platform
                                                            </span>
                                                            <ArrowUpRight
                                                                size={14}
                                                            />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Deskripsi */}
                                <div className="border-t border-neutral-100 pt-6">
                                    <h4 className="mb-3 font-brand text-h4-mobile font-black text-neutral-900 lg:text-h4-web">
                                        Deskripsi
                                    </h4>
                                    <p className="text-base leading-relaxed font-medium whitespace-pre-wrap text-neutral-700">
                                        {displayDescription}
                                    </p>
                                    {hasMoreThan10Lines && (
                                        <button
                                            onClick={() =>
                                                setIsDescExpanded(
                                                    !isDescExpanded,
                                                )
                                            }
                                            className="group mt-3 flex cursor-pointer items-center gap-1 text-sm font-bold text-primary-500 transition-colors duration-150 hover:text-primary-600 focus:outline-none"
                                        >
                                            {isDescExpanded
                                                ? 'Sembunyikan'
                                                : 'Baca Selengkapnya'}
                                            <span className="text-xs transition-transform duration-150 group-hover:translate-y-0.5">
                                                {isDescExpanded ? '▲' : '▼'}
                                            </span>
                                        </button>
                                    )}
                                </div>

                                {/* Contacts Metadata if present */}
                                {contacts && (
                                    <div className="border-t border-neutral-100 pt-6">
                                        <h4 className="mb-4 font-brand text-h4-mobile font-black text-neutral-900 lg:text-h4-web">
                                            Contact Person
                                        </h4>
                                        {parsedContacts.length > 0 ? (
                                            <div className="flex flex-col gap-3">
                                                {parsedContacts.map(
                                                    (contact, idx) => {
                                                        const { href, label } =
                                                            getContactDetails(
                                                                contact.info,
                                                            );

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className="rounded-r-2xl border border-l-4 border-neutral-200/50 border-l-primary-500 bg-neutral-50/40 p-3.5 pl-5 transition-all duration-200 hover:bg-neutral-50"
                                                            >
                                                                <div className="flex min-w-0 flex-col">
                                                                    <span className="mb-0.5 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                                                        {
                                                                            contact.name
                                                                        }
                                                                    </span>
                                                                    {href ? (
                                                                        <a
                                                                            href={
                                                                                href
                                                                            }
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="truncate text-base font-semibold text-neutral-800 transition-colors duration-150 hover:text-primary-500"
                                                                        >
                                                                            {
                                                                                label
                                                                            }
                                                                        </a>
                                                                    ) : (
                                                                        <span className="truncate text-base font-semibold text-neutral-800">
                                                                            {
                                                                                label
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-neutral-750 border-neutral-150 rounded-2xl border bg-neutral-50 p-5 text-base leading-relaxed font-semibold whitespace-pre-line">
                                                {contacts}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Panel: Attendance Stats & Controls */}
                        <div className="flex flex-col gap-6 lg:sticky lg:top-28">
                            {/* Stats Card */}
                            <div className="flex flex-col gap-4 rounded-3xl border border-neutral-300 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                    <h4 className="font-brand text-h6-mobile font-black text-neutral-900 lg:text-h6-web">
                                        Analitik Peserta
                                    </h4>
                                    <div className="flex items-center gap-1.5 rounded-full border border-neutral-200/40 bg-neutral-50 px-2.5 py-1 text-xs font-bold text-neutral-500">
                                        <Eye
                                            size={14}
                                            className="text-neutral-400"
                                        />
                                        <span>{event.view_count || 0}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Pendaftar Card */}
                                    <div className="flex flex-col gap-1.5 rounded-2xl border border-neutral-200/60 bg-white p-4">
                                        <span className="text-[0.65rem] font-bold tracking-wider text-gray-400 uppercase">
                                            Pendaftar
                                        </span>
                                        <div className="mt-0.5 flex items-baseline">
                                            <span className="text-2xl font-black text-primary-500">
                                                {total_attendees}
                                            </span>
                                            <span className="text-sm font-bold text-neutral-400">
                                                {' '}
                                                / {event.capacity || '∞'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Kehadiran Card */}
                                    <div className="flex flex-col gap-1.5 rounded-2xl border border-neutral-200/60 bg-white p-4">
                                        <span className="text-[0.65rem] font-bold tracking-wider text-gray-400 uppercase">
                                            Kehadiran
                                        </span>
                                        <div className="mt-0.5 flex items-baseline">
                                            <span className="text-2xl font-black text-secondary-500">
                                                {checked_in_attendees}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Harga Tiket */}
                                <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                                    <span className="text-sm font-bold text-neutral-500">
                                        Harga Tiket:
                                    </span>
                                    <span className="text-lg font-black text-neutral-900">
                                        {event.price === 0
                                            ? 'GRATIS'
                                            : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                                    </span>
                                </div>
                            </div>

                            {/* Standalone Action Buttons Sticky Bottom on Mobile/Tablet */}
                            <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-row items-center gap-3 border-t border-neutral-200 bg-white p-4 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:z-auto lg:w-full lg:flex-col lg:gap-4 lg:border-t-0 lg:bg-transparent lg:p-0 lg:shadow-none">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsScanModalOpen(true);
                                    }}
                                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-primary-500 py-3 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 active:scale-[0.99] lg:w-full lg:py-4"
                                >
                                    <Camera size={18} />
                                    <span>Scan QR</span>
                                </button>

                                <Link
                                    href={`/dashboard/events/${event.id}/edit`}
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-500 text-base font-bold text-neutral-900 shadow-md transition-all duration-200 hover:bg-secondary-600 active:scale-[0.99] lg:h-auto lg:w-full lg:flex-row lg:gap-2 lg:py-4"
                                    title="Edit Detail Acara"
                                >
                                    <Edit size={16} />
                                    <span className="hidden lg:inline">
                                        Edit Detail Acara
                                    </span>
                                </Link>

                                <Link
                                    href={`/dashboard/events/${event.id}/attendees`}
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-base font-bold text-neutral-800 shadow-xs transition-all duration-200 hover:bg-neutral-50 active:scale-[0.99] lg:h-auto lg:w-full lg:flex-row lg:gap-2 lg:py-4"
                                    title="Pendaftar"
                                >
                                    <Users size={16} />
                                    <span className="hidden lg:inline">
                                        Pendaftar
                                    </span>
                                </Link>

                                <Link
                                    href={`/dashboard/events/${event.id}/certificates`}
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-base font-bold text-neutral-800 shadow-xs transition-all duration-200 hover:bg-neutral-50 active:scale-[0.99] lg:h-auto lg:w-full lg:flex-row lg:gap-2 lg:py-4"
                                    title="Kelola E-Sertifikat"
                                >
                                    <Award size={16} />
                                    <span className="hidden lg:inline">
                                        E-Sertifikat
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR SCAN MODAL */}
                <TicketScannerModal
                    isOpen={isScanModalOpen}
                    onClose={() => setIsScanModalOpen(false)}
                    eventId={event.id}
                />
            </div>
            <Footer />
        </div>
    );
}
