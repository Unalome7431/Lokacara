import { router } from '@inertiajs/react';
import Button from './Button';

import DefaultCover from '@/../../public/covers/default_cover.jpg';

interface EventCardProps {
  event: {
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
}

export default function EventCard({event}: EventCardProps) {
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
    <div className='w-full border border-neutral-200 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] bg-white overflow-hidden flex flex-col'>
      <div className='w-full aspect-3/2'>
        <img src={event.cover??DefaultCover} alt={event.title} className='w-full h-full object-cover'/>
      </div>

      <div className='p-6 pb-8 flex flex-col h-55'>
        <h6 className='text-base font-text font-bold text-primary-500 leading-tight mb-2'>
          {event.title}
        </h6>
        
        <span className='text-micro font-text text-gray-300 font-normal leading-snug'>
          {formattedDate}
        </span>
        
        <span className='text-micro font-text text-gray-300 font-normal leading-snug'>
          {event.location_name}
        </span>
        
        {/* We keep the button here so you can still join! */}
        <div className="mt-auto">
          <Button onClick={() => handleJoin(event.id)} className="text-small w-full">Join Event</Button>
        </div>
      </div>
    </div>
  )
}