import React from 'react';
import {
    BarChart2,
    AlertTriangle,
    CheckCircle,
    Calendar,
    Users,
    Tag,
    History,
    LogOut,
} from 'lucide-react';
import faviconUrl from '@/../../public/favicon.svg';
import { User, Event, Report, Category, AuditLog } from '../types';

interface AdminSidebarProps {
    activeTab: 'dashboard' | 'laporan' | 'semua_laporan' | 'events' | 'users' | 'categories' | 'audit_logs';
    setActiveTab: (tab: 'dashboard' | 'laporan' | 'semua_laporan' | 'events' | 'users' | 'categories' | 'audit_logs') => void;
    reportsCount: number;
    resolvedReportsCount: number;
    eventsCount: number;
    usersCount: number;
    categoriesCount: number;
    auditLogsCount: number;
    onLogout: () => void;
}

export default function AdminSidebar({
    activeTab,
    setActiveTab,
    reportsCount,
    resolvedReportsCount,
    eventsCount,
    usersCount,
    categoriesCount,
    auditLogsCount,
    onLogout,
}: AdminSidebarProps) {
    return (
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
                    onClick={() => setActiveTab('dashboard')}
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
                    onClick={() => setActiveTab('laporan')}
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
                        {reportsCount}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('semua_laporan')}
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
                        {resolvedReportsCount}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('events')}
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
                        {eventsCount}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('users')}
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
                        {usersCount}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('categories')}
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
                        {categoriesCount}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('audit_logs')}
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
                        {auditLogsCount}
                    </span>
                </button>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 shrink-0">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl border border-primary-200 bg-primary-50/50 px-4 py-3 text-sm font-bold text-primary-600 hover:bg-primary-50/80 transition-all cursor-pointer"
                >
                    <LogOut size={16} />
                    <span>Keluar Panel</span>
                </button>
            </div>
        </div>
    );
}
