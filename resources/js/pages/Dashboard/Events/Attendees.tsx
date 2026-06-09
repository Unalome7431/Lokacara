import { Head, Link, router } from '@inertiajs/react';
import { 
  ChevronLeft, Search, UserMinus,
  Users, CheckCircle, HelpCircle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import defaultAvatar from '@/../../public/avatars/default.png';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';

interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

interface EventRegistration {
  id: number;
  user?: User;
  checked_in_at?: string;
  status: string;
  created_at: string;
}

interface PaginatorLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Paginator<T> {
  data: T[];
  links: PaginatorLink[];
  total: number;
  current_page: number;
  last_page: number;
}

interface Event {
  id: number;
  title: string;
}

interface AttendeesProps {
  event: Event;
  attendees: Paginator<EventRegistration>;
  filters: {
    search?: string;
  };
}

export default function Attendees({ event, attendees, filters }: AttendeesProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [optimisticAttendance, setOptimisticAttendance] = useState<Record<number, boolean>>({});

  // Perform search queries using Inertia reload
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search !== (filters.search || '')) {
        router.get(
          `/dashboard/events/${event.id}/attendees`,
          { search },
          { preserveState: true, replace: true }
        );
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, event.id, filters.search]);

  const getIsAttended = (regId: number, checkedInAt?: string) => {
    if (regId in optimisticAttendance) {
      return optimisticAttendance[regId];
    }

    return !!checkedInAt;
  };

  const handleToggleAttendance = (regId: number, checkedInAt?: string) => {
    const currentStatus = getIsAttended(regId, checkedInAt);
    const newStatus = !currentStatus;

    setOptimisticAttendance((prev) => ({
      ...prev,
      [regId]: newStatus,
    }));

    router.post(
      `/dashboard/events/${event.id}/attendance/${regId}/toggle`,
      {},
      {
        preserveScroll: true,
        preserveState: true,
        onError: () => {
          setOptimisticAttendance((prev) => ({
            ...prev,
            [regId]: currentStatus,
          }));
        },
      }
    );
  };

  const handleKickAttendee = (regId: number, userName: string) => {
    if (confirm(`Apakah Anda yakin ingin mengeluarkan ${userName} dari event ini?`)) {
      router.delete(
        `/dashboard/events/${event.id}/attendees/${regId}`,
        {
          preserveScroll: true,
          preserveState: true,
        }
      );
    }
  };

  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString);

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(dateObj);
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col justify-between">
      <div className="flex-grow">
        <NavBar />
        <Head title={`Daftar Peserta - ${event.title}`} />

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-16">
        
        {/* Navigation Breadcrumbs */}
        <div className="mb-6">
          <Link 
            href={`/dashboard/events/${event.id}`}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary-500 text-small font-bold transition-colors duration-150"
          >
            <ChevronLeft size={16} />
            <span>Kembali ke Detail Event</span>
          </Link>
        </div>

        {/* Content Card Container */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
          
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div>
              <h2 className="font-brand font-black text-xl md:text-2xl text-neutral-900 tracking-tight flex items-center gap-2">
                <Users className="text-primary-500" size={24} />
                <span>Daftar Peserta</span>
              </h2>
              <p className="text-gray-400 text-micro font-semibold mt-1">
                Mengelola kehadiran dan keanggotaan untuk event <span className="text-neutral-800">{event.title}</span> ({attendees.total} peserta terdaftar)
              </p>
            </div>

            {/* Local Search Input */}
            <div className="relative w-full md:max-w-xs">
              <input 
                type="text" 
                placeholder="Cari nama peserta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-base placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 transition-colors font-medium text-gray-700"
              />
              <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Attendees Table */}
          {attendees.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-gray-400 flex items-center justify-center">
                <HelpCircle size={24} />
              </div>
              <div>
                <h5 className="font-brand font-bold text-neutral-800 text-base">Tidak Ada Peserta ditemukan</h5>
                <p className="text-gray-400 text-small">Tidak ada pendaftar yang cocok dengan pencarian Anda.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-base text-gray-500">
                <thead>
                  <tr className="border-b border-neutral-150 text-neutral-800 font-extrabold text-micro uppercase tracking-wider bg-neutral-50/50">
                    <th className="px-6 py-4">Peserta</th>
                    <th className="px-6 py-4">Tanggal Daftar</th>
                    <th className="px-6 py-4">Kehadiran</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-150">
                  {attendees.data.map((reg) => {
                    const attendeeUser = reg.user;

                    if (!attendeeUser) {
                      return null;
                    }

                    const isAttended = getIsAttended(reg.id, reg.checked_in_at);

                    return (
                      <tr key={reg.id} className="hover:bg-neutral-50/30 transition-colors">
                        
                        {/* Avatar/Details */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-200 shrink-0">
                              <img 
                                src={attendeeUser.avatar_url || defaultAvatar} 
                                alt={attendeeUser.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-neutral-900 font-extrabold text-small leading-tight truncate">{attendeeUser.name}</span>
                              <span className="text-gray-400 text-micro font-medium mt-0.5 truncate">{attendeeUser.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Registration date */}
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-neutral-700 text-small">
                          {formatDate(reg.created_at)}
                        </td>

                        {/* Presence Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 font-bold text-micro rounded-full shadow-xs uppercase tracking-wider ${
                            isAttended 
                              ? 'bg-green-50 text-green-700 border border-green-150' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isAttended && <CheckCircle size={10} />}
                            <span>{isAttended ? 'Hadir' : 'Tidak Hadir'}</span>
                          </span>
                        </td>

                        {/* Action Switches */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-4">
                            
                            {/* Toggle Switch */}
                            <div className="flex items-center gap-2">
                              <span className="text-micro font-semibold text-gray-400">
                                {isAttended ? 'Check-in' : 'Belum'}
                              </span>
                              
                              <button 
                                type="button"
                                onClick={() => handleToggleAttendance(reg.id, reg.checked_in_at)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  isAttended ? 'bg-primary-500' : 'bg-gray-200'
                                }`}
                              >
                                <span 
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    isAttended ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Kick Out Button */}
                            <button 
                              type="button"
                              onClick={() => handleKickAttendee(reg.id, attendeeUser.name)}
                              className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-full border-0 cursor-pointer transition-colors flex items-center justify-center"
                              title="Keluarkan Peserta"
                            >
                              <UserMinus size={14} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {attendees.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-100 pt-6">
              <span className="text-micro font-semibold text-gray-400">
                Halaman {attendees.current_page} dari {attendees.last_page}
              </span>
              
              <div className="flex gap-1.5">
                {attendees.links.map((link, idx) => {
                  if (!link.url) {
                    return (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 bg-neutral-50 text-gray-300 font-bold text-micro rounded-lg cursor-not-allowed select-none border border-neutral-150"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    );
                  }

                  return (
                    <Link
                      key={idx}
                      href={link.url}
                      className={`px-3 py-1.5 font-bold text-micro rounded-lg border transition-colors ${
                        link.active 
                          ? 'bg-primary-500 text-white border-primary-500 shadow-sm' 
                          : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200'
                      }`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
