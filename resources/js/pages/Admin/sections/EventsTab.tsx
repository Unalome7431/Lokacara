import React, { useState, useMemo } from 'react';
import {
    Calendar,
    Filter,
    Search,
    Tag,
    Eye,
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { formatIndonesianDateShort } from '@/lib/utils';
import { Event } from '../types';

interface EventsTabProps {
    events: Event[];
    onSelectEvent?: (event: Event) => void;
}

const ITEMS_PER_PAGE = 10;

export default function EventsTab({ events, onSelectEvent }: EventsTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned' | 'cancelled'>('all');
    const [page, setPage] = useState(1);

    // Filter events
    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [events, searchQuery, statusFilter]);

    // Paginate events
    const paginatedEvents = useMemo(() => {
        return filteredEvents.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    }, [filteredEvents, page]);

    const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setPage(1);
    };

    const handleStatusFilterChange = (status: 'all' | 'active' | 'banned' | 'cancelled') => {
        setStatusFilter(status);
        setPage(1);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
                <h3 className="font-brand text-h5-mobile font-black text-neutral-800 lg:text-h5-web">
                    Kelola Daftar Event
                </h3>
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-extrabold text-primary-600">
                    {events.length} Total
                </span>
            </div>

            {/* Filtering Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4">
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Cari event berdasarkan judul..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2.5 pl-11 pr-5 text-sm font-semibold text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-neutral-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilterChange(e.target.value as any)}
                        className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-600 focus:outline-none"
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="banned">Banned</option>
                        <option value="cancelled">Dibatalkan</option>
                    </select>
                </div>
            </div>

            {/* Events List */}
            {paginatedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search size={48} className="text-neutral-300 mb-4" />
                    <h4 className="text-base font-bold text-neutral-700">Tidak ada event yang ditemukan.</h4>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
                                <th className="pb-3 pl-2 w-[35%]">Judul Event</th>
                                <th className="pb-3 w-[25%]">Penyelenggara</th>
                                <th className="pb-3 w-[15%]">Kategori</th>
                                <th className="pb-3 w-[12%]">Status</th>
                                <th className="pb-3 text-left pl-2 w-[13%]">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedEvents.map((event) => (
                                <tr key={event.id} className="border-b border-neutral-100/50 hover:bg-neutral-50/50 transition-colors">
                                    <td className="py-4 pl-2">
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-bold text-neutral-900 truncate block max-w-[320px]" title={event.title}>
                                                {event.title}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 mt-1">
                                                <Calendar size={10} />
                                                {formatIndonesianDateShort(event.start_datetime)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm font-medium text-neutral-600">
                                        <span className="block truncate max-w-[200px]" title={event.user?.name || 'Anonim'}>
                                            {event.user?.name || 'Anonim'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-sm font-semibold text-neutral-600">
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded-full">
                                            <Tag size={10} />
                                            {event.category?.name || 'Kategori'}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase select-none ${
                                            event.status === 'banned'
                                                ? 'bg-secondary-100 text-secondary-800'
                                                : event.status === 'cancelled'
                                                ? 'bg-gray-100 text-gray-700'
                                                : 'bg-green-100 text-green-700'
                                        }`}>
                                            {event.status === 'banned' ? 'BANNED' : event.status === 'cancelled' ? 'BATAL' : 'AKTIF'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-left pl-2">
                                        <button
                                            type="button"
                                            onClick={() => onSelectEvent?.(event)}
                                            className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-500 hover:bg-primary-100 transition-colors cursor-pointer"
                                        >
                                            <Eye size={12} />
                                            <span>Buka Detail</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
}
