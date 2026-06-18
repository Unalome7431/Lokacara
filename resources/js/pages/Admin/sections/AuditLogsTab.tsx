import React, { useState, useMemo } from 'react';
import { History } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { formatIndonesianDateShort } from '@/lib/utils';
import { AuditLog } from '../types';

interface AuditLogsTabProps {
    auditLogs: AuditLog[];
}

const ITEMS_PER_PAGE = 10;

export default function AuditLogsTab({ auditLogs }: AuditLogsTabProps) {
    const [page, setPage] = useState(1);

    // Paginate logs
    const paginatedLogs = useMemo(() => {
        return auditLogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    }, [auditLogs, page]);

    const totalPages = Math.ceil(auditLogs.length / ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
                <h3 className="font-brand text-h5-mobile font-black text-neutral-800 lg:text-h5-web">
                    Log Aktivitas
                </h3>
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-extrabold text-primary-600">
                    {auditLogs.length} Total
                </span>
            </div>

            {/* Logs List / Table */}
            {paginatedLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <History size={48} className="text-neutral-300 mb-4" />
                    <h4 className="text-base font-bold text-neutral-700">Belum ada riwayat aktivitas.</h4>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
                                <th className="pb-3 pl-2 w-[20%]">Pelaku</th>
                                <th className="pb-3 w-[20%]">Aksi</th>
                                <th className="pb-3 w-[45%]">Detail</th>
                                <th className="pb-3 w-[15%]">Waktu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogs.map((log) => {
                                let actionBadgeColor = 'bg-neutral-100 text-neutral-700';
                                let actionText = log.action;

                                if (log.action === 'ban_event') {
                                    actionBadgeColor = 'bg-secondary-100 text-secondary-800';
                                    actionText = 'Ban Event';
                                } else if (log.action === 'dismiss_report') {
                                    actionBadgeColor = 'bg-green-100 text-green-800';
                                    actionText = 'Abaikan Laporan';
                                } else if (log.action === 'suspend_user') {
                                    actionBadgeColor = 'bg-secondary-100 text-secondary-800';
                                    actionText = 'Suspend User';
                                } else if (log.action === 'unsuspend_user') {
                                    actionBadgeColor = 'bg-green-100 text-green-800';
                                    actionText = 'Batal Suspend';
                                } else if (log.action === 'change_role') {
                                    actionBadgeColor = 'bg-purple-100 text-purple-800';
                                    actionText = 'Ubah Role';
                                } else if (log.action === 'create_category') {
                                    actionBadgeColor = 'bg-primary-100 text-primary-800';
                                    actionText = 'Tambah Kategori';
                                } else if (log.action === 'update_category') {
                                    actionBadgeColor = 'bg-primary-100 text-primary-800';
                                    actionText = 'Edit Kategori';
                                } else if (log.action === 'delete_category') {
                                    actionBadgeColor = 'bg-secondary-100 text-secondary-800';
                                    actionText = 'Hapus Kategori';
                                }

                                // Format details display helper
                                let detailsString = '';
                                if (log.details) {
                                    if (log.action === 'ban_event') {
                                        detailsString = `Event: "${log.details.title}" (Host: ${log.details.organizer_name || 'Anonim'})`;
                                    } else if (log.action === 'dismiss_report') {
                                        detailsString = `Laporan #${log.target_id} - Event: "${log.details.event_title || 'N/A'}" (Oleh: ${log.details.reporter_name || 'Anonim'}, Alasan: ${log.details.reason})`;
                                    } else if (log.action === 'suspend_user') {
                                        detailsString = `User: ${log.details.name} (${log.details.email})`;
                                    } else if (log.action === 'unsuspend_user') {
                                        detailsString = `User: ${log.details.name} (${log.details.email})`;
                                    } else if (log.action === 'change_role') {
                                        detailsString = `User: ${log.details.name} (Role: ${log.details.old_role} -> ${log.details.new_role})`;
                                    } else if (log.action === 'create_category') {
                                        detailsString = `Kategori: "${log.details.name}"`;
                                    } else if (log.action === 'update_category') {
                                        detailsString = `Kategori: "${log.details.old_name}" -> "${log.details.new_name}"`;
                                    } else if (log.action === 'delete_category') {
                                        detailsString = `Kategori: "${log.details.name}"`;
                                    } else {
                                        detailsString = JSON.stringify(log.details);
                                    }
                                }

                                return (
                                    <tr key={log.id} className="border-b border-neutral-100/50 hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 pl-2">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-neutral-900 truncate max-w-[150px]" title={log.user?.name || 'Sistem'}>
                                                    {log.user?.name || 'Sistem'}
                                                </span>
                                                {log.user?.email && (
                                                    <span className="text-[10px] text-gray-400 font-semibold truncate max-w-[150px]" title={log.user.email}>
                                                        {log.user.email}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase select-none ${actionBadgeColor}`}>
                                                {actionText}
                                            </span>
                                        </td>
                                        <td className="py-4 text-xs font-semibold text-neutral-600 break-words pr-4">
                                            {detailsString}
                                        </td>
                                        <td className="py-4 text-xs font-medium text-neutral-400">
                                            {formatIndonesianDateShort(log.created_at)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
}
