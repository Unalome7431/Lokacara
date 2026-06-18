import { useForm } from '@inertiajs/react';
import { AlertTriangle, Eye, ShieldAlert, X } from 'lucide-react';
import React, { useState } from 'react';

interface Report {
    id: number;
    reason: string;
    description: string;
    status: string;
    created_at: string;
    user?: {
        name: string;
        email: string;
    };
}

interface Event {
    id: number;
    title: string;
    view_count: number;
    status?: string;
}

interface AdminActionCardProps {
    event: Event;
    reports?: Report[];
}

export default function AdminActionCard({ event, reports = [] }: AdminActionCardProps) {
    const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
    const { post, processing } = useForm();

    const handleBanEvent = () => {
        if (confirm(`Apakah Anda yakin ingin melakukan BANNED terhadap event "${event.title}"? Tindakan ini akan membatalkan pendaftaran semua peserta.`)) {
            post(`/admin/events/${event.id}/ban`);
        }
    };

    const isBanned = event.status === 'banned';
    const isCancelled = event.status === 'cancelled';
    const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

    return (
        <div className="flex flex-col gap-6 lg:sticky lg:top-28">
            {/* Stats Card */}
            <div className="flex flex-col gap-4 rounded-3xl border border-neutral-300 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h4 className="font-brand text-h6-mobile font-black text-neutral-900 lg:text-h6-web">
                        Moderasi Admin
                    </h4>
                    <div className="flex items-center gap-1.5 rounded-full border border-neutral-200/40 bg-neutral-50 px-2.5 py-1 text-xs font-bold text-neutral-500">
                        <Eye size={14} className="text-neutral-400" />
                        <span>{event.view_count || 0} views</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-sm">
                        <span className="font-semibold text-neutral-500">Status Acara:</span>
                        <span className={`font-bold uppercase ${isBanned ? 'text-red-600' : isCancelled ? 'text-gray-500' : 'text-green-600'}`}>
                            {isBanned ? 'BANNED' : isCancelled ? 'Dibatalkan' : 'Aktif'}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-neutral-100 pt-3">
                        <span className="font-semibold text-neutral-500">Total Laporan:</span>
                        <span className={`font-bold ${reports.length > 0 ? 'text-red-500' : 'text-neutral-700'}`}>
                            {reports.length} laporan ({pendingReportsCount} pending)
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-col gap-3">
                {isBanned ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-base font-bold text-red-700 lg:py-4">
                        <ShieldAlert size={18} className="text-red-600" />
                        <span>Event Telah Diblokir</span>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleBanEvent}
                        disabled={processing || isCancelled}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-red-600 py-3 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-red-700 active:scale-[0.99] disabled:bg-neutral-300 disabled:cursor-not-allowed lg:py-4"
                    >
                        <ShieldAlert size={18} />
                        <span>Blokir (Ban) Event</span>
                    </button>
                )}

                {reports.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setIsReportsModalOpen(true)}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white py-3 text-base font-bold text-neutral-800 shadow-xs transition-all duration-200 hover:bg-neutral-50 active:scale-[0.99] lg:py-4"
                    >
                        <AlertTriangle size={18} className="text-amber-500" />
                        <span>Lihat Daftar Laporan ({reports.length})</span>
                    </button>
                )}
            </div>

            {/* Reports List Modal Overlay */}
            {isReportsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs select-none">
                    <div className="animate-in fade-in zoom-in-95 relative flex h-full max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-brand text-lg font-black text-neutral-900">
                                        Laporan Masuk untuk Event
                                    </h3>
                                    <p className="text-xs font-semibold text-gray-400 mt-0.5">
                                        {event.title}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsReportsModalOpen(false)}
                                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="grow overflow-y-auto p-6 flex flex-col gap-4">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-neutral-50/55 p-4"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Pelapor:</span>
                                            <h5 className="text-sm font-bold text-neutral-800 leading-tight">
                                                {report.user?.name || 'User Anonim'}
                                            </h5>
                                            <span className="text-xs font-semibold text-neutral-400">
                                                {report.user?.email || ''}
                                            </span>
                                        </div>
                                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase select-none ${
                                            report.status === 'pending'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-green-100 text-green-700'
                                        }`}>
                                            {report.status}
                                        </span>
                                    </div>

                                    <div className="mt-2 border-t border-neutral-200/50 pt-2">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Kategori Laporan:</span>
                                            <span className="text-sm font-extrabold text-neutral-800">
                                                {report.reason}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1 mt-2">
                                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Keterangan:</span>
                                            <p className="text-sm font-medium text-neutral-700 leading-relaxed whitespace-pre-line">
                                                {report.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
