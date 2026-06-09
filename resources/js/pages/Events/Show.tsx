import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
  Calendar, MapPin, ChevronLeft, ArrowUpRight, 
  CheckCircle2, Eye
} from 'lucide-react';
import React, { useState } from 'react';
import DefaultCover from '@/../../public/covers/default_cover.jpg';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';

interface Category {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Event {
  id: number;
  title: string;
  poster_url?: string;
  description: string;
  type: 'online' | 'offline';
  location_name?: string;
  address?: string;
  platform_name?: string;
  link?: string;
  start_datetime: string;
  end_datetime: string;
  capacity?: number;
  category?: Category;
  user?: User;
  view_count: number;
  event_registrations_count?: number;
}

interface ShowProps {
  event: Event;
  isRegistered: boolean;
}

export default function Show({ event, isRegistered }: ShowProps) {
  const page = usePage();
  const { auth } = page.props as any;
  const user = auth?.user;
  const isAuthenticated = !!user;

  const [isJoining, setIsJoining] = useState(false);

  const formatLongDate = (dateString: string) => {
    const dateObj = new Date(dateString);

    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj) + ' WIB';
  };

  const handleJoinEvent = () => {
    if (isJoining) {
      return;
    }

    setIsJoining(true);
    router.post(`/events/${event.id}/join`, {}, {
      preserveScroll: true,
      onFinish: () => setIsJoining(false),
    });
  };

  // Calculate remaining capacity if capacity is defined
  const registeredCount = event.event_registrations_count ?? 0;
  const hasCapacityLimit = !!event.capacity;
  const remainingCapacity = hasCapacityLimit && event.capacity 
    ? Math.max(0, event.capacity - registeredCount) 
    : null;

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col justify-between">
      <div className="flex-grow">
        <NavBar />
        <Head title={`${event.title} - Lokacara`} />

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-16">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary-500 text-small font-bold transition-colors duration-150"
          >
            <ChevronLeft size={16} />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Panel: Poster & Info Details */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Main Header Container */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
              
              {/* Cover Image */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-150">
                <img 
                  src={event.poster_url || DefaultCover} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-4 left-4 z-10 px-3 py-1 font-extrabold text-micro rounded-lg shadow-sm uppercase tracking-wider ${
                  event.type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {event.type}
                </div>
              </div>

              {/* Title & Category & Host */}
              <div className="flex flex-col gap-2">
                {event.category && (
                  <span className="text-secondary-600 font-extrabold text-small uppercase tracking-wider">
                    {event.category.name}
                  </span>
                )}
                <h1 className="font-brand font-black text-2xl md:text-4xl text-neutral-900 leading-tight">
                  {event.title}
                </h1>
                
                {event.user && (
                  <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-neutral-100">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-500 text-micro font-bold uppercase shrink-0">
                      {event.user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-neutral-500 text-micro font-semibold uppercase tracking-wider">Diselenggarakan Oleh</span>
                      <span className="text-neutral-800 text-base font-bold leading-tight">{event.user.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="border-t border-neutral-150 pt-6">
                <h4 className="font-brand font-black text-lg text-neutral-900 mb-3">Deskripsi Event</h4>
                <p className="text-neutral-700 text-base leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* Date & Location */}
              <div className="border-t border-neutral-150 pt-6 flex flex-col gap-4">
                <h4 className="font-brand font-black text-lg text-neutral-900">Waktu & Lokasi</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Calendar details */}
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-micro font-bold uppercase tracking-wider">Waktu Mulai</span>
                      <span className="text-neutral-800 font-bold text-small mt-0.5">{formatLongDate(event.start_datetime)}</span>
                      
                      <span className="text-gray-400 text-micro font-bold uppercase tracking-wider mt-3">Waktu Selesai</span>
                      <span className="text-neutral-800 font-bold text-small mt-0.5">{formatLongDate(event.end_datetime)}</span>
                    </div>
                  </div>

                  {/* Location details */}
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
                      <MapPin size={18} />
                    </div>
                    
                    {event.type === 'offline' ? (
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-micro font-bold uppercase tracking-wider">Tempat</span>
                        <span className="text-neutral-800 font-bold text-small mt-0.5">{event.location_name || 'Tidak Ditentukan'}</span>
                        {event.address && (
                          <span className="text-gray-500 text-micro font-semibold mt-1.5">{event.address}</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-micro font-bold uppercase tracking-wider">Platform Online</span>
                        <span className="text-neutral-800 font-bold text-small mt-0.5">{event.platform_name || 'Webinar Online'}</span>
                        {event.link && isRegistered && (
                          <a 
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 font-bold text-micro mt-2"
                          >
                            <span>Gabung Platform</span>
                            <ArrowUpRight size={12} />
                          </a>
                        )}
                        {event.link && !isRegistered && (
                          <span className="text-gray-400 text-micro font-semibold mt-2 italic">
                            Link gabung tersedia setelah mendaftar
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>

          </div>

          {/* Right Panel: Registration Card */}
          <div className="flex flex-col gap-6">
            
            {/* Main Action Registration Card */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6 sticky top-28">
              
              <div>
                <h4 className="font-brand font-black text-lg text-neutral-900 border-b border-neutral-100 pb-3">Informasi Pendaftaran</h4>
              </div>

              {/* Stats & capacity */}
              <div className="flex flex-col gap-4">
                
                {/* Capacity Card */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex flex-col gap-1">
                  <span className="text-gray-400 text-micro font-bold uppercase tracking-wider">Ketersediaan Tiket</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-neutral-800 font-black text-2xl">
                      {remainingCapacity !== null ? remainingCapacity : '∞'}
                    </span>
                    {hasCapacityLimit && (
                      <span className="text-gray-400 font-semibold text-small">
                        / {event.capacity} Total
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-[0.65rem] font-semibold mt-0.5">
                    {hasCapacityLimit ? 'Kapasitas terbatas, segera amankan tiket Anda' : 'Kapasitas tidak terbatas'}
                  </p>
                </div>

                {/* Popularity Card */}
                <div className="flex items-center justify-between px-2 text-gray-400 text-micro font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Eye size={14} className="text-gray-400" />
                    <span>{event.view_count || 0} Dilihat</span>
                  </span>
                  <span>Free / Gratis</span>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-neutral-100 flex flex-col gap-3">
                {isRegistered ? (
                  <div className="flex flex-col gap-3">
                    <div className="w-full py-3.5 bg-green-50 border border-green-200 text-green-700 font-bold text-base rounded-full flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} className="text-green-600" />
                      <span>Anda Sudah Terdaftar</span>
                    </div>
                    
                    <Link 
                      href={`/events/${event.id}/ticket`}
                      className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-center text-base rounded-full transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Lihat Tiket QR Anda</span>
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <>
                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={handleJoinEvent}
                        disabled={isJoining || (remainingCapacity !== null && remainingCapacity <= 0)}
                        className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-300 text-white font-bold text-base rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-0 flex items-center justify-center gap-2"
                      >
                        {isJoining ? 'Mendaftar...' : (remainingCapacity !== null && remainingCapacity <= 0 ? 'Kuota Penuh' : 'Ikuti Event Sekarang')}
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-center text-base rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        Masuk untuk Bergabung
                      </Link>
                    )}
                  </>
                )}
              </div>

            </div>

          </div>

        </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
