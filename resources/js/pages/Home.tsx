import { createElement } from 'react';
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

    return createElement('div', { style: { padding: '20px' } },
        createElement('header', { style: { marginBottom: '20px' } },
            isAuthenticated 
                ? createElement(Link, { href: '/dashboard' }, createElement('button', null, 'Dashboard'))
                : createElement(Link, { href: '/login' }, createElement('button', null, 'Login'))
        ),
        createElement('h1', null, 'Latest Events'),
        createElement('div', null,
            events.map((event) => 
                createElement('div', { key: event.id, style: { border: '1px solid black', margin: '10px 0', padding: '10px' } },
                    createElement('h3', null, event.title),
                    createElement('p', null, `Category: ${event.category?.name || 'Uncategorized'}`),
                    createElement('p', null, event.description),
                    createElement('button', { onClick: () => handleJoin(event.id) }, 'Join Event')
                )
            )
        )
    );
}
