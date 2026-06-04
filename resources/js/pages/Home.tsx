import EventCard from '@/components/ui/EventCard';
import NavBar from '@/layouts/NavBar';

// Using interfaces to map data structure
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

interface HomeProps {
    events: Event[];
    isAuthenticated: boolean;
}

export default function Home({ events, isAuthenticated }: HomeProps) {
    return (
      <>
        <NavBar isAuthenticated={isAuthenticated}/>
        <div className='p-20 pt-30'>
            <h5 className='font-brand font-bold mb-5'>Event Terdekat</h5>
            <div className='grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-3'>
                {events.map((event) => (
                    <EventCard key={event.id} event={event} isDetail={false} />
                ))}
            </div>
        </div>
      </>
    );
}
