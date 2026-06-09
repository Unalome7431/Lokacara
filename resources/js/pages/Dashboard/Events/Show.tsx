import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { 
  Calendar, MapPin, QrCode, 
  Edit, Users, ChevronLeft, ArrowUpRight, CheckCircle2, AlertTriangle, X 
} from 'lucide-react';
import React, { useState } from 'react';
import DefaultCover from '@/../../public/covers/default_cover.jpg';
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
}

interface ShowProps {
  event: Event;
  total_attendees: number;
  checked_in_attendees: number;
  remaining_capacity: number | null;
}

export default function Show({ event, total_attendees, checked_in_attendees, remaining_capacity }: ShowProps) {
  const page = usePage();
  const flash = (page.props as any).flash || {};
  
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Form for scanning attendee QR tokens
  const scanForm = useForm({
    qr_token: '',
  });

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scanForm.post(`/dashboard/events/${event.id}/attendance/scan`, {
      preserveScroll: true,
      onSuccess: () => {
        scanForm.reset();
      },
    });
  };

  const formatLongDate = (dateString: string) => {
    const dateObj = new Date(dateString);

    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj) + ' WIB';
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col justify-between">
      <div className="flex-grow">
        <NavBar />
        <Head title={`Detail Event - ${event.title}`} />

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-16">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary-500 text-small font-bold transition-colors duration-150"
          >
            <ChevronLeft size={16} />
            <span>Kembali ke Dashboard</span>
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

              {/* Title & Category */}
              <div className="flex flex-col gap-2">
                {event.category && (
                  <span className="text-secondary-600 font-extrabold text-small uppercase tracking-wider">
                    {event.category.name}
                  </span>
                )}
                <h1 className="font-brand font-black text-2xl md:text-3xl text-neutral-900 leading-tight">
                  {event.title}
                </h1>
              </div>

              {/* Description */}
              <div className="border-t border-neutral-150 pt-6">
                <h4 className="font-brand font-black text-base text-neutral-900 mb-3">Deskripsi Event</h4>
                <p className="text-neutral-700 text-base leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* Date & Location */}
              <div className="border-t border-neutral-150 pt-6 flex flex-col gap-4">
                <h4 className="font-brand font-black text-base text-neutral-900">Waktu & Lokasi</h4>
                
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
                        {event.link && (
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
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>

          </div>

          {/* Right Panel: Attendance Stats & Controls */}
          <div className="flex flex-col gap-6">
            
            {/* Stats Cards */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <h4 className="font-brand font-black text-base text-neutral-900 border-b border-neutral-100 pb-3">Statistik Event</h4>
              
              <div className="grid grid-cols-1 gap-4">
                
                {/* Kuota Card */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <span className="text-gray-400 text-micro font-bold uppercase tracking-wider">Kuota Tersisa</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-neutral-800 font-black text-2xl">
                      {remaining_capacity !== null ? remaining_capacity : '∞'}
                    </span>
                    {event.capacity && (
                      <span className="text-gray-400 font-semibold text-small">
                        / {event.capacity} Total
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-[0.65rem] mt-1 font-semibold">
                    {remaining_capacity !== null ? 'Kuota bangku peserta tersisa' : 'Kapasitas event tidak dibatasi'}
                  </p>
                </div>

                {/* Hadir/Total Card */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <span className="text-gray-400 text-micro font-bold uppercase tracking-wider">Kehadiran Peserta</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-neutral-800 font-black text-2xl">
                      {checked_in_attendees}
                    </span>
                    <span className="text-gray-400 font-semibold text-small">
                      / {total_attendees} Terdaftar
                    </span>
                  </div>
                  <p className="text-gray-400 text-[0.65rem] mt-1 font-semibold">
                    Peserta yang sudah check-in kehadiran di venue
                  </p>
                </div>

              </div>
            </div>

            {/* Actions card */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
              <h4 className="font-brand font-black text-base text-neutral-900 border-b border-neutral-100 pb-3">Menu Pengelola</h4>
              
              <button 
                type="button"
                onClick={() => {
                  scanForm.clearErrors();
                  scanForm.reset();
                  setIsScanModalOpen(true);
                }}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-base rounded-full shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                <QrCode size={18} />
                <span>Scan QR Kehadiran</span>
              </button>

              <Link 
                href={`/dashboard/events/${event.id}/edit`}
                className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-base rounded-full transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                <span>Edit Detail Event</span>
              </Link>

              <Link 
                href={`/dashboard/events/${event.id}/attendees`}
                className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-base rounded-full transition-colors flex items-center justify-center gap-2"
              >
                <Users size={16} />
                <span>Daftar Peserta</span>
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* QR SCAN MODAL */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsScanModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden z-[101] animate-in fade-in zoom-in-95 duration-200 p-6 flex flex-col gap-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h4 className="font-brand font-black text-lg text-neutral-900 flex items-center gap-2">
                <QrCode size={20} className="text-primary-500" />
                <span>Scan QR Tiket Kehadiran</span>
              </h4>
              <button 
                type="button"
                onClick={() => setIsScanModalOpen(false)}
                className="p-1 bg-neutral-100 hover:bg-neutral-200 rounded-full border-0 cursor-pointer flex items-center justify-center text-neutral-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Camera Frame Mock */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-950 flex flex-col items-center justify-center">
              <div className="absolute inset-10 border-2 border-dashed border-primary-500/60 rounded-xl flex flex-col items-center justify-center">
                <div className="w-full h-0.5 bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              </div>
              <span className="text-white/60 font-semibold text-micro uppercase tracking-wider mt-2 z-10">Kamera Scanner Aktif (Simulasi)</span>
            </div>

            {/* Scanner alerts */}
            {scanForm.wasSuccessful && flash.success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-micro font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{flash.success}</span>
              </div>
            )}
            {flash.warning && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-micro font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{flash.warning}</span>
              </div>
            )}
            {scanForm.errors.qr_token && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-micro font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{scanForm.errors.qr_token}</span>
              </div>
            )}

            {/* Input fields */}
            <form onSubmit={handleScanSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-700 font-bold text-micro uppercase tracking-wider font-brand">Token Tiket UUID</label>
                <input 
                  type="text" 
                  value={scanForm.data.qr_token}
                  onChange={(e) => scanForm.setData('qr_token', e.target.value)}
                  required
                  placeholder="Contoh: 123e4567-e89b-12d3-a456-426614174000"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-base placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 transition-colors"
                />
              </div>

              <button 
                type="submit" 
                disabled={scanForm.processing}
                className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-bold text-base rounded-full shadow-md cursor-pointer transition-colors border-0"
              >
                {scanForm.processing ? 'Memproses...' : 'Kirim Token Kehadiran'}
              </button>
            </form>

          </div>

        </div>
      )}

      </div>
      <Footer />
    </div>
  );
}
