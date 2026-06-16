import { usePage, router, Link } from '@inertiajs/react';
import {
    Search,
    MapPin,
    User as UserIcon,
    Settings,
    LogOut,
    LogIn,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import defaultAvatar from '@/../../public/avatars/default.png';
import faviconUrl from '@/../../public/favicon.svg';
import Button from '@/components/ui/Button';
import {
    fetchCitySuggestions,
    INDONESIAN_CITIES,
    reverseGeocode,
} from '@/lib/geocoding';

interface NavBarProps {
    locationValue?: string;
    onLocationSubmit?: (location: string) => void;
    onUseCurrentLocation?: () => void;
}

export default function NavBar({
    locationValue,
    onLocationSubmit,
    onUseCurrentLocation,
}: NavBarProps = {}) {
    const page = usePage();
    const { auth } = page.props as any;
    const user = auth?.user;
    const isAuthenticated = !!user;

    // Page context detection
    const isHomePage = page.component === 'Home';
    const isEventDetailsPage =
        page.component === 'Events/Show' ||
        page.component === 'Dashboard/Events/Show';
    const showLocationBar = isHomePage || isEventDetailsPage;

    // Get event details if on details page
    const event = page.props.event as any;
    const [eventCity, setEventCity] = useState('');
    const [isFetchingEventCity, setIsFetchingEventCity] = useState(false);

    useEffect(() => {
        if (!event || event.type !== 'offline') {
            queueMicrotask(() => {
                setEventCity('');
                setIsFetchingEventCity(false);
            });

            return;
        }

        const lat = parseFloat(event.latitude);
        const lng = parseFloat(event.longitude);

        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            queueMicrotask(() => setIsFetchingEventCity(true));
            reverseGeocode(lat, lng)
                .then((city) => {
                    setEventCity(city);
                })
                .catch((err) => {
                    console.error('Failed to geocode event location', err);
                    setEventCity(event.location_name || 'Tidak Ditentukan');
                })
                .finally(() => {
                    setIsFetchingEventCity(false);
                });
        } else {
            queueMicrotask(() => {
                setEventCity(event.location_name || 'Tidak Ditentukan');
                setIsFetchingEventCity(false);
            });
        }
    }, [event]);

    const eventLocation = useMemo(() => {
        if (!event) {
            return '';
        }

        if (event.type === 'online') {
            return event.platform_name || 'Online';
        }

        if (isFetchingEventCity) {
            return 'Loading...';
        }

        return eventCity || event.location_name || 'Tidak Ditentukan';
    }, [event, eventCity, isFetchingEventCity]);

    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Sync state with props or page context
    const [prevLocationValue, setPrevLocationValue] = useState(locationValue);
    const [locationInput, setLocationInput] = useState(locationValue || '');

    const currentFilters = (page.props.filters as any) || {};
    const [keyword, setKeyword] = useState(currentFilters.keyword || '');

    useEffect(() => {
        setKeyword(currentFilters.keyword || '');
    }, [currentFilters.keyword]);

    // Sync input depending on page
    useEffect(() => {
        if (isEventDetailsPage) {
            queueMicrotask(() => setLocationInput(eventLocation));
        } else if (isHomePage) {
            queueMicrotask(() => setLocationInput(locationValue || ''));
        }
    }, [isHomePage, isEventDetailsPage, locationValue, eventLocation]);

    // Sync state changes on home page
    if (isHomePage && locationValue !== prevLocationValue) {
        setPrevLocationValue(locationValue);
        setLocationInput(locationValue || '');
    }

    // Dropdown suggestions state
    const [showDropdown, setShowDropdown] = useState(false);
    const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);
    const locationContainerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                locationContainerRef.current &&
                !locationContainerRef.current.contains(e.target as Node)
            ) {
                setShowDropdown(false);
                setLocationInput(
                    isHomePage
                        ? locationValue || ''
                        : isEventDetailsPage
                          ? eventLocation
                          : '',
                );
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [locationValue, isHomePage, isEventDetailsPage, eventLocation]);

    // Sync/fetch suggestions when input changes
    useEffect(() => {
        if (!isHomePage || !locationInput.trim()) {
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
    }, [locationInput, isHomePage]);

    // Compute local matches and combined suggestions in render phase
    const localSuggestions = useMemo(() => {
        if (!isHomePage || !locationInput.trim()) {
            return [];
        }

        return INDONESIAN_CITIES.filter((city) =>
            city.toLowerCase().includes(locationInput.toLowerCase()),
        ).slice(0, 5);
    }, [locationInput, isHomePage]);

    const suggestions = useMemo(() => {
        if (!isHomePage || !locationInput.trim()) {
            return [];
        }

        return Array.from(
            new Set([...localSuggestions, ...apiSuggestions]),
        ).slice(0, 8);
    }, [locationInput, localSuggestions, apiSuggestions, isHomePage]);

    return (
        <>
            <nav className="fixed top-0 right-0 left-0 z-50 flex h-18 items-center justify-between gap-2.5 border-b border-gray-100 bg-white px-3 py-4 shadow-sm sm:gap-6 sm:px-8">
                {/* Logo and Home Button */}
                <a href="/" className="group flex shrink-0 items-center gap-2">
                    <img
                        src={faviconUrl}
                        alt="Lokacara"
                        className="h-7.5 w-6 group-hover:animate-logo-wave"
                    />
                    <span className="hidden font-brand text-2xl font-black tracking-tight text-primary-500 sm:inline">
                        lokacara
                    </span>
                </a>

                {/* Search Bar and Location */}
                <form
                    action="/events/search"
                    method="GET"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const activeElement = document.activeElement;
                        const isLocationActive = activeElement && activeElement.getAttribute('name') === 'location';

                        if (isLocationActive && onLocationSubmit) {
                            onLocationSubmit(locationInput);
                        } else {
                            router.get('/events/search', { keyword: keyword.trim() });
                        }
                    }}
                    className="flex w-0 max-w-[480px] flex-1 items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50/50 px-3 py-1.5 transition-all duration-200 focus-within:border-primary-500 focus-within:bg-white focus-within:shadow-sm hover:bg-white sm:gap-3 sm:px-5 sm:py-2"
                >
                    {/* Search Input */}
                    <div className="flex w-0 flex-1 items-center gap-1.5 sm:gap-2">
                        <Search className="h-3.5 w-3.5 shrink-0 text-gray-400 sm:h-4 sm:w-4" />
                        <input
                            type="text"
                            name="keyword"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Cari"
                            className="w-full border-0 bg-transparent font-brand text-xs font-normal text-gray-700 placeholder-gray-400 outline-none focus:ring-0 focus:outline-none sm:text-base"
                        />
                    </div>

                    {showLocationBar && (
                        <>
                            <div className="h-3.5 w-px shrink-0 bg-gray-200 sm:h-4"></div>

                            {/* Location Input */}
                            <div
                                className="relative flex w-0 flex-1 items-center gap-1.5 sm:gap-2"
                                ref={locationContainerRef}
                            >
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400 sm:h-4 sm:w-4" />
                                <input
                                    type="text"
                                    name="location"
                                    value={locationInput}
                                    onChange={(e) => {
                                        if (isHomePage) {
                                            setLocationInput(e.target.value);
                                        }
                                    }}
                                    onFocus={() => {
                                        if (isHomePage) {
                                            setShowDropdown(true);
                                            setLocationInput('');
                                        }
                                    }}
                                    onClick={() => {
                                        if (isHomePage) {
                                            setShowDropdown(true);
                                            setLocationInput('');
                                        }
                                    }}
                                    placeholder="Lokasi"
                                    autoComplete="off"
                                    disabled={!isHomePage}
                                    className={`w-full border-0 bg-transparent font-brand text-xs font-normal text-gray-700 placeholder-gray-400 outline-none focus:ring-0 focus:outline-none sm:text-base ${
                                        !isHomePage
                                            ? 'cursor-default text-gray-500'
                                            : ''
                                    }`}
                                />

                                {isHomePage && showDropdown && (
                                    <div className="border-neutral-150 absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border bg-white py-1 shadow-xl">
                                        {onUseCurrentLocation &&
                                            !locationInput.trim() && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onUseCurrentLocation();
                                                        setShowDropdown(false);
                                                    }}
                                                    className={`flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-base font-semibold text-primary-500 transition-colors hover:bg-neutral-50 ${
                                                        suggestions.length > 0
                                                            ? 'border-b border-neutral-100'
                                                            : ''
                                                    }`}
                                                >
                                                    <MapPin
                                                        size={16}
                                                        className="animate-bounce text-primary-500"
                                                    />
                                                    <span>
                                                        Gunakan lokasi saat ini
                                                    </span>
                                                </button>
                                            )}

                                        {suggestions.length > 0
                                            ? suggestions.map((city) => (
                                                  <button
                                                      key={city}
                                                      type="button"
                                                      onClick={() => {
                                                          setLocationInput(
                                                              city,
                                                          );
                                                          onLocationSubmit?.(
                                                              city,
                                                          );
                                                          setShowDropdown(
                                                              false,
                                                          );
                                                      }}
                                                      className="w-full cursor-pointer px-4 py-2 text-left text-base font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                                                  >
                                                      {city}
                                                  </button>
                                              ))
                                            : locationInput.trim() && (
                                                  <div className="px-4 py-2 text-base font-semibold text-neutral-400">
                                                      Kota tidak ditemukan
                                                  </div>
                                              )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <button type="submit" className="hidden" />
                </form>

                {/* Actions (Create Event & Profile) */}
                <div className="relative flex shrink-0 items-center gap-4">
                    <div className="hidden md:block">
                        <Button
                            href={isAuthenticated ? '/create' : '/login'}
                            className="rounded-full px-6 py-2.5 text-small font-bold"
                        >
                            Buat Event
                        </Button>
                    </div>

                    {isAuthenticated ? (
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setIsDropdownOpen(!isDropdownOpen)
                                }
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-gray-200 p-0 transition-colors duration-200 hover:border-primary-500"
                            >
                                <img
                                    src={user?.avatar_url || defaultAvatar}
                                    alt={user?.name || 'User'}
                                    className="h-10 w-10 object-cover"
                                />
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
                                <div className="border-neutral-150 animate-in fade-in slide-in-from-top-3 absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border bg-white py-1.5 shadow-lg duration-200">
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent px-4 py-2.5 text-left text-small font-bold text-neutral-800 transition-colors duration-150 hover:bg-gray-50 focus:outline-none"
                                    >
                                        <UserIcon
                                            size={16}
                                            className="shrink-0 text-neutral-500"
                                        />
                                        <span>Dashboard</span>
                                    </Link>

                                    <Link
                                        href="/settings"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent px-4 py-2.5 text-left text-small font-bold text-neutral-800 transition-colors duration-150 hover:bg-gray-50 focus:outline-none"
                                    >
                                        <Settings
                                            size={16}
                                            className="shrink-0 text-neutral-500"
                                        />
                                        <span>Pengaturan</span>
                                    </Link>

                                    <div className="bg-neutral-150 my-1 h-px"></div>

                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            router.post('/logout');
                                        }}
                                        className="flex w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent px-4 py-2.5 text-left text-small font-bold text-red-500 transition-colors duration-150 hover:bg-red-50 focus:outline-none"
                                    >
                                        <LogOut
                                            size={16}
                                            className="shrink-0"
                                        />
                                        <span>Keluar</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setIsDropdownOpen(!isDropdownOpen)
                                }
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-gray-50 p-1 text-gray-400 transition-colors duration-200 hover:text-primary-500"
                            >
                                <UserIcon size={18} />
                            </button>

                            {/* Backdrop for click away */}
                            {isDropdownOpen && (
                                <div
                                    className="fixed inset-0 z-40 bg-transparent"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                            )}

                            {/* Guest Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="border-neutral-150 animate-in fade-in slide-in-from-top-3 absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border bg-white py-1.5 shadow-lg duration-200">
                                    <Link
                                        href="/login"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent px-4 py-2.5 text-left text-small font-bold text-neutral-800 transition-colors duration-150 hover:bg-gray-50 focus:outline-none"
                                    >
                                        <LogIn
                                            size={16}
                                            className="shrink-0 text-neutral-500"
                                        />
                                        <span>Masuk</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}
