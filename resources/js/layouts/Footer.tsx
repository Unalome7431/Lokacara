import { Link } from '@inertiajs/react';
import { Mail, Shield, FileText, Compass, PlusCircle, Globe, Github, Instagram, Twitter, Heart } from 'lucide-react';
import faviconUrl from '@/../../public/favicon.svg';

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-950 text-neutral-400 relative overflow-hidden mt-auto border-t border-neutral-900">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1280px] mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">
          {/* Logo & Description */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2.5 w-fit group">
              <img src={faviconUrl} alt="Lokacara" className="w-7 h-8.5 group-hover:animate-logo-wave" />
              <span className="font-brand font-black text-2xl tracking-tight text-white group-hover:text-primary-400 transition-colors">
                lokacara
              </span>
            </Link>
            <p className="text-neutral-400 text-base font-normal max-w-[380px] leading-relaxed">
              Platform manajemen dan pencarian event komunitas terbaik di Indonesia. Temukan, ikuti, dan selenggarakan event impian Anda secara mudah dan menyenangkan.
            </p>
            {/* Social Icons with micro-animations */}
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 hover:border-primary-500 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-105" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 hover:border-primary-500 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-105" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 hover:border-primary-500 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-105" aria-label="GitHub">
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {/* Column 1: Jelajahi */}
            <div className="flex flex-col gap-4">
              <h5 className="font-brand font-bold text-base text-white tracking-wide flex items-center gap-2">
                <Compass size={18} className="text-primary-400" />
                <span>Jelajahi</span>
              </h5>
              <div className="flex flex-col gap-3">
                <Link href="/" className="hover:text-primary-400 text-small font-semibold transition-colors duration-200 w-fit">
                  Beranda
                </Link>
                <Link href="/events/search" className="hover:text-primary-400 text-small font-semibold transition-colors duration-200 w-fit">
                  Cari Event
                </Link>
              </div>
            </div>

            {/* Column 2: Organizer */}
            <div className="flex flex-col gap-4">
              <h5 className="font-brand font-bold text-base text-white tracking-wide flex items-center gap-2">
                <PlusCircle size={18} className="text-secondary-400" />
                <span>Organizer</span>
              </h5>
              <div className="flex flex-col gap-3">
                <Link href="/dashboard/events/create" className="hover:text-secondary-400 text-small font-semibold transition-colors duration-200 w-fit">
                  Buat Event
                </Link>
                <Link href="/dashboard" className="hover:text-secondary-400 text-small font-semibold transition-colors duration-200 w-fit">
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Column 3: Bantuan & Legal */}
            <div className="flex flex-col gap-4">
              <h5 className="font-brand font-bold text-base text-white tracking-wide flex items-center gap-2">
                <Shield size={18} className="text-primary-400" />
                <span>Bantuan & Legal</span>
              </h5>
              <div className="flex flex-col gap-3">
                <Link href="/settings" className="hover:text-primary-400 text-small font-semibold transition-colors duration-200 flex items-center gap-2 w-fit">
                  <Mail size={14} className="shrink-0" />
                  <span>Pengaturan</span>
                </Link>
                <span className="hover:text-primary-400 text-small font-semibold flex items-center gap-2 w-fit cursor-pointer transition-colors duration-200">
                  <FileText size={14} className="shrink-0" />
                  <span>Syarat & Ketentuan</span>
                </span>
                <span className="hover:text-primary-400 text-small font-semibold flex items-center gap-2 w-fit cursor-pointer transition-colors duration-200">
                  <Shield size={14} className="shrink-0" />
                  <span>Kebijakan Privasi</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-900 w-full mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-neutral-500 text-small font-medium flex items-center gap-1">
            <span>&copy; {new Date().getFullYear()} Lokacara. Dibuat dengan</span>
            <Heart size={12} className="text-red-500 fill-red-500 animate-pulse animate-duration-1000" />
            <span>untuk Komunitas Indonesia.</span>
          </p>
          <div className="flex items-center gap-6">
            <span className="text-neutral-500 hover:text-white text-small font-semibold transition-colors duration-200 cursor-pointer flex items-center gap-1.5">
              <Globe size={14} />
              <span>Bahasa Indonesia</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
