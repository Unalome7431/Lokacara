import { Head, router, useForm, usePage } from '@inertiajs/react';
import { User, Lock, Camera, Info, ShieldAlert } from 'lucide-react';
import React, { useState } from 'react';
import defaultAvatar from '@/../../public/avatars/default.png';
import faviconUrl from '@/../../public/favicon.svg';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';

interface UserData {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
    email_verified_at?: string | null;
}

interface PageProps {
    auth?: {
        user?: UserData;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Profile() {
    const page = usePage<PageProps>();
    const { auth, flash } = page.props;
    const user = auth?.user;

    const [activeTab, setActiveTab] = useState<'Akun' | 'Tentang'>('Akun');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handleSendOtp = () => {
        router.post('/settings/send-otp');
    };

    // Form 1: Profile Details Form
    const profileForm = useForm({
        name: user?.name || '',
        email: user?.email || '',
        avatar: null as File | null,
    });

    // Form 2: Password Reset Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post('/profile', {
            preserveScroll: true,
            onSuccess: () => {
                profileForm.reset('avatar');
                setAvatarPreview(null);
            },
        });
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
            },
        });
    };

    return (
        <div className="flex min-h-screen flex-col justify-between bg-neutral-50/50">
            <div className="flex-grow">
                <NavBar />
                <Head title="Pengaturan Saya - Lokacara" />

                <div className="mx-auto max-w-6xl px-4 pt-28 pb-16 md:px-8">
                    <div className="flex flex-col items-start gap-8 lg:flex-row">
                        {/* Settings Navigation Sidebar */}
                        <div className="flex w-full shrink-0 flex-col gap-1.5 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm lg:w-[280px]">
                            <h3 className="mb-3 px-3 font-brand text-lg font-black tracking-tight text-neutral-800">
                                Pengaturan
                            </h3>

                            <button
                                onClick={() => setActiveTab('Akun')}
                                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 px-4 py-3 text-left text-small font-bold transition-colors duration-150 ${
                                    activeTab === 'Akun'
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-transparent text-gray-500 hover:bg-neutral-50 hover:text-neutral-900'
                                }`}
                            >
                                <User size={18} />
                                <span>Akun Anda</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('Tentang')}
                                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 px-4 py-3 text-left text-small font-bold transition-colors duration-150 ${
                                    activeTab === 'Tentang'
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-transparent text-gray-500 hover:bg-neutral-50 hover:text-neutral-900'
                                }`}
                            >
                                <Info size={18} />
                                <span>Tentang</span>
                            </button>
                        </div>

                        {/* Settings Main Panel */}
                        <div className="w-full flex-grow">
                            {/* Akun Settings Section */}
                            {activeTab === 'Akun' && (
                                <div className="animate-in fade-in flex flex-col gap-8 duration-200">
                                    {/* Flash Message Alerts */}
                                    {flash?.success && (
                                        <div className="animate-in fade-in rounded-2xl border border-green-200 bg-green-50 p-4 text-small font-bold text-green-700 duration-200">
                                            {flash.success}
                                        </div>
                                    )}
                                    {flash?.warning && (
                                        <div className="animate-in fade-in rounded-2xl border border-amber-200 bg-amber-50 p-4 text-small font-bold text-amber-700 duration-200">
                                            {flash.warning}
                                        </div>
                                    )}
                                    {flash?.error && (
                                        <div className="animate-in fade-in rounded-2xl border border-red-200 bg-red-50 p-4 text-small font-bold text-red-700 duration-200">
                                            {flash.error}
                                        </div>
                                    )}

                                    {/* Unverified Email Alert Banner */}
                                    {user && !user.email_verified_at && (
                                        <div className="animate-in fade-in flex flex-col justify-between gap-4 rounded-3xl border border-secondary-300 bg-secondary-100/30 p-6 shadow-sm duration-200 sm:flex-row sm:items-center">
                                            <div className="flex-grow">
                                                <h4 className="font-brand text-base font-black text-secondary-900">
                                                    Email Anda Belum
                                                    Diverifikasi
                                                </h4>
                                                <p className="mt-1 text-[0.7rem] font-medium text-secondary-800">
                                                    Verifikasi email Anda untuk
                                                    dapat membuat event baru dan
                                                    bergabung dengan event
                                                    berbayar.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleSendOtp}
                                                className="cursor-pointer rounded-full bg-secondary-500 px-5 py-2.5 text-small font-bold whitespace-nowrap text-white shadow-md transition-colors hover:bg-secondary-600 focus:outline-none"
                                            >
                                                Verifikasi Sekarang
                                            </button>
                                        </div>
                                    )}

                                    {/* Form 1: Edit Profile Form */}
                                    <form
                                        onSubmit={handleUpdateProfile}
                                        className="flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
                                    >
                                        <div className="border-b border-neutral-100 pb-4">
                                            <h4 className="font-brand text-lg font-black text-neutral-900">
                                                Ubah Profil
                                            </h4>
                                            <p className="text-micro font-medium text-gray-400">
                                                Ubah nama, email, dan foto
                                                profil Anda.
                                            </p>
                                        </div>

                                        {profileForm.wasSuccessful && (
                                            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-small font-bold text-green-700">
                                                Profil berhasil diperbarui!
                                            </div>
                                        )}

                                        {Object.keys(profileForm.errors)
                                            .length > 0 && (
                                            <div className="flex flex-col gap-1 rounded-2xl border border-red-200 bg-red-50 p-4 text-small font-bold text-red-700">
                                                {Object.entries(
                                                    profileForm.errors,
                                                ).map(([key, val]) => (
                                                    <span
                                                        key={key}
                                                        className="flex items-center gap-1.5"
                                                    >
                                                        <ShieldAlert
                                                            size={14}
                                                            className="shrink-0"
                                                        />
                                                        <span>{val}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Avatar Upload Field */}
                                        <div className="flex flex-col items-center gap-3 self-start">
                                            <div className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-neutral-200">
                                                <img
                                                    src={
                                                        avatarPreview ||
                                                        user?.avatar_url ||
                                                        defaultAvatar
                                                    }
                                                    alt={user?.name || 'User'}
                                                    className="h-full w-full object-cover"
                                                />
                                                <label
                                                    htmlFor="avatar-file-input"
                                                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                                                >
                                                    <Camera size={20} />
                                                </label>
                                            </div>

                                            <input
                                                id="avatar-file-input"
                                                type="file"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files?.[0];

                                                    if (file) {
                                                        profileForm.setData(
                                                            'avatar',
                                                            file,
                                                        );
                                                        setAvatarPreview(
                                                            URL.createObjectURL(
                                                                file,
                                                            ),
                                                        );
                                                    }
                                                }}
                                                accept="image/*"
                                                className="hidden"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    document
                                                        .getElementById(
                                                            'avatar-file-input',
                                                        )
                                                        ?.click()
                                                }
                                                className="cursor-pointer border-0 bg-transparent p-0 text-small font-bold text-primary-500 hover:text-primary-600"
                                            >
                                                Unggah Foto Baru
                                            </button>
                                        </div>

                                        {/* Name field */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-brand text-small font-bold text-neutral-700">
                                                Nama Lengkap
                                            </label>
                                            <input
                                                type="text"
                                                value={profileForm.data.name}
                                                onChange={(e) =>
                                                    profileForm.setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                placeholder="Nama lengkap Anda"
                                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base placeholder-gray-400 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none"
                                            />
                                        </div>

                                        {/* Email field */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-brand text-small font-bold text-neutral-700">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={profileForm.data.email}
                                                onChange={(e) =>
                                                    profileForm.setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                placeholder="Alamat email Anda"
                                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base placeholder-gray-400 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={profileForm.processing}
                                            className="cursor-pointer self-end rounded-full bg-primary-500 px-6 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-primary-600 disabled:bg-primary-300"
                                        >
                                            {profileForm.processing
                                                ? 'Menyimpan...'
                                                : 'Simpan Profil'}
                                        </button>
                                    </form>

                                    {/* Form 2: Update Password Form */}
                                    <form
                                        onSubmit={handleUpdatePassword}
                                        className="flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
                                    >
                                        <div className="border-b border-neutral-100 pb-4">
                                            <h4 className="font-brand text-lg font-black text-neutral-900">
                                                Ubah Kata Sandi
                                            </h4>
                                            <p className="text-micro font-medium text-gray-400">
                                                Jaga keamanan akun Anda dengan
                                                memperbarui kata sandi secara
                                                berkala.
                                            </p>
                                        </div>

                                        {passwordForm.wasSuccessful && (
                                            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-small font-bold text-green-700">
                                                Kata sandi berhasil diperbarui!
                                            </div>
                                        )}

                                        {Object.keys(passwordForm.errors)
                                            .length > 0 && (
                                            <div className="flex flex-col gap-1 rounded-2xl border border-red-200 bg-red-50 p-4 text-small font-bold text-red-700">
                                                {Object.entries(
                                                    passwordForm.errors,
                                                ).map(([key, val]) => (
                                                    <span
                                                        key={key}
                                                        className="flex items-center gap-1.5"
                                                    >
                                                        <ShieldAlert
                                                            size={14}
                                                            className="shrink-0"
                                                        />
                                                        <span>{val}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Current Password */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-brand text-small font-bold text-neutral-700">
                                                Kata Sandi Sekarang
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={
                                                        passwordForm.data
                                                            .current_password
                                                    }
                                                    onChange={(e) =>
                                                        passwordForm.setData(
                                                            'current_password',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    placeholder="Kata sandi saat ini"
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pr-10 pl-4 text-base placeholder-gray-400 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none"
                                                />
                                                <Lock
                                                    size={16}
                                                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400"
                                                />
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-brand text-small font-bold text-neutral-700">
                                                Kata Sandi Baru
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={
                                                        passwordForm.data
                                                            .password
                                                    }
                                                    onChange={(e) =>
                                                        passwordForm.setData(
                                                            'password',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    placeholder="Kata sandi baru minimal 8 karakter"
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pr-10 pl-4 text-base placeholder-gray-400 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none"
                                                />
                                                <Lock
                                                    size={16}
                                                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-brand text-small font-bold text-neutral-700">
                                                Konfirmasi Kata Sandi Baru
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={
                                                        passwordForm.data
                                                            .password_confirmation
                                                    }
                                                    onChange={(e) =>
                                                        passwordForm.setData(
                                                            'password_confirmation',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    placeholder="Ulangi kata sandi baru"
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pr-10 pl-4 text-base placeholder-gray-400 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none"
                                                />
                                                <Lock
                                                    size={16}
                                                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={passwordForm.processing}
                                            className="cursor-pointer self-end rounded-full bg-primary-500 px-6 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-primary-600 disabled:bg-primary-300"
                                        >
                                            {passwordForm.processing
                                                ? 'Memperbarui...'
                                                : 'Perbarui Kata Sandi'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Tentang Settings Section */}
                            {activeTab === 'Tentang' && (
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
                                        Lokacara adalah platform manajemen dan
                                        pendaftaran event komunitas yang
                                        dirancang khusus untuk pasar Indonesia.
                                        Platform ini memudahkan komunitas dalam
                                        membuat, mengelola, menyelenggarakan,
                                        dan mendistribusikan e-sertifikat kepada
                                        para peserta secara efisien, transparan,
                                        dan terintegrasi.
                                    </p>

                                    <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                                            <h5 className="mb-1 font-brand text-sm font-black text-neutral-800">
                                                Organizer Hub
                                            </h5>
                                            <p className="text-micro leading-snug text-gray-500">
                                                Kelola pembuatan event, daftar
                                                peserta, dan edit detail event
                                                secara online maupun offline
                                                dengan integrasi Google Maps.
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                                            <h5 className="mb-1 font-brand text-sm font-black text-neutral-800">
                                                E-Sertifikat Cepat
                                            </h5>
                                            <p className="text-micro leading-snug text-gray-500">
                                                Distribusi sertifikat otomatis
                                                ke seluruh peserta event hanya
                                                dengan satu klik ketika event
                                                selesai.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 border-t border-gray-100 pt-6 text-micro font-semibold text-gray-400">
                                        <span>
                                            © 2026 Lokacara Team. Semua Hak
                                            Dilindungi.
                                        </span>
                                        <span>
                                            Didesain dengan cinta untuk
                                            memajukan komunitas-komunitas hebat
                                            di Indonesia.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
