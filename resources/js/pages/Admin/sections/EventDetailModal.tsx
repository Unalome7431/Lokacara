import {
    Calendar,
    X,
    Eye,
    Tag,
    Users,
    MapPin,
    Monitor,
} from 'lucide-react';
import React from 'react';
import DefaultCover from '@/../../public/covers/default_cover.jpg';
import { formatIndonesianDateShort } from '@/lib/utils';
import type { Event } from '../types';

interface EventDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event | null;
    onBanEvent: (eventId: number, eventTitle: string) => void;
    processing: boolean;
}

export default function EventDetailModal({
    isOpen,
    onClose,
    event,
    onBanEvent,
    processing,
}: EventDetailModalProps) {
    if (!isOpen || !event) {
return null;
}

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs select-none">
            <div className="animate-in fade-in zoom-in-95 relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                            <Eye size={20} />
                        </div>
                        <div>
                            <h3 className="font-brand text-lg font-black text-neutral-900">
                                Detail Event
                            </h3>
                            <p className="text-xs font-semibold text-gray-400 mt-0.5">
                                ID #{event.id}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="grow overflow-y-auto p-6 flex flex-col gap-5" data-lenis-prevent>
                    {/* Cover Image */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-neutral-200 shrink-0 shadow-xs">
                        <img
                            src={event.poster_url || DefaultCover}
                            alt={event.title}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* Title & Status */}
                    <div>
                        <div className="flex items-start justify-between gap-3">
                            <h4 className="font-brand text-xl font-black text-neutral-900 leading-tight">
                                {event.title}
                            </h4>
                            <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase select-none ${
                                event.status === 'banned'
                                    ? 'bg-secondary-100 text-secondary-800'
                                    : event.status === 'cancelled'
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-green-100 text-green-700'
                            }`}>
                                {event.status === 'banned' ? 'BANNED' : event.status === 'cancelled' ? 'BATAL' : 'AKTIF'}
                            </span>
                        </div>
                        {event.category && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded-full mt-2">
                                <Tag size={10} />
                                {event.category.name}
                            </span>
                        )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                            <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Penyelenggara</span>
                            <h5 className="text-sm font-bold text-neutral-800 mt-1">{event.user?.name || 'Anonim'}</h5>
                            <span className="text-xs text-gray-400">{event.user?.email}</span>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                            <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Tipe Event</span>
                            <h5 className="text-sm font-bold text-neutral-800 mt-1 flex items-center gap-1.5">
                                {event.type === 'online' ? <Monitor size={14} className="text-primary-500" /> : <MapPin size={14} className="text-secondary-500" />}
                                {event.type === 'online' ? 'Online' : 'Offline'}
                            </h5>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                            <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Waktu Mulai</span>
                            <h5 className="text-sm font-bold text-neutral-800 mt-1 flex items-center gap-1.5">
                                <Calendar size={14} className="text-neutral-400" />
                                {formatIndonesianDateShort(event.start_datetime)}
                            </h5>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                            <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Waktu Selesai</span>
                            <h5 className="text-sm font-bold text-neutral-800 mt-1 flex items-center gap-1.5">
                                <Calendar size={14} className="text-neutral-400" />
                                {event.end_datetime ? formatIndonesianDateShort(event.end_datetime) : '-'}
                            </h5>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-3 text-center">
                            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">Views</span>
                            <p className="text-lg font-black text-neutral-800 mt-0.5 flex items-center justify-center gap-1">
                                <Eye size={14} className="text-neutral-400" />
                                {event.view_count || 0}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-3 text-center">
                            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">Peserta</span>
                            <p className="text-lg font-black text-neutral-800 mt-0.5 flex items-center justify-center gap-1">
                                <Users size={14} className="text-neutral-400" />
                                {event.event_registrations_count ?? 0}{event.capacity ? ` / ${event.capacity}` : ''}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-3 text-center">
                            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">Harga</span>
                            <p className="text-lg font-black text-neutral-800 mt-0.5">
                                {event.price === 0 || !event.price ? 'Gratis' : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                            </p>
                        </div>
                    </div>

                    {/* Location / Platform */}
                    {event.type === 'offline' && event.location_name && (
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                            <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Lokasi</span>
                            <h5 className="text-sm font-bold text-neutral-800 mt-1">{event.location_name}</h5>
                            {event.address && (
                                <p className="text-xs font-medium text-neutral-500 mt-0.5">{event.address}</p>
                            )}
                        </div>
                    )}
                    {event.type === 'online' && event.platform_name && (
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
                            <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Platform</span>
                            <h5 className="text-sm font-bold text-neutral-800 mt-1">{event.platform_name}</h5>
                        </div>
                    )}

                    {/* Description */}
                    {event.description && (
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Deskripsi</span>
                            <p className="text-sm font-medium text-neutral-700 leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-200 whitespace-pre-line">
                                {event.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-100 p-6 flex gap-3 bg-neutral-50/50 shrink-0">
                    {event.status !== 'banned' && event.status !== 'cancelled' && (
                        <button
                            onClick={() => onBanEvent(event.id, event.title)}
                            disabled={processing}
                            className="flex-1 rounded-full bg-secondary-500 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-secondary-600 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Ban / Blokir Event
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-full border border-neutral-300 bg-white py-3 text-center text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
