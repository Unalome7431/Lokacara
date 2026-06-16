import { Link } from '@inertiajs/react';
import { Calendar, MapPin } from 'lucide-react';
import React from 'react';
import Button from '@/components/ui/Button';
import DefaultCover from '@/../../public/covers/default_cover.jpg';
import { formatShortDate } from '@/lib/utils';

interface Event {
    id: number;
    title: string;
    poster_url?: string;
    type: 'online' | 'offline';
    location_name?: string;
    start_datetime: string;
    price?: number;
}

interface EventCardProps {
    event: any; // Using any or keeping interface but relaxing type checks is good. Let's define Event as a relaxed type so it supports any Event object with these properties.
    variant?: 'grid' | 'slider' | 'dashboard';
    detailUrl?: string;
    footer?: React.ReactNode;
    className?: string;
}

export default function EventCard({
    event,
    variant = 'grid',
    detailUrl,
    footer,
    className = '',
}: EventCardProps) {
    const isFree = !event.price || event.price === 0;
    const badgeText = isFree ? (variant === 'dashboard' ? 'FREE' : 'GRATIS') : `Rp ${Number(event.price).toLocaleString('id-ID')}`;

    // Layout configuration depending on variant
    let containerClass = '';
    let imageClass = '';
    let contentClass = '';
    let titleClass = '';

    if (variant === 'slider') {
        containerClass = 'border-neutral-150 group relative flex h-[340px] w-[calc((100%-24px)/2)] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md md:h-[370px] md:w-[calc((100%-48px)/3)] lg:h-[400px] lg:w-[calc((100%-72px)/4)]';
        imageClass = 'relative h-[170px] w-full shrink-0 overflow-hidden border-b border-gray-100 bg-gray-50 md:h-[190px] lg:h-[210px]';
        contentClass = 'flex h-[170px] shrink-0 flex-col justify-between p-4 md:h-[180px] lg:h-[190px]';
        titleClass = 'line-clamp-2 h-[34px] overflow-hidden text-small leading-snug font-extrabold text-primary-500 group-hover:text-primary-600 md:h-[40px] lg:h-[48px] lg:text-base';
    } else if (variant === 'grid') {
        containerClass = 'border-neutral-150 group relative flex h-[160px] w-full flex-row justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:mx-auto sm:h-[400px] sm:w-full sm:flex-col';
        imageClass = 'sm:aspect-none relative aspect-square h-full w-[160px] shrink-0 overflow-hidden border-r border-gray-100 bg-gray-50 sm:h-[210px] sm:w-full sm:border-r-0 sm:border-b';
        contentClass = 'flex grow flex-col justify-between gap-1 overflow-hidden p-3 sm:h-[190px] sm:flex-none sm:shrink-0 sm:p-4';
        titleClass = 'line-clamp-2 h-[36px] overflow-hidden text-small leading-snug font-extrabold text-primary-500 group-hover:text-primary-600 sm:h-[48px] sm:text-base';
    } else if (variant === 'dashboard') {
        containerClass = 'border-neutral-150 group relative flex h-[160px] w-full flex-row justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:h-[370px] sm:flex-col lg:mx-auto lg:h-[400px] lg:w-full lg:max-w-[300px]';
        imageClass = 'sm:aspect-none relative aspect-square h-full w-[160px] shrink-0 overflow-hidden border-r border-gray-100 bg-gray-50 sm:h-[190px] sm:w-full sm:border-r-0 sm:border-b lg:h-[210px]';
        contentClass = 'flex grow flex-col justify-between gap-1 overflow-hidden p-3 sm:h-[180px] sm:flex-none sm:shrink-0 sm:p-4 lg:h-[190px]';
        titleClass = 'line-clamp-2 h-[36px] overflow-hidden text-xs leading-snug font-extrabold text-primary-500 group-hover:text-primary-600 sm:h-[40px] sm:text-sm lg:h-[48px] lg:text-base';
    }

    return (
        <div className={`${containerClass} ${className}`}>
            {/* Badge */}
            <div className="absolute top-3 left-3 z-10 rounded-md bg-secondary-400 px-3 py-1 text-[0.6275rem] font-extrabold text-secondary-900 shadow-sm sm:top-4 sm:left-4">
                {badgeText}
            </div>

            {/* Poster Image */}
            <div className={imageClass}>
                <img
                    src={event.poster_url || DefaultCover}
                    alt={event.title}
                    draggable="false"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Content Details */}
            <div className={contentClass}>
                <div className="flex flex-col gap-1 sm:gap-1.5">
                    <h4 className={titleClass}>
                        {event.title}
                    </h4>
                    <div className="flex flex-col gap-0.5 border-t border-gray-100/50 pt-1 text-[10px] font-semibold text-gray-400 sm:gap-1 sm:pt-1.5 sm:text-micro">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="shrink-0 text-gray-400" />
                            {formatShortDate(event.start_datetime)}
                        </span>
                        <span className="flex items-start gap-1.5">
                            <MapPin size={12} className="mt-0.5 shrink-0 text-gray-400" />
                            <span className="line-clamp-2 overflow-hidden">
                                {event.type === 'online' ? 'Online' : event.location_name || 'Lokasi Offline'}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Footer / Detail Button */}
                {footer ? (
                    footer
                ) : (
                    detailUrl && (
                        <div className="pt-1">
                            <Button
                                href={detailUrl}
                                className="w-full py-1.5 text-[10px] sm:py-2 sm:text-small"
                            >
                                Detail Event
                            </Button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}