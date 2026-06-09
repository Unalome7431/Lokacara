import { Link } from '@inertiajs/react';
import { Mail, Shield, FileText, Compass, PlusCircle } from 'lucide-react';
import faviconUrl from '@/../../public/favicon.svg';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-[1280px] mx-auto px-6 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-10 md:mb-12">
          
          {/* Logo & Description (5 cols on md) */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <img src={faviconUrl} alt="Lokacara" className="w-6 h-7.5" />
              <span className="font-brand font-black text-2xl tracking-tight text-primary-500">lokacara</span>
            </Link>
            <p className="text-gray-500 text-base font-medium max-w-[360px] leading-relaxed">
              Platform manajemen dan pencarian event komunitas terbaik di Indonesia. Temukan, ikuti, dan selenggarakan event impian Anda.
            </p>
          </div>

          {/* Navigation Links (7 cols on md - 3 sub-columns) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-4">
            
            {/* Column 1: Jelajahi */}
            <div className="flex flex-col gap-4">
              <h5 className="font-brand font-bold text-base text-neutral-800 tracking-wide flex items-center gap-2">
                <Compass size={16} className="text-primary-400" />
                <span>Jelajahi</span>
              </h5>
              <div className="flex flex-col gap-2.5">
                <Link href="/" className="text-gray-400 hover:text-primary-500 text-small font-semibold transition-colors duration-200">
                  Beranda
                </Link>
                <Link href="/events/search" className="text-gray-400 hover:text-primary-500 text-small font-semibold transition-colors duration-200">
                  Cari Event
                </Link>
              </div>
            </div>

            {/* Column 2: Penyelenggara */}
            <div className="flex flex-col gap-4">
              <h5 className="font-brand font-bold text-base text-neutral-800 tracking-wide flex items-center gap-2">
                <PlusCircle size={16} className="text-primary-400" />
                <span>Organizer</span>
              </h5>
              <div className="flex flex-col gap-2.5">
                <Link href="/dashboard/events/create" className="text-gray-400 hover:text-primary-500 text-small font-semibold transition-colors duration-200">
                  Buat Event
                </Link>
                <Link href="/dashboard" className="text-gray-400 hover:text-primary-500 text-small font-semibold transition-colors duration-200">
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Column 3: Bantuan & Legal */}
            <div className="flex flex-col gap-4 col-span-2 sm:col-span-1">
              <h5 className="font-brand font-bold text-base text-neutral-800 tracking-wide flex items-center gap-2">
                <Shield size={16} className="text-primary-400" />
                <span>Bantuan & Legal</span>
              </h5>
              <div className="flex flex-col gap-2.5">
                <Link href="/settings" className="text-gray-400 hover:text-primary-500 text-small font-semibold transition-colors duration-200 flex items-center gap-2">
                  <Mail size={12} />
                  <span>Pengaturan</span>
                </Link>
                <span className="text-gray-400 text-small font-semibold flex items-center gap-2">
                  <FileText size={12} />
                  <span>Syarat & Ketentuan</span>
                </span>
                <span className="text-gray-400 text-small font-semibold flex items-center gap-2">
                  <Shield size={12} />
                  <span>Kebijakan Privasi</span>
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 w-full mb-6"></div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-small font-semibold">
            &copy; {new Date().getFullYear()} Lokacara. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-gray-400 hover:text-primary-500 text-small font-semibold transition-colors duration-200 cursor-pointer">
              Bahasa Indonesia
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
