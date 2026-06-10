import { Head, Link, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { Plus, ChevronRight, ChevronLeft, Calendar, MapPin, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import DefaultCover from '@/../../public/covers/default_cover.jpg';
import Button from '@/components/ui/Button';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';
import { calculateDistance, geocodeAddress, reverseGeocode } from '@/lib/geocoding';

interface Event {
    id: number;
    title: string;
    description: string;
    type: 'online' | 'offline';
    poster_url?: string;
    location_name?: string;
    latitude?: number;
    longitude?: number;
    distance?: number;
    start_datetime: string;
    category?: {
        id: number;
        name: string;
    };
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface HomeProps {
    events: Event[];
    popularEvents: Event[];
    joinedEvents: Event[];
    categories: Category[];
}

export default function Home({ events, popularEvents, joinedEvents, categories }: HomeProps) {
    const { auth } = usePage().props as any;
    const isAuthenticated = !!auth?.user;

    // 1. Carousel State for Popular Events
    const [activeIndex, setActiveIndex] = useState(1);
    const isTransitioning = useRef(false);
    const isMounted = useRef(false);
    const hasPopular = popularEvents && popularEvents.length > 0;
    const heroEvents = hasPopular ? popularEvents : events.slice(0, 3);
    const displayHeroEvents = heroEvents.length > 1
        ? [heroEvents[heroEvents.length - 1], ...heroEvents, heroEvents[0]]
        : heroEvents;

    const currentDot = heroEvents.length > 0
        ? (activeIndex - 1 + heroEvents.length) % heroEvents.length
        : 0;

    const heroTrackRef = useRef<HTMLDivElement>(null);
    const joinedTrackRef = useRef<HTMLDivElement>(null);
    const nearbyTrackRef = useRef<HTMLDivElement>(null);

    const tabAllRef = useRef<HTMLButtonElement>(null);
    const tabOnlineRef = useRef<HTMLButtonElement>(null);
    const tabOfflineRef = useRef<HTMLButtonElement>(null);
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

    // 2. Location & Proximity State
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [locationName, setLocationName] = useState('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);

    const detectLocation = (isInitial = false) => {
        if (!isInitial) {
            setIsLoadingLocation(true);
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserCoords({ lat, lng });

                    try {
                        const city = await reverseGeocode(lat, lng);
                        setLocationName(city);
                    } catch (err) {
                        console.error('Reverse geocoding failed, using coordinates', err);
                        setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                    }

                    setIsLoadingLocation(false);
                },
                async (error) => {
                    console.warn('Geolocation failed, defaulting to Yogyakarta', error);
                    const fallback = { lat: -7.79558, lng: 110.36949 };
                    setUserCoords(fallback);
                    setLocationName('Yogyakarta');
                    setIsLoadingLocation(false);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            console.warn('Geolocation not supported, defaulting to Yogyakarta');
            const fallback = { lat: -7.79558, lng: 110.36949 };
            setTimeout(() => {
                setUserCoords(fallback);
                setLocationName('Yogyakarta');
                setIsLoadingLocation(false);
            }, 0);
        }
    };

    // Geolocation detection on load
    useEffect(() => {
        setTimeout(() => {
            detectLocation(true);
        }, 0);
    }, []);

    // Calculate proximity and sort events via useMemo (prevents render-loop state updates)
    const filteredNearbyEvents = useMemo(() => {
        if (!userCoords) {
            return [];
        }

        return events
            .filter((e) => e.type === 'offline' && e.latitude !== null && e.longitude !== null && e.latitude !== undefined && e.longitude !== undefined)
            .map((e) => {
                const distance = calculateDistance(
                    userCoords.lat,
                    userCoords.lng,
                    Number(e.latitude),
                    Number(e.longitude)
                );

                return { ...e, distance };
            })
            .sort((a, b) => (a.distance || 0) - (b.distance || 0))
            .slice(0, 12);
    }, [userCoords, events]);

    // Handle search location submit in navbar
    const handleLocationSubmit = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
return;
}

        setIsLoadingLocation(true);

        try {
            const result = await geocodeAddress(searchQuery);

            if (result) {
                setUserCoords({ lat: result.lat, lng: result.lng });
                setLocationName(result.city);
            } else {
                alert(`Tidak dapat menemukan lokasi: "${searchQuery}"`);
            }
        } catch (err) {
            console.error('Error during geocoding:', err);
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const handleNextSlide = () => {
        if (heroEvents.length > 1 && !isTransitioning.current) {
            setActiveIndex((prev) => prev + 1);
        }
    };

    const handlePrevSlide = () => {
        if (heroEvents.length > 1 && !isTransitioning.current) {
            setActiveIndex((prev) => prev - 1);
        }
    };

    // Carousel states for Joined and Nearby Events
    const [joinedIndex, setJoinedIndex] = useState(0);
    const [nearbyIndex, setNearbyIndex] = useState(0);
    const [cardsToShow, setCardsToShow] = useState(3);

    const displayJoined = joinedEvents.length > cardsToShow 
        ? [...joinedEvents, ...joinedEvents.slice(0, cardsToShow)] 
        : joinedEvents;

    const displayNearby = filteredNearbyEvents.length > cardsToShow 
        ? [...filteredNearbyEvents, ...filteredNearbyEvents.slice(0, cardsToShow)] 
        : filteredNearbyEvents;

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setCardsToShow(2);
            } else {
                setCardsToShow(4);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleJoinedNext = () => {
        if (joinedEvents.length === 0) {
            return;
        }

        setJoinedIndex((prev) => {
            const nextIndex = prev + cardsToShow;
            const maxIndex = joinedEvents.length - cardsToShow;

            if (prev < maxIndex) {
                return Math.min(nextIndex, maxIndex);
            }

            return joinedEvents.length;
        });
    };

    const handleJoinedPrev = () => {
        if (joinedEvents.length === 0) {
            return;
        }

        if (joinedIndex === 0) {
            const track = joinedTrackRef.current;

            if (track) {
                const cardElement = track.firstElementChild as HTMLElement;

                if (cardElement) {
                    const cardWidth = cardElement.getBoundingClientRect().width || 
                        (track.getBoundingClientRect().width - (cardsToShow - 1) * 24) / cardsToShow;
                    const gap = 24;

                    gsap.set(track, { x: -joinedEvents.length * (cardWidth + gap) });
                    
                    const maxIndex = joinedEvents.length - cardsToShow;

                    setJoinedIndex(maxIndex);
                }
            }
        } else {
            setJoinedIndex((prev) => {
                const prevIndex = prev - cardsToShow;

                return Math.max(0, prevIndex);
            });
        }
    };

    const handleNearbyNext = () => {
        if (filteredNearbyEvents.length === 0) {
            return;
        }

        setNearbyIndex((prev) => {
            const nextIndex = prev + cardsToShow;
            const maxIndex = filteredNearbyEvents.length - cardsToShow;

            if (prev < maxIndex) {
                return Math.min(nextIndex, maxIndex);
            }

            return filteredNearbyEvents.length;
        });
    };

    const handleNearbyPrev = () => {
        if (filteredNearbyEvents.length === 0) {
            return;
        }

        if (nearbyIndex === 0) {
            const track = nearbyTrackRef.current;

            if (track) {
                const cardElement = track.firstElementChild as HTMLElement;

                if (cardElement) {
                    const cardWidth = cardElement.getBoundingClientRect().width || 
                        (track.getBoundingClientRect().width - (cardsToShow - 1) * 24) / cardsToShow;
                    const gap = 24;

                    gsap.set(track, { x: -filteredNearbyEvents.length * (cardWidth + gap) });
                    
                    const maxIndex = filteredNearbyEvents.length - cardsToShow;

                    setNearbyIndex(maxIndex);
                }
            }
        } else {
            setNearbyIndex((prev) => {
                const prevIndex = prev - cardsToShow;

                return Math.max(0, prevIndex);
            });
        }
    };

    // Pointer drag / swipe handlers for touch & mouse
    const heroDragStartX = useRef<number | null>(null);
    const heroDragStartY = useRef<number | null>(null);
    const handleHeroPointerDown = (e: React.PointerEvent) => {
        heroDragStartX.current = e.clientX;
        heroDragStartY.current = e.clientY;
    };
    const handleHeroPointerUp = (e: React.PointerEvent) => {
        if (heroDragStartX.current === null || heroDragStartY.current === null) {
            return;
        }

        const diffX = heroDragStartX.current - e.clientX;
        const diffY = heroDragStartY.current - e.clientY;

        heroDragStartX.current = null;
        heroDragStartY.current = null;

        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                handleNextSlide();
            } else {
                handlePrevSlide();
            }
        }
    };

    const joinedDragStartX = useRef<number | null>(null);
    const joinedDragStartY = useRef<number | null>(null);
    const handleJoinedPointerDown = (e: React.PointerEvent) => {
        joinedDragStartX.current = e.clientX;
        joinedDragStartY.current = e.clientY;
    };
    const handleJoinedPointerUp = (e: React.PointerEvent) => {
        if (joinedDragStartX.current === null || joinedDragStartY.current === null) {
            return;
        }

        const diffX = joinedDragStartX.current - e.clientX;
        const diffY = joinedDragStartY.current - e.clientY;

        joinedDragStartX.current = null;
        joinedDragStartY.current = null;

        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                handleJoinedNext();
            } else {
                handleJoinedPrev();
            }
        }
    };

    const nearbyDragStartX = useRef<number | null>(null);
    const nearbyDragStartY = useRef<number | null>(null);
    const handleNearbyPointerDown = (e: React.PointerEvent) => {
        nearbyDragStartX.current = e.clientX;
        nearbyDragStartY.current = e.clientY;
    };
    const handleNearbyPointerUp = (e: React.PointerEvent) => {
        if (nearbyDragStartX.current === null || nearbyDragStartY.current === null) {
            return;
        }

        const diffX = nearbyDragStartX.current - e.clientX;
        const diffY = nearbyDragStartY.current - e.clientY;

        nearbyDragStartX.current = null;
        nearbyDragStartY.current = null;

        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                handleNearbyNext();
            } else {
                handleNearbyPrev();
            }
        }
    };

    // GSAP Slider animations
    useEffect(() => {
        if (heroTrackRef.current && heroEvents.length > 1) {
            if (!isMounted.current) {
                gsap.set(heroTrackRef.current, { xPercent: -activeIndex * 100 });
                isMounted.current = true;

                return;
            }

            isTransitioning.current = true;
            gsap.to(heroTrackRef.current, {
                xPercent: -activeIndex * 100,
                duration: 0.6,
                ease: 'power2.out',
                onComplete: () => {
                    if (activeIndex === heroEvents.length + 1) {
                        gsap.set(heroTrackRef.current, { xPercent: -100 });
                        setActiveIndex(1);
                    } else if (activeIndex === 0) {
                        gsap.set(heroTrackRef.current, { xPercent: -heroEvents.length * 100 });
                        setActiveIndex(heroEvents.length);
                    }

                    isTransitioning.current = false;
                }
            });
        }
    }, [activeIndex, heroEvents.length]);

    // Auto-scroll for Hero Slider
    useEffect(() => {
        if (heroEvents.length <= 1) {
return;
}

        const interval = setInterval(() => {
            if (!isTransitioning.current) {
                setActiveIndex((prev) => prev + 1);
            }
        }, 5000); // Auto scroll every 5 seconds

        return () => clearInterval(interval);
    }, [activeIndex, heroEvents.length]);

    useEffect(() => {
        if (joinedTrackRef.current) {
            const cardElement = joinedTrackRef.current.firstElementChild as HTMLElement;

            if (cardElement) {
                const cardWidth = cardElement.getBoundingClientRect().width || 
                    (joinedTrackRef.current.getBoundingClientRect().width - (cardsToShow - 1) * 24) / cardsToShow;
                const gap = 24;
                const targetX = -joinedIndex * (cardWidth + gap);

                gsap.to(joinedTrackRef.current, {
                    x: targetX,
                    duration: 0.6,
                    ease: 'power2.out',
                    onComplete: () => {
                        if (joinedIndex === joinedEvents.length) {
                            gsap.set(joinedTrackRef.current, { x: 0 });
                            setJoinedIndex(0);
                        }
                    }
                });
            }
        }
    }, [joinedIndex, cardsToShow, joinedEvents]);

    useEffect(() => {
        if (nearbyTrackRef.current) {
            const cardElement = nearbyTrackRef.current.firstElementChild as HTMLElement;

            if (cardElement) {
                const cardWidth = cardElement.getBoundingClientRect().width || 
                    (nearbyTrackRef.current.getBoundingClientRect().width - (cardsToShow - 1) * 24) / cardsToShow;
                const gap = 24;
                const targetX = -nearbyIndex * (cardWidth + gap);

                gsap.to(nearbyTrackRef.current, {
                    x: targetX,
                    duration: 0.6,
                    ease: 'power2.out',
                    onComplete: () => {
                        if (nearbyIndex === filteredNearbyEvents.length) {
                            gsap.set(nearbyTrackRef.current, { x: 0 });
                            setNearbyIndex(0);
                        }
                    }
                });
            }
        }
    }, [nearbyIndex, cardsToShow, filteredNearbyEvents]);


    // 3. Category & Type Catalog Filter State
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [activeType, setActiveType] = useState<'all' | 'online' | 'offline'>('all');

    useEffect(() => {
        const updateUnderline = () => {
            let activeTab: HTMLButtonElement | null = null;

            if (activeType === 'all') {
                activeTab = tabAllRef.current;
            } else if (activeType === 'online') {
                activeTab = tabOnlineRef.current;
            } else if (activeType === 'offline') {
                activeTab = tabOfflineRef.current;
            }

            if (activeTab) {
                setUnderlineStyle({
                    left: activeTab.offsetLeft,
                    width: activeTab.offsetWidth
                });
            }
        };

        updateUnderline();
        window.addEventListener('resize', updateUnderline);

        return () => window.removeEventListener('resize', updateUnderline);
    }, [activeType]);

    const filteredCatalogEvents = events.filter(e => {
        const matchesCategory = activeCategory === null || e.category?.id === activeCategory;
        const matchesType = activeType === 'all' || e.type === activeType;

        return matchesCategory && matchesType;
    });

    // 4. Pagination State & Logic for Catalogue
    const [currentPage, setCurrentPage] = useState(1);

    const eventsPerPage = 9;
    const totalPages = Math.ceil(filteredCatalogEvents.length / eventsPerPage);
    const paginatedCatalogEvents = filteredCatalogEvents.slice(
        (currentPage - 1) * eventsPerPage,
        currentPage * eventsPerPage
    );

    const formatIndonesianDate = (dateString: string) => {
        const dateObj = new Date(dateString);

        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(dateObj);
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
        <div className="min-h-screen bg-white flex flex-col justify-between">
            <div className="flex-grow">
                <NavBar 
                    locationValue={locationName} 
                    onLocationSubmit={handleLocationSubmit} 
                    onUseCurrentLocation={detectLocation}
                />
                <Head title="Home - Temukan Event Komunitas Terbaik" />

                {/* 1. HERO SECTION: EVENT POPULER (FULL WIDTH) */}
                {heroEvents.length > 0 && (
                    <div 
                        onPointerDown={handleHeroPointerDown}
                        onPointerUp={handleHeroPointerUp}
                        className="relative w-full h-[340px] sm:h-[460px] md:h-[580px] overflow-hidden group pt-18 select-none touch-pan-y"
                    >
                        {/* Standalone Navigation Buttons */}
                        {heroEvents.length > 1 && (
                            <>
                                <button 
                                    onClick={handlePrevSlide}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/25 border border-white/20 rounded-full text-white cursor-pointer backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100"
                                    title="Slide Sebelumnya"
                                >
                                    <ChevronLeft size={22} />
                                </button>
                                <button 
                                    onClick={handleNextSlide}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/25 border border-white/20 rounded-full text-white cursor-pointer backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100"
                                    title="Slide Selanjutnya"
                                >
                                    <ChevronRight size={22} />
                                </button>
                            </>
                        )}

                        {/* Dot indicators */}
                        {heroEvents.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                                {heroEvents.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (!isTransitioning.current) {
                                                setActiveIndex(idx + 1);
                                            }
                                        }}
                                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                            currentDot === idx ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/75'
                                        }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Stationary Event Populer label */}
                        <div className="absolute top-24 left-6 md:top-26 md:left-10 z-20 px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-small font-bold">
                            Event Populer
                        </div>

                        <div ref={heroTrackRef} className="flex h-full w-full">
                            {displayHeroEvents.map((event, idx) => (
                                <Link 
                                    key={`${event.id}-hero-${idx}`} 
                                    href={`/events/${event.id}`}
                                    className="w-full h-full shrink-0 relative block cursor-pointer overflow-hidden group/hero-slide"
                                >
                                    <img 
                                        src={event.poster_url || DefaultCover} 
                                        alt={event.title} 
                                        draggable="false"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/hero-slide:scale-[1.03]"
                                    />
                                    {/* Dark gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-900/40 to-transparent"></div>

                                    {/* Text overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 pt-6 pl-8 pr-8 pb-12 md:pt-10 md:pl-16 md:pr-16 md:pb-16 flex flex-col gap-2 max-w-[800px] ml-4">
                                        <h1 className="text-white text-3xl md:text-5xl font-black font-brand leading-tight">
                                            {event.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-neutral-300 text-small md:text-base font-semibold">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={16} />
                                                {formatIndonesianDate(event.start_datetime)}
                                            </span>
                                            <span className="hidden md:inline text-neutral-500">|</span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={16} />
                                                {event.type === 'online' ? 'Online' : (event.location_name || 'Lokasi Offline')}
                                            </span>
                                        </div>
                                        <p className="text-neutral-400 text-small md:text-base font-medium line-clamp-2 mt-2 leading-relaxed">
                                            {event.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 flex flex-col gap-14 pb-16">

                {/* 2. EVENT MENDATANG SECTION (JOINED EVENTS) */}
                {isAuthenticated && (
                    <div className="flex flex-col gap-5">
                        <h3 className="text-neutral-900 font-extrabold text-2xl md:text-3xl font-brand tracking-tight">
                            Event Mendatang
                        </h3>
                        
                        <div className="w-full relative group/slider">
                            {/* Placeholder card if not registered for any events */}
                            {joinedEvents.length === 0 ? (
                                <div className="w-full h-[280px] bg-white border-2 border-dashed border-neutral-200 rounded-3xl flex flex-col items-center justify-center p-6 gap-4 text-center group hover:border-primary-300 transition-colors duration-300">
                                    <a 
                                        href="#catalog"
                                        className="w-16 h-16 rounded-full bg-gray-50 border border-neutral-150 flex items-center justify-center text-primary-500 shadow-md group-hover:scale-105 transition-transform duration-300"
                                    >
                                        <Plus size={28} />
                                    </a>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-neutral-700 font-bold text-base font-brand">
                                            Belum Ikut Event Apapun
                                        </h4>
                                        <p className="text-gray-400 text-small max-w-[200px]">
                                            Temukan berbagai event menarik di bawah ini
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                        <div 
                                            onPointerDown={handleJoinedPointerDown}
                                            onPointerUp={handleJoinedPointerUp}
                                            className="w-full overflow-hidden relative select-none touch-pan-y"
                                        >
                                            <div ref={joinedTrackRef} className="flex gap-6 w-full">
                                                {displayJoined.map((event, idx) => (
                                                    <div 
                                                        key={`${event.id}-clone-${idx}`} 
                                                        className="w-[calc((100%-24px)/2)] lg:w-[calc((100%-72px)/4)] shrink-0 border border-neutral-150 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden flex flex-col group relative justify-between h-[325px] sm:h-[370px] lg:h-[400px]"
                                                    >
                                                        {/* "FREE" Badge on Top-Left of image */}
                                                        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-secondary-400 text-secondary-900 font-extrabold text-[0.6275rem] rounded-md shadow-sm">
                                                            FREE
                                                        </div>

                                                        <div className="relative w-full h-[140px] sm:h-[170px] lg:h-auto lg:aspect-3/2 shrink-0 overflow-hidden bg-gray-50 border-b border-gray-100">
                                                            <img 
                                                                src={event.poster_url || DefaultCover} 
                                                                alt={event.title} 
                                                                draggable="false"
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                        </div>
                                                        <div className="p-4 flex flex-col gap-2 flex-grow justify-between">
                                                            <div className="flex flex-col gap-1.5">
                                                                <h4 className="text-primary-500 font-extrabold text-xs sm:text-sm lg:text-base leading-snug line-clamp-2 lg:line-clamp-3 h-[34px] sm:h-[40px] lg:h-[66px] group-hover:text-primary-600 overflow-hidden">
                                                                    {event.title}
                                                                </h4>
                                                                <div className="pt-1.5 border-t border-gray-100/50 flex flex-col gap-1 text-gray-400 text-[10px] sm:text-micro font-semibold">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <Calendar size={12} className="shrink-0 text-gray-400" />
                                                                        {formatShortDate(event.start_datetime)}
                                                                    </span>
                                                                    <span className="flex items-center gap-1.5">
                                                                        <MapPin size={12} className="shrink-0 text-gray-400" />
                                                                        {event.type === 'online' ? 'Online' : (event.location_name || 'Lokasi Offline')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="pt-1">
                                                                <Button href={`/events/${event.id}`} className="text-[10px] sm:text-small w-full py-1.5 sm:py-2">
                                                                    Detail Event
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {joinedEvents.length > cardsToShow && (
                                                <>
                                                    <button 
                                                        onClick={handleJoinedPrev}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/80 hover:bg-white border border-neutral-200/80 text-neutral-800 rounded-full cursor-pointer backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center shadow-md opacity-0 group-hover/slider:opacity-100"
                                                        title="Halaman Sebelumnya"
                                                    >
                                                        <ChevronLeft size={22} />
                                                    </button>
                                                    <button 
                                                        onClick={handleJoinedNext}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/80 hover:bg-white border border-neutral-200/80 text-neutral-800 rounded-full cursor-pointer backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center shadow-md opacity-0 group-hover/slider:opacity-100"
                                                        title="Halaman Selanjutnya"
                                                    >
                                                        <ChevronRight size={22} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. EVENT TERDEKAT SECTION */}
                <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <h3 className="text-neutral-900 font-extrabold text-2xl md:text-3xl font-brand tracking-tight">
                            Event Terdekat di Sekitarmu
                        </h3>
                        {isLoadingLocation && (
                            <div className="flex items-center gap-2 text-primary-500 animate-pulse ml-2">
                                <Loader2 size={20} className="animate-spin text-primary-500" />
                                <span className="font-brand font-bold text-small">Mendapatkan lokasi...</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="w-full relative group/slider">
                        {isLoadingLocation && filteredNearbyEvents.length === 0 ? (
                            <div className="w-full h-[280px] bg-white border border-neutral-200 rounded-3xl flex items-center justify-center">
                                <Loader2 size={32} className="animate-spin text-primary-500 mr-2" />
                                <span className="font-brand font-bold text-neutral-500">Memuat event terdekat...</span>
                            </div>
                        ) : filteredNearbyEvents.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-400 font-semibold bg-white border border-neutral-200 rounded-3xl">
                                Tidak ada event terdekat di sekitarmu.
                            </div>
                        ) : (
                            <div 
                                onPointerDown={handleNearbyPointerDown}
                                onPointerUp={handleNearbyPointerUp}
                                className="w-full overflow-hidden relative select-none touch-pan-y"
                            >
                                <div ref={nearbyTrackRef} className="flex gap-6 w-full">
                                    {displayNearby.map((event, idx) => (
                                        <div 
                                            key={`${event.id}-clone-${idx}`} 
                                            className="w-[calc((100%-24px)/2)] lg:w-[calc((100%-72px)/4)] shrink-0 border border-neutral-150 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden flex flex-col group relative justify-between h-[325px] sm:h-[370px] lg:h-[400px]"
                                        >
                                            {/* "FREE" Badge on Top-Left of image */}
                                            <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-secondary-400 text-secondary-900 font-extrabold text-[0.6275rem] rounded-md shadow-sm">
                                                FREE
                                            </div>

                                            <div className="relative w-full h-[140px] sm:h-[170px] lg:h-auto lg:aspect-3/2 shrink-0 overflow-hidden bg-gray-50 border-b border-gray-100">
                                                <img 
                                                    src={event.poster_url || DefaultCover} 
                                                    alt={event.title} 
                                                    draggable="false"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="p-4 flex flex-col gap-2 flex-grow justify-between">
                                                <div className="flex flex-col gap-1.5">
                                                    <h4 className="text-primary-500 font-extrabold text-xs sm:text-sm lg:text-base leading-snug line-clamp-2 lg:line-clamp-3 h-[34px] sm:h-[40px] lg:h-[66px] group-hover:text-primary-600 overflow-hidden">
                                                        {event.title}
                                                    </h4>
                                                    <div className="pt-1.5 border-t border-gray-100/50 flex flex-col gap-1 text-gray-400 text-[10px] sm:text-micro font-semibold">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar size={12} className="shrink-0 text-gray-400" />
                                                            {formatShortDate(event.start_datetime)}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <MapPin size={12} className="shrink-0 text-gray-400" />
                                                            {event.type === 'online' ? 'Online' : (event.location_name || 'Lokasi Offline')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="pt-1">
                                                    <Button href={`/events/${event.id}`} className="text-[10px] sm:text-small w-full py-1.5 sm:py-2">
                                                        Detail Event
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {filteredNearbyEvents.length > cardsToShow && (
                                    <>
                                        <button 
                                            onClick={handleNearbyPrev}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/80 hover:bg-white border border-neutral-200/80 text-neutral-800 rounded-full cursor-pointer backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center shadow-md opacity-0 group-hover/slider:opacity-100"
                                            title="Halaman Sebelumnya"
                                        >
                                            <ChevronLeft size={22} />
                                        </button>
                                        <button 
                                            onClick={handleNearbyNext}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/80 hover:bg-white border border-neutral-200/80 text-neutral-800 rounded-full cursor-pointer backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center shadow-md opacity-0 group-hover/slider:opacity-100"
                                            title="Halaman Selanjutnya"
                                        >
                                            <ChevronRight size={22} />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. MAIN CATALOGUE & FILTER SECTION */}
                <div id="catalog" className="flex flex-col lg:flex-row gap-10 mt-6 scroll-mt-24">
                    
                    {/* Left Column: Sidebar Category Filter */}
                    <div className="w-full lg:w-1/4 shrink-0 flex flex-col gap-6 lg:border-r lg:border-neutral-150 lg:pr-10 pb-8 lg:pb-0 border-b lg:border-b-0 border-neutral-150">
                        <h4 className="text-primary-500 font-black text-xl font-brand">
                            Kategori
                        </h4>
                        <div className="flex flex-row flex-wrap lg:flex-col gap-y-3.5 gap-x-4 items-start">
                            {categories.map((cat) => {
                                const isActive = activeCategory === cat.id;

                                return (
                                    <button 
                                        key={cat.id}
                                        onClick={() => {
                                            setActiveCategory(isActive ? null : cat.id);
                                            setCurrentPage(1);
                                        }}
                                        className="flex items-center gap-3 text-neutral-600 hover:text-primary-500 font-semibold text-base transition-colors cursor-pointer group"
                                    >
                                        {/* Square bullet style */}
                                        <div className={`w-4 h-4 rounded-sm border-2 transition-all duration-200 ${isActive ? 'border-secondary-500 bg-secondary-500' : 'border-secondary-400 bg-white group-hover:border-secondary-500'}`}></div>
                                        <span>{cat.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Events Catalogue Listing */}
                    <div className="flex-grow flex flex-col gap-8">
                        {/* Tab Filter Type */}
                        <div className="flex items-center gap-8 border-b border-gray-150 pb-1 relative">
                            {/* Sliding underline */}
                            <div 
                                className="absolute bottom-0 h-0.75 bg-primary-500 rounded-full transition-all duration-300 ease-out"
                                style={{
                                    left: `${underlineStyle.left}px`,
                                    width: `${underlineStyle.width}px`
                                }}
                            />
                            
                            <button 
                                ref={tabAllRef}
                                onClick={() => {
                                    setActiveType('all');
                                    setCurrentPage(1);
                                }}
                                className={`pb-3 font-bold text-base cursor-pointer transition-colors duration-300 ${activeType === 'all' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                Semua
                            </button>
                            <button 
                                ref={tabOnlineRef}
                                onClick={() => {
                                    setActiveType('online');
                                    setCurrentPage(1);
                                }}
                                className={`pb-3 font-bold text-base cursor-pointer transition-colors duration-300 ${activeType === 'online' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                Online
                            </button>
                            <button 
                                ref={tabOfflineRef}
                                onClick={() => {
                                    setActiveType('offline');
                                    setCurrentPage(1);
                                }}
                                className={`pb-3 font-bold text-base cursor-pointer transition-colors duration-300 ${activeType === 'offline' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                Offline
                            </button>
                        </div>

                        {/* Catalogue Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {paginatedCatalogEvents.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-gray-400 font-semibold">
                                    Tidak ada event yang ditemukan untuk filter ini.
                                </div>
                            ) : (
                                paginatedCatalogEvents.map((event) => (
                                    <div key={event.id} className="w-full border border-neutral-150 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden flex flex-row lg:flex-col group relative justify-between h-[140px] sm:h-[170px] lg:h-[400px]">
                                        
                                        {/* "FREE" Badge on Top-Left of image */}
                                        <div className="absolute top-3 left-3 sm:top-4 lg:top-4 z-10 px-3 py-1 bg-secondary-400 text-secondary-900 font-extrabold text-[0.6275rem] rounded-md shadow-sm">
                                            FREE
                                        </div>

                                        <div className="relative aspect-square h-full w-[140px] sm:w-[170px] lg:h-[180px] lg:w-full lg:aspect-none shrink-0 overflow-hidden bg-gray-50 border-r lg:border-r-0 lg:border-b border-gray-100">
                                            <img 
                                                src={event.poster_url || DefaultCover} 
                                                alt={event.title} 
                                                draggable="false"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>

                                        <div className="p-3 sm:p-4 lg:p-4 flex flex-col gap-1 sm:gap-2 lg:gap-2 flex-grow justify-between overflow-hidden">
                                            <div className="flex flex-col gap-1 sm:gap-1.5">
                                                <h4 className="text-primary-500 font-extrabold text-xs sm:text-sm lg:text-base leading-snug line-clamp-2 lg:line-clamp-3 h-[36px] sm:h-[40px] lg:h-[66px] group-hover:text-primary-600 overflow-hidden">
                                                    {event.title}
                                                </h4>

                                                <div className="pt-1 sm:pt-1.5 border-t border-gray-100/50 flex flex-col gap-0.5 sm:gap-1 text-gray-400 text-[10px] sm:text-micro font-semibold">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar size={12} className="shrink-0 text-gray-400" />
                                                        {formatShortDate(event.start_datetime)}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin size={12} className="shrink-0 text-gray-400" />
                                                        {event.type === 'online' ? 'Online' : (event.location_name || 'Lokasi Offline')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="pt-1">
                                                <Button href={`/events/${event.id}`} className="text-[10px] sm:text-small w-full py-1 sm:py-2">
                                                    Detail Event
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-neutral-100 pt-6 mt-4">
                                <span className="text-micro font-semibold text-gray-400">
                                    Halaman {currentPage} dari {totalPages}
                                </span>
                                
                                <div className="flex gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1.5 font-bold text-micro rounded-lg border transition-colors ${
                                            currentPage === 1 
                                                ? 'bg-neutral-50 text-gray-300 cursor-not-allowed border-neutral-150' 
                                                : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200 cursor-pointer'
                                        }`}
                                    >
                                        Sebelumnya
                                    </button>

                                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNumber) => (
                                        <button
                                            key={pageNumber}
                                            type="button"
                                            onClick={() => setCurrentPage(pageNumber)}
                                            className={`px-3 py-1.5 font-bold text-micro rounded-lg border transition-colors cursor-pointer ${
                                                currentPage === pageNumber 
                                                    ? 'bg-primary-500 text-white border-primary-500 shadow-sm' 
                                                    : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200'
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1.5 font-bold text-micro rounded-lg border transition-colors ${
                                            currentPage === totalPages 
                                                ? 'bg-neutral-50 text-gray-300 cursor-not-allowed border-neutral-150' 
                                                : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200 cursor-pointer'
                                        }`}
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}

