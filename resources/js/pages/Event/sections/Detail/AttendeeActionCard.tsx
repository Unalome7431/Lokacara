import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, CheckCircle2, Eye, Award, AlertTriangle } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    type: 'online' | 'offline';
    price: number;
    capacity?: number;
    view_count: number;
    event_registrations_count?: number;
}

interface AttendeeActionCardProps {
    event: Event;
    isRegistered: boolean;
    certificateUrl?: string | null;
    isAuthenticated: boolean;
    isJoining: boolean;
    handleJoinEvent: () => void;
    showVerificationWarning: boolean;
}

export default function AttendeeActionCard({
    event,
    isRegistered,
    certificateUrl,
    isAuthenticated,
    isJoining,
    handleJoinEvent,
    showVerificationWarning,
}: AttendeeActionCardProps) {
    const registeredCount = event.event_registrations_count ?? 0;
    const hasCapacityLimit = !!event.capacity;
    const remainingCapacity =
        hasCapacityLimit && event.capacity
            ? Math.max(0, event.capacity - registeredCount)
            : null;

    return (
        <div className="flex flex-col gap-6 lg:sticky lg:top-28">
            {/* Stats Card */}
            <div className="flex flex-col gap-4 rounded-3xl border border-neutral-300 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h4 className="font-brand text-h6-mobile font-black text-neutral-900 lg:text-h6-web">
                        Informasi Pendaftaran
                    </h4>
                    <div className="flex items-center gap-1.5 rounded-full border border-neutral-200/40 bg-neutral-50 px-2.5 py-1 text-xs font-bold text-neutral-500">
                        <Eye size={14} className="text-neutral-400" />
                        <span>{event.view_count || 0}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Sisa Kuota Card */}
                    <div className="flex flex-col gap-1.5 rounded-2xl border border-neutral-200/60 bg-white p-4">
                        <span className="text-[0.65rem] font-bold tracking-wider text-gray-400 uppercase">
                            Sisa Tiket
                        </span>
                        <div className="mt-0.5 flex items-baseline">
                            <span className="text-2xl font-black text-primary-500">
                                {remainingCapacity !== null ? remainingCapacity : '∞'}
                            </span>
                            {hasCapacityLimit && (
                                <span className="text-sm font-bold text-neutral-400">
                                    {' '} / {event.capacity}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Harga Card */}
                    <div className="flex flex-col gap-1.5 rounded-2xl border border-neutral-200/60 bg-white p-4">
                        <span className="text-[0.65rem] font-bold tracking-wider text-gray-400 uppercase">
                            Harga Tiket
                        </span>
                        <div className="mt-0.5 flex items-baseline">
                            <span className="text-2xl font-black text-secondary-500">
                                {event.price === 0
                                    ? 'GRATIS'
                                    : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Standalone Action Buttons Sticky Bottom on Mobile/Tablet */}
            <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-neutral-200 bg-white p-4 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] lg:relative lg:right-auto lg:bottom-auto lg:left-auto lg:z-auto lg:w-full lg:flex-col lg:gap-4 lg:border-t-0 lg:bg-transparent lg:p-0 lg:shadow-none">
                {isRegistered ? (
                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:flex-col">
                        <div className="flex flex-1 items-center justify-center gap-2 rounded-full border border-green-200 bg-green-50 py-3 text-base font-bold text-green-700 lg:py-4">
                            <CheckCircle2 size={18} className="animate-pulse text-green-600" />
                            <span>Anda Sudah Terdaftar</span>
                        </div>

                        <Link
                            href={`/events/${event.id}/ticket`}
                            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-500 py-3 text-center text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 active:scale-[0.99] lg:py-4"
                        >
                            <span>Lihat Tiket QR Anda</span>
                            <ArrowUpRight size={16} />
                        </Link>

                        {certificateUrl && (
                            <a
                                href={certificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-secondary-500 py-3 text-center text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-secondary-600 active:scale-[0.99] lg:py-4"
                            >
                                <span>Unduh E-Sertifikat</span>
                                <Award size={16} />
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="w-full">
                        {isAuthenticated ? (
                            <div className="flex w-full flex-col">
                                <button
                                    type="button"
                                    onClick={handleJoinEvent}
                                    disabled={
                                        isJoining ||
                                        (remainingCapacity !== null && remainingCapacity <= 0)
                                    }
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-primary-500 py-3 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-300 lg:py-4"
                                >
                                    <span>
                                        {isJoining
                                            ? 'Mendaftar...'
                                            : remainingCapacity !== null && remainingCapacity <= 0
                                            ? 'Kuota Penuh'
                                            : 'Ikuti Event Sekarang'}
                                    </span>
                                </button>
                                {showVerificationWarning && (
                                    <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-secondary-200 bg-secondary-100/40 p-4 text-neutral-800">
                                        <div className="flex gap-2 text-secondary-800">
                                            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                                            <span className="text-xs font-bold tracking-wider uppercase">
                                                Verifikasi Diperlukan
                                            </span>
                                        </div>
                                        <p className="text-xs leading-relaxed font-medium text-neutral-700">
                                            Anda harus memverifikasi email untuk bergabung dengan event
                                            berbayar demi keamanan transaksi.
                                        </p>
                                        <Link
                                            href="/settings/verify-email"
                                            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-secondary-500 py-2.5 text-center text-xs font-bold text-neutral-900 shadow-sm transition-all duration-200 hover:bg-secondary-600 active:scale-[0.98]"
                                        >
                                            <span>Verifikasi Sekarang</span>
                                            <ArrowUpRight size={14} />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="block w-full rounded-full bg-primary-500 py-3 text-center text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 active:scale-[0.99] lg:py-4"
                            >
                                Masuk untuk Bergabung
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
