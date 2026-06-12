import { Head, Link, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import {
    Plus,
    ChevronRight,
    ChevronLeft,
    Calendar,
    MapPin,
    Loader2,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import DefaultCover from '@/../../public/covers/default_cover.jpg';
import Button from '@/components/ui/Button';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';
import {
    calculateDistance,
    geocodeAddress,
    reverseGeocode,
} from '@/lib/geocoding';

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
    price: number;
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

export default function Home({
    events,
    popularEvents,
    joinedEvents,
    categories,
}: HomeProps) {
    const { auth } = usePage().props as any;
    const isAuthenticated = !!auth?.user;

    // 1. Carousel State for Popular Events
    const [activeIndex, setActiveIndex] = useState(1);
    const isTransitioning = useRef(false);
    const isMounted = useRef(false);
    const hasPopular = popularEvents && popularEvents.length > 0;
    const heroEvents = hasPopular ? popularEvents : events.slice(0, 3);
    const displayHeroEvents =
        heroEvents.length > 1
            ? [heroEvents[heroEvents.length - 1], ...heroEvents, heroEvents[0]]
            : heroEvents;

    const currentDot =
        heroEvents.length > 0
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
    const [userCoords, setUserCoords] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
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
                        console.error(
                            'Reverse geocoding failed, using coordinates',
                            err,
                        );
                        setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                    }

                    setIsLoadingLocation(false);
                },
                async (error) => {
                    console.warn(
                        'Geolocation failed, defaulting to Yogyakarta',
                        error,
                    );
                    const fallback = { lat: -7.79558, lng: 110.36949 };
                    setUserCoords(fallback);
                    setLocationName('Yogyakarta');
                    setIsLoadingLocation(false);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
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
            .filter(
                (e) =>
                    e.type === 'offline' &&
                    e.latitude !== null &&
                    e.longitude !== null &&
                    e.latitude !== undefined &&
                    e.longitude !== undefined,
            )
            .map((e) => {
                const distance = calculateDistance(
                    userCoords.lat,
                    userCoords.lng,
                    Number(e.latitude),
                    Number(e.longitude),
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

    const displayJoined =
        joinedEvents.length > cardsToShow
            ? [...joinedEvents, ...joinedEvents.slice(0, cardsToShow)]
            : joinedEvents;

    const displayNearby =
        filteredNearbyEvents.length > cardsToShow
            ? [
                  ...filteredNearbyEvents,
                  ...filteredNearbyEvents.slice(0, cardsToShow),
              ]
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
                    const cardWidth =
                        cardElement.getBoundingClientRect().width ||
                        (track.getBoundingClientRect().width -
                            (cardsToShow - 1) * 24) /
                            cardsToShow;
                    const gap = 24;

                    gsap.set(track, {
                        x: -joinedEvents.length * (cardWidth + gap),
                    });

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
                    const cardWidth =
                        cardElement.getBoundingClientRect().width ||
                        (track.getBoundingClientRect().width -
                            (cardsToShow - 1) * 24) /
                            cardsToShow;
                    const gap = 24;

                    gsap.set(track, {
                        x: -filteredNearbyEvents.length * (cardWidth + gap),
                    });

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
        if (
            heroDragStartX.current === null ||
            heroDragStartY.current === null
        ) {
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
        if (
            joinedDragStartX.current === null ||
            joinedDragStartY.current === null
        ) {
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
        if (
            nearbyDragStartX.current === null ||
            nearbyDragStartY.current === null
        ) {
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
                gsap.set(heroTrackRef.current, {
                    xPercent: -activeIndex * 100,
                });
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
                        gsap.set(heroTrackRef.current, {
                            xPercent: -heroEvents.length * 100,
                        });
                        setActiveIndex(heroEvents.length);
                    }

                    isTransitioning.current = false;
                },
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
            const cardElement = joinedTrackRef.current
                .firstElementChild as HTMLElement;

            if (cardElement) {
                const cardWidth =
                    cardElement.getBoundingClientRect().width ||
                    (joinedTrackRef.current.getBoundingClientRect().width -
                        (cardsToShow - 1) * 24) /
                        cardsToShow;
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
                    },
                });
            }
        }
    }, [joinedIndex, cardsToShow, joinedEvents]);

    useEffect(() => {
        if (nearbyTrackRef.current) {
            const cardElement = nearbyTrackRef.current
                .firstElementChild as HTMLElement;

            if (cardElement) {
                const cardWidth =
                    cardElement.getBoundingClientRect().width ||
                    (nearbyTrackRef.current.getBoundingClientRect().width -
                        (cardsToShow - 1) * 24) /
                        cardsToShow;
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
                    },
                });
            }
        }
    }, [nearbyIndex, cardsToShow, filteredNearbyEvents]);

    // 3. Category & Type Catalog Filter State
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [activeType, setActiveType] = useState<'all' | 'online' | 'offline'>(
        'all',
    );

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
                    width: activeTab.offsetWidth,
                });
            }
        };

        updateUnderline();
        window.addEventListener('resize', updateUnderline);

        return () => window.removeEventListener('resize', updateUnderline);
    }, [activeType]);

    const filteredCatalogEvents = events.filter((e) => {
        const matchesCategory =
            activeCategory === null || e.category?.id === activeCategory;
        const matchesType = activeType === 'all' || e.type === activeType;

        return matchesCategory && matchesType;
    });

    // 4. Pagination State & Logic for Catalogue
    const [currentPage, setCurrentPage] = useState(1);

    const eventsPerPage = 9;
    const totalPages = Math.ceil(filteredCatalogEvents.length / eventsPerPage);
    const paginatedCatalogEvents = filteredCatalogEvents.slice(
        (currentPage - 1) * eventsPerPage,
        currentPage * eventsPerPage,
    );

    // Get the page numbers to display, limiting to a maximum of 5 pages
    const getPageNumbers = () => {
        const maxPageButtons = 5;

        if (totalPages <= maxPageButtons) {
            return Array.from({ length: totalPages }, (_, idx) => idx + 1);
        }

        let startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        return Array.from(
            { length: endPage - startPage + 1 },
            (_, idx) => startPage + idx,
        );
    };

    const formatIndonesianDate = (dateString: string) => {
        const dateObj = new Date(dateString);

        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(dateObj);
    };

    const formatShortDate = (dateString: string) => {
        const dateObj = new Date(dateString);

        return (
            new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(dateObj) + ' WIB'
        );
    };

    return (
        <div className="flex min-h-screen flex-col justify-between bg-white">
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
                        className="group relative h-[340px] w-full touch-pan-y overflow-hidden pt-18 select-none sm:h-[460px] md:h-[580px]"
                    >
                        {/* Standalone Navigation Buttons */}
                        {heroEvents.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevSlide}
                                    className="absolute top-1/2 left-6 z-20 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 p-3 text-white opacity-0 shadow-md backdrop-blur-md transition-all duration-300 group-hover:opacity-100 hover:scale-105 hover:bg-white/25 active:scale-95"
                                    title="Slide Sebelumnya"
                                >
                                    <ChevronLeft size={22} />
                                </button>
                                <button
                                    onClick={handleNextSlide}
                                    className="absolute top-1/2 right-6 z-20 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 p-3 text-white opacity-0 shadow-md backdrop-blur-md transition-all duration-300 group-hover:opacity-100 hover:scale-105 hover:bg-white/25 active:scale-95"
                                    title="Slide Selanjutnya"
                                >
                                    <ChevronRight size={22} />
                                </button>
                            </>
                        )}

                        {/* Dot indicators */}
                        {heroEvents.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                                {heroEvents.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (!isTransitioning.current) {
                                                setActiveIndex(idx + 1);
                                            }
                                        }}
                                        className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
                                            currentDot === idx
                                                ? 'w-6 bg-white'
                                                : 'w-2 bg-white/40 hover:bg-white/75'
                                        }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Stationary Event Populer label */}
                        <div className="absolute top-24 left-6 z-20 rounded-full border border-white/20 bg-white/20 px-4 py-1.5 text-small font-bold text-white backdrop-blur-md md:top-26 md:left-10">
                            Event Populer
                        </div>

                        <div ref={heroTrackRef} className="flex h-full w-full">
                            {displayHeroEvents.map((event, idx) => (
                                <Link
                                    key={`${event.id}-hero-${idx}`}
                                    href={`/events/${event.id}`}
                                    className="group/hero-slide relative block h-full w-full shrink-0 cursor-pointer overflow-hidden"
                                >
                                    <img
                                        src={event.poster_url || DefaultCover}
                                        alt={event.title}
                                        draggable="false"
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover/hero-slide:scale-[1.03]"
                                    />
                                    {/* Dark gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-900/40 to-transparent"></div>

                                    {/* Text overlay */}
                                    <div className="absolute right-0 bottom-0 left-0 ml-4 flex max-w-[800px] flex-col gap-2 pt-6 pr-8 pb-12 pl-8 md:pt-10 md:pr-16 md:pb-16 md:pl-16">
                                        <h1 className="font-brand text-3xl leading-tight font-black text-white md:text-5xl">
                                            {event.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-small font-semibold text-neutral-300 md:text-base">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={16} />
                                                {formatIndonesianDate(
                                                    event.start_datetime,
                                                )}
                                            </span>
                                            <span className="hidden text-neutral-500 md:inline">
                                                |
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={16} />
                                                {event.type === 'online'
                                                    ? 'Online'
                                                    : event.location_name ||
                                                      'Lokasi Offline'}
                                            </span>
                                        </div>
                                        <p className="mt-2 line-clamp-2 text-small leading-relaxed font-medium text-neutral-400 md:text-base">
                                            {event.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mx-auto flex max-w-[1280px] flex-col gap-14 px-4 py-10 pb-16 md:px-8">
                    {/* 2. EVENT MENDATANG SECTION (JOINED EVENTS) */}
                    {isAuthenticated && (
                        <div className="flex flex-col gap-5">
                            <h3 className="font-brand text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">
                                Event Mendatang
                            </h3>

                            <div className="group/slider relative w-full">
                                {/* Placeholder card if not registered for any events */}
                                {joinedEvents.length === 0 ? (
                                    <div className="group flex h-[280px] w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-neutral-200 bg-white p-6 text-center transition-colors duration-300 hover:border-primary-300">
                                        <a
                                            href="#catalog"
                                            className="border-neutral-150 flex h-16 w-16 items-center justify-center rounded-full border bg-gray-50 text-primary-500 shadow-md transition-transform duration-300 group-hover:scale-105"
                                        >
                                            <Plus size={28} />
                                        </a>
                                        <div className="flex flex-col gap-1">
                                            <h4 className="font-brand text-base font-bold text-neutral-700">
                                                Belum Ikut Event Apapun
                                            </h4>
                                            <p className="max-w-[200px] text-small text-gray-400">
                                                Temukan berbagai event menarik
                                                di bawah ini
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onPointerDown={handleJoinedPointerDown}
                                        onPointerUp={handleJoinedPointerUp}
                                        className="relative w-full touch-pan-y overflow-hidden select-none"
                                    >
                                        <div
                                            ref={joinedTrackRef}
                                            className="flex w-full gap-6"
                                        >
                                            {displayJoined.map((event, idx) => (
                                                <div
                                                    key={`${event.id}-clone-${idx}`}
                                                    className="border-neutral-150 group relative flex h-[325px] w-[calc((100%-24px)/2)] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:h-[370px] lg:h-[400px] lg:w-[calc((100%-72px)/4)]"
                                                >
                                                    <div className="absolute top-4 left-4 z-10 rounded-md bg-secondary-400 px-3 py-1 text-[0.6275rem] font-extrabold text-secondary-900 shadow-sm">
                                                        {event.price === 0
                                                            ? 'GRATIS'
                                                            : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                                                    </div>

                                                    <div className="relative h-[140px] w-full shrink-0 overflow-hidden border-b border-gray-100 bg-gray-50 sm:h-[170px] lg:aspect-3/2 lg:h-auto">
                                                        <img
                                                            src={
                                                                event.poster_url ||
                                                                DefaultCover
                                                            }
                                                            alt={event.title}
                                                            draggable="false"
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    </div>
                                                    <div className="flex flex-grow flex-col justify-between gap-2 p-4">
                                                        <div className="flex flex-col gap-1.5">
                                                            <h4 className="line-clamp-2 h-[34px] overflow-hidden text-xs leading-snug font-extrabold text-primary-500 group-hover:text-primary-600 sm:h-[40px] sm:text-sm lg:line-clamp-3 lg:h-[66px] lg:text-base">
                                                                {event.title}
                                                            </h4>
                                                            <div className="flex flex-col gap-1 border-t border-gray-100/50 pt-1.5 text-[10px] font-semibold text-gray-400 sm:text-micro">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Calendar
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="shrink-0 text-gray-400"
                                                                    />
                                                                    {formatShortDate(
                                                                        event.start_datetime,
                                                                    )}
                                                                </span>
                                                                <span className="flex items-center gap-1.5">
                                                                    <MapPin
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="shrink-0 text-gray-400"
                                                                    />
                                                                    {event.type ===
                                                                    'online'
                                                                        ? 'Online'
                                                                        : event.location_name ||
                                                                          'Lokasi Offline'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="pt-1">
                                                            <Button
                                                                href={`/events/${event.id}`}
                                                                className="w-full py-1.5 text-[10px] sm:py-2 sm:text-small"
                                                            >
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
                                                    className="absolute top-1/2 left-4 z-20 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 p-3 text-neutral-800 opacity-0 shadow-md backdrop-blur-md transition-all duration-300 group-hover/slider:opacity-100 hover:scale-105 hover:bg-white active:scale-95"
                                                    title="Halaman Sebelumnya"
                                                >
                                                    <ChevronLeft size={22} />
                                                </button>
                                                <button
                                                    onClick={handleJoinedNext}
                                                    className="absolute top-1/2 right-4 z-20 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 p-3 text-neutral-800 opacity-0 shadow-md backdrop-blur-md transition-all duration-300 group-hover/slider:opacity-100 hover:scale-105 hover:bg-white active:scale-95"
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
                            <h3 className="font-brand text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">
                                Event Terdekat di Sekitarmu
                            </h3>
                            {isLoadingLocation && (
                                <div className="ml-2 flex animate-pulse items-center gap-2 text-primary-500">
                                    <Loader2
                                        size={20}
                                        className="animate-spin text-primary-500"
                                    />
                                    <span className="font-brand text-small font-bold">
                                        Mendapatkan lokasi...
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="group/slider relative w-full">
                            {isLoadingLocation &&
                            filteredNearbyEvents.length === 0 ? (
                                <div className="flex h-[280px] w-full items-center justify-center rounded-3xl border border-neutral-200 bg-white">
                                    <Loader2
                                        size={32}
                                        className="mr-2 animate-spin text-primary-500"
                                    />
                                    <span className="font-brand font-bold text-neutral-500">
                                        Memuat event terdekat...
                                    </span>
                                </div>
                            ) : filteredNearbyEvents.length === 0 ? (
                                <div className="col-span-full rounded-3xl border border-neutral-200 bg-white py-12 text-center font-semibold text-gray-400">
                                    Tidak ada event terdekat di sekitarmu.
                                </div>
                            ) : (
                                <div
                                    onPointerDown={handleNearbyPointerDown}
                                    onPointerUp={handleNearbyPointerUp}
                                    className="relative w-full touch-pan-y overflow-hidden select-none"
                                >
                                    <div
                                        ref={nearbyTrackRef}
                                        className="flex w-full gap-6"
                                    >
                                        {displayNearby.map((event, idx) => (
                                            <div
                                                key={`${event.id}-clone-${idx}`}
                                                className="border-neutral-150 group relative flex h-[325px] w-[calc((100%-24px)/2)] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:h-[370px] lg:h-[400px] lg:w-[calc((100%-72px)/4)]"
                                            >
                                                <div className="absolute top-4 left-4 z-10 rounded-md bg-secondary-400 px-3 py-1 text-[0.6275rem] font-extrabold text-secondary-900 shadow-sm">
                                                    {event.price === 0
                                                            ? 'GRATIS'
                                                            : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                                                </div>

                                                <div className="relative h-[140px] w-full shrink-0 overflow-hidden border-b border-gray-100 bg-gray-50 sm:h-[170px] lg:aspect-3/2 lg:h-auto">
                                                    <img
                                                        src={
                                                            event.poster_url ||
                                                            DefaultCover
                                                        }
                                                        alt={event.title}
                                                        draggable="false"
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                </div>
                                                <div className="flex flex-grow flex-col justify-between gap-2 p-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <h4 className="line-clamp-2 h-[34px] overflow-hidden text-xs leading-snug font-extrabold text-primary-500 group-hover:text-primary-600 sm:h-[40px] sm:text-sm lg:line-clamp-3 lg:h-[66px] lg:text-base">
                                                            {event.title}
                                                        </h4>
                                                        <div className="flex flex-col gap-1 border-t border-gray-100/50 pt-1.5 text-[10px] font-semibold text-gray-400 sm:text-micro">
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar
                                                                    size={12}
                                                                    className="shrink-0 text-gray-400"
                                                                />
                                                                {formatShortDate(
                                                                    event.start_datetime,
                                                                )}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <MapPin
                                                                    size={12}
                                                                    className="shrink-0 text-gray-400"
                                                                />
                                                                {event.type ===
                                                                'online'
                                                                    ? 'Online'
                                                                    : event.location_name ||
                                                                      'Lokasi Offline'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="pt-1">
                                                        <Button
                                                            href={`/events/${event.id}`}
                                                            className="w-full py-1.5 text-[10px] sm:py-2 sm:text-small"
                                                        >
                                                            Detail Event
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {filteredNearbyEvents.length >
                                        cardsToShow && (
                                        <>
                                            <button
                                                onClick={handleNearbyPrev}
                                                className="absolute top-1/2 left-4 z-20 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 p-3 text-neutral-800 opacity-0 shadow-md backdrop-blur-md transition-all duration-300 group-hover/slider:opacity-100 hover:scale-105 hover:bg-white active:scale-95"
                                                title="Halaman Sebelumnya"
                                            >
                                                <ChevronLeft size={22} />
                                            </button>
                                            <button
                                                onClick={handleNearbyNext}
                                                className="absolute top-1/2 right-4 z-20 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 p-3 text-neutral-800 opacity-0 shadow-md backdrop-blur-md transition-all duration-300 group-hover/slider:opacity-100 hover:scale-105 hover:bg-white active:scale-95"
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
                    <div
                        id="catalog"
                        className="mt-6 flex scroll-mt-24 flex-col gap-10 lg:flex-row"
                    >
                        {/* Left Column: Sidebar Category Filter */}
                        <div className="lg:border-neutral-150 border-neutral-150 flex w-full shrink-0 flex-col gap-6 border-b pb-8 lg:w-1/4 lg:border-r lg:border-b-0 lg:pr-10 lg:pb-0">
                            <h4 className="font-brand text-xl font-black text-primary-500">
                                Kategori
                            </h4>
                            <div className="flex flex-row flex-wrap items-start gap-x-4 gap-y-3.5 lg:flex-col">
                                {categories.map((cat) => {
                                    const isActive = activeCategory === cat.id;

                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                setActiveCategory(
                                                    isActive ? null : cat.id,
                                                );
                                                setCurrentPage(1);
                                            }}
                                            className="group flex cursor-pointer items-center gap-3 text-base font-semibold text-neutral-600 transition-colors hover:text-primary-500"
                                        >
                                            {/* Square bullet style */}
                                            <div
                                                className={`h-4 w-4 rounded-sm border-2 transition-all duration-200 ${isActive ? 'border-secondary-500 bg-secondary-500' : 'border-secondary-400 bg-white group-hover:border-secondary-500'}`}
                                            ></div>
                                            <span>{cat.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Column: Events Catalogue Listing */}
                        <div className="flex flex-grow flex-col gap-8">
                            {/* Tab Filter Type */}
                            <div className="border-gray-150 relative flex items-center gap-8 border-b pb-1">
                                {/* Sliding underline */}
                                <div
                                    className="absolute bottom-0 h-0.75 rounded-full bg-primary-500 transition-all duration-300 ease-out"
                                    style={{
                                        left: `${underlineStyle.left}px`,
                                        width: `${underlineStyle.width}px`,
                                    }}
                                />

                                <button
                                    ref={tabAllRef}
                                    onClick={() => {
                                        setActiveType('all');
                                        setCurrentPage(1);
                                    }}
                                    className={`cursor-pointer pb-3 text-base font-bold transition-colors duration-300 ${activeType === 'all' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                                >
                                    Semua
                                </button>
                                <button
                                    ref={tabOnlineRef}
                                    onClick={() => {
                                        setActiveType('online');
                                        setCurrentPage(1);
                                    }}
                                    className={`cursor-pointer pb-3 text-base font-bold transition-colors duration-300 ${activeType === 'online' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                                >
                                    Online
                                </button>
                                <button
                                    ref={tabOfflineRef}
                                    onClick={() => {
                                        setActiveType('offline');
                                        setCurrentPage(1);
                                    }}
                                    className={`cursor-pointer pb-3 text-base font-bold transition-colors duration-300 ${activeType === 'offline' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                                >
                                    Offline
                                </button>
                            </div>

                            {/* Catalogue Grid */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                {paginatedCatalogEvents.length === 0 ? (
                                    <div className="col-span-full py-20 text-center font-semibold text-gray-400">
                                        Tidak ada event yang ditemukan untuk
                                        filter ini.
                                    </div>
                                ) : (
                                    paginatedCatalogEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="border-neutral-150 group relative flex h-[140px] w-full flex-row justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:h-[170px] lg:h-[400px] lg:flex-col"
                                        >
                                            <div className="absolute top-3 left-3 z-10 rounded-md bg-secondary-400 px-3 py-1 text-[0.6275rem] font-extrabold text-secondary-900 shadow-sm sm:top-4 lg:top-4">
                                                {event.price === 0
                                                            ? 'GRATIS'
                                                            : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                                            </div>

                                            <div className="lg:aspect-none relative aspect-square h-full w-[140px] shrink-0 overflow-hidden border-r border-gray-100 bg-gray-50 sm:w-[170px] lg:h-[180px] lg:w-full lg:border-r-0 lg:border-b">
                                                <img
                                                    src={
                                                        event.poster_url ||
                                                        DefaultCover
                                                    }
                                                    alt={event.title}
                                                    draggable="false"
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>

                                            <div className="flex flex-grow flex-col justify-between gap-1 overflow-hidden p-3 sm:gap-2 sm:p-4 lg:gap-2 lg:p-4">
                                                <div className="flex flex-col gap-1 sm:gap-1.5">
                                                    <h4 className="line-clamp-2 h-[36px] overflow-hidden text-xs leading-snug font-extrabold text-primary-500 group-hover:text-primary-600 sm:h-[40px] sm:text-sm lg:line-clamp-3 lg:h-[66px] lg:text-base">
                                                        {event.title}
                                                    </h4>

                                                    <div className="flex flex-col gap-0.5 border-t border-gray-100/50 pt-1 text-[10px] font-semibold text-gray-400 sm:gap-1 sm:pt-1.5 sm:text-micro">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar
                                                                size={12}
                                                                className="shrink-0 text-gray-400"
                                                            />
                                                            {formatShortDate(
                                                                event.start_datetime,
                                                            )}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <MapPin
                                                                size={12}
                                                                className="shrink-0 text-gray-400"
                                                            />
                                                            {event.type ===
                                                            'online'
                                                                ? 'Online'
                                                                : event.location_name ||
                                                                  'Lokasi Offline'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="pt-1">
                                                    <Button
                                                        href={`/events/${event.id}`}
                                                        className="w-full py-1 text-[10px] sm:py-2 sm:text-small"
                                                    >
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
                                <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-6">
                                    <span className="text-micro font-semibold text-gray-400">
                                        Halaman {currentPage} dari {totalPages}
                                    </span>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.max(1, prev - 1),
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-micro font-bold ${
                                                currentPage === 1
                                                    ? 'border-neutral-150 cursor-not-allowed bg-neutral-50 text-gray-300'
                                                    : 'cursor-pointer border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                                            }`}
                                            title="Sebelumnya"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>

                                        {getPageNumbers().map((pageNumber) => (
                                            <button
                                                key={pageNumber}
                                                type="button"
                                                onClick={() =>
                                                    setCurrentPage(pageNumber)
                                                }
                                                className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-micro font-bold ${
                                                    currentPage === pageNumber
                                                        ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
                                                        : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.min(
                                                        totalPages,
                                                        prev + 1,
                                                    ),
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-micro font-bold ${
                                                currentPage === totalPages
                                                    ? 'border-neutral-150 cursor-not-allowed bg-neutral-50 text-gray-300'
                                                    : 'cursor-pointer border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                                            }`}
                                            title="Selanjutnya"
                                        >
                                            <ChevronRight size={16} />
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
