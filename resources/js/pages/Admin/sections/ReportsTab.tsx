import {
    AlertTriangle,
    CheckCircle,
    Filter,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import Pagination from '@/components/ui/Pagination';
import { formatIndonesianDateShort } from '@/lib/utils';
import type { Report } from '../types';

interface ReportsTabProps {
    reports: Report[];
    type: 'pending' | 'resolved';
    onSelectReport?: (report: Report) => void;
}

const ITEMS_PER_PAGE = 10;
const REPORT_REASONS = ['Spam', 'Konten Tidak Layak / Seksual', 'Penipuan / Scam', 'Pelanggaran Hak Cipta', 'Lainnya'];

export default function ReportsTab({ reports, type, onSelectReport }: ReportsTabProps) {
    const [reasonFilter, setReasonFilter] = useState('all');
    const [page, setPage] = useState(1);

    // Filter reports
    const filteredReports = useMemo(() => {
        let filtered = reports.filter((r) => {
            if (type === 'pending') {
                return r.status === 'pending';
            } else {
                return r.status !== 'pending';
            }
        });

        if (reasonFilter !== 'all') {
            filtered = filtered.filter((r) => r.reason === reasonFilter);
        }

        return filtered;
    }, [reports, reasonFilter, type]);

    // Paginate reports
    const paginatedReports = useMemo(() => {
        return filteredReports.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    }, [filteredReports, page]);

    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);

    const handleReasonFilterChange = (val: string) => {
        setReasonFilter(val);
        setPage(1);
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Filter and Title Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                <h3 className="font-brand text-h5-mobile font-black text-neutral-800 lg:text-h5-web">
                    {type === 'pending' ? 'Laporan Masuk (Pending)' : 'Riwayat Laporan (Resolved)'}
                </h3>
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-neutral-400" />
                    <select
                        value={reasonFilter}
                        onChange={(e) => handleReasonFilterChange(e.target.value)}
                        className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-bold text-neutral-600 focus:outline-none"
                    >
                        <option value="all">Semua Tipe</option>
                        {REPORT_REASONS.map((reason) => (
                            <option key={reason} value={reason}>{reason}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content List */}
            {paginatedReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    {type === 'pending' ? (
                        <>
                            <CheckCircle size={48} className="text-green-500 mb-4" />
                            <h4 className="text-base font-bold text-neutral-700">Bersih! Tidak ada laporan pending.</h4>
                            <p className="text-xs text-gray-400 mt-1">Semua laporan telah terselesaikan.</p>
                        </>
                    ) : (
                        <>
                            <AlertTriangle size={48} className="text-neutral-300 mb-4" />
                            <h4 className="text-base font-bold text-neutral-700">Belum ada riwayat laporan.</h4>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {paginatedReports.map((report) => (
                        <div
                            key={report.id}
                            onClick={() => onSelectReport?.(report)}
                            className={`flex flex-col gap-3 rounded-2xl border p-4 transition-all ${
                                type === 'pending'
                                    ? 'border-neutral-200 bg-neutral-50/40 hover:shadow-xs hover:border-primary-200 cursor-pointer'
                                    : 'border-neutral-100 bg-neutral-50/20'
                            }`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase select-none ${
                                        type === 'pending'
                                            ? 'bg-secondary-100 text-secondary-800'
                                            : 'bg-green-100 text-green-700'
                                    }`}>
                                        {report.reason}
                                    </span>
                                    <h4 className="font-brand text-base font-black text-neutral-900 mt-2">
                                        Laporan: {report.event?.title || 'Event Terhapus'}
                                    </h4>
                                    <p className="text-xs font-semibold text-gray-400 mt-1">
                                        {type === 'pending' ? (
                                            <>
                                                Dilaporkan oleh <span className="text-neutral-700 font-bold">{report.user?.name}</span> pada {formatIndonesianDateShort(report.created_at)}
                                            </>
                                        ) : (
                                            <>
                                                Oleh <span className="text-neutral-600 font-bold">{report.user?.name}</span> • Status: <span className="text-green-600 font-bold uppercase">{report.status}</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                                {type === 'pending' && (
                                    <span className="text-xs font-extrabold text-primary-500 flex items-center gap-1 shrink-0 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors">
                                        Tinjau Laporan
                                    </span>
                                )}
                            </div>
                            <p className="line-clamp-2 text-sm font-medium text-neutral-600 mt-1 bg-white p-3 rounded-xl border border-neutral-100">
                                {report.description}
                            </p>
                            {type === 'resolved' && report.resolved_by && (
                                <p className="text-[11px] font-semibold text-neutral-400 mt-1 flex items-center gap-1">
                                    <CheckCircle size={12} className="text-green-500" />
                                    Diselesaikan oleh <span className="font-bold text-neutral-600">{report.resolved_by.name}</span>
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
}
