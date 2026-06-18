import { Head, useForm, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    BarChart2,
    Calendar,
    CheckCircle,
    Edit3,
    Eye,
    Filter,
    History,
    Lock,
    LogOut,
    MapPin,
    Monitor,
    Pencil,
    Plus,
    Search,
    ShieldAlert,
    Tag,
    Trash2,
    Unlock,
    Users,
    X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import Pagination from '@/components/ui/Pagination';
import { formatIndonesianDateShort } from '@/lib/utils';
import DefaultCover from '@/../../public/covers/default_cover.jpg';
import faviconUrl from '@/../../public/favicon.svg';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    suspended_at?: string | null;
    created_at?: string;
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

interface Category {
    id: number;
    name: string;
    slug: string;
    created_at?: string;
}

interface AuditLog {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    action: string;
    target_type: string;
    target_id: number | null;
    details: any;
    created_at: string;
}

interface ModerationBaseProps {
    reports?: Report[];
    events?: Event[];
    stats?: {
        total_events: number;
        active_events: number;
        banned_events: number;
        cancelled_events: number;
        total_users: number;
        total_reports: number;
        pending_reports: number;
        resolved_reports: number;
        total_views: number;
        total_registrations: number;
        category_distribution: {
            id: number;
            name: string;
            events_count: number;
        }[];
    };
    categories?: Category[];
    users?: User[];
    auditLogs?: AuditLog[];
    auth: {
        user: User;
    };
}

const ITEMS_PER_PAGE = 10;

const REPORT_REASONS = ['Spam', 'Konten Tidak Layak / Seksual', 'Penipuan / Scam', 'Pelanggaran Hak Cipta', 'Lainnya'];



export default function ModerationBase({
    reports = [],
    events = [],
    stats = {
        total_events: 0,
        active_events: 0,
        banned_events: 0,
        cancelled_events: 0,
        total_users: 0,
        total_reports: 0,
        pending_reports: 0,
        resolved_reports: 0,
        total_views: 0,
        total_registrations: 0,
        category_distribution: [],
    },
    categories = [],
    users = [],
    auditLogs = [],
    auth,
}: ModerationBaseProps) {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'laporan' | 'semua_laporan' | 'events' | 'users' | 'categories' | 'audit_logs'>('dashboard');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [eventSearchQuery, setEventSearchQuery] = useState('');
    const [eventStatusFilter, setEventStatusFilter] = useState<'all' | 'active' | 'banned' | 'cancelled'>('all');
    const [pendingReasonFilter, setPendingReasonFilter] = useState<string>('all');
    const [resolvedReasonFilter, setResolvedReasonFilter] = useState<string>('all');

    // User Management State
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'user' | 'admin' | 'super_admin'>('all');
    const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

    // Category Management State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryFormName, setCategoryFormName] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Pagination state
    const [pendingPage, setPendingPage] = useState(1);
    const [resolvedPage, setResolvedPage] = useState(1);
    const [eventsPage, setEventsPage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);
    const [categoriesPage, setCategoriesPage] = useState(1);
    const [auditPage, setAuditPage] = useState(1);

    const { post, put, delete: destroy, processing } = useForm();

    useEffect(() => {
        const lenis = (window as any).lenis;

        if (selectedReport || selectedEvent) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';

            if (lenis) {
                lenis.stop();
            }
        } else {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';

            if (lenis) {
                lenis.start();
            }
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';

            if (lenis) {
                lenis.start();
            }
        };
    }, [selectedReport, selectedEvent]);

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

    // User actions
    const handleSuspendUser = (user: User) => {
        if (confirm(`Apakah Anda yakin ingin menangguhkan (suspend) user "${user.name}"?`)) {
            router.post(`/admin/users/${user.id}/suspend`);
        }
    };

    const handleUnsuspendUser = (user: User) => {
        if (confirm(`Apakah Anda yakin ingin mengaktifkan kembali (unsuspend) user "${user.name}"?`)) {
            router.post(`/admin/users/${user.id}/unsuspend`);
        }
    };

    const handleChangeRole = (user: User, newRole: string) => {
        if (confirm(`Apakah Anda yakin ingin mengubah role "${user.name}" menjadi "${newRole}"?`)) {
            router.post(`/admin/users/${user.id}/change-role`, { role: newRole });
        }
    };

    // Category actions
    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            router.put(`/admin/categories/${editingCategory.id}`, { name: categoryFormName }, {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                    setCategoryFormName('');
                    setEditingCategory(null);
                }
            });
        } else {
            router.post('/admin/categories', { name: categoryFormName }, {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                    setCategoryFormName('');
                }
            });
        }
    };

    const handleDeleteCategory = (cat: Category) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`)) {
            router.delete(`/admin/categories/${cat.id}`);
        }
    };

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                                  u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
            const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
            const matchesStatus = userStatusFilter === 'all' || 
                (userStatusFilter === 'suspended' ? u.suspended_at !== null : u.suspended_at === null);
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, userSearchQuery, userRoleFilter, userStatusFilter]);

    // Paginated users
    const paginatedUsers = useMemo(() => {
        return filteredUsers.slice((usersPage - 1) * ITEMS_PER_PAGE, usersPage * ITEMS_PER_PAGE);
    }, [filteredUsers, usersPage]);

    const usersTotalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    // Paginated categories
    const paginatedCategories = useMemo(() => {
        return categories.slice((categoriesPage - 1) * ITEMS_PER_PAGE, categoriesPage * ITEMS_PER_PAGE);
    }, [categories, categoriesPage]);

    const categoriesTotalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

    // Paginated audit logs
    const paginatedLogs = useMemo(() => {
        return auditLogs.slice((auditPage - 1) * ITEMS_PER_PAGE, auditPage * ITEMS_PER_PAGE);
    }, [auditLogs, auditPage]);

    const logsTotalPages = Math.ceil(auditLogs.length / ITEMS_PER_PAGE);

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
        <div className="flex h-screen w-screen overflow-hidden bg-neutral-100 select-none">
            <Head title="Moderasi Admin - Lokacara" />

            {/* Sidebar */}
            <div className="w-80 border-r border-neutral-200 bg-white flex flex-col h-full shrink-0">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-neutral-200 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 shrink-0">
                        <img
                            src={faviconUrl}
                            alt="Lokacara"
                            className="h-7.5 w-6 animate-logo-wave"
                        />
                    </div>

                    <div>
                        <h2 className="font-brand text-base font-black text-neutral-900 leading-tight">
                            Admin Dashboard
                        </h2>
                    </div>
                </div>

                {/* Sidebar Navigation Links */}
                <div className="grow p-4 flex flex-col gap-2 overflow-y-auto" data-lenis-prevent>
                    <button
                        onClick={() => {
                            setActiveTab('dashboard');
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all cursor-pointer ${
                            activeTab === 'dashboard'
                                ? 'bg-primary-500 text-white shadow-md shadow-primary-200/50'
                                : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                    >
                        <span className="flex items-center gap-2.5">
                            <BarChart2 size={16} />
                            <span>Analitik & Ringkasan</span>
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('laporan');
                            setPendingPage(1);
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all cursor-pointer ${
                            activeTab === 'laporan'
                                ? 'bg-primary-500 text-white shadow-md shadow-primary-200/50'
                                : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                    >
                        <span className="flex items-center gap-2.5">
                            <AlertTriangle size={16} />
                            <span>Laporan Pending</span>
                        </span>

                        <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                            activeTab === 'laporan' ? 'bg-white text-primary-600' : 'bg-primary-50 text-primary-600'
                        }`}>
                            {totalPendingCount}
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('semua_laporan');
                            setResolvedPage(1);
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all cursor-pointer ${
                            activeTab === 'semua_laporan'
                                ? 'bg-primary-500 text-white shadow-md shadow-primary-200/50'
                                : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                    >
                        <span className="flex items-center gap-2.5">
                            <CheckCircle size={16} />
                            <span>Riwayat Laporan</span>
                        </span>

                        <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                            activeTab === 'semua_laporan' ? 'bg-white text-primary-600' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                            {totalResolvedCount}
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('events');
                            setEventsPage(1);
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all cursor-pointer ${
                            activeTab === 'events'
                                ? 'bg-primary-500 text-white shadow-md shadow-primary-200/50'
                                : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                    >
                        <span className="flex items-center gap-2.5">
                            <Calendar size={16} />
                            <span>Kelola Event</span>
                        </span>

                        <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                            activeTab === 'events' ? 'bg-white text-primary-600' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                            {events.length}
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('users');
                            setUsersPage(1);
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all cursor-pointer ${
                            activeTab === 'users'
                                ? 'bg-primary-500 text-white shadow-md shadow-primary-200/50'
                                : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                    >
                        <span className="flex items-center gap-2.5">
                            <Users size={16} />
                            <span>Kelola Pengguna</span>
                        </span>

                        <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                            activeTab === 'users' ? 'bg-white text-primary-600' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                            {users.length}
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('categories');
                            setCategoriesPage(1);
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all cursor-pointer ${
                            activeTab === 'categories'
                                ? 'bg-primary-500 text-white shadow-md shadow-primary-200/50'
                                : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                    >
                        <span className="flex items-center gap-2.5">
                            <Tag size={16} />
                            <span>Kelola Kategori</span>
                        </span>

                        <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                            activeTab === 'categories' ? 'bg-white text-primary-600' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                            {categories.length}
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('audit_logs');
                            setAuditPage(1);
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all cursor-pointer ${
                            activeTab === 'audit_logs'
                                ? 'bg-primary-500 text-white shadow-md shadow-primary-200/50'
                                : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                    >
                        <span className="flex items-center gap-2.5">
                            <History size={16} />
                            <span>Log Aktivitas</span>
                        </span>

                        <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                            activeTab === 'audit_logs' ? 'bg-white text-primary-600' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                            {auditLogs.length}
                        </span>
                    </button>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-primary-200 bg-primary-50/50 px-4 py-3 text-sm font-bold text-primary-600 hover:bg-primary-50/80 transition-all cursor-pointer"
                    >
                        <LogOut size={16} />

                        <span>Keluar Panel</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grow flex flex-col h-full overflow-hidden">
                {/* Top Bar */}
                <div className="h-20 border-b border-neutral-200 bg-white px-8 flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="font-brand text-lg font-black text-neutral-900 leading-tight">
                            {activeTab === 'dashboard' && 'Analitik & Ringkasan'}
                            {activeTab === 'laporan' && 'Laporan Masuk (Pending)'}
                            {activeTab === 'semua_laporan' && 'Riwayat Laporan (Resolved)'}
                            {activeTab === 'events' && 'Kelola Daftar Event'}
                            {activeTab === 'users' && 'Kelola Pengguna'}
                            {activeTab === 'categories' && 'Kelola Kategori'}
                            {activeTab === 'audit_logs' && 'Log Aktivitas'}
                        </h1>

                        <p className="text-xs font-semibold text-gray-400 mt-0.5">
                            {activeTab === 'dashboard' && 'Data statistik platform Lokacara.'}
                            {activeTab === 'laporan' && 'Tinjau laporan masuk dari peserta event.'}
                            {activeTab === 'semua_laporan' && 'Daftar laporan yang telah diselesaikan atau diabaikan.'}
                            {activeTab === 'events' && 'Lihat detail, lakukan pemblokiran, atau kelola seluruh event.'}
                            {activeTab === 'users' && 'Kelola akun pengguna, ubah role, dan tangguhkan akun jika melanggar ketentuan.'}
                            {activeTab === 'categories' && 'Kelola kategori acara yang tersedia pada platform Lokacara.'}
                            {activeTab === 'audit_logs' && 'Daftar riwayat aksi administratif dan moderasi yang dilakukan.'}
                        </p>
                    </div>
                </div>

                {/* Scrollable Content Body */}
                <div className="grow overflow-y-auto p-8" data-lenis-prevent>
                    <div className="w-full rounded-3xl border border-neutral-200 bg-white p-8 shadow-xs min-h-full">
                        {/* 0. Analytics & Stats Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <div className="flex flex-col gap-8">
                                <div className="flex flex-col gap-3">
                                    <h3 className="font-brand text-h5-mobile font-black text-neutral-800 lg:text-h5-web">
                                        Analitik & Ringkasan Data
                                    </h3>
                                    <p className="text-xs text-neutral-400 font-semibold">
                                        Ikhtisar data operasional secara real-time.
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                                    <div className="rounded-3xl border border-neutral-200 bg-neutral-50/50 p-5 flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-neutral-400">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Acara</span>
                                            <Calendar size={18} className="text-primary-500" />
                                        </div>
                                        <p className="text-3xl font-black text-neutral-900 mt-2">{stats.total_events}</p>
                                        <span className="text-[10px] font-semibold text-neutral-500 mt-1">
                                            {stats.active_events} Aktif • {stats.banned_events} Banned
                                        </span>
                                    </div>

                                    <div className="rounded-3xl border border-neutral-200 bg-neutral-50/50 p-5 flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-neutral-400">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total User</span>
                                            <Users size={18} className="text-primary-500" />
                                        </div>
                                        <p className="text-3xl font-black text-neutral-900 mt-2">{stats.total_users}</p>
                                        <span className="text-[10px] font-semibold text-neutral-500 mt-1">Pengguna terdaftar</span>
                                    </div>

                                    <div className="rounded-3xl border border-neutral-200 bg-neutral-50/50 p-5 flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-neutral-400">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Laporan</span>
                                            <AlertTriangle size={18} className="text-secondary-500" />
                                        </div>
                                        <p className="text-3xl font-black text-neutral-900 mt-2">{stats.total_reports}</p>
                                        <span className="text-[10px] font-semibold text-neutral-500 mt-1">
                                            {stats.pending_reports} Pending • {stats.resolved_reports} Resolved
                                        </span>
                                    </div>

                                    <div className="rounded-3xl border border-neutral-200 bg-neutral-50/50 p-5 flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-neutral-400">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Kunjungan</span>
                                            <Eye size={18} className="text-primary-500" />
                                        </div>
                                        <p className="text-3xl font-black text-neutral-900 mt-2">{stats.total_views.toLocaleString('id-ID')}</p>
                                        <span className="text-[10px] font-semibold text-neutral-500 mt-1">Total views event</span>
                                    </div>

                                    <div className="rounded-3xl border border-neutral-200 bg-neutral-50/50 p-5 flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-neutral-400">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Partisipan</span>
                                            <Activity size={18} className="text-green-500" />
                                        </div>
                                        <p className="text-3xl font-black text-neutral-900 mt-2">{stats.total_registrations.toLocaleString('id-ID')}</p>
                                        <span className="text-[10px] font-semibold text-neutral-500 mt-1">Pendaftaran tiket</span>
                                    </div>
                                </div>

                                {/* Content Columns */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
                                    {/* Category Distribution list */}
                                    <div className="lg:col-span-2 rounded-3xl border border-neutral-200 p-6 flex flex-col gap-4">
                                        <h4 className="font-brand text-sm font-black text-neutral-800">Distribusi Kategori Acara</h4>
                                        <div className="flex flex-col gap-4 mt-2">
                                            {stats.category_distribution.length === 0 ? (
                                                <p className="text-xs text-neutral-400 font-semibold py-4 text-center">Belum ada kategori terdaftar.</p>
                                            ) : (
                                                stats.category_distribution.map((cat) => {
                                                    const percentage = stats.total_events > 0 
                                                        ? Math.round((cat.events_count / stats.total_events) * 100) 
                                                        : 0;
                                                    return (
                                                        <div key={cat.id} className="flex flex-col gap-1.5">
                                                            <div className="flex justify-between items-center text-xs font-bold text-neutral-700">
                                                                <span>{cat.name}</span>
                                                                <span>{cat.events_count} Acara ({percentage}%)</span>
                                                            </div>
                                                            <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="bg-primary-500 h-full rounded-full transition-all duration-500" 
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Info / Links */}
                                    <div className="rounded-3xl border border-neutral-200 p-6 flex flex-col justify-between gap-6">
                                        <div className="flex flex-col gap-4">
                                            <h4 className="font-brand text-sm font-black text-neutral-800">Status Tindak Lanjut</h4>
                                            <div className="flex flex-col gap-3 mt-2">
                                                <div className="flex justify-between items-center text-xs font-bold p-3 bg-secondary-50 rounded-2xl border border-secondary-200 text-secondary-800">
                                                    <span>Laporan Belum Direview</span>
                                                    <span>{stats.pending_reports} Laporan</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs font-bold p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-neutral-700">
                                                    <span>Laporan Selesai Direview</span>
                                                    <span>{stats.resolved_reports} Laporan</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setActiveTab('laporan')}
                                            className="w-full text-center font-bold text-xs bg-primary-500 text-white py-3.5 rounded-full hover:bg-primary-600 transition-colors shadow-md shadow-primary-200/50 cursor-pointer"
                                        >
                                            Review Laporan Pending
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                                className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/40 p-4 transition-all hover:shadow-xs hover:border-primary-200 cursor-pointer"
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <span className="rounded-full bg-secondary-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-secondary-800 select-none">
                                                            {report.reason}
                                                        </span>
                                                        <h4 className="font-brand text-base font-black text-neutral-900 mt-2">
                                                            Laporan: {report.event?.title || 'Event Terhapus'}
                                                        </h4>
                                                        <p className="text-xs font-semibold text-gray-400 mt-1">
                                                            Dilaporkan oleh <span className="text-neutral-700 font-bold">{report.user?.name}</span> pada {formatIndonesianDateShort(report.created_at)}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs font-extrabold text-primary-500 flex items-center gap-1 shrink-0 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors">
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
                                            value={eventSearchQuery}
                                            onChange={(e) => handleEventSearchChange(e.target.value)}
                                            className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2.5 pl-11 pr-5 text-sm font-semibold text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none"
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

                        {/* 4. Manage Users Tab */}
                        {activeTab === 'users' && (
                            <div className="flex flex-col gap-5">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-brand text-h5-mobile font-black text-neutral-800 lg:text-h5-web">
                                        Kelola Pengguna
                                    </h3>
                                    <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-extrabold text-primary-600">
                                        {users.length} Total
                                    </span>
                                </div>

                                {/* Filtering Bar */}
                                <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between border-b border-neutral-100 pb-4">
                                    {/* Search Input */}
                                    <div className="relative flex-1 max-w-sm">
                                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari user berdasarkan nama/email..."
                                            value={userSearchQuery}
                                            onChange={(e) => {
                                                setUserSearchQuery(e.target.value);
                                                setUsersPage(1);
                                            }}
                                            className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2.5 pl-11 pr-5 text-sm font-semibold text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none"
                                        />
                                    </div>

                                    {/* Filters */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <Filter size={14} className="text-neutral-400" />
                                            <select
                                                value={userRoleFilter}
                                                onChange={(e) => {
                                                    setUserRoleFilter(e.target.value as any);
                                                    setUsersPage(1);
                                                }}
                                                className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-600 focus:outline-none"
                                            >
                                                <option value="all">Semua Role</option>
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="super_admin">Super Admin</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Filter size={14} className="text-neutral-400" />
                                            <select
                                                value={userStatusFilter}
                                                onChange={(e) => {
                                                    setUserStatusFilter(e.target.value as any);
                                                    setUsersPage(1);
                                                }}
                                                className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-600 focus:outline-none"
                                            >
                                                <option value="all">Semua Status</option>
                                                <option value="active">Aktif</option>
                                                <option value="suspended">Ditangguhkan</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Users Table */}
                                {paginatedUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <Search size={48} className="text-neutral-300 mb-4" />
                                        <h4 className="text-base font-bold text-neutral-700">Tidak ada pengguna yang ditemukan.</h4>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse table-fixed">
                                            <thead>
                                                <tr className="border-b border-neutral-100 text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
                                                    <th className="pb-3 pl-2 w-[35%]">Nama / Email</th>
                                                    <th className="pb-3 w-[15%]">Role</th>
                                                    <th className="pb-3 w-[15%]">Status</th>
                                                    <th className="pb-3 w-[35%] pl-2">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedUsers.map((user) => (
                                                    <tr key={user.id} className="border-b border-neutral-100/50 hover:bg-neutral-50/50 transition-colors">
                                                        <td className="py-4 pl-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-neutral-900 truncate max-w-[280px]" title={user.name}>
                                                                    {user.name}
                                                                </span>
                                                                <span className="text-xs text-gray-400 font-semibold truncate max-w-[280px]" title={user.email}>
                                                                    {user.email}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4">
                                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase select-none ${
                                                                user.role === 'super_admin'
                                                                    ? 'bg-purple-100 text-purple-800'
                                                                    : user.role === 'admin'
                                                                    ? 'bg-primary-100 text-primary-800'
                                                                    : 'bg-neutral-100 text-neutral-600'
                                                            }`}>
                                                                {user.role === 'super_admin' ? 'SUPER ADMIN' : user.role === 'admin' ? 'ADMIN' : 'USER'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4">
                                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase select-none ${
                                                                user.suspended_at
                                                                    ? 'bg-secondary-100 text-secondary-800'
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}>
                                                                {user.suspended_at ? 'DITANGGUHKAN' : 'AKTIF'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 pl-2">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {/* Suspend / Unsuspend action */}
                                                                {user.id !== auth.user.id && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => user.suspended_at ? handleUnsuspendUser(user) : handleSuspendUser(user)}
                                                                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
                                                                            user.suspended_at
                                                                                ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                                                                                : 'border-secondary-300 bg-secondary-50 text-secondary-700 hover:bg-secondary-100'
                                                                        }`}
                                                                    >
                                                                        {user.suspended_at ? <Unlock size={12} /> : <Lock size={12} />}
                                                                        <span>{user.suspended_at ? 'Buka Suspend' : 'Suspend'}</span>
                                                                    </button>
                                                                )}

                                                                {/* Role Promotion / Demotion action (Super Admin only) */}
                                                                {auth.user.role === 'super_admin' && user.id !== auth.user.id && (
                                                                    <div className="flex items-center gap-1">
                                                                        {user.role === 'admin' ? (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleChangeRole(user, 'user')}
                                                                                className="inline-flex items-center gap-1 rounded-full border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
                                                                            >
                                                                                <span>Demote ke User</span>
                                                                            </button>
                                                                        ) : (
                                                                            user.role === 'user' && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleChangeRole(user, 'admin')}
                                                                                    className="inline-flex items-center gap-1 rounded-full border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
                                                                                >
                                                                                    <span>Promote ke Admin</span>
                                                                                </button>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <Pagination currentPage={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
                            </div>
                        )}

                        {/* 5. Manage Categories Tab */}
                        {activeTab === 'categories' && (
                            <div className="flex flex-col gap-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-brand text-h5-mobile font-black text-neutral-800 lg:text-h5-web">
                                            Kelola Kategori
                                        </h3>
                                        <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-extrabold text-primary-600">
                                            {categories.length} Total
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingCategory(null);
                                            setCategoryFormName('');
                                            setIsCategoryModalOpen(true);
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-xs font-bold text-white hover:bg-primary-600 transition-colors shadow-md shadow-primary-200/50 cursor-pointer"
                                    >
                                        <Plus size={14} />
                                        <span>Tambah Kategori</span>
                                    </button>
                                </div>

                                {/* Categories Table */}
                                {paginatedCategories.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <Tag size={48} className="text-neutral-300 mb-4" />
                                        <h4 className="text-base font-bold text-neutral-700">Tidak ada kategori.</h4>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse table-fixed">
                                            <thead>
                                                <tr className="border-b border-neutral-100 text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
                                                    <th className="pb-3 pl-2 w-[45%]">Nama Kategori</th>
                                                    <th className="pb-3 w-[35%]">Slug</th>
                                                    <th className="pb-3 text-left pl-2 w-[20%]">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedCategories.map((cat) => (
                                                    <tr key={cat.id} className="border-b border-neutral-100/50 hover:bg-neutral-50/50 transition-colors">
                                                        <td className="py-4 pl-2 text-sm font-bold text-neutral-900">
                                                            {cat.name}
                                                        </td>
                                                        <td className="py-4 text-sm font-medium text-neutral-500">
                                                            {cat.slug}
                                                        </td>
                                                        <td className="py-4 text-left pl-2">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingCategory(cat);
                                                                        setCategoryFormName(cat.name);
                                                                        setIsCategoryModalOpen(true);
                                                                    }}
                                                                    className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                                                                >
                                                                    <Pencil size={12} />
                                                                    <span>Edit</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteCategory(cat)}
                                                                    className="inline-flex items-center gap-1 rounded-full border border-secondary-300 bg-secondary-50 px-2.5 py-1.5 text-xs font-bold text-secondary-600 hover:bg-secondary-100 transition-colors cursor-pointer"
                                                                >
                                                                    <Trash2 size={12} />
                                                                    <span>Hapus</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <Pagination currentPage={categoriesPage} totalPages={categoriesTotalPages} onPageChange={setCategoriesPage} />
                            </div>
                        )}

                        {/* 6. Log Aktivitas Tab */}
                        {activeTab === 'audit_logs' && (
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
                                <Pagination currentPage={auditPage} totalPages={logsTotalPages} onPageChange={setAuditPage} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals and Overlays */}
            {/* 1. Category Modal (Create/Edit) */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs select-none">
                    <div className="animate-in fade-in zoom-in-95 relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 shrink-0">
                            <h3 className="font-brand text-lg font-black text-neutral-900">
                                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsCategoryModalOpen(false);
                                    setCategoryFormName('');
                                    setEditingCategory(null);
                                }}
                                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {/* Form Body */}
                        <form onSubmit={handleSaveCategory}>
                            <div className="p-6 flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
                                        Nama Kategori
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Nama kategori baru..."
                                        value={categoryFormName}
                                        onChange={(e) => setCategoryFormName(e.target.value)}
                                        className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-800 focus:border-primary-500 focus:bg-white focus:outline-none"
                                    />
                                </div>
                            </div>
                            {/* Footer */}
                            <div className="border-t border-neutral-100 p-6 flex gap-3 bg-neutral-50/50 shrink-0">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 rounded-full bg-primary-500 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-primary-600 transition-colors cursor-pointer"
                                >
                                    Simpan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCategoryModalOpen(false);
                                        setCategoryFormName('');
                                        setEditingCategory(null);
                                    }}
                                    className="flex-1 rounded-full border border-neutral-300 bg-white py-3 text-center text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Detail Report Modal */}
            {selectedReport && (
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
                        <div className="grow overflow-y-auto p-6 flex flex-col gap-5" data-lenis-prevent>
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
                                    <span className="text-sm font-black text-secondary-600">{selectedReport.reason}</span>
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
                                    className="flex-1 rounded-full bg-secondary-500 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-secondary-600 transition-colors cursor-pointer"
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
                    <div className="animate-in fade-in zoom-in-95 relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
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
                        <div className="grow overflow-y-auto p-6 flex flex-col gap-5" data-lenis-prevent>
                            {/* Cover Image */}
                            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-neutral-200 shrink-0 shadow-xs">
                                <img
                                    src={selectedEvent.poster_url || DefaultCover}
                                    alt={selectedEvent.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            {/* Title & Status */}
                            <div>
                                <div className="flex items-start justify-between gap-3">
                                    <h4 className="font-brand text-xl font-black text-neutral-900 leading-tight">
                                        {selectedEvent.title}
                                    </h4>
                                    <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase select-none ${
                                        selectedEvent.status === 'banned'
                                            ? 'bg-secondary-100 text-secondary-800'
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
                                        {selectedEvent.type === 'online' ? <Monitor size={14} className="text-primary-500" /> : <MapPin size={14} className="text-secondary-500" />}
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
                                    <p className="text-sm font-medium text-neutral-700 leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-200 whitespace-pre-line">
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
                                    className="flex-1 rounded-full bg-secondary-500 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-secondary-600 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
