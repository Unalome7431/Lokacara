import { Users } from 'lucide-react';
import React from 'react';
import DefaultCover from '@/../../public/covers/default_cover.jpg';

interface Category {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface Event {
    id: number;
    title: string;
    poster_url?: string;
    category?: Category;
    user?: User;
}

interface EventDetailHeaderProps {
    event: Event;
    organizer?: string;
}

export default function EventDetailHeader({ event, organizer }: EventDetailHeaderProps) {
    return (
        <>
            {/* Cover Image */}
            <div className="border-neutral-150 relative aspect-video w-full overflow-hidden rounded-2xl border bg-neutral-100">
                <img
                    src={event.poster_url || DefaultCover}
                    alt={event.title}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Title & Category Stacked */}
            <div className="flex flex-col gap-2">
                <h1 className="font-brand text-h1-mobile leading-tight font-black text-neutral-900 lg:text-h1-web">
                    {event.title}
                </h1>
                {event.category && (
                    <div className="flex">
                        <span className="rounded-full bg-secondary-500 px-3 py-1 font-brand text-xs font-black tracking-wider text-neutral-900 uppercase select-none">
                            {event.category.name}
                        </span>
                    </div>
                )}
            </div>

            {/* Horizontal Info Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-neutral-100 pb-5 text-sm font-semibold text-neutral-500">
                {/* Organizer */}
                <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200">
                        <Users
                            size={12}
                            className="text-neutral-500"
                        />
                    </div>
                    <span>
                        oleh{' '}
                        <span className="font-bold text-neutral-800">
                            {event.user?.name || organizer || 'Arrivo zul Group'}
                        </span>
                    </span>
                </div>
            </div>
        </>
    );
}
