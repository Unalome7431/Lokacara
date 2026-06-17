import { Link, useForm } from '@inertiajs/react';
import { Camera, Edit, Users, Award, Eye, AlertTriangle } from 'lucide-react';
import React, { useState } from 'react';
import CancelEventModal from '@/components/ui/CancelEventModal';
import TicketScannerModal from '@/components/ui/TicketScannerModal';

interface Event {
    id: number;
    title: string;
    capacity?: number;
    view_count: number;
    price: number;
    status?: string;
    start_datetime: string;
    end_datetime: string;
}

interface HostActionCardProps {
    event: Event;
    total_attendees: number;
    checked_in_attendees: number;
}

export default function HostActionCard({
    event,
    total_attendees,
    checked_in_attendees,
}: HostActionCardProps) {
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const { post, processing } = useForm();

    const handleConfirmCancel = () => {
        post(`/dashboard/events/${event.id}/cancel`, {
            onSuccess: () => {
                setIsCancelModalOpen(false);
            },
        });
    };

    const isCancelled = event.status === 'cancelled';
    const isEventFinished = new Date(event.end_datetime) < new Date();
    const isOngoing = new Date(event.start_datetime) <= new Date() && new Date(event.end_datetime) >= new Date();

    return (
        <div className="flex flex-col gap-6 lg:sticky lg:top-28">
            {/* Stats Card */}
            <div className="flex flex-col gap-4 rounded-3xl border border-neutral-300 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h4 className="font-brand text-h6-mobile font-black text-neutral-900 lg:text-h6-web">
                        Analitik Peserta
                    </h4>
                    <div className="flex items-center gap-1.5 rounded-full border border-neutral-200/40 bg-neutral-50 px-2.5 py-1 text-xs font-bold text-neutral-500">
                        <Eye size={14} className="text-neutral-400" />
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
                                {' '} / {event.capacity || '∞'}
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
                {isCancelled ? (
                    <div className="flex w-full flex-col gap-3">
                        <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-base font-bold text-red-700 lg:py-4">
                            <AlertTriangle size={18} className="text-red-600" />
                            <span>Acara Telah Dibatalkan</span>
                        </div>

                        <Link
                            href={`/dashboard/events/${event.id}/attendees`}
                            className="flex h-12 w-full items-center justify-center rounded-full border border-neutral-300 bg-white text-base font-bold text-neutral-800 shadow-xs transition-all duration-200 hover:bg-neutral-50 active:scale-[0.99] lg:h-auto lg:py-4"
                            title="Pendaftar"
                        >
                            <Users size={16} className="mr-2" />
                            <span>Pendaftar</span>
                        </Link>
                    </div>
                ) : isEventFinished ? (
                    <div className="flex w-full flex-col gap-3 lg:gap-4">
                        <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 py-3.5 text-base font-bold text-amber-700 lg:py-4">
                            <Award size={18} className="text-amber-600" />
                            <span>Acara Telah Selesai</span>
                        </div>

                        <Link
                            href={`/dashboard/events/${event.id}/attendees`}
                            className="flex h-12 w-full items-center justify-center rounded-full border border-neutral-300 bg-white text-base font-bold text-neutral-800 shadow-xs transition-all duration-200 hover:bg-neutral-50 active:scale-[0.99] lg:h-auto lg:py-4"
                            title="Pendaftar"
                        >
                            <Users size={16} className="mr-2" />
                            <span>Pendaftar</span>
                        </Link>

                        <Link
                            href={`/dashboard/events/${event.id}/certificates`}
                            className="flex h-12 w-full items-center justify-center rounded-full border border-neutral-300 bg-white text-base font-bold text-neutral-800 shadow-xs transition-all duration-200 hover:bg-neutral-50 active:scale-[0.99] lg:h-auto lg:py-4"
                            title="Kelola E-Sertifikat"
                        >
                            <Award size={16} className="mr-2" />
                            <span>E-Sertifikat</span>
                        </Link>
                    </div>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => setIsScanModalOpen(true)}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-primary-500 py-3 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 active:scale-[0.99] lg:w-full lg:py-4"
                        >
                            <Camera size={18} />
                            <span>Scan QR</span>
                        </button>

                        {!isOngoing && (
                            <Link
                                href={`/dashboard/events/${event.id}/edit`}
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-500 text-base font-bold text-neutral-900 shadow-md transition-all duration-200 hover:bg-secondary-600 active:scale-[0.99] lg:h-auto lg:w-full lg:flex-row lg:gap-2 lg:py-4"
                                title="Edit Detail Acara"
                            >
                                <Edit size={16} />
                                <span className="hidden lg:inline">Edit Detail Acara</span>
                            </Link>
                        )}

                        <Link
                            href={`/dashboard/events/${event.id}/attendees`}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-base font-bold text-neutral-800 shadow-xs transition-all duration-200 hover:bg-neutral-50 active:scale-[0.99] lg:h-auto lg:w-full lg:flex-row lg:gap-2 lg:py-4"
                            title="Pendaftar"
                        >
                            <Users size={16} />
                            <span className="hidden lg:inline">Pendaftar</span>
                        </Link>

                        <Link
                            href={`/dashboard/events/${event.id}/certificates`}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-base font-bold text-neutral-800 shadow-xs transition-all duration-200 hover:bg-neutral-50 active:scale-[0.99] lg:h-auto lg:w-full lg:flex-row lg:gap-2 lg:py-4"
                            title="Kelola E-Sertifikat"
                        >
                            <Award size={16} />
                            <span className="hidden lg:inline">E-Sertifikat</span>
                        </Link>

                        {isOngoing ? (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-base font-bold text-blue-600 shadow-xs lg:h-auto lg:w-full lg:flex-row lg:gap-2 lg:py-4 select-none" title="Event Sedang Berlangsung">
                                <AlertTriangle size={16} />
                                <span className="hidden lg:inline">Event Sedang Berlangsung</span>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsCancelModalOpen(true)}
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-base font-bold text-red-600 shadow-xs transition-all duration-200 hover:bg-red-100 active:scale-[0.99] lg:h-auto lg:w-full lg:flex-row lg:gap-2 lg:py-4 cursor-pointer"
                                title="Batalkan Acara"
                            >
                                <AlertTriangle size={16} />
                                <span className="hidden lg:inline">Batalkan Acara</span>
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* QR SCAN MODAL */}
            <TicketScannerModal
                isOpen={isScanModalOpen}
                onClose={() => setIsScanModalOpen(false)}
                eventId={event.id}
            />

            {/* CANCEL EVENT CONFIRMATION MODAL */}
            <CancelEventModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                isProcessing={processing}
                eventName={event.title}
            />
        </div>
    );
}
