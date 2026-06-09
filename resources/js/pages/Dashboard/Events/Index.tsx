import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Calendar, MapPin, Users } from 'lucide-react';
import DefaultCover from '@/../../public/covers/default_cover.jpg';
import Button from '@/components/ui/Button';
import NavBar from '@/layouts/NavBar';
import Footer from '@/layouts/Footer';

interface Event {
  id: number;
  title: string;
  type: 'online' | 'offline';
  poster_url?: string;
  start_datetime: string;
  location_name?: string;
  capacity?: number;
  category?: {
    name: string;
  };
}

interface IndexProps {
  events: {
    data: Event[];
    links: any[];
  };
}

export default function Index({ events }: IndexProps) {
  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus event ini?')) {
      router.delete(`/dashboard/events/${id}`);
    }
  };

  const formatShortDate = (dateString: string) => {
    const dateObj = new Date(dateString);

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj) + " WIB";
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
      <div className="flex-grow">
        <NavBar />
        <Head title="Kelola Event Anda - Dashboard" />

        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 pt-28 flex flex-col gap-8 pb-16">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-6">
          <div>
            <h1 className="text-neutral-900 font-extrabold text-2xl md:text-3xl font-brand tracking-tight">
              Kelola Event
            </h1>
            <p className="text-gray-500 text-base font-medium mt-1">
              Buat, edit, dan pantau seluruh event yang Anda selenggarakan.
            </p>
          </div>
          
          <Button 
            href="/dashboard/events/create" 
            className="flex items-center gap-2 text-base font-bold py-3 px-6 rounded-full shrink-0"
          >
            <Plus size={20} />
            <span>Buat Event Baru</span>
          </Button>
        </div>

        {/* Quick Stats/Dashboard Navigation Links */}
        <div className="flex items-center gap-4 text-small font-bold text-gray-500">
          <Link href="/dashboard" className="hover:text-primary-500">Dashboard Utama</Link>
          <span>/</span>
          <span className="text-primary-500">Kelola Event</span>
        </div>

        {/* Events List */}
        {events.data.length === 0 ? (
          <div className="w-full bg-white border border-neutral-150 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center">
              <Calendar size={28} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-neutral-700 font-bold text-lg font-brand">Belum Ada Event</h3>
              <p className="text-gray-400 text-small max-w-[280px] mx-auto">
                Anda belum menyelenggarakan event apapun. Mulai buat event pertama Anda sekarang!
              </p>
            </div>
            <Button href="/dashboard/events/create" className="mt-2 text-small px-6 py-2.5">
              Buat Event Pertama
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.data.map((event) => (
              <div key={event.id} className="bg-white border border-neutral-150 rounded-3xl shadow-xs overflow-hidden flex flex-col group relative">
                
                {/* Event Type Badge */}
                <div className={`absolute top-4 left-4 z-10 px-3 py-1 font-extrabold text-[0.6275rem] rounded-md shadow-xs ${event.type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {event.type.toUpperCase()}
                </div>

                <div className="relative aspect-3/2 w-full overflow-hidden bg-neutral-100 border-b border-neutral-100">
                  <img 
                    src={event.poster_url || DefaultCover} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                </div>

                <div className="p-6 flex flex-col gap-4 flex-grow">
                  <div className="flex flex-col gap-1.5">
                    {event.category && (
                      <span className="text-secondary-600 font-extrabold text-[0.6275rem] uppercase tracking-wide">
                        {event.category.name}
                      </span>
                    )}
                    <h3 className="text-neutral-900 font-extrabold text-lg leading-tight line-clamp-1 group-hover:text-primary-500 transition-colors">
                      {event.title}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-2 text-gray-500 text-small font-semibold">
                    <span className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400 shrink-0" />
                      {formatShortDate(event.start_datetime)}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400 shrink-0" />
                      <span className="line-clamp-1">{event.type === 'online' ? 'Online' : (event.location_name || 'Lokasi Offline')}</span>
                    </span>
                    {event.capacity && (
                      <span className="flex items-center gap-2">
                        <Users size={14} className="text-gray-400 shrink-0" />
                        <span>Kuota: {event.capacity} Peserta</span>
                      </span>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button 
                        href={`/dashboard/events/${event.id}/edit`} 
                        variant="secondary"
                        className="flex-1 flex items-center justify-center gap-1.5 text-small py-2.5"
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </Button>
                      
                      <button 
                        onClick={() => handleDelete(event.id)}
                        className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 border border-transparent rounded-full hover:text-red-700 transition-all duration-200 cursor-pointer flex items-center justify-center"
                        title="Hapus Event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <Button 
                      href={`/dashboard/events/${event.id}/attendees`}
                      className="w-full text-small py-2.5 bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                    >
                      Daftar Peserta
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
