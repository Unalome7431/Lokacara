import { Head } from '@inertiajs/react';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';
import ProfileHeader from './sections/ProfileHeader';
import DashboardCatalog from './sections/DashboardCatalog';

interface Category {
    id: number;
    name: string;
}

interface Event {
    id: number;
    title: string;
    poster_url?: string;
    type: 'online' | 'offline';
    location_name?: string;
    platform_name?: string;
    start_datetime: string;
    category?: Category;
    price?: number;
}

interface EventRegistration {
    id: number;
    event?: Event;
}

interface Certificate {
    id: number;
    event_registration?: {
        event?: {
            title: string;
        };
    };
    eventRegistration?: {
        event?: {
            title: string;
        };
    };
}

interface DashboardProps {
    hosted_events: Event[];
    joined_events: EventRegistration[];
    certificates: Certificate[];
    auth: {
        user: {
            name: string;
            email: string;
            avatar_url?: string;
            role?: string;
        };
    };
}

export default function Dashboard({
    hosted_events = [],
    joined_events = [],
    certificates = [],
    auth,
}: DashboardProps) {
    const user = auth?.user;

    return (
        <div className="flex min-h-screen flex-col justify-between bg-neutral-50/50">
            <div className="grow">
                <NavBar />
                <Head title="Dashboard Saya - Lokacara" />

                {/* Main Dashboard Layout */}
                <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 md:px-8">
                    {/* User profile section */}
                    {user && <ProfileHeader user={user} />}

                    {/* Events & Certificates Catalog Section */}
                    <DashboardCatalog
                        hosted_events={hosted_events}
                        joined_events={joined_events}
                        certificates={certificates}
                    />
                </div>
            </div>
            <Footer />
        </div>
    );
}
