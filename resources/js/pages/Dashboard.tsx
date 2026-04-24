import { Link } from '@inertiajs/react';
import Button from '@/components/ui/Button';
import NavBar from '@/layouts/NavBar';

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
    return (
      <>
        <NavBar />

        <div style={{ padding: '20px' }}>
            <h1>My Dashboard</h1>

            <h2>Joined Events</h2>
            <ul>
                {joined_events.map((reg) => (
                    <li key={reg.id}>{reg.event?.title || 'Unknown Event'}</li>
                ))}
            </ul>

            <h2>Hosted Events</h2>
            <ul>
                {hosted_events.map((ev) => (
                    <li key={ev.id}>{ev.title}</li>
                ))}
            </ul>

            <h2>Certificates</h2>
            <ul>
                {certificates.map((cert) => (
                    <li key={cert.id}>
                        Certificate for {cert.eventRegistration?.event?.title || 'Unknown Event'}
                    </li>
                ))}
            </ul>
        </div>
      </>
    );
}
