import React from 'react';

interface AdminTopBarProps {
    activeTab: 'dashboard' | 'laporan' | 'semua_laporan' | 'events' | 'users' | 'categories' | 'audit_logs';
}

export default function AdminTopBar({ activeTab }: AdminTopBarProps) {
    const titles = {
        dashboard: 'Analitik & Ringkasan',
        laporan: 'Laporan Masuk (Pending)',
        semua_laporan: 'Riwayat Laporan (Resolved)',
        events: 'Kelola Daftar Event',
        users: 'Kelola Pengguna',
        categories: 'Kelola Kategori',
        audit_logs: 'Log Aktivitas',
    };

    const subtitles = {
        dashboard: 'Ikhtisar data statistik platform Lokacara.',
        laporan: 'Tinjau laporan masuk dari peserta event.',
        semua_laporan: 'Daftar laporan yang telah diselesaikan atau diabaikan.',
        events: 'Lihat detail, lakukan pemblokiran, atau kelola seluruh event.',
        users: 'Kelola akun pengguna, ubah role, dan tangguhkan akun jika melanggar ketentuan.',
        categories: 'Kelola kategori acara yang tersedia pada platform Lokacara.',
        audit_logs: 'Daftar riwayat aksi administratif dan moderasi yang dilakukan.',
    };

    return (
        <div className="h-20 border-b border-neutral-200 bg-white px-8 flex items-center justify-between shrink-0">
            <div>
                <h1 className="font-brand text-lg font-black text-neutral-900 leading-tight">
                    {titles[activeTab]}
                </h1>

                <p className="text-xs font-semibold text-gray-400 mt-0.5">
                    {subtitles[activeTab]}
                </p>
            </div>
        </div>
    );
}
