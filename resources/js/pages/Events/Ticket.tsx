import { Head } from '@inertiajs/react';
import {
    Calendar,
    MapPin,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight,
} from 'lucide-react';
import React from 'react';
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
    address?: string;
    platform_name?: string;
    link?: string;
    start_datetime: string;
    end_datetime: string;
    category?: Category;
}

interface EventRegistration {
    id: number;
    qr_token: string;
    checked_in_at?: string;
    status: string;
}

interface TicketProps {
    event: Event;
    registration: EventRegistration;
}

export default function Ticket({ event, registration }: TicketProps) {
    const isCheckedIn = !!registration.checked_in_at;

    const formatLongDate = (dateString: string) => {
        const dateObj = new Date(dateString);

        return (
            new Intl.DateTimeFormat('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(dateObj) + ' WIB'
        );
    };

    // Generate QR Code URL using api.qrserver.com
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(registration.qr_token)}`;

    return (
        <div className="flex min-h-screen flex-col justify-between bg-neutral-50/50">
            <div className="flex-grow">
                <NavBar />
                <Head title={`Tiket Event - ${event.title}`} />

                <div className="mx-auto max-w-3xl px-4 pt-28 pb-16 md:px-8">


                    {/* Ticket Container */}
                    <div className="flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-lg md:flex-row">
                        {/* Left / Top Section: Event Info (Ticket Body) */}
                        <div className="flex flex-1 flex-col justify-between gap-6 p-6 md:p-8">
                            <div className="flex flex-col gap-4">
                                {/* Category */}
                                {event.category && (
                                    <span className="text-micro font-extrabold tracking-wider text-secondary-600 uppercase">
                                        {event.category.name}
                                    </span>
                                )}

                                {/* Title */}
                                <h2 className="font-brand text-xl leading-snug font-black text-neutral-900 md:text-2xl">
                                    {event.title}
                                </h2>

                                {/* Date details */}
                                <div className="flex items-start gap-2.5 text-small text-gray-600">
                                    <Calendar
                                        size={16}
                                        className="mt-0.5 shrink-0 text-gray-400"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-micro font-semibold tracking-wider text-gray-400 uppercase">
                                            Waktu Acara
                                        </span>
                                        <span className="mt-0.5 font-bold text-neutral-800">
                                            {formatLongDate(
                                                event.start_datetime,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Location details */}
                                <div className="flex items-start gap-2.5 text-small text-gray-600">
                                    <MapPin
                                        size={16}
                                        className="mt-0.5 shrink-0 text-gray-400"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-micro font-semibold tracking-wider text-gray-400 uppercase">
                                            Lokasi / Platform
                                        </span>
                                        <span className="mt-0.5 font-bold text-neutral-800">
                                            {event.type === 'offline'
                                                ? event.location_name ||
                                                  'Lokasi Offline'
                                                : event.platform_name ||
                                                  'Webinar Online'}
                                        </span>
                                        {event.type === 'offline' &&
                                            event.address && (
                                                <span className="mt-1 text-micro font-medium text-gray-400">
                                                    {event.address}
                                                </span>
                                            )}
                                        {event.type === 'online' &&
                                            event.link &&
                                            isCheckedIn && (
                                                <a
                                                    href={event.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-1.5 inline-flex items-center gap-1 text-micro font-bold text-primary-500 hover:text-primary-600"
                                                >
                                                    <span>
                                                        Link Gabung Webinar
                                                    </span>
                                                    <ArrowUpRight size={12} />
                                                </a>
                                            )}
                                    </div>
                                </div>
                            </div>

                            {/* Verification Status Badge */}
                            <div className="mt-4 border-t border-neutral-100 pt-4">
                                {isCheckedIn ? (
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-micro font-bold tracking-wider text-green-700 uppercase">
                                        <CheckCircle2
                                            size={14}
                                            className="text-green-600"
                                        />
                                        <span>Kehadiran Terverifikasi</span>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-micro font-bold tracking-wider text-yellow-800 uppercase">
                                        <Clock
                                            size={14}
                                            className="text-yellow-600"
                                        />
                                        <span>Belum Check-in</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dotted Tear Line (Visual Separator) */}
                        <div className="relative hidden shrink-0 flex-col items-center justify-between py-4 md:flex">
                            <div className="z-10 -mt-6 h-4 w-4 rounded-full border-b border-neutral-200 bg-neutral-50/50" />
                            <div className="my-2 h-full border-l-2 border-dashed border-neutral-200" />
                            <div className="z-10 -mb-6 h-4 w-4 rounded-full border-t border-neutral-200 bg-neutral-50/50" />
                        </div>

                        {/* Dotted Tear Line Mobile */}
                        <div className="relative flex shrink-0 items-center justify-between px-4 md:hidden">
                            <div className="z-10 -ml-6 h-4 w-4 rounded-full border-r border-neutral-200 bg-neutral-50/50" />
                            <div className="mx-2 w-full border-t-2 border-dashed border-neutral-200" />
                            <div className="z-10 -mr-6 h-4 w-4 rounded-full border-l border-neutral-200 bg-neutral-50/50" />
                        </div>

                        {/* Right / Bottom Section: QR Code Code (Ticket Stub) */}
                        <div className="flex w-full shrink-0 flex-col items-center justify-center gap-4 border-t border-neutral-200 bg-neutral-50/40 p-6 text-center md:w-80 md:border-t-0 md:border-l md:p-8">
                            <span className="text-micro font-bold tracking-wider text-neutral-500 uppercase">
                                Pindai QR Code
                            </span>

                            {/* QR Image Wrapper */}
                            <div className="flex h-64 w-64 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                                <img
                                    src={qrCodeUrl}
                                    alt="QR Code Ticket"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Instuksi Penggunaan */}
                    <div className="border-blue-150 mt-8 flex gap-3 rounded-2xl border bg-blue-50/60 p-5 text-blue-900">
                        <AlertCircle
                            size={20}
                            className="mt-0.5 shrink-0 text-blue-500"
                        />
                        <div className="flex flex-col gap-1 text-small">
                            <h5 className="font-bold">Petunjuk Check-in</h5>
                            <p className="leading-relaxed font-medium text-blue-800">
                                Tunjukkan QR Code ini kepada
                                panitia/penyelenggara acara saat tiba di lokasi.
                                Setelah panitia melakukan pemindaian (scan)
                                berhasil, kehadiran Anda akan terverifikasi
                                secara otomatis.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
