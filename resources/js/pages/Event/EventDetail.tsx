import { Head, usePage, router } from '@inertiajs/react';
import React, { useState } from 'react';
import EventInfoDetails from '@/components/ui/EventInfoDetails';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';
import AttendeeActionCard from './sections/Detail/AttendeeActionCard';
import EventDetailDescription from './sections/Detail/EventDetailDescription';
import EventDetailHeader from './sections/Detail/EventDetailHeader';
import HostActionCard from './sections/Detail/HostActionCard';

interface Category {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email?: string;
}

interface Event {
    id: number;
    title: string;
    poster_url?: string;
    description: string;
    type: 'online' | 'offline';
    location_name?: string;
    address?: string;
    platform_name?: string;
    link?: string;
    start_datetime: string;
    end_datetime: string;
    capacity?: number;
    category?: Category;
    user?: User;
    user_id?: number;
    view_count: number;
    price: number;
    event_registrations_count?: number;
}

interface EventDetailProps {
    event: Event;
    isHost?: boolean;
    // Host-specific props
    total_attendees?: number;
    checked_in_attendees?: number;
    // Attendee-specific props
    isRegistered?: boolean;
    certificateUrl?: string | null;
}

export default function EventDetail({
    event,
    isHost,
    total_attendees = 0,
    checked_in_attendees = 0,
    isRegistered = false,
    certificateUrl = null,
}: EventDetailProps) {
    const page = usePage();
    const { auth } = page.props as any;
    const user = auth?.user;
    const isAuthenticated = !!user;

    const [isJoining, setIsJoining] = useState(false);
    const [showVerificationWarning, setShowVerificationWarning] = useState(false);

    // Host check logic (explicit prop or user id matching)
    const isHostView = isHost ?? (isAuthenticated && user?.id === event.user_id);

    const handleJoinEvent = () => {
        if (isJoining) {
            return;
        }

        if (event.price > 0 && !user?.email_verified_at) {
            setShowVerificationWarning(true);

            return;
        }

        setIsJoining(true);
        router.post(
            `/events/${event.id}/join`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsJoining(false),
            },
        );
    };

    return (
        <div className="bg-primary-50/20 animate-in fade-in flex min-h-screen flex-col justify-between duration-200">
            <div className="grow">
                <NavBar />
                <Head title={isHostView ? `Detail Event - ${event.title}` : `${event.title} - Lokacara`} />

                <div className="mx-auto max-w-7xl px-4 pt-28 pb-28 md:px-8 lg:pb-16">
                    {/* Layout Grid */}
                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                        {/* Left Panel: Cover, Specifications & Description */}
                        <div className="flex flex-col gap-8 lg:col-span-2">
                            {/* Main Header Container */}
                            <div className="flex flex-col gap-6 rounded-3xl border border-neutral-300 bg-white p-6 shadow-sm md:p-8">
                                <EventDetailHeader event={event} />

                                <EventInfoDetails event={event} showWebinarLink={isRegistered || isHostView} />

                                <EventDetailDescription event={event} />
                            </div>
                        </div>

                        {/* Right Panel: Role specific control panels */}
                        {isHostView ? (
                            <HostActionCard
                                event={event}
                                total_attendees={total_attendees}
                                checked_in_attendees={checked_in_attendees}
                            />
                        ) : (
                            <AttendeeActionCard
                                event={event}
                                isRegistered={isRegistered}
                                certificateUrl={certificateUrl}
                                isAuthenticated={isAuthenticated}
                                isJoining={isJoining}
                                handleJoinEvent={handleJoinEvent}
                                showVerificationWarning={showVerificationWarning}
                            />
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
