import { Head, Link } from '@inertiajs/react';
import { 
  Calendar, Bookmark, Award, Search, MapPin, Plus, FileText, ExternalLink 
} from 'lucide-react';
import { useState } from 'react';
import defaultAvatar from '@/../../public/avatars/default.png';
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
  platform_name?: string;
  start_datetime: string;
  category?: Category;
}

interface EventRegistration {
  id: number;
  event?: Event;
}

interface Certificate {
  id: number;
  eventRegistration?: {
    event?: {
      title: string;
    };
  };
}

interface DashboardProps {
  hosted_events: Event[];
  joined_events: EventRegistration[];
  certificates: Certificate[];
  auth: {
    user: {
      name: string;
      email: string;
      avatar_url?: string;
      role?: string;
    };
  };
}

export default function Dashboard({ hosted_events = [], joined_events = [], certificates = [], auth }: DashboardProps) {
  const user = auth?.user;
  const [activeTab, setActiveTab] = useState<'Event Terbuat' | 'Event Tersimpan' | 'Sertifikat'>('Event Terbuat');
  const [searchQuery, setSearchQuery] = useState('');



  const formatShortDate = (dateString: string) => {
    const dateObj = new Date(dateString);

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj) + ' WIB';
  };

  // Client-side searches
  const filteredHostedEvents = hosted_events.filter(event => 
    event.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJoinedEvents = joined_events.filter(reg => 
    reg.event?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col justify-between">
      <div className="flex-grow">
        <NavBar />
        <Head title="Dashboard Saya - Lokacara" />

        {/* Main Dashboard Layout */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-16">
        
        {/* User profile section */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm mb-10">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-100 shrink-0">
            <img 
              src={user?.avatar_url || defaultAvatar} 
              alt={user?.name || 'User'} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1.5 justify-center md:justify-start">
              <h2 className="font-brand font-black text-2xl tracking-tight text-neutral-900 leading-none">
                {user?.name || 'Pengguna Lokacara'}
              </h2>
              {user?.role === 'admin' && (
                <span className="px-2.5 py-0.5 bg-red-100 text-red-800 font-extrabold text-[0.65rem] tracking-wider rounded-md uppercase self-center">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-gray-500 font-semibold text-small leading-none mb-4">{user?.email}</p>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Link 
                href="/settings" 
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-micro font-bold rounded-full transition-colors duration-150"
              >
                Edit Profile & Kata Sandi
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-4 border-b border-neutral-200">
          {/* Tab Toggles */}
          <div className="flex overflow-x-auto gap-2 p-1 bg-neutral-100 rounded-2xl self-start shrink-0">
            {(['Event Terbuat', 'Event Tersimpan', 'Sertifikat'] as const).map((tab) => {
              const isActive = activeTab === tab;
              let count = 0;

              if (tab === 'Event Terbuat') {
                count = hosted_events.length;
              } else if (tab === 'Event Tersimpan') {
                count = joined_events.length;
              } else if (tab === 'Sertifikat') {
                count = certificates.length;
              }

              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSearchQuery('');
                  }}
                  className={`px-5 py-2.5 rounded-xl text-small font-bold transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer border-0 ${
                    isActive 
                      ? 'bg-white text-primary-500 shadow-sm' 
                      : 'text-gray-500 hover:text-neutral-900 bg-transparent'
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`px-2 py-0.5 text-micro rounded-full font-extrabold ${
                    isActive ? 'bg-primary-50 text-primary-600' : 'bg-neutral-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          {activeTab !== 'Sertifikat' && (
            <div className="relative w-full md:max-w-xs">
              <input 
                type="text" 
                placeholder="Cari nama event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-neutral-200 rounded-2xl text-base placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-0 transition-colors font-medium text-gray-700"
              />
              <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content Tab Bodies */}
        <div className="min-h-[300px]">
          
          {/* Event Terbuat Tab */}
          {activeTab === 'Event Terbuat' && (
            filteredHostedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-neutral-200 rounded-3xl text-center gap-4 shadow-sm animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center">
                  <Calendar size={28} />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-neutral-800 font-bold text-base">Belum Ada Event</h4>
                  <p className="text-gray-400 text-small max-w-[280px]">Anda belum menyelenggarakan event apapun.</p>
                </div>
                <Link 
                  href="/dashboard/events/create" 
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-small rounded-full shadow-md transition-all flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  <span>Buat Event Baru</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                {filteredHostedEvents.map((event) => (
                  <div key={event.id} className="bg-white border border-neutral-200 rounded-3xl overflow-hidden flex flex-col shadow-sm hover:border-primary-200 transition-all duration-200">
                    <div className="relative aspect-video w-full bg-neutral-100 border-b border-neutral-100">
                      <img 
                        src={event.poster_url || "/covers/default_cover.jpg"} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-3 left-3 z-10 px-2.5 py-0.5 font-extrabold text-[0.6rem] rounded-md shadow-xs uppercase tracking-wide ${
                        event.type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {event.type}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col gap-3 flex-grow">
                      <div>
                        {event.category && (
                          <span className="text-secondary-600 font-extrabold text-micro uppercase tracking-wide">
                            {event.category.name}
                          </span>
                        )}
                        <h4 className="text-neutral-900 font-extrabold text-base leading-snug line-clamp-1 mt-0.5">
                          {event.title}
                        </h4>
                      </div>

                      <div className="flex flex-col gap-1 text-gray-500 text-small font-semibold">
                        <span className="flex items-center gap-1.5 truncate">
                          <MapPin size={12} className="text-gray-400 shrink-0" />
                          <span>{event.type === 'online' ? 'Online' : (event.location_name || 'Offline')}</span>
                        </span>
                        <span className="text-micro text-gray-400 font-medium">
                          {formatShortDate(event.start_datetime)}
                        </span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                        <Link 
                          href={`/dashboard/events/${event.id}`} 
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-micro rounded-full transition-colors"
                        >
                          <span>Detail Event</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Event Tersimpan Tab */}
          {activeTab === 'Event Tersimpan' && (
            filteredJoinedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-neutral-200 rounded-3xl text-center gap-4 shadow-sm animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center">
                  <Bookmark size={28} />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-neutral-800 font-bold text-base">Belum Ada Event Terdaftar</h4>
                  <p className="text-gray-400 text-small max-w-[280px]">Anda belum mendaftar ke event apa pun.</p>
                </div>
                <Link 
                  href="/" 
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-small rounded-full shadow-md transition-all"
                >
                  Cari Event Menarik
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                {filteredJoinedEvents.map((reg) => {
                  const event = reg.event;

                  if (!event) {
                    return null;
                  }

                  return (
                    <div key={reg.id} className="bg-white border border-neutral-200 rounded-3xl overflow-hidden flex flex-col shadow-sm hover:border-primary-200 transition-all duration-200">
                      <div className="relative aspect-video w-full bg-neutral-100 border-b border-neutral-100">
                        <img 
                          src={event.poster_url || "/covers/default_cover.jpg"} 
                          alt={event.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute top-3 left-3 z-10 px-2.5 py-0.5 font-extrabold text-[0.6rem] rounded-md shadow-xs uppercase tracking-wide ${
                          event.type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {event.type}
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col gap-3 flex-grow">
                        <div>
                          {event.category && (
                            <span className="text-secondary-600 font-extrabold text-micro uppercase tracking-wide">
                              {event.category.name}
                            </span>
                          )}
                          <h4 className="text-neutral-900 font-extrabold text-base leading-snug line-clamp-1 mt-0.5">
                            {event.title}
                          </h4>
                        </div>

                        <div className="flex flex-col gap-1 text-gray-500 text-small font-semibold">
                          <span className="flex items-center gap-1.5 truncate">
                            <MapPin size={12} className="text-gray-400 shrink-0" />
                            <span>{event.type === 'online' ? 'Online' : (event.location_name || 'Offline')}</span>
                          </span>
                          <span className="text-micro text-gray-400 font-medium">
                            {formatShortDate(event.start_datetime)}
                          </span>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                          <Link 
                            href={`/events/${event.id}`} 
                            className="flex-grow flex items-center justify-center gap-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-micro rounded-full transition-colors"
                          >
                            <span>Lihat Detail Event</span>
                          </Link>
                          <Link 
                            href={`/events/${event.id}/ticket`} 
                            className="flex items-center justify-center p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full transition-colors"
                            title="Lihat Tiket QR"
                          >
                            <FileText size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Sertifikat Tab */}
          {activeTab === 'Sertifikat' && (
            certificates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-neutral-200 rounded-3xl text-center gap-4 shadow-sm animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center">
                  <Award size={28} />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-neutral-800 font-bold text-base">Belum Ada Sertifikat</h4>
                  <p className="text-gray-400 text-small max-w-[280px]">Sertifikat event Anda akan muncul di sini setelah didistribusikan oleh penyelenggara.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                {certificates.map((cert) => (
                  <div key={cert.id} className="bg-white border border-neutral-200 rounded-3xl p-6 flex flex-col gap-4 shadow-sm hover:border-primary-200 transition-all duration-200">
                    <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center shrink-0">
                      <Award size={22} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400 text-micro font-bold uppercase tracking-wider">E-SERTIFIKAT RESMI</span>
                      <h4 className="text-neutral-900 font-extrabold text-base leading-tight">
                        {cert.eventRegistration?.event?.title || 'Event Lokacara'}
                      </h4>
                    </div>
                    
                    <a 
                      href={`/certificates/${cert.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-micro rounded-full text-center shadow-md transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Unduh PDF</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            )
          )}

        </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
