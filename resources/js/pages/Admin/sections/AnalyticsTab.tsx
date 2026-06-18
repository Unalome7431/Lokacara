import React from 'react';
import {
    Activity,
    AlertTriangle,
    Calendar,
    Eye,
    Users,
} from 'lucide-react';
import { ModerationBaseProps } from '../types';

interface AnalyticsTabProps {
    stats: NonNullable<ModerationBaseProps['stats']>;
    setActiveTab: (tab: 'dashboard' | 'laporan' | 'semua_laporan' | 'events' | 'users' | 'categories' | 'audit_logs') => void;
}

export default function AnalyticsTab({ stats, setActiveTab }: AnalyticsTabProps) {
    return (
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
                                <span>Laporan Belum Diulas</span>
                                <span>{stats.pending_reports} Laporan</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-neutral-700">
                                <span>Laporan Selesai Diulas</span>
                                <span>{stats.resolved_reports} Laporan</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setActiveTab('laporan')}
                        className="w-full text-center font-bold text-xs bg-primary-500 text-white py-3.5 rounded-full hover:bg-primary-600 transition-colors shadow-md shadow-primary-200/50 cursor-pointer"
                    >
                        Ulas Laporan Pending
                    </button>
                </div>
            </div>
        </div>
    );
}
