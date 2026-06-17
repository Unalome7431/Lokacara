import React from 'react';
import faviconUrl from '@/../../public/favicon.svg';

export default function Tentang() {
    return (
        <div className="animate-in fade-in flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm duration-200 md:p-8">
            <div className="flex items-center gap-4 border-b border-neutral-100 pb-4">
                <img
                    src={faviconUrl}
                    alt="Lokacara"
                    className="h-12 w-10 shrink-0"
                />
                <div>
                    <h3 className="mb-1 font-brand text-h3-mobile leading-none font-black tracking-tight text-primary-500 lg:text-h3-web">
                        lokacara
                    </h3>
                    <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[0.6rem] font-bold tracking-wider text-gray-500">
                        VERSI 1.0.0
                    </span>
                </div>
            </div>

            <p className="text-base leading-relaxed text-neutral-700">
                Lokacara adalah platform manajemen dan pendaftaran event komunitas yang
                dirancang khusus untuk pasar Indonesia. Platform ini memudahkan komunitas dalam
                membuat, mengelola, menyelenggarakan, dan mendistribusikan e-sertifikat kepada
                para peserta secara efisien, transparan, dan terintegrasi.
            </p>

            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                    <h5 className="mb-1 font-brand text-sm font-black text-neutral-800">
                        Organizer Hub
                    </h5>
                    <p className="text-micro leading-snug text-gray-500">
                        Kelola pembuatan event, daftar peserta, dan edit detail event
                        secara online maupun offline dengan integrasi Google Maps.
                    </p>
                </div>
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                    <h5 className="mb-1 font-brand text-sm font-black text-neutral-800">
                        E-Sertifikat Cepat
                    </h5>
                    <p className="text-micro leading-snug text-gray-500">
                        Distribusi sertifikat otomatis ke seluruh peserta event hanya
                        dengan satu klik ketika event selesai.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-1 border-t border-gray-100 pt-6 text-micro font-semibold text-gray-400">
                <span>
                    © 2026 Lokacara Team. Semua Hak Dilindungi.
                </span>
                <span>
                    Didesain dengan cinta untuk memajukan komunitas-komunitas hebat
                    di Indonesia.
                </span>
            </div>
        </div>
    );
}
