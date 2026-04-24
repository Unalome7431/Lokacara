import Button from '@/components/Button';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';

// Using interfaces to map data structure
interface Event {
    id: number;
    title: string;
    description: string;
    category?: {
        name: string;
    };
}

interface HomeProps {
    events: Event[];
    isAuthenticated: boolean;
}

export default function Home({ events, isAuthenticated }: HomeProps) {
    const handleJoin = (eventId: number) => {
        router.post(`/events/${eventId}/join`);
    };

    return (
        <div style={{ padding: '20px' }}>
            <header style={{ marginBottom: '20px' }}>
                {isAuthenticated ? (
                    <Button href='/dashboard'>
                      Dashboard
                    </Button>
                ) : (
                    <Button href='/login'>
                      Login
                    </Button>
                )}
            </header>
            <h1>Latest Events</h1>
            <div>
                {events.map((event) => (
                    <div key={event.id} style={{ border: '1px solid black', margin: '10px 0', padding: '10px' }}>
                        <h3>{event.title}</h3>
                        <p>Category: {event.category?.name || 'Uncategorized'}</p>
                        <p>{event.description}</p>
                        <button onClick={() => handleJoin(event.id)}>Join Event</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
