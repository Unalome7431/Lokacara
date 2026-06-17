import { formatIndonesianDate, formatIndonesianTime } from '@/lib/utils';
import { Calendar, MapPin, ArrowUpRight } from 'lucide-react';
import React from 'react';

interface Event {
    type: 'online' | 'offline';
    start_datetime: string;
    end_datetime: string;
    location_name?: string;
    address?: string;
    platform_name?: string;
    link?: string;
}

interface EventInfoDetailsProps {
    event: Event;
    showWebinarLink?: boolean;
}

export default function EventInfoDetails({
    event,
    showWebinarLink = false,
}: EventInfoDetailsProps) {
    return (
        <div className="flex flex-col gap-4">
            <h4 className="font-brand text-h4-mobile font-black text-neutral-900 lg:text-h4-web">
                Waktu & Lokasi
            </h4>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Tanggal & Waktu */}
                <div className="flex flex-col gap-4">
                    {/* Tanggal */}
                    <div className="flex items-start gap-3.5">
                        <div className="mt-1 shrink-0 text-neutral-400">
                            <Calendar size={20} className="stroke-[1.5]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                Tanggal
                            </span>
                            <span className="mt-0.5 text-base font-bold text-neutral-800">
                                {formatIndonesianDate(event.start_datetime)}
                            </span>
                        </div>
                    </div>

                    {/* Waktu */}
                    <div className="flex items-start gap-3.5">
                        <div className="mt-1 shrink-0 text-neutral-400">
                            <svg
                                className="h-5 w-5 stroke-[1.5] text-neutral-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                Waktu
                            </span>
                            <span className="mt-0.5 text-base font-bold text-neutral-800">
                                {formatIndonesianTime(event.start_datetime)} -{' '}
                                {formatIndonesianTime(event.end_datetime)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Lokasi */}
                <div className="flex items-start gap-3.5">
                    <div className="mt-1 shrink-0 text-neutral-400">
                        <MapPin size={20} className="stroke-[1.5]" />
                    </div>

                    {event.type === 'offline' ? (
                        <div className="flex flex-col">
                            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                Lokasi
                            </span>
                            <span className="mt-0.5 text-base font-bold text-neutral-800">
                                {event.location_name || 'Tidak Ditentukan'}
                            </span>
                            {event.address && (
                                <span className="mt-1 text-sm leading-relaxed font-semibold text-gray-500">
                                    {event.address}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                Platform Online
                            </span>
                            <span className="mt-0.5 text-base font-bold text-neutral-800">
                                {event.platform_name || 'Webinar Online'}
                            </span>
                            {event.link && showWebinarLink ? (
                                <a
                                    href={event.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold text-primary-500 hover:text-primary-600"
                                >
                                    <span>Link Gabung Webinar</span>
                                    <ArrowUpRight size={14} />
                                </a>
                            ) : event.link ? (
                                <span className="mt-2 text-xs font-semibold text-gray-400 italic">
                                    Link gabung tersedia setelah mendaftar
                                </span>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
