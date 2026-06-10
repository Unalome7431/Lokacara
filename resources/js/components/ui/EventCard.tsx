import { router } from '@inertiajs/react';
import Button from './Button';

import DefaultCover from '@/../../public/covers/default_cover.jpg';

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

interface EventCardProps {
  event: Event;
  isDetail?: boolean;
}

export default function EventCard({event, isDetail = true}: EventCardProps) {
  const handleJoin = (eventId: number) => {
    router.post(`/events/${eventId}/join`);
  };

  const dateObj = new Date(event.start_datetime);

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(dateObj);

  return(
    <div className='w-full border border-neutral-200 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] bg-white overflow-hidden flex flex-col h-[410px]'>
      <div className='w-full h-[180px] shrink-0'>
        <img src={event.cover??DefaultCover} alt={event.title} className='w-full h-full object-cover'/>
      </div>

      <div className='p-6 pb-8 flex flex-col justify-between flex-grow'>
        <div>
          <h6 className='text-base font-brand font-bold text-primary-500 leading-tight mb-2 line-clamp-3 h-[72px]'>
            {event.title}
          </h6>
          
          <span className='text-micro font-brand text-gray-300 font-normal leading-snug block'>
            {formattedDate}
          </span>
          
          <span className='text-micro font-brand text-gray-300 font-normal leading-snug block'>
            {event.location_name}
          </span>
        </div>
        
        {/* We keep the button here so you can still join! */}
        <div className="mt-auto">
          {isDetail ?
            <Button href='/dashboard' className="text-small w-full">Detail Event</Button>
            :
            <Button onClick={() => handleJoin(event.id)} className="text-small w-full">Join Event</Button>
          }
        </div>
      </div>
    </div>
  )
}