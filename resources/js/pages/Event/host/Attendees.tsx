import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    Search,
    UserMinus,
    Users,
    CheckCircle,
    HelpCircle,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import defaultAvatar from '@/../../public/avatars/default.png';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';
import { formatIndonesianDateShort } from '@/lib/utils';

interface User {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
}

interface EventRegistration {
    id: number;
    user?: User;
    checked_in_at?: string;
    status: string;
    created_at: string;
}

interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginator<T> {
    data: T[];
    links: PaginatorLink[];
    total: number;
    current_page: number;
    last_page: number;
}

interface Event {
    id: number;
    title: string;
}

interface AttendeesProps {
    event: Event;
    attendees: Paginator<EventRegistration>;
    filters: {
        search?: string;
    };
}

export default function Attendees({
    event,
    attendees,
    filters,
}: AttendeesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [optimisticAttendance, setOptimisticAttendance] = useState<
        Record<number, boolean>
    >({});

    // Perform search queries using Inertia reload
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    `/dashboard/events/${event.id}/attendees`,
                    { search },
                    { preserveState: true, replace: true },
                );
            }
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [search, event.id, filters.search]);

    const getIsAttended = (regId: number, checkedInAt?: string) => {
        if (regId in optimisticAttendance) {
            return optimisticAttendance[regId];
        }

        return !!checkedInAt;
    };

    const handleToggleAttendance = (regId: number, checkedInAt?: string) => {
        const currentStatus = getIsAttended(regId, checkedInAt);
        const newStatus = !currentStatus;

        setOptimisticAttendance((prev) => ({
            ...prev,
            [regId]: newStatus,
        }));

        router.post(
            `/dashboard/events/${event.id}/attendance/${regId}/toggle`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    setOptimisticAttendance((prev) => ({
                        ...prev,
                        [regId]: currentStatus,
                    }));
                },
            },
        );
    };

    const handleKickAttendee = (regId: number, userName: string) => {
        if (
            confirm(
                `Apakah Anda yakin ingin mengeluarkan ${userName} dari event ini?`,
            )
        ) {
            router.delete(`/dashboard/events/${event.id}/attendees/${regId}`, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };



    return (
        <div className="flex min-h-screen flex-col justify-between bg-neutral-50/50">
            <div className="grow">
                <NavBar />
                <Head title={`Daftar Peserta - ${event.title}`} />

                <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 md:px-8">
                    {/* Navigation Breadcrumbs */}
                    <div className="mb-6">
                        <Link
                            href={`/dashboard/events/${event.id}`}
                            className="inline-flex items-center gap-1.5 text-small font-bold text-gray-500 transition-colors duration-150 hover:text-primary-500"
                        >
                            <ChevronLeft size={16} />
                            <span>Kembali ke Detail Event</span>
                        </Link>
                    </div>

                    {/* Content Card Container */}
                    <div className="flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
                        {/* Header section */}
                        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-4 md:flex-row md:items-center">
                            <div>
                                <h2 className="flex items-center gap-2 font-brand text-h3-mobile font-black tracking-tight text-neutral-900 lg:text-h3-web">
                                    <Users
                                        className="text-primary-500"
                                        size={24}
                                    />
                                    <span>Daftar Peserta</span>
                                </h2>
                                <p className="mt-1 text-micro font-semibold text-gray-400">
                                    Mengelola kehadiran dan keanggotaan untuk
                                    event{' '}
                                    <span className="text-neutral-800">
                                        {event.title}
                                    </span>{' '}
                                    ({attendees.total} peserta terdaftar)
                                </p>
                            </div>

                            {/* Local Search Input */}
                            <div className="relative w-full md:max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Cari nama peserta..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-2.5 pr-10 pl-4 text-base font-medium text-gray-700 placeholder-gray-400 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none"
                                />
                                <Search
                                    size={16}
                                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400"
                                />
                            </div>
                        </div>

                        {/* Attendees Table */}
                        {attendees.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-gray-400">
                                    <HelpCircle size={24} />
                                </div>
                                <div>
                                    <h5 className="font-brand text-base font-bold text-neutral-800">
                                        Tidak Ada Peserta ditemukan
                                    </h5>
                                    <p className="text-small text-gray-400">
                                        Tidak ada pendaftar yang cocok dengan
                                        pencarian Anda.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-base text-gray-500">
                                    <thead>
                                        <tr className="border-neutral-150 border-b bg-neutral-50/50 text-micro font-extrabold tracking-wider text-neutral-800 uppercase">
                                            <th className="px-6 py-4">
                                                Peserta
                                            </th>
                                            <th className="px-6 py-4">
                                                Tanggal Daftar
                                            </th>
                                            <th className="px-6 py-4">
                                                Kehadiran
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-neutral-150 divide-y">
                                        {attendees.data.map((reg) => {
                                            const attendeeUser = reg.user;

                                            if (!attendeeUser) {
                                                return null;
                                            }

                                            const isAttended = getIsAttended(
                                                reg.id,
                                                reg.checked_in_at,
                                            );

                                            return (
                                                <tr
                                                    key={reg.id}
                                                    className="transition-colors hover:bg-neutral-50/30"
                                                >
                                                    {/* Avatar/Details */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-neutral-200">
                                                                <img
                                                                    src={
                                                                        attendeeUser.avatar_url ||
                                                                        defaultAvatar
                                                                    }
                                                                    alt={
                                                                        attendeeUser.name
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex min-w-0 flex-col">
                                                                <span className="truncate text-small leading-tight font-extrabold text-neutral-900">
                                                                    {
                                                                        attendeeUser.name
                                                                    }
                                                                </span>
                                                                <span className="mt-0.5 truncate text-micro font-medium text-gray-400">
                                                                    {
                                                                        attendeeUser.email
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Registration date */}
                                                    <td className="px-6 py-4 text-small font-medium whitespace-nowrap text-neutral-700">
                                                        {formatIndonesianDateShort(
                                                            reg.created_at,
                                                        )}
                                                    </td>

                                                    {/* Presence Badge */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-micro font-bold tracking-wider uppercase shadow-xs ${
                                                                isAttended
                                                                    ? 'border-green-150 border bg-green-50 text-green-700'
                                                                    : 'bg-gray-100 text-gray-500'
                                                            }`}
                                                        >
                                                            {isAttended && (
                                                                <CheckCircle
                                                                    size={10}
                                                                />
                                                            )}
                                                            <span>
                                                                {isAttended
                                                                    ? 'Hadir'
                                                                    : 'Tidak Hadir'}
                                                            </span>
                                                        </span>
                                                    </td>

                                                    {/* Action Switches */}
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-4">
                                                            {/* Toggle Switch */}
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-micro font-semibold text-gray-400">
                                                                    {isAttended
                                                                        ? 'Check-in'
                                                                        : 'Belum'}
                                                                </span>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleToggleAttendance(
                                                                            reg.id,
                                                                            reg.checked_in_at,
                                                                        )
                                                                    }
                                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                                        isAttended
                                                                            ? 'bg-primary-500'
                                                                            : 'bg-gray-200'
                                                                    }`}
                                                                >
                                                                    <span
                                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                                                            isAttended
                                                                                ? 'translate-x-5'
                                                                                : 'translate-x-0'
                                                                        }`}
                                                                    />
                                                                </button>
                                                            </div>

                                                            {/* Kick Out Button */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleKickAttendee(
                                                                        reg.id,
                                                                        attendeeUser.name,
                                                                    )
                                                                }
                                                                className="flex cursor-pointer items-center justify-center rounded-full border-0 bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-100"
                                                                title="Keluarkan Peserta"
                                                            >
                                                                <UserMinus
                                                                    size={14}
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {attendees.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-neutral-100 pt-6">
                                <span className="text-micro font-semibold text-gray-400">
                                    Halaman {attendees.current_page} dari{' '}
                                    {attendees.last_page}
                                </span>

                                <div className="flex gap-1.5">
                                    {attendees.links.map((link, idx) => {
                                        const isNumeric = !isNaN(
                                            Number(link.label),
                                        );
                                        const isMobileHidden = (() => {
                                            if (!isNumeric) {
                                                return link.label === '...';
                                            }

                                            const pageNum = Number(link.label);
                                            const totalPages =
                                                attendees.last_page;
                                            const currentPage =
                                                attendees.current_page;

                                            if (totalPages <= 3) {
                                                return false;
                                            }

                                            if (currentPage === 1) {
                                                return pageNum > 3;
                                            }

                                            if (currentPage === totalPages) {
                                                return pageNum < totalPages - 2;
                                            }

                                            return (
                                                Math.abs(
                                                    pageNum - currentPage,
                                                ) > 1
                                            );
                                        })();

                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className={`border-neutral-150 cursor-not-allowed rounded-lg border px-2 py-1 text-[10px] font-bold text-gray-300 select-none sm:px-3 sm:py-1.5 sm:text-micro ${
                                                        isMobileHidden
                                                            ? 'hidden sm:inline-block'
                                                            : 'inline-block'
                                                    }`}
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                className={`rounded-lg border px-2 py-1 text-[10px] font-bold transition-colors sm:px-3 sm:py-1.5 sm:text-micro ${
                                                    isMobileHidden
                                                        ? 'hidden sm:inline-block'
                                                        : 'inline-block'
                                                } ${
                                                    link.active
                                                        ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
                                                        : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
