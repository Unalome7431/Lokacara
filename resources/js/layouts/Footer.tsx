import { Link } from '@inertiajs/react';
import {
    Mail,
    Shield,
    FileText,
    Compass,
    PlusCircle,
    Globe,
    Github,
    Instagram,
    Twitter,
    Heart,
} from 'lucide-react';
import faviconUrl from '@/../../public/favicon.svg';

export default function Footer() {
    return (
        <footer className="relative mt-auto w-full overflow-hidden border-t border-neutral-900 bg-neutral-950 text-neutral-400">
            {/* Decorative background glow */}
            <div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 -translate-y-1/2 rounded-full bg-primary-500/10 blur-3xl" />
            <div className="pointer-events-none absolute right-1/4 bottom-0 h-96 w-96 translate-y-1/2 rounded-full bg-secondary-500/10 blur-3xl" />

            <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 py-16">
                <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
                    {/* Logo & Description */}
                    <div className="flex flex-col gap-5 lg:col-span-5">
                        <Link
                            href="/"
                            className="group flex w-fit items-center gap-2.5"
                        >
                            <img
                                src={faviconUrl}
                                alt="Lokacara"
                                className="h-8.5 w-7 group-hover:animate-logo-wave"
                            />
                            <span className="font-brand text-2xl font-black tracking-tight text-white transition-colors group-hover:text-primary-400">
                                lokacara
                            </span>
                        </Link>
                        <p className="max-w-[380px] text-base leading-relaxed font-normal text-neutral-400">
                            Platform manajemen dan pencarian event komunitas
                            terbaik di Indonesia. Temukan, ikuti, dan
                            selenggarakan event impian Anda secara mudah dan
                            menyenangkan.
                        </p>
                        {/* Social Icons with micro-animations */}
                        <div className="mt-2 flex items-center gap-4">
                            <a
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 transition-all duration-300 hover:scale-105 hover:border-primary-500 hover:text-white"
                                aria-label="Instagram"
                            >
                                <Instagram size={18} />
                            </a>
                            <a
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 transition-all duration-300 hover:scale-105 hover:border-primary-500 hover:text-white"
                                aria-label="Twitter"
                            >
                                <Twitter size={18} />
                            </a>
                            <a
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 transition-all duration-300 hover:scale-105 hover:border-primary-500 hover:text-white"
                                aria-label="GitHub"
                            >
                                <Github size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:col-span-7">
                        {/* Column 1: Jelajahi */}
                        <div className="flex flex-col gap-4">
                            <h5 className="flex items-center gap-2 font-brand text-base font-bold tracking-wide text-white">
                                <Compass
                                    size={18}
                                    className="text-primary-400"
                                />
                                <span>Jelajahi</span>
                            </h5>
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/"
                                    className="w-fit text-small font-semibold transition-colors duration-200 hover:text-primary-400"
                                >
                                    Beranda
                                </Link>
                                <Link
                                    href="/events/search"
                                    className="w-fit text-small font-semibold transition-colors duration-200 hover:text-primary-400"
                                >
                                    Cari Event
                                </Link>
                            </div>
                        </div>

                        {/* Column 2: Organizer */}
                        <div className="flex flex-col gap-4">
                            <h5 className="flex items-center gap-2 font-brand text-base font-bold tracking-wide text-white">
                                <PlusCircle
                                    size={18}
                                    className="text-secondary-400"
                                />
                                <span>Organizer</span>
                            </h5>
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/create"
                                    className="w-fit text-small font-semibold transition-colors duration-200 hover:text-secondary-400"
                                >
                                    Buat Event
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="w-fit text-small font-semibold transition-colors duration-200 hover:text-secondary-400"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        </div>

                        {/* Column 3: Bantuan & Legal */}
                        <div className="flex flex-col gap-4">
                            <h5 className="flex items-center gap-2 font-brand text-base font-bold tracking-wide text-white">
                                <Shield
                                    size={18}
                                    className="text-primary-400"
                                />
                                <span>Bantuan & Legal</span>
                            </h5>
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/settings"
                                    className="flex w-fit items-center gap-2 text-small font-semibold transition-colors duration-200 hover:text-primary-400"
                                >
                                    <Mail size={14} className="shrink-0" />
                                    <span>Pengaturan</span>
                                </Link>
                                <span className="flex w-fit cursor-pointer items-center gap-2 text-small font-semibold transition-colors duration-200 hover:text-primary-400">
                                    <FileText size={14} className="shrink-0" />
                                    <span>Syarat & Ketentuan</span>
                                </span>
                                <span className="flex w-fit cursor-pointer items-center gap-2 text-small font-semibold transition-colors duration-200 hover:text-primary-400">
                                    <Shield size={14} className="shrink-0" />
                                    <span>Kebijakan Privasi</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="mb-8 h-px w-full bg-neutral-900" />

                {/* Bottom bar */}
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <p className="flex items-center gap-1 text-small font-medium text-neutral-500">
                        <span>
                            &copy; {new Date().getFullYear()} Lokacara. Dibuat
                            dengan
                        </span>
                        <Heart
                            size={12}
                            className="animate-duration-1000 animate-pulse fill-red-500 text-red-500"
                        />
                        <span>untuk Komunitas Indonesia.</span>
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="flex cursor-pointer items-center gap-1.5 text-small font-semibold text-neutral-500 transition-colors duration-200 hover:text-white">
                            <Globe size={14} />
                            <span>Bahasa Indonesia</span>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
