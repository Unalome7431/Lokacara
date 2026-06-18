import { Head, useForm, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    LogOut,
    MapPin,
    Monitor,
    Search,
    ShieldAlert,
    Tag,
    Users,
    X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { formatIndonesianDateShort } from '@/lib/utils';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Event {
    id: number;
    title: string;
    description?: string;
    type?: 'online' | 'offline';
    location_name?: string;
    address?: string;
    platform_name?: string;
    link?: string;
    price?: number;
    capacity?: number;
    poster_url?: string;
    user?: User;
    category?: {
        name: string;
    };
    status: string;
    start_datetime: string;
    end_datetime?: string;
    view_count: number;
    event_registrations_count?: number;
}

interface Report {
    id: number;
    event_id: number;
    reporter_id: number;
    reason: string;
    description: string;
    status: string;
    created_at: string;
    user?: User;
    event?: Event;
    resolved_by?: User;
}

interface ModerationBaseProps {
    reports?: Report[];
    events?: Event[];
}

const ITEMS_PER_PAGE = 10;

const REPORT_REASONS = ['Spam', 'Konten Tidak Layak / Seksual', 'Penipuan / Scam', 'Pelanggaran Hak Cipta', 'Lainnya'];

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-neutral-100 mt-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        page === currentPage
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronRight size={14} />
            </button>
        </div>
    );
}

export default function ModerationBase({ reports = [], events = [] }: ModerationBaseProps) {
    const [activeTab, setActiveTab] = useState<'laporan' | 'semua_laporan' | 'events'>('laporan');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [eventSearchQuery, setEventSearchQuery] = useState('');
    const [eventStatusFilter, setEventStatusFilter] = useState<'all' | 'active' | 'banned' | 'cancelled'>('all');
    const [pendingReasonFilter, setPendingReasonFilter] = useState<string>('all');
    const [resolvedReasonFilter, setResolvedReasonFilter] = useState<string>('all');

    // Pagination state
    const [pendingPage, setPendingPage] = useState(1);
    const [resolvedPage, setResolvedPage] = useState(1);
    const [eventsPage, setEventsPage] = useState(1);

    const { post, processing } = useForm();

    const handleBanEvent = (eventId: number, eventTitle: string) => {
        if (confirm(`Apakah Anda yakin ingin memblokir (ban) event "${eventTitle}"?`)) {
            post(`/admin/events/${eventId}/ban`, {
                onSuccess: () => setSelectedReport(null),
            });
        }
    };

    const handleDismissReport = (reportId: number) => {
        if (confirm('Apakah Anda yakin ingin mengabaikan/menyelesaikan laporan ini?')) {
            post(`/admin/reports/${reportId}/dismiss`, {
                onSuccess: () => setSelectedReport(null),
            });
        }
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    // Filtered reports
    const pendingReports = useMemo(() => {
        let filtered = reports.filter((r) => r.status === 'pending');

        if (pendingReasonFilter !== 'all') {
            filtered = filtered.filter((r) => r.reason === pendingReasonFilter);
        }

        return filtered;
    }, [reports, pendingReasonFilter]);

    const resolvedReports = useMemo(() => {
        let filtered = reports.filter((r) => r.status !== 'pending');

        if (resolvedReasonFilter !== 'all') {
            filtered = filtered.filter((r) => r.reason === resolvedReasonFilter);
        }

        return filtered;
    }, [reports, resolvedReasonFilter]);

    // Filtered events
    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesSearch = event.title?.toLowerCase().includes(eventSearchQuery.toLowerCase());
            const matchesStatus = eventStatusFilter === 'all' || event.status === eventStatusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [events, eventSearchQuery, eventStatusFilter]);

    // Paginated data
    const pendingTotalPages = Math.ceil(pendingReports.length / ITEMS_PER_PAGE);
    const paginatedPending = pendingReports.slice((pendingPage - 1) * ITEMS_PER_PAGE, pendingPage * ITEMS_PER_PAGE);

    const resolvedTotalPages = Math.ceil(resolvedReports.length / ITEMS_PER_PAGE);
    const paginatedResolved = resolvedReports.slice((resolvedPage - 1) * ITEMS_PER_PAGE, resolvedPage * ITEMS_PER_PAGE);

    const eventsTotalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
    const paginatedEvents = filteredEvents.slice((eventsPage - 1) * ITEMS_PER_PAGE, eventsPage * ITEMS_PER_PAGE);

    // Reset pagination on filter change
    const handlePendingReasonChange = (reason: string) => {
        setPendingReasonFilter(reason);
        setPendingPage(1);
    };

    const handleResolvedReasonChange = (reason: string) => {
        setResolvedReasonFilter(reason);
        setResolvedPage(1);
    };

    const handleEventSearchChange = (query: string) => {
        setEventSearchQuery(query);
        setEventsPage(1);
    };

    const handleEventStatusChange = (status: 'all' | 'active' | 'banned' | 'cancelled') => {
        setEventStatusFilter(status);
        setEventsPage(1);
    };

    // Counts from unfiltered data for sidebar badges
    const totalPendingCount = reports.filter((r) => r.status === 'pending').length;
    const totalResolvedCount = reports.filter((r) => r.status !== 'pending').length;

    return (
        <div className="flex min-h-screen flex-col bg-neutral-50/50 select-none">
            <Head title="Moderasi Admin - Lokacara" />

            <div className="grow mx-auto w-full max-w-7xl px-4 pt-8 pb-16 md:px-8">
                {/* Header card with logout */}
                <div className="mb-8 flex flex-col justify-between gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h2 className="font-brand text-h3-mobile font-black text-neutral-900 lg:text-h3-web leading-tight">
                                Panel Moderasi Admin
                            </h2>
                            <p className="text-xs font-semibold text-gray-400 mt-0.5">
                                Tinjau laporan masuk, moderasi event, dan kelola integritas platform.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50/50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                    >
                        <LogOut size={16} />
                        <span>Keluar Panel</span>
                    </button>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 items-start">
                    {/* Left Sidebar Menu */}
                    <div className="flex flex-col gap-2 lg:col-span-1 rounded-3xl border border-neutral-200 bg-white p-4 shadow-xs">
                        <button
                            onClick={() => {
 setActiveTab('laporan'); setPendingPage(1); 
}}
                            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all cursor-pointer ${
                                activeTab === 'laporan'
                                    ? 'bg-red-500 text-white shadow-sm shadow-red-200/50'
                                    : 'text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            <span>Laporan Pending</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                                activeTab === 'laporan' ? 'bg-white text-red-600' : 'bg-red-50 text-red-600'
                            }`}>
                                {totalPendingCount}
                            </span>
                        </button>

                        <button
                            onClick={() => {
 setActiveTab('semua_laporan'); setResolvedPage(1); 
}}
                            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all cursor-pointer ${
                                activeTab === 'semua_laporan'
                                    ? 'bg-red-500 text-white shadow-sm shadow-red-200/50'
                                    : 'text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            <span>Riwayat Laporan</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                                activeTab === 'semua_laporan' ? 'bg-white text-red-600' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                                {totalResolvedCount}
                            </span>
                        </button>

                        <button
                            onClick={() => {
 setActiveTab('events'); setEventsPage(1); 
}}
                            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all cursor-pointer ${
                                activeTab === 'events'
                                    ? 'bg-red-500 text-white shadow-sm shadow-red-200/50'
                                    : 'text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            <span>Kelola Event</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                                activeTab === 'events' ? 'bg-white text-red-600' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                                {events.length}
                            </span>
                        </button>
                    </div>

                    {/* Right Content Panel */}
                    <div className="lg:col-span-3 rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs min-h-[500px]">
                        {/* 1. Pending Reports List */}
                        {activeTab === 'laporan' && (
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                                    <h3 className="font-brand text-h5-mobile font-black text-neutral-800 lg:text-h5-web">
                                        Laporan Masuk (Pending)
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Filter size={14} className="text-neutral-400" />
                                        <select
                                            value={pendingReasonFilter}
                                            onChange={(e) => handlePendingReasonChange(e.target.value)}
                                            className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-bold text-neutral-600 focus:outline-none"
                                        >
                                            <option value="all">Semua Tipe</option>
                                            {REPORT_REASONS.map((reason) => (
                                                <option key={reason} value={reason}>{reason}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {paginatedPending.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <CheckCircle size={48} className="text-green-500 mb-4" />
                                        <h4 className="text-base font-bold text-neutral-700">Bersih! Tidak ada laporan pending.</h4>
                                        <p className="text-xs text-gray-400 mt-1">Semua laporan telah terselesaikan.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {paginatedPending.map((report) => (
                                            <div
                                                key={report.id}
                                                onClick={() => setSelectedReport(report)}
                                                className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/40 p-4 transition-all hover:shadow-xs hover:border-red-200 cursor-pointer"
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-red-700 select-none">
                                                            {report.reason}
                                                        </span>
                                                        <h4 className="font-brand text-base font-black text-neutral-900 mt-2">
                                                            Laporan: {report.event?.title || 'Event Terhapus'}
                                                        </h4>
                                                        <p className="text-xs font-semibold text-gray-400 mt-1">
                                                            Dilaporkan oleh <span className="text-neutral-700 font-bold">{report.user?.name}</span> pada {formatIndonesianDateShort(report.created_at)}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs font-extrabold text-red-500 flex items-center gap-1 shrink-0 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors">
                                                        Tinjau Laporan
                                                    </span>
                                                </div>
                                                <p className="line-clamp-2 text-sm font-medium text-neutral-600 mt-1 bg-white p-3 rounded-xl border border-neutral-100">
                                                    {report.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Pagination currentPage={pendingPage} totalPages={pendingTotalPages} onPageChange={setPendingPage} />
                            </div>
                        )}

                        {/* 2. Resolved Reports History */}
                        {activeTab === 'semua_laporan' && (
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                                    <h3 className="font-brand text-h5-mobile font-black text-neutral-800 lg:text-h5-web">
                                        Riwayat Laporan (Resolved)
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Filter size={14} className="text-neutral-400" />
                                        <select
                                            value={resolvedReasonFilter}
                                            onChange={(e) => handleResolvedReasonChange(e.target.value)}
                                            className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-bold text-neutral-600 focus:outline-none"
                                        >
                                            <option value="all">Semua Tipe</option>
                                            {REPORT_REASONS.map((reason) => (
                                                <option key={reason} value={reason}>{reason}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {paginatedResolved.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <AlertTriangle size={48} className="text-neutral-300 mb-4" />
                                        <h4 className="text-base font-bold text-neutral-700">Belum ada riwayat laporan.</h4>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {paginatedResolved.map((report) => (
                                            <div
                                                key={report.id}
                                                className="flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-neutral-50/20 p-4"
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-green-700 select-none">
                                                            {report.reason}
                                                        </span>
                                                        <h4 className="font-brand text-base font-black text-neutral-800 mt-2">
                                                            {report.event?.title || 'Event Terhapus'}
                                                        </h4>
                                                        <p className="text-xs font-semibold text-gray-400 mt-1">
                                                            Oleh <span className="text-neutral-600 font-bold">{report.user?.name}</span> • Status: <span className="text-green-600 font-bold uppercase">{report.status}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium text-neutral-600 mt-1 bg-white p-3 rounded-xl border border-neutral-100/50">
                                                    {report.description}
                                                </p>
                                                {report.resolved_by && (
                                                    <p className="text-[11px] font-semibold text-neutral-400 mt-1 flex items-center gap-1">
                                                        <CheckCircle size={12} className="text-green-500" />
                                                        Diselesaikan oleh <span className="font-bold text-neutral-600">{report.resolved_by.name}</span>
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Pagination currentPage={resolvedPage} totalPages={resolvedTotalPages} onPageChange={setResolvedPage} />
                            </div>
                        )}

                        {/* 3. Manage Events List */}
                        {activeTab === 'events' && (
                            <div className="flex flex-col gap-5">
                                <h3 className="font-brand text-h5-mobile font-black text-neutral-800 lg:text-h5-web">
                                    Kelola Daftar Event
                                </h3>

                                {/* Filtering Bar */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4">
                                    {/* Search Input */}
                                    <div className="relative flex-1 max-w-sm">
                                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari event berdasarkan judul..."
                                            value={eventSearchQuery}
                                            onChange={(e) => handleEventSearchChange(e.target.value)}
                                            className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2.5 pl-11 pr-5 text-sm font-semibold text-neutral-800 placeholder-neutral-400 focus:border-red-500 focus:bg-white focus:outline-none"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <div className="flex items-center gap-2">
                                        <Filter size={14} className="text-neutral-400" />
                                        <select
                                            value={eventStatusFilter}
                                            onChange={(e) => handleEventStatusChange(e.target.value as any)}
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
                                        <Search size={48} className="text-neutral-300 mb-4 animate-pulse" />
                                        <h4 className="text-base font-bold text-neutral-700">Tidak ada event yang ditemukan.</h4>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-neutral-100 text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
                                                    <th className="pb-3 pl-2">Judul Event</th>
                                                    <th className="pb-3">Penyelenggara</th>
                                                    <th className="pb-3">Kategori</th>
                                                    <th className="pb-3">Status</th>
                                                    <th className="pb-3 text-right pr-2">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedEvents.map((event) => (
                                                    <tr key={event.id} className="border-b border-neutral-100/50 hover:bg-neutral-50/50 transition-colors">
                                                        <td className="py-4 pl-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-neutral-900 max-w-[200px] truncate">
                                                                    {event.title}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 mt-1">
                                                                    <Calendar size={10} />
                                                                    {formatIndonesianDateShort(event.start_datetime)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-sm font-medium text-neutral-600">
                                                            {event.user?.name || 'Anonim'}
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
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : event.status === 'cancelled'
                                                                    ? 'bg-gray-100 text-gray-700'
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}>
                                                                {event.status === 'banned' ? 'BANNED' : event.status === 'cancelled' ? 'BATAL' : 'AKTIF'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 text-right pr-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedEvent(event)}
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
                                <Pagination currentPage={eventsPage} totalPages={eventsTotalPages} onPageChange={setEventsPage} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Report Detail Modal Overlay */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs select-none">
                    <div className="animate-in fade-in zoom-in-95 relative flex h-full max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-brand text-lg font-black text-neutral-900">
                                        Detail Review Laporan
                                    </h3>
                                    <p className="text-xs font-semibold text-gray-400 mt-0.5">
                                        ID Laporan #{selectedReport.id}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="grow overflow-y-auto p-6 flex flex-col gap-5">
                            {/* Event Section */}
                            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                                <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider mb-2">Event yang Dilaporkan</h4>
                                <h5 className="text-base font-black text-neutral-900">{selectedReport.event?.title || 'Event Terhapus'}</h5>
                                <div className="grid grid-cols-2 gap-3 mt-3 text-xs border-t border-neutral-200/50 pt-3">
                                    <div>
                                        <span className="font-semibold text-gray-400">Host/Penyelenggara:</span>
                                        <p className="font-bold text-neutral-800 mt-0.5">{selectedReport.event?.user?.name || 'Anonim'}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-400">Status Acara:</span>
                                        <p className="font-bold text-neutral-800 uppercase mt-0.5">{selectedReport.event?.status || 'active'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reporter Section */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                                    <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Dilaporkan Oleh</span>
                                    <h5 className="text-sm font-bold text-neutral-800 mt-1">{selectedReport.user?.name}</h5>
                                    <span className="text-xs text-gray-400">{selectedReport.user?.email}</span>
                                </div>
                                <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                                    <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Tanggal Laporan</span>
                                    <h5 className="text-sm font-bold text-neutral-800 mt-1">{formatIndonesianDateShort(selectedReport.created_at)}</h5>
                                </div>
                            </div>

                            {/* Reason & Content Section */}
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Kategori Pelanggaran</span>
                                    <span className="text-sm font-black text-red-600">{selectedReport.reason}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Deskripsi Masalah</span>
                                    <p className="text-sm font-medium text-neutral-700 leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-200 whitespace-pre-line">
                                        {selectedReport.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="border-t border-neutral-100 p-6 flex gap-3 bg-neutral-50/50 shrink-0">
                            {selectedReport.event && selectedReport.event.status !== 'banned' && (
                                <button
                                    onClick={() => handleBanEvent(selectedReport.event_id, selectedReport.event?.title || '')}
                                    disabled={processing}
                                    className="flex-1 rounded-full bg-red-600 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                                >
                                    Ban / Blokir Event
                                </button>
                            )}
                            <button
                                onClick={() => handleDismissReport(selectedReport.id)}
                                disabled={processing}
                                className="flex-1 rounded-full border border-neutral-300 bg-white py-3 text-center text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                            >
                                Abaikan Laporan
                            </button>
                            {selectedReport.event && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedReport(null);

                                        if (selectedReport.event) {
                                            setSelectedEvent(selectedReport.event);
                                        }
                                    }}
                                    className="flex-1 rounded-full border border-neutral-300 bg-neutral-100 py-3 text-center text-sm font-bold text-neutral-700 hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Eye size={14} />
                                    <span>Buka Event</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Event Detail Popup Overlay */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs select-none">
                    <div className="animate-in fade-in zoom-in-95 relative flex h-full max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                                    <Eye size={20} />
                                </div>
                                <div>
                                    <h3 className="font-brand text-lg font-black text-neutral-900">
                                        Detail Event
                                    </h3>
                                    <p className="text-xs font-semibold text-gray-400 mt-0.5">
                                        ID #{selectedEvent.id}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="grow overflow-y-auto p-6 flex flex-col gap-5">
                            {/* Title & Status */}
                            <div>
                                <div className="flex items-start justify-between gap-3">
                                    <h4 className="font-brand text-xl font-black text-neutral-900 leading-tight">
                                        {selectedEvent.title}
                                    </h4>
                                    <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase select-none ${
                                        selectedEvent.status === 'banned'
                                            ? 'bg-red-100 text-red-700'
                                            : selectedEvent.status === 'cancelled'
                                            ? 'bg-gray-100 text-gray-700'
                                            : 'bg-green-100 text-green-700'
                                    }`}>
                                        {selectedEvent.status === 'banned' ? 'BANNED' : selectedEvent.status === 'cancelled' ? 'BATAL' : 'AKTIF'}
                                    </span>
                                </div>
                                {selectedEvent.category && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded-full mt-2">
                                        <Tag size={10} />
                                        {selectedEvent.category.name}
                                    </span>
                                )}
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                                    <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Penyelenggara</span>
                                    <h5 className="text-sm font-bold text-neutral-800 mt-1">{selectedEvent.user?.name || 'Anonim'}</h5>
                                    <span className="text-xs text-gray-400">{selectedEvent.user?.email}</span>
                                </div>
                                <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                                    <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Tipe Event</span>
                                    <h5 className="text-sm font-bold text-neutral-800 mt-1 flex items-center gap-1.5">
                                        {selectedEvent.type === 'online' ? <Monitor size={14} className="text-blue-500" /> : <MapPin size={14} className="text-red-500" />}
                                        {selectedEvent.type === 'online' ? 'Online' : 'Offline'}
                                    </h5>
                                </div>
                                <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                                    <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Waktu Mulai</span>
                                    <h5 className="text-sm font-bold text-neutral-800 mt-1 flex items-center gap-1.5">
                                        <Calendar size={14} className="text-neutral-400" />
                                        {formatIndonesianDateShort(selectedEvent.start_datetime)}
                                    </h5>
                                </div>
                                <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                                    <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Waktu Selesai</span>
                                    <h5 className="text-sm font-bold text-neutral-800 mt-1 flex items-center gap-1.5">
                                        <Calendar size={14} className="text-neutral-400" />
                                        {selectedEvent.end_datetime ? formatIndonesianDateShort(selectedEvent.end_datetime) : '-'}
                                    </h5>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-2xl border border-neutral-200 bg-white p-3 text-center">
                                    <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">Views</span>
                                    <p className="text-lg font-black text-neutral-800 mt-0.5 flex items-center justify-center gap-1">
                                        <Eye size={14} className="text-neutral-400" />
                                        {selectedEvent.view_count || 0}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-neutral-200 bg-white p-3 text-center">
                                    <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">Peserta</span>
                                    <p className="text-lg font-black text-neutral-800 mt-0.5 flex items-center justify-center gap-1">
                                        <Users size={14} className="text-neutral-400" />
                                        {selectedEvent.event_registrations_count ?? 0}{selectedEvent.capacity ? ` / ${selectedEvent.capacity}` : ''}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-neutral-200 bg-white p-3 text-center">
                                    <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">Harga</span>
                                    <p className="text-lg font-black text-neutral-800 mt-0.5">
                                        {selectedEvent.price === 0 || !selectedEvent.price ? 'Gratis' : `Rp ${Number(selectedEvent.price).toLocaleString('id-ID')}`}
                                    </p>
                                </div>
                            </div>

                            {/* Location / Platform */}
                            {selectedEvent.type === 'offline' && selectedEvent.location_name && (
                                <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                                    <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Lokasi</span>
                                    <h5 className="text-sm font-bold text-neutral-800 mt-1">{selectedEvent.location_name}</h5>
                                    {selectedEvent.address && (
                                        <p className="text-xs font-medium text-neutral-500 mt-0.5">{selectedEvent.address}</p>
                                    )}
                                </div>
                            )}
                            {selectedEvent.type === 'online' && selectedEvent.platform_name && (
                                <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                                    <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Platform</span>
                                    <h5 className="text-sm font-bold text-neutral-800 mt-1">{selectedEvent.platform_name}</h5>
                                </div>
                            )}

                            {/* Description */}
                            {selectedEvent.description && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Deskripsi</span>
                                    <p className="text-sm font-medium text-neutral-700 leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-200 whitespace-pre-line line-clamp-6">
                                        {selectedEvent.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-neutral-100 p-6 flex gap-3 bg-neutral-50/50 shrink-0">
                            {selectedEvent.status !== 'banned' && selectedEvent.status !== 'cancelled' && (
                                <button
                                    onClick={() => handleBanEvent(selectedEvent.id, selectedEvent.title)}
                                    disabled={processing}
                                    className="flex-1 rounded-full bg-red-600 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Ban / Blokir Event
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setSelectedEvent(null)}
                                className="flex-1 rounded-full border border-neutral-300 bg-white py-3 text-center text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
