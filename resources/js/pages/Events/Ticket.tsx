import { Head, Link } from '@inertiajs/react';
import { 
  Calendar, MapPin, ChevronLeft, CheckCircle2, 
  Clock, AlertCircle, ArrowUpRight
} from 'lucide-react';
import React from 'react';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';

interface Category {
  id: number;
  name: string;
}

interface Event {
  id: number;
  title: string;
  poster_url?: string;
  type: 'online' | 'offline';
  location_name?: string;
  address?: string;
  platform_name?: string;
  link?: string;
  start_datetime: string;
  end_datetime: string;
  category?: Category;
}

interface EventRegistration {
  id: number;
  qr_token: string;
  checked_in_at?: string;
  status: string;
}

interface TicketProps {
  event: Event;
  registration: EventRegistration;
}

export default function Ticket({ event, registration }: TicketProps) {
  const isCheckedIn = !!registration.checked_in_at;

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

  // Generate QR Code URL using api.qrserver.com
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registration.qr_token)}`;

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col justify-between">
      <div className="flex-grow">
        <NavBar />
        <Head title={`Tiket Event - ${event.title}`} />

        <div className="max-w-3xl mx-auto px-4 md:px-8 pt-28 pb-16">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link 
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary-500 text-small font-bold transition-colors duration-150"
          >
            <ChevronLeft size={16} />
            <span>Kembali ke Detail Event</span>
          </Link>
        </div>

        {/* Ticket Container */}
        <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-lg flex flex-col md:flex-row">
          
          {/* Left / Top Section: Event Info (Ticket Body) */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              
              {/* Category */}
              {event.category && (
                <span className="text-secondary-600 font-extrabold text-micro uppercase tracking-wider">
                  {event.category.name}
                </span>
              )}

              {/* Title */}
              <h2 className="font-brand font-black text-xl md:text-2xl text-neutral-900 leading-snug">
                {event.title}
              </h2>

              {/* Date details */}
              <div className="flex gap-2.5 items-start text-gray-600 text-small">
                <Calendar size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-400 text-micro uppercase tracking-wider">Waktu Acara</span>
                  <span className="font-bold text-neutral-800 mt-0.5">{formatLongDate(event.start_datetime)}</span>
                </div>
              </div>

              {/* Location details */}
              <div className="flex gap-2.5 items-start text-gray-600 text-small">
                <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-400 text-micro uppercase tracking-wider">Lokasi / Platform</span>
                  <span className="font-bold text-neutral-800 mt-0.5">
                    {event.type === 'offline' ? (event.location_name || 'Lokasi Offline') : (event.platform_name || 'Webinar Online')}
                  </span>
                  {event.type === 'offline' && event.address && (
                    <span className="text-gray-400 text-micro font-medium mt-1">{event.address}</span>
                  )}
                  {event.type === 'online' && event.link && isCheckedIn && (
                    <a 
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 font-bold text-micro mt-1.5"
                    >
                      <span>Link Gabung Webinar</span>
                      <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* Verification Status Badge */}
            <div className="mt-4 pt-4 border-t border-neutral-100">
              {isCheckedIn ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 font-bold text-micro rounded-full uppercase tracking-wider">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <span>Kehadiran Terverifikasi</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-800 font-bold text-micro rounded-full uppercase tracking-wider">
                  <Clock size={14} className="text-yellow-600" />
                  <span>Belum Check-in</span>
                </div>
              )}
            </div>

          </div>

          {/* Dotted Tear Line (Visual Separator) */}
          <div className="hidden md:flex flex-col justify-between items-center py-4 relative shrink-0">
            <div className="w-4 h-4 bg-neutral-50/50 rounded-full border-b border-neutral-200 -mt-6 z-10" />
            <div className="border-l-2 border-dashed border-neutral-200 h-full my-2" />
            <div className="w-4 h-4 bg-neutral-50/50 rounded-full border-t border-neutral-200 -mb-6 z-10" />
          </div>

          {/* Dotted Tear Line Mobile */}
          <div className="flex md:hidden items-center justify-between px-4 shrink-0 relative">
            <div className="w-4 h-4 bg-neutral-50/50 rounded-full border-r border-neutral-200 -ml-6 z-10" />
            <div className="border-t-2 border-dashed border-neutral-200 w-full mx-2" />
            <div className="w-4 h-4 bg-neutral-50/50 rounded-full border-l border-neutral-200 -mr-6 z-10" />
          </div>

          {/* Right / Bottom Section: QR Code Code (Ticket Stub) */}
          <div className="w-full md:w-64 bg-neutral-50/40 p-6 md:p-8 flex flex-col items-center justify-center gap-4 text-center shrink-0 border-t md:border-t-0 md:border-l border-neutral-200">
            <span className="text-neutral-500 font-bold text-micro uppercase tracking-wider">Pindai QR Code</span>
            
            {/* QR Image Wrapper */}
            <div className="p-3 bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden w-44 h-44 flex items-center justify-center shrink-0">
              <img 
                src={qrCodeUrl} 
                alt="QR Code Ticket" 
                className="w-full h-full object-contain"
              />
            </div>

            {/* Token details */}
            <div className="flex flex-col gap-0.5">
              <span className="text-gray-400 text-[0.6rem] font-bold uppercase tracking-wider">Token ID</span>
              <span className="text-neutral-800 font-mono text-micro font-bold break-all max-w-[180px]">{registration.qr_token}</span>
            </div>

          </div>

        </div>

        {/* Instuksi Penggunaan */}
        <div className="mt-8 p-5 bg-blue-50/60 border border-blue-150 rounded-2xl flex gap-3 text-blue-900">
          <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-small">
            <h5 className="font-bold">Petunjuk Check-in</h5>
            <p className="font-medium text-blue-800 leading-relaxed">
              Tunjukkan QR Code ini kepada panitia/penyelenggara acara saat tiba di lokasi. Setelah panitia melakukan pemindaian (scan) berhasil, kehadiran Anda akan terverifikasi secara otomatis.
            </p>
          </div>
        </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
