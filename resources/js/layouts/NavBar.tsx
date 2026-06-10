import { usePage, router, Link } from '@inertiajs/react';
import { Search, MapPin, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import defaultAvatar from '@/../../public/avatars/default.png';
import faviconUrl from '@/../../public/favicon.svg';
import Button from '@/components/ui/Button';
import { fetchCitySuggestions, INDONESIAN_CITIES } from '@/lib/geocoding';

interface NavBarProps {
  locationValue?: string;
  onLocationSubmit?: (location: string) => void;
  onUseCurrentLocation?: () => void;
}

export default function NavBar({ locationValue, onLocationSubmit, onUseCurrentLocation }: NavBarProps = {}) {
  const page = usePage();
  const { auth } = page.props as any;
  const user = auth?.user;
  const isAuthenticated = !!user;

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Sync state with props during render
  const [prevLocationValue, setPrevLocationValue] = useState(locationValue);
  const [locationInput, setLocationInput] = useState(locationValue || '');

  if (locationValue !== prevLocationValue) {
    setPrevLocationValue(locationValue);
    setLocationInput(locationValue || '');
  }

  // Dropdown suggestions state
  const [showDropdown, setShowDropdown] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);
  const locationContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationContainerRef.current &&
        !locationContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setLocationInput(locationValue || '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [locationValue]);

  // Sync/fetch suggestions when input changes
  useEffect(() => {
    if (!locationInput.trim()) {
      setTimeout(() => {
        setApiSuggestions([]);
      }, 0);

      return;
    }

    const timeout = setTimeout(async () => {
      const apiMatches = await fetchCitySuggestions(locationInput);

      if (apiMatches.length > 0) {
        setApiSuggestions(apiMatches);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [locationInput]);

  // Compute local matches and combined suggestions in render phase
  const localSuggestions = useMemo(() => {
    if (!locationInput.trim()) {
      return [];
    }

    return INDONESIAN_CITIES.filter((city) =>
      city.toLowerCase().includes(locationInput.toLowerCase())
    ).slice(0, 5);
  }, [locationInput]);

  const suggestions = useMemo(() => {
    if (!locationInput.trim()) {
      return [];
    }

    return Array.from(new Set([...localSuggestions, ...apiSuggestions])).slice(0, 8);
  }, [locationInput, localSuggestions, apiSuggestions]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white h-18 shadow-sm">
        {/* Logo and Home Button */}
        <a href="/" className='flex items-center gap-2 shrink-0 group'>
          <img src={faviconUrl} alt="Lokacara" className='w-6 h-7.5 group-hover:animate-logo-wave'/>
          <span className='font-brand font-black text-2xl tracking-tight text-primary-500'>lokacara</span>
        </a>

        {/* Search Bar and Location */}
        <form 
          action="/events/search" 
          method="GET" 
          onSubmit={(e) => {
            if (onLocationSubmit) {
              e.preventDefault();
              onLocationSubmit(locationInput);
            }
          }}
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
          <div className='flex items-center gap-2 flex-1 relative' ref={locationContainerRef}>
            <MapPin className='text-gray-400 w-4 h-4 shrink-0' />
            <input 
              type='text' 
              name='location'
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onFocus={() => {
                setShowDropdown(true);
                setLocationInput('');
              }}
              onClick={() => {
                setShowDropdown(true);
                setLocationInput('');
              }}
              placeholder='Lokasi'
              autoComplete='off'
              className='w-full text-base placeholder-gray-400 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 font-brand font-normal text-gray-700'
            />

            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-neutral-150 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                {onUseCurrentLocation && !locationInput.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onUseCurrentLocation();
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-base font-semibold hover:bg-neutral-50 transition-colors cursor-pointer text-primary-500 flex items-center gap-2 ${
                      suggestions.length > 0 ? 'border-b border-neutral-100' : ''
                    }`}
                  >
                    <MapPin size={16} className="text-primary-500 animate-bounce" />
                    <span>Gunakan lokasi saat ini</span>
                  </button>
                )}
                
                {suggestions.length > 0 ? (
                  suggestions.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setLocationInput(city);
                        onLocationSubmit?.(city);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-base font-semibold hover:bg-neutral-50 transition-colors cursor-pointer text-neutral-700"
                    >
                      {city}
                    </button>
                  ))
                ) : (
                  locationInput.trim() && (
                    <div className="px-4 py-2 text-base font-semibold text-neutral-400">
                      Kota tidak ditemukan
                    </div>
                  )
                )}
              </div>
            )}
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