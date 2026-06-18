import { AlertTriangle, X, Eye } from 'lucide-react';
import React from 'react';
import { formatIndonesianDateShort } from '@/lib/utils';
import type { Report } from '../types';

interface ReportDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: Report | null;
    onBanEvent: (eventId: number, eventTitle: string) => void;
    onDismissReport: (reportId: number) => void;
    onOpenEvent: (report: Report) => void;
    processing: boolean;
}

export default function ReportDetailModal({
    isOpen,
    onClose,
    report,
    onBanEvent,
    onDismissReport,
    onOpenEvent,
    processing,
}: ReportDetailModalProps) {
    if (!isOpen || !report) {
return null;
}

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs select-none">
            <div className="animate-in fade-in zoom-in-95 relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3 className="font-brand text-lg font-black text-neutral-900">
                                Detail Review Laporan
                            </h3>
                            <p className="text-xs font-semibold text-gray-400 mt-0.5">
                                ID Laporan #{report.id}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="grow overflow-y-auto p-6 flex flex-col gap-5" data-lenis-prevent>
                    {/* Event Section */}
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                        <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider mb-2">Event yang Dilaporkan</h4>
                        <h5 className="text-base font-black text-neutral-900">{report.event?.title || 'Event Terhapus'}</h5>
                        <div className="grid grid-cols-2 gap-3 mt-3 text-xs border-t border-neutral-200/50 pt-3">
                            <div>
                                <span className="font-semibold text-gray-400">Host/Penyelenggara:</span>
                                <p className="font-bold text-neutral-800 mt-0.5">{report.event?.user?.name || 'Anonim'}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-400">Status Acara:</span>
                                <p className="font-bold text-neutral-800 uppercase mt-0.5">{report.event?.status || 'active'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reporter Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                            <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Dilaporkan Oleh</span>
                            <h5 className="text-sm font-bold text-neutral-800 mt-1">{report.user?.name}</h5>
                            <span className="text-xs text-gray-400">{report.user?.email}</span>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                            <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Tanggal Laporan</span>
                            <h5 className="text-sm font-bold text-neutral-800 mt-1">{formatIndonesianDateShort(report.created_at)}</h5>
                        </div>
                    </div>

                    {/* Reason & Content Section */}
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Kategori Pelanggaran</span>
                            <span className="text-sm font-black text-secondary-600">{report.reason}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Deskripsi Masalah</span>
                            <p className="text-sm font-medium text-neutral-700 leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-200 whitespace-pre-line">
                                {report.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="border-t border-neutral-100 p-6 flex gap-3 bg-neutral-50/50 shrink-0">
                    {report.event && report.event.status !== 'banned' && (
                        <button
                            onClick={() => onBanEvent(report.event_id, report.event?.title || '')}
                            disabled={processing}
                            className="flex-1 rounded-full bg-secondary-500 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-secondary-600 transition-colors cursor-pointer"
                        >
                            Ban / Blokir Event
                        </button>
                    )}
                    <button
                        onClick={() => onDismissReport(report.id)}
                        disabled={processing}
                        className="flex-1 rounded-full border border-neutral-300 bg-white py-3 text-center text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                        Abaikan Laporan
                    </button>
                    {report.event && (
                        <button
                            type="button"
                            onClick={() => onOpenEvent(report)}
                            className="flex-1 rounded-full border border-neutral-300 bg-neutral-100 py-3 text-center text-sm font-bold text-neutral-700 hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Eye size={14} />
                            <span>Buka Event</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
