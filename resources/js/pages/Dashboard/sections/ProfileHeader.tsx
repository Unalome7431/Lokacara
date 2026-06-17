import { Link } from '@inertiajs/react';
import defaultAvatar from '@/../../public/avatars/default.png';

interface User {
    name: string;
    email: string;
    avatar_url?: string;
    role?: string;
}

interface ProfileHeaderProps {
    user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
    return (
        <div className="mb-10 flex flex-col items-center gap-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:flex-row md:p-8">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-primary-100">
                <img
                    src={user?.avatar_url || defaultAvatar}
                    alt={user?.name || 'User'}
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="grow text-center md:text-left">
                <div className="mb-1.5 flex flex-col justify-center gap-2 md:flex-row md:items-center md:justify-start">
                    <h2 className="font-brand text-h2-mobile leading-none font-black tracking-tight text-neutral-900 lg:text-h3-web">
                        {user?.name || 'Pengguna Lokacara'}
                    </h2>
                    {user?.role === 'admin' && (
                        <span className="self-center rounded-md bg-red-100 px-2.5 py-0.5 text-[0.65rem] font-extrabold tracking-wider text-red-800 uppercase">
                            ADMIN
                        </span>
                    )}
                </div>
                <p className="mb-4 text-small leading-none font-semibold text-gray-500">
                    {user?.email}
                </p>
                <div className="flex items-center justify-center gap-2 md:justify-start">
                    <Link
                        href="/settings"
                        className="rounded-full bg-neutral-100 px-4 py-2 text-micro font-bold text-neutral-800 transition-colors duration-150 hover:bg-neutral-200"
                    >
                        Edit Profile & Kata Sandi
                    </Link>
                </div>
            </div>
        </div>
    );
}
