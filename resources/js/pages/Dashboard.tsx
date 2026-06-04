import EventCard from '@/components/ui/EventCard';
import NavBar from '@/layouts/NavBar';

interface EventRegistration {
  id: number;
  event: Event;
}

interface Event {
    id: number;
    title: string;
    cover: string;
    start_datetime: string;
    location_name: string;
    description: string;
    category?: {
        name: string;
    };
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

        <div className='p-20 pt-30'>
            <h2 className='font-brand font-bold mb-5'>My Dashboard</h2>

            <h5 className='font-brand font-bold mb-5'>Event Terdaftar</h5>
            <ul className='grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-3'>
                {joined_events.map((reg) => (
                    <EventCard key={reg.id} event={reg.event}/>
                ))}
            </ul>

            <h5 className='font-brand font-bold mb-5'>Event Dibuat</h5>
            <ul className='grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-3'>
                {hosted_events.map((ev) => (
                    <EventCard key={ev.id} event={ev}/>
                ))}
            </ul>

            <h5 className='font-brand font-bold mb-5'>E-Sertifikat</h5>
            <ul className='grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-3'>
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
