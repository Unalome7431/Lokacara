import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Calendar,
    MapPin,
    QrCode,
    Edit,
    Users,
    ChevronLeft,
    ArrowUpRight,
    CheckCircle2,
    AlertTriangle,
    X,
    Camera,
} from 'lucide-react';
import React, { useState } from 'react';
import DefaultCover from '@/../../public/covers/default_cover.jpg';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';

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
    const page = usePage();
    const flash = (page.props as any).flash || {};

    const [isScanModalOpen, setIsScanModalOpen] = useState(false);

    // Form for scanning attendee QR tokens
    const scanForm = useForm({
        qr_token: '',
    });

    const handleScanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        scanForm.post(`/dashboard/events/${event.id}/attendance/scan`, {
            preserveScroll: true,
            onSuccess: () => {
                scanForm.reset();
            },
        });
    };

    // Helper to parse description metadata
    const parseDescription = (desc: string) => {
        if (!desc) {
            return { cleanDesc: '', organizer: '', tags: '', contacts: '' };
        }

        const parts = desc.split('---');
        const cleanDesc = parts[0].trim();

        let organizer = '';
        let tags = '';
        let contacts = '';

        if (parts.length > 1) {
            const metadata = parts[1];
            const organizerMatch = metadata.match(/\*\*Penyelenggara:\*\*\s*(.*)/);
            const tagsMatch = metadata.match(/\*\*Tags:\*\*\s*(.*)/);
            const contactsMatch = metadata.match(/\*\*Kontak:\*\*\s*([\s\S]*)/);

            if (organizerMatch) {
                organizer = organizerMatch[1].trim();
            }

            if (tagsMatch) {
                tags = tagsMatch[1].trim();
            }

            if (contactsMatch) {
                contacts = contactsMatch[1].trim();
            }
        }

        return { cleanDesc, organizer, tags, contacts };
    };

    const { cleanDesc, organizer, contacts } = parseDescription(event.description);

    const formatLongDate = (dateString: string) => {
        const dateObj = new Date(dateString);

        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(dateObj);
    };

    const formatTime = (dateString: string) => {
        const dateObj = new Date(dateString);

        return new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(dateObj) + ' WIB';
    };

    return (
        <div className="min-h-screen bg-primary-50/20 flex flex-col justify-between animate-in fade-in duration-200">
            <div className="flex-grow">
                <NavBar />
                <Head title={`Detail Event - ${event.title}`} />

                <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-16">
                    {/* Navigation Breadcrumb */}
                    <div className="mb-6">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary-500 text-small font-bold transition-colors duration-150"
                        >
                            <ChevronLeft size={16} />
                            <span>Kembali ke Dashboard</span>
                        </Link>
                    </div>

                    {/* Layout Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Left Panel: Poster & Info Details */}
                        <div className="lg:col-span-2 flex flex-col gap-8">
                            {/* Main Header Container */}
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-300 flex flex-col gap-6">
                                {/* Cover Image */}
                                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-150">
                                    <img
                                        src={event.poster_url || DefaultCover}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Yellow-orange Price/Free badge in top-left */}
                                    <div className="absolute top-4 left-4 z-10 px-3.5 py-1.5 font-brand text-xs font-black rounded-full bg-yellow-100 text-amber-800 shadow-xs uppercase tracking-wide">
                                        {event.price === 0
                                            ? 'FREE'
                                            : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                                    </div>
                                </div>

                                {/* Title & Category Stacked */}
                                <div className="flex flex-col gap-2">
                                    <h1 className="font-brand font-black text-2xl md:text-3xl text-neutral-900 leading-tight">
                                        {event.title}
                                    </h1>
                                    {event.category && (
                                        <div className="flex">
                                            <span className="px-3 py-1 bg-secondary-500 text-neutral-900 font-brand text-xs font-black rounded-full uppercase tracking-wider select-none">
                                                {event.category.name}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Horizontal Info Row */}
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-neutral-500 text-sm font-semibold border-b border-neutral-100 pb-5">
                                    {/* Organizer */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center shrink-0">
                                            <Users size={12} className="text-neutral-500" />
                                        </div>
                                        <span>
                                            {event.user?.name || organizer || 'Arrivo zul Group'}{' '}
                                            <span className="text-neutral-400 font-normal">
                                                ~ Organizer
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                {/* Waktu & Lokasi */}
                                <div className="flex flex-col gap-4">
                                    <h4 className="font-brand font-black text-lg text-neutral-900">
                                        Waktu & Lokasi
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Tanggal & Waktu */}
                                        <div className="flex flex-col gap-4">
                                            {/* Tanggal */}
                                            <div className="flex gap-3.5 items-start">
                                                <div className="text-neutral-400 mt-1 shrink-0">
                                                    <Calendar size={20} className="stroke-[1.5]" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                                                        Tanggal
                                                    </span>
                                                    <span className="text-neutral-800 font-bold text-base mt-0.5">
                                                        {formatLongDate(event.start_datetime)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Waktu */}
                                            <div className="flex gap-3.5 items-start">
                                                <div className="text-neutral-400 mt-1 shrink-0">
                                                    <svg
                                                        className="w-5 h-5 text-neutral-400 stroke-[1.5]"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <circle cx="12" cy="12" r="10" />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                                                        Waktu
                                                    </span>
                                                    <span className="text-neutral-800 font-bold text-base mt-0.5">
                                                        {formatTime(event.start_datetime)} -{' '}
                                                        {formatTime(event.end_datetime)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lokasi */}
                                        <div className="flex gap-3.5 items-start">
                                            <div className="text-neutral-400 mt-1 shrink-0">
                                                <MapPin size={20} className="stroke-[1.5]" />
                                            </div>

                                            {event.type === 'offline' ? (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                                                        Lokasi
                                                    </span>
                                                    <span className="text-neutral-800 font-bold text-base mt-0.5">
                                                        {event.location_name || 'Tidak Ditentukan'}
                                                    </span>
                                                    {event.address && (
                                                        <span className="text-gray-500 text-sm font-semibold mt-1 leading-relaxed">
                                                            {event.address}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                                                        Platform Online
                                                    </span>
                                                    <span className="text-neutral-800 font-bold text-base mt-0.5">
                                                        {event.platform_name || 'Webinar Online'}
                                                    </span>
                                                    {event.link && (
                                                        <a
                                                            href={event.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 font-bold text-sm mt-1.5"
                                                        >
                                                            <span>Gabung Platform</span>
                                                            <ArrowUpRight size={14} />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Deskripsi */}
                                <div className="border-t border-neutral-100 pt-6">
                                    <h4 className="font-brand font-black text-lg text-neutral-900 mb-3">
                                        Tentang Event Ini
                                    </h4>
                                    <p className="text-neutral-700 text-base leading-relaxed whitespace-pre-wrap font-medium">
                                        {cleanDesc || event.description}
                                    </p>
                                </div>

                                {/* Contacts Metadata if present */}
                                {contacts && (
                                    <div className="border-t border-neutral-100 pt-6">
                                        <h4 className="font-brand font-black text-lg text-neutral-900 mb-3">
                                            Kontak Penyelenggara
                                        </h4>
                                        <div className="text-neutral-750 text-base bg-neutral-50 border border-neutral-150 p-5 rounded-2xl whitespace-pre-line leading-relaxed font-semibold">
                                            {contacts}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Panel: Attendance Stats & Controls */}
                        <div className="flex flex-col gap-6">
                            {/* Stats Card */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-300 flex flex-col gap-4">
                                <h4 className="font-brand font-black text-base text-neutral-900 border-b border-neutral-100 pb-3">
                                    Analitik Peserta
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Pendaftar Card */}
                                    <div className="p-4 bg-white rounded-2xl border border-neutral-200/60 flex flex-col gap-1.5">
                                        <span className="text-gray-400 text-[0.65rem] font-bold uppercase tracking-wider">
                                            Pendaftar
                                        </span>
                                        <div className="flex items-baseline mt-0.5">
                                            <span className="text-primary-500 font-black text-2xl">
                                                {total_attendees}
                                            </span>
                                            <span className="text-neutral-400 font-bold text-sm">
                                                {" "}/ {event.capacity || '∞'}
                                            </span>
                                        </div>
                                        <span className="text-gray-400 text-[0.65rem] font-semibold">
                                            Kuota Terisi
                                        </span>
                                    </div>

                                    {/* Kehadiran Card */}
                                    <div className="p-4 bg-white rounded-2xl border border-neutral-200/60 flex flex-col gap-1.5">
                                        <span className="text-gray-400 text-[0.65rem] font-bold uppercase tracking-wider">
                                            Kehadiran
                                        </span>
                                        <div className="flex items-baseline mt-0.5">
                                            <span className="text-secondary-500 font-black text-2xl">
                                                {checked_in_attendees}
                                            </span>
                                        </div>
                                        <span className="text-gray-400 text-[0.65rem] font-semibold">
                                            Hadir Via Scan
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Standalone Action Buttons Stacked Directly in Column */}
                            <div className="flex flex-col gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        scanForm.clearErrors();
                                        scanForm.reset();
                                        setIsScanModalOpen(true);
                                    }}
                                    className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-base rounded-full shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-0 active:scale-[0.99]"
                                >
                                    <Camera size={18} />
                                    <span>Scan QR</span>
                                </button>

                                <Link
                                    href={`/dashboard/events/${event.id}/edit`}
                                    className="w-full py-4 bg-secondary-500 hover:bg-secondary-600 text-neutral-900 font-bold text-base rounded-full shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-center active:scale-[0.99]"
                                >
                                    <Edit size={16} />
                                    <span>Edit Detail Acara</span>
                                </Link>

                                <Link
                                    href={`/dashboard/events/${event.id}/attendees`}
                                    className="w-full py-4 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-bold text-base rounded-full shadow-xs transition-all duration-200 flex items-center justify-center gap-2 text-center active:scale-[0.99]"
                                >
                                    <Users size={16} />
                                    <span>Pendaftar</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR SCAN MODAL */}
                {isScanModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-200"
                            onClick={() => setIsScanModalOpen(false)}
                        />

                        {/* Modal Container */}
                        <div className="relative w-full max-w-md bg-white border border-neutral-150 rounded-3xl shadow-2xl overflow-hidden z-[101] animate-in fade-in zoom-in-95 duration-200 p-6 flex flex-col gap-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                <h4 className="font-brand font-black text-lg text-neutral-900 flex items-center gap-2">
                                    <QrCode size={20} className="text-primary-500" />
                                    <span>Scan QR Tiket Kehadiran</span>
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setIsScanModalOpen(false)}
                                    className="p-1 bg-neutral-100 hover:bg-neutral-200 rounded-full border-0 cursor-pointer flex items-center justify-center text-neutral-500"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Camera Frame Mock */}
                            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-950 flex flex-col items-center justify-center">
                                <div className="absolute inset-10 border-2 border-dashed border-primary-500/60 rounded-xl flex flex-col items-center justify-center">
                                    <div className="w-full h-0.5 bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                </div>
                                <span className="text-white/60 font-semibold text-xs uppercase tracking-wider mt-2 z-10">
                                    Kamera Scanner Aktif (Simulasi)
                                </span>
                            </div>

                            {/* Scanner alerts */}
                            {scanForm.wasSuccessful && flash.success && (
                                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl flex items-center gap-2">
                                    <CheckCircle2 size={16} className="shrink-0" />
                                    <span>{flash.success}</span>
                                </div>
                            )}
                            {flash.warning && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-bold rounded-xl flex items-center gap-2">
                                    <AlertTriangle size={16} className="shrink-0" />
                                    <span>{flash.warning}</span>
                                </div>
                            )}
                            {scanForm.errors.qr_token && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                                    <AlertTriangle size={16} className="shrink-0" />
                                    <span>{scanForm.errors.qr_token}</span>
                                </div>
                            )}

                            {/* Input fields */}
                            <form onSubmit={handleScanSubmit} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-neutral-700 font-bold text-xs uppercase tracking-wider font-brand">
                                        Token Tiket UUID
                                    </label>
                                    <input
                                        type="text"
                                        value={scanForm.data.qr_token}
                                        onChange={(e) =>
                                            scanForm.setData('qr_token', e.target.value)
                                        }
                                        required
                                        placeholder="Contoh: 123e4567-e89b-12d3-a456-426614174000"
                                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-base placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 transition-colors"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={scanForm.processing}
                                    className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-bold text-base rounded-full shadow-md cursor-pointer transition-colors border-0"
                                >
                                    {scanForm.processing
                                        ? 'Memproses...'
                                        : 'Kirim Token Kehadiran'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
