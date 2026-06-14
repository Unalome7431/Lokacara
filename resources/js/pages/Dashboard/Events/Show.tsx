import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    MapPin,
    QrCode,
    Edit,
    Users,
    ArrowUpRight,
    CheckCircle2,
    AlertTriangle,
    X,
    Camera,
    Eye,
    XCircle,
    RefreshCw,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
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
    const page = usePage();
    const flash = (page.props as any).flash || {};

    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [scannerRunning, setScannerRunning] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [scanOutcome, setScanOutcome] = useState<{
        type: 'success' | 'warning' | 'error' | 'idle';
        message: string;
    }>({ type: 'idle', message: '' });

    const qrCodeRegionId = 'html5qr-code-full-region';

    const startScanning = () => {
        setScanOutcome({ type: 'idle', message: '' });
        setIsVerifying(false);
        setScannerRunning(true);
    };

    const closeScanner = () => {
        setIsScanModalOpen(false);
        setScannerRunning(false);
        setScanOutcome({ type: 'idle', message: '' });
        setIsVerifying(false);
    };

    useEffect(() => {
        if (!isScanModalOpen || !scannerRunning) return;

        const html5QrCode = new Html5Qrcode(qrCodeRegionId);

        html5QrCode.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
                html5QrCode.stop().then(() => {
                    setScannerRunning(false);
                    setIsVerifying(true);
                    
                    router.post(`/dashboard/events/${event.id}/attendance/scan`, {
                        qr_token: decodedText
                    }, {
                        preserveScroll: true,
                        onSuccess: (page) => {
                            setIsVerifying(false);
                            const updatedFlash = (page.props as any).flash || {};
                            if (updatedFlash.success) {
                                setScanOutcome({ type: 'success', message: updatedFlash.success });
                            } else if (updatedFlash.warning) {
                                setScanOutcome({ type: 'warning', message: updatedFlash.warning });
                            }
                        },
                        onError: (err) => {
                            setIsVerifying(false);
                            setScanOutcome({ type: 'error', message: err.qr_token || 'Gagal memverifikasi tiket.' });
                        },
                    });
                }).catch((err) => console.error('Gagal menghentikan scanner: ', err));
            },
            () => {
                // Keep scanning silently on scan error/no QR detected
            }
        ).catch((err) => {
            console.error('Gagal memulai scanner: ', err);
            setScannerRunning(false);
            setScanOutcome({
                type: 'error',
                message: 'Gagal mengakses kamera. Pastikan izin kamera telah diberikan.',
            });
        });

        return () => {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().catch((err) => console.error('Gagal menghentikan scanner: ', err));
            }
        };
    }, [isScanModalOpen, scannerRunning]);

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
            const organizerMatch = metadata.match(
                /\*\*Penyelenggara:\*\*\s*(.*)/,
            );
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

    const getContactDetails = (info: string) => {
        const cleanInfo = info.trim();

        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanInfo)) {
            return {
                href: `mailto:${cleanInfo}`,
                type: 'mail',
                label: cleanInfo,
            };
        }

        if (
            /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6}\.?)(\/[\w.-]*)*\/?$/i.test(
                cleanInfo,
            )
        ) {
            const href = cleanInfo.startsWith('http')
                ? cleanInfo
                : `https://${cleanInfo}`;

            return {
                href,
                type: 'web',
                label: cleanInfo,
            };
        }

        if (/^\+?[\d\s()-.]{7,18}$/.test(cleanInfo)) {
            const digits = cleanInfo.replace(/[^\d+]/g, '');
            let href = `tel:${digits}`;

            if (
                digits.startsWith('+62') ||
                digits.startsWith('62') ||
                digits.startsWith('08')
            ) {
                let waNumber = digits;

                if (waNumber.startsWith('08')) {
                    waNumber = '628' + waNumber.slice(2);
                } else if (waNumber.startsWith('+')) {
                    waNumber = waNumber.slice(1);
                }

                href = `https://wa.me/${waNumber}`;
            }

            return {
                href,
                type: 'phone',
                label: cleanInfo,
            };
        }

        return {
            href: null,
            type: 'general',
            label: cleanInfo,
        };
    };

    const descriptionText = cleanDesc || event.description || '';
    const descLines = descriptionText.split('\n');
    const hasMoreThan10Lines = descLines.length > 10;
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const displayDescription =
        hasMoreThan10Lines && !isDescExpanded
            ? descLines.slice(0, 10).join('\n') + '...'
            : descriptionText;

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

        return (
            new Intl.DateTimeFormat('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
            }).format(dateObj) + ' WIB'
        );
    };

    return (
        <div className="bg-primary-50/20 animate-in fade-in flex min-h-screen flex-col justify-between duration-200">
            <div className="flex-grow">
                <NavBar />
                <Head title={`Detail Event - ${event.title}`} />

                <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 md:px-8">
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
                                    <h1 className="font-brand text-2xl leading-tight font-black text-neutral-900 md:text-3xl">
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
                                    <h4 className="font-brand text-lg font-black text-neutral-900">
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
                                    <h4 className="mb-3 font-brand text-lg font-black text-neutral-900">
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
                                        <h4 className="mb-4 font-brand text-lg font-black text-neutral-900">
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
                                    <h4 className="font-brand text-base font-black text-neutral-900">
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

                            {/* Standalone Action Buttons Stacked Directly in Column */}
                            <div className="flex flex-col gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsScanModalOpen(true);
                                        startScanning();
                                    }}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-primary-500 py-4 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 active:scale-[0.99]"
                                >
                                    <Camera size={18} />
                                    <span>Scan QR</span>
                                </button>

                                <Link
                                    href={`/dashboard/events/${event.id}/edit`}
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary-500 py-4 text-center text-base font-bold text-neutral-900 shadow-md transition-all duration-200 hover:bg-secondary-600 active:scale-[0.99]"
                                >
                                    <Edit size={16} />
                                    <span>Edit Detail Acara</span>
                                </Link>

                                <Link
                                    href={`/dashboard/events/${event.id}/attendees`}
                                    className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white py-4 text-center text-base font-bold text-neutral-800 shadow-xs transition-all duration-200 hover:bg-neutral-50 active:scale-[0.99]"
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
                            className="animate-in fade-in fixed inset-0 bg-neutral-900/40 backdrop-blur-xs duration-200"
                            onClick={closeScanner}
                        />

                        {/* Modal Container */}
                        <div className="border-neutral-150 animate-in fade-in zoom-in-95 relative z-[101] flex w-full max-w-md flex-col gap-6 overflow-hidden rounded-3xl border bg-white p-6 shadow-2xl duration-200">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                <h4 className="flex items-center gap-2 font-brand text-lg font-black text-neutral-900">
                                    <QrCode
                                        size={20}
                                        className="text-primary-500"
                                    />
                                    <span>Scan QR Tiket Kehadiran</span>
                                </h4>
                                <button
                                    type="button"
                                    onClick={closeScanner}
                                    className="flex cursor-pointer items-center justify-center rounded-full border-0 bg-neutral-100 p-1 text-neutral-500 hover:bg-neutral-200"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Camera Viewport / Outcome States */}
                            <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950">
                                {isVerifying ? (
                                    <div className="flex flex-col items-center justify-center p-6 text-center text-white">
                                        <RefreshCw className="mb-4 h-12 w-12 animate-spin text-primary-500" />
                                        <h5 className="text-base font-bold text-white">Memverifikasi Tiket...</h5>
                                        <p className="text-xs text-neutral-400 mt-1">Harap tunggu sebentar</p>
                                    </div>
                                ) : scanOutcome.type === 'idle' ? (
                                    scannerRunning ? (
                                        <div className="relative w-full h-full">
                                            {/* html5-qrcode target region */}
                                            <div id={qrCodeRegionId} className="w-full h-full object-cover [&_video]:!object-cover [&_video]:!w-full [&_video]:!h-full" />
                                            
                                            {/* Overlay scanning frame guide */}
                                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-8">
                                                <span className="text-[0.65rem] font-bold tracking-widest text-white/75 bg-neutral-900/60 px-3 py-1.5 rounded-full uppercase backdrop-blur-xs">
                                                    Arahkan Kamera ke QR Code
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-400">
                                            <Camera size={40} className="mb-3 text-neutral-600" />
                                            <span className="text-sm font-medium">Kamera dinonaktifkan</span>
                                            <button
                                                type="button"
                                                onClick={startScanning}
                                                className="mt-4 flex items-center gap-2 rounded-full bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-600 transition-colors"
                                            >
                                                <RefreshCw size={12} />
                                                Mulai Scanner
                                            </button>
                                        </div>
                                    )
                                ) : (
                                    /* Premium scan outcomes in Bahasa Indonesia */
                                    <div className="flex flex-col items-center justify-center p-8 text-center w-full h-full animate-in fade-in zoom-in-95 duration-200">
                                        {scanOutcome.type === 'success' && (
                                            <div className="flex flex-col items-center animate-bounce">
                                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 mb-4 ring-8 ring-green-500/5">
                                                    <CheckCircle2 size={44} />
                                                </div>
                                                <h5 className="text-lg font-black text-white mb-2">Check-in Berhasil!</h5>
                                                <p className="text-sm text-neutral-300 max-w-[280px]">
                                                    {scanOutcome.message}
                                                </p>
                                            </div>
                                        )}
                                        {scanOutcome.type === 'warning' && (
                                            <div className="flex flex-col items-center animate-pulse">
                                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 mb-4 ring-8 ring-yellow-500/5">
                                                    <AlertTriangle size={44} />
                                                </div>
                                                <h5 className="text-lg font-black text-white mb-2">Peringatan</h5>
                                                <p className="text-sm text-neutral-300 max-w-[280px]">
                                                    {scanOutcome.message}
                                                </p>
                                            </div>
                                        )}
                                        {scanOutcome.type === 'error' && (
                                            <div className="flex flex-col items-center animate-pulse">
                                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 mb-4 ring-8 ring-red-500/5">
                                                    <XCircle size={44} />
                                                </div>
                                                <h5 className="text-lg font-black text-white mb-2">Check-in Gagal</h5>
                                                <p className="text-sm text-neutral-300 max-w-[280px]">
                                                    {scanOutcome.message}
                                                </p>
                                            </div>
                                        )}
                                        
                                        <button
                                            type="button"
                                            onClick={startScanning}
                                            className="mt-6 flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-white/20 transition-all active:scale-[0.98]"
                                        >
                                            <RefreshCw size={12} />
                                            <span>Scan Tiket Lain</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
