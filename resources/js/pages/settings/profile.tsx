import { Head, useForm, usePage } from '@inertiajs/react';
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
}

interface PageProps {
  auth: {
    user: UserData;
  };
}

export default function Profile() {
  const page = usePage();
  const { auth } = page.props as any as PageProps;
  const user = auth?.user;

  const [activeTab, setActiveTab] = useState<'Akun' | 'Tentang'>('Akun');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
    <div className="min-h-screen bg-neutral-50/50 flex flex-col justify-between">
      <div className="flex-grow">
        <NavBar />
        <Head title="Pengaturan Saya - Lokacara" />

        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-28 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Settings Navigation Sidebar */}
          <div className="w-full lg:w-[280px] bg-white border border-neutral-200 rounded-3xl p-5 flex flex-col gap-1.5 shadow-sm shrink-0">
            <h3 className="font-brand font-black text-lg tracking-tight text-neutral-800 px-3 mb-3">
              Pengaturan
            </h3>
            
            <button
              onClick={() => setActiveTab('Akun')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-small font-bold transition-colors duration-150 border-0 cursor-pointer text-left ${
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-small font-bold transition-colors duration-150 border-0 cursor-pointer text-left ${
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
          <div className="flex-grow w-full">
            
            {/* Akun Settings Section */}
            {activeTab === 'Akun' && (
              <div className="flex flex-col gap-8 animate-in fade-in duration-200">
                
                {/* Form 1: Edit Profile Form */}
                <form 
                  onSubmit={handleUpdateProfile}
                  className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm"
                >
                  <div className="border-b border-neutral-100 pb-4">
                    <h4 className="font-brand font-black text-lg text-neutral-900">Ubah Profil</h4>
                    <p className="text-gray-400 text-micro font-medium">Ubah nama, email, dan foto profil Anda.</p>
                  </div>

                  {profileForm.wasSuccessful && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-small font-bold rounded-2xl">
                      Profil berhasil diperbarui!
                    </div>
                  )}

                  {Object.keys(profileForm.errors).length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-small font-bold rounded-2xl flex flex-col gap-1">
                      {Object.entries(profileForm.errors).map(([key, val]) => (
                        <span key={key} className="flex items-center gap-1.5">
                          <ShieldAlert size={14} className="shrink-0" />
                          <span>{val}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Avatar Upload Field */}
                  <div className="flex flex-col gap-3 items-center self-start">
                    <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-200">
                      <img 
                        src={avatarPreview || user?.avatar_url || defaultAvatar} 
                        alt={user?.name || "User"} 
                        className="w-full h-full object-cover"
                      />
                      <label 
                        htmlFor="avatar-file-input"
                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200"
                      >
                        <Camera size={20} />
                      </label>
                    </div>
                    
                    <input 
                      id="avatar-file-input"
                      type="file" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          profileForm.setData('avatar', file);
                          setAvatarPreview(URL.createObjectURL(file));
                        }
                      }}
                      accept="image/*"
                      className="hidden" 
                    />
                    
                    <button 
                      type="button"
                      onClick={() => document.getElementById('avatar-file-input')?.click()}
                      className="text-primary-500 hover:text-primary-600 font-bold text-small border-0 bg-transparent cursor-pointer p-0"
                    >
                      Unggah Foto Baru
                    </button>
                  </div>

                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-700 font-bold text-small font-brand">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={profileForm.data.name}
                      onChange={(e) => profileForm.setData('name', e.target.value)}
                      required
                      placeholder="Nama lengkap Anda"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-base placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 transition-colors"
                    />
                  </div>

                  {/* Email field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-700 font-bold text-small font-brand">Email</label>
                    <input 
                      type="email" 
                      value={profileForm.data.email}
                      onChange={(e) => profileForm.setData('email', e.target.value)}
                      required
                      placeholder="Alamat email Anda"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-base placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 transition-colors"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={profileForm.processing}
                    className="self-end px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-bold text-base rounded-full shadow-md cursor-pointer transition-colors"
                  >
                    {profileForm.processing ? 'Menyimpan...' : 'Simpan Profil'}
                  </button>
                </form>

                {/* Form 2: Update Password Form */}
                <form 
                  onSubmit={handleUpdatePassword}
                  className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm"
                >
                  <div className="border-b border-neutral-100 pb-4">
                    <h4 className="font-brand font-black text-lg text-neutral-900">Ubah Kata Sandi</h4>
                    <p className="text-gray-400 text-micro font-medium">Jaga keamanan akun Anda dengan memperbarui kata sandi secara berkala.</p>
                  </div>

                  {passwordForm.wasSuccessful && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-small font-bold rounded-2xl">
                      Kata sandi berhasil diperbarui!
                    </div>
                  )}

                  {Object.keys(passwordForm.errors).length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-small font-bold rounded-2xl flex flex-col gap-1">
                      {Object.entries(passwordForm.errors).map(([key, val]) => (
                        <span key={key} className="flex items-center gap-1.5">
                          <ShieldAlert size={14} className="shrink-0" />
                          <span>{val}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Current Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-700 font-bold text-small font-brand">Kata Sandi Sekarang</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={passwordForm.data.current_password}
                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                        required
                        placeholder="Kata sandi saat ini"
                        className="w-full pl-4 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-base placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 transition-colors"
                      />
                      <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-700 font-bold text-small font-brand">Kata Sandi Baru</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={passwordForm.data.password}
                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                        required
                        placeholder="Kata sandi baru minimal 8 karakter"
                        className="w-full pl-4 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-base placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 transition-colors"
                      />
                      <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-neutral-700 font-bold text-small font-brand">Konfirmasi Kata Sandi Baru</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={passwordForm.data.password_confirmation}
                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                        required
                        placeholder="Ulangi kata sandi baru"
                        className="w-full pl-4 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-base placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 transition-colors"
                      />
                      <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={passwordForm.processing}
                    className="self-end px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-bold text-base rounded-full shadow-md cursor-pointer transition-colors"
                  >
                    {passwordForm.processing ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
                  </button>
                </form>
              </div>
            )}

            {/* Tentang Settings Section */}
            {activeTab === 'Tentang' && (
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm animate-in fade-in duration-200">
                <div className="flex items-center gap-4 border-b border-neutral-100 pb-4">
                  <img src={faviconUrl} alt="Lokacara" className="w-10 h-12 shrink-0" />
                  <div>
                    <h3 className="font-brand font-black text-2xl text-primary-500 tracking-tight leading-none mb-1">lokacara</h3>
                    <span className="px-2 py-0.5 bg-neutral-100 text-gray-500 text-[0.6rem] font-bold rounded-md tracking-wider">VERSI 1.0.0</span>
                  </div>
                </div>
                
                <p className="text-neutral-700 text-base leading-relaxed">
                  Lokacara adalah platform manajemen dan pendaftaran event komunitas yang dirancang khusus untuk pasar Indonesia. Platform ini memudahkan komunitas dalam membuat, mengelola, menyelenggarakan, dan mendistribusikan e-sertifikat kepada para peserta secara efisien, transparan, dan terintegrasi.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <h5 className="font-brand font-black text-sm text-neutral-800 mb-1">Organizer Hub</h5>
                    <p className="text-gray-500 text-micro leading-snug">Kelola pembuatan event, daftar peserta, dan edit detail event secara online maupun offline dengan integrasi Google Maps.</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <h5 className="font-brand font-black text-sm text-neutral-800 mb-1">E-Sertifikat Cepat</h5>
                    <p className="text-gray-500 text-micro leading-snug">Distribusi sertifikat otomatis ke seluruh peserta event hanya dengan satu klik ketika event selesai.</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 flex flex-col gap-1 text-micro font-semibold text-gray-400">
                  <span>© 2026 Lokacara Team. Semua Hak Dilindungi.</span>
                  <span>Didesain dengan cinta untuk memajukan komunitas-komunitas hebat di Indonesia.</span>
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
