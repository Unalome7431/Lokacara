import { usePage, router, Link } from '@inertiajs/react';
import { Search, MapPin, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import defaultAvatar from '@/../../public/avatars/default.png';
import faviconUrl from '@/../../public/favicon.svg';
import Button from '@/components/ui/Button';

export default function NavBar() {
  const page = usePage();
  const { auth } = page.props as any;
  const user = auth?.user;
  const isAuthenticated = !!user;

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white h-18 shadow-sm">
        {/* Logo and Home Button */}
        <a href="/" className='flex items-center gap-2 shrink-0'>
          <img src={faviconUrl} alt="Lokacara" className='w-6 h-7.5'/>
          <span className='font-brand font-black text-2xl tracking-tight text-primary-500'>lokacara</span>
        </a>

        {/* Search Bar and Location */}
        <form 
          action="/events/search" 
          method="GET" 
          className='hidden md:flex items-center gap-3 px-5 py-2 border border-gray-200 rounded-full bg-gray-50/50 hover:bg-white focus-within:bg-white focus-within:border-primary-500 focus-within:shadow-sm transition-all duration-200 w-full max-w-[480px]'
        >
          {/* Search Input */}
          <div className='flex items-center gap-2 flex-1'>
            <Search className='text-gray-400 w-4 h-4 shrink-0' />
            <input 
              type='text' 
              name='keyword'
              placeholder='Cari'
              className='w-full text-base placeholder-gray-400 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 font-brand font-normal text-gray-700'
            />
          </div>

          <div className='h-4 w-px bg-gray-200 shrink-0'></div>

          {/* Location Input */}
          <div className='flex items-center gap-2 flex-1'>
            <MapPin className='text-gray-400 w-4 h-4 shrink-0' />
            <input 
              type='text' 
              name='location'
              placeholder='Lokasi'
              className='w-full text-base placeholder-gray-400 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 font-brand font-normal text-gray-700'
            />
          </div>

          <button type="submit" className="hidden" />
        </form>

        {/* Actions (Create Event & Profile) */}
        <div className='flex items-center gap-4 shrink-0 relative'>
          <Button 
            href={isAuthenticated ? '/dashboard/events/create' : '/login'} 
            className='text-small font-bold px-6 py-2.5 rounded-full'
          >
            Buat Event
          </Button>
          
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className='shrink-0 rounded-full overflow-hidden border border-gray-200 hover:border-primary-500 transition-colors duration-200 flex items-center justify-center cursor-pointer w-10 h-10 p-0'
              >
                <img src={user?.avatar_url || defaultAvatar} alt={user?.name || "User"} className='w-10 h-10 object-cover'/>
              </button>

              {/* Backdrop for click away */}
              {isDropdownOpen && (
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsDropdownOpen(false)}
                />
              )}

              {/* Profile Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 py-1.5 w-48 bg-white border border-neutral-150 rounded-2xl shadow-lg z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-neutral-800 hover:bg-gray-50 text-small font-bold cursor-pointer transition-colors duration-150 text-left border-0 bg-transparent focus:outline-none"
                  >
                    <UserIcon size={16} className="text-neutral-500 shrink-0" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-neutral-800 hover:bg-gray-50 text-small font-bold cursor-pointer transition-colors duration-150 text-left border-0 bg-transparent focus:outline-none"
                  >
                    <Settings size={16} className="text-neutral-500 shrink-0" />
                    <span>Pengaturan</span>
                  </Link>
                  
                  <div className="h-px bg-neutral-150 my-1"></div>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      router.post('/logout');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-500 hover:bg-red-50 text-small font-bold cursor-pointer transition-colors duration-150 text-left border-0 bg-transparent focus:outline-none"
                  >
                    <LogOut size={16} className="shrink-0" />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a href='/login' className='text-gray-400 hover:text-primary-500 transition-colors duration-200 shrink-0 p-1 bg-gray-50 border border-gray-100 rounded-full w-10 h-10 flex items-center justify-center'>
              <UserIcon size={18} />
            </a>
          )}
        </div>
      </nav>
    </>
  );
}