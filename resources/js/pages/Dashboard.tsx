import { createElement } from 'react';
import { Link } from '@inertiajs/react';

interface EventRegistration {
    id: number;
    event?: {
        title: string;
    };
}

interface Event {
    id: number;
    title: string;
}

interface Certificate {
    id: number;
    eventRegistration?: {
        event?: {
            title: string;
        }
    };
}

interface DashboardProps {
    joined_events: EventRegistration[];
    hosted_events: Event[];
    certificates: Certificate[];
}

export default function Dashboard({ joined_events, hosted_events, certificates }: DashboardProps) {
    return createElement('div', { style: { padding: '20px' } },
        createElement('header', { style: { marginBottom: '20px' } },
            createElement(Link, { href: '/' }, createElement('button', null, 'Home'))
        ),
        createElement('h1', null, 'My Dashboard'),
        
        createElement('h2', null, 'Joined Events'),
        createElement('ul', null,
            joined_events.map(reg => 
                createElement('li', { key: reg.id }, reg.event?.title || 'Unknown Event')
            )
        ),

        createElement('h2', null, 'Hosted Events'),
        createElement('ul', null,
            hosted_events.map(ev => 
                createElement('li', { key: ev.id }, ev.title)
            )
        ),

        createElement('h2', null, 'Certificates'),
        createElement('ul', null,
            certificates.map(cert => 
                createElement('li', { key: cert.id }, `Certificate for ${cert.eventRegistration?.event?.title || 'Unknown Event'}`)
            )
        )
    );
}
