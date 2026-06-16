import { Head, Link, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import {
    Plus,
    ChevronRight,
    ChevronLeft,
    Calendar,
    MapPin,
    Loader2,
    ChevronDown,
    Filter,
    X,
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
    view_count?: number;
    capacity?: number;
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
            if (window.innerWidth < 768) {
                setCardsToShow(2);
            } else if (window.innerWidth < 1024) {
                setCardsToShow(3);
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

    // Custom sort dropdown
    const sortOptions = [
        { value: 'popular', label: 'Terpopuler' },
        { value: 'nearest', label: 'Lokasi Terdekat' },
        { value: 'date_asc', label: 'Tanggal Terdekat' },
        { value: 'date_desc', label: 'Tanggal Terjauh' },
        { value: 'price_asc', label: 'Harga Termurah' },
        { value: 'price_desc', label: 'Harga Termahal' },
    ] as const;

    type SortValue = (typeof sortOptions)[number]['value'];
    const [sortBy, setSortBy] = useState<SortValue>('popular');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Price range filters
    const [tempMinPrice, setTempMinPrice] = useState('');
    const [tempMaxPrice, setTempMaxPrice] = useState('');
    const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
    const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);

    // Date range filters
    const [tempStartDate, setTempStartDate] = useState('');
    const [tempEndDate, setTempEndDate] = useState('');
    const [appliedStartDate, setAppliedStartDate] = useState<string | null>(
        null,
    );
    const [appliedEndDate, setAppliedEndDate] = useState<string | null>(null);

    const todayString = useMemo(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd}`;
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                sortDropdownRef.current &&
                !sortDropdownRef.current.contains(event.target as Node)
            ) {
                setIsSortDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isMobileFilterOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileFilterOpen]);
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
    const filteredCatalogEvents = useMemo(() => {
        const result = events.filter((e) => {
            const matchesCategory =
                activeCategory === null || e.category?.id === activeCategory;
            const matchesType = activeType === 'all' || e.type === activeType;

            // Price range filter
            const matchesMinPrice =
                appliedMinPrice === null || e.price >= appliedMinPrice;
            const matchesMaxPrice =
                appliedMaxPrice === null || e.price <= appliedMaxPrice;

            // Date range filter
            let matchesDate = true;
            const eventTime = new Date(e.start_datetime).getTime();

            if (appliedStartDate !== null && appliedStartDate !== '') {
                const startDate = new Date(appliedStartDate);
                startDate.setHours(0, 0, 0, 0);

                if (eventTime < startDate.getTime()) {
                    matchesDate = false;
                }
            }

            if (appliedEndDate !== null && appliedEndDate !== '') {
                const endDate = new Date(appliedEndDate);
                endDate.setHours(23, 59, 59, 999);

                if (eventTime > endDate.getTime()) {
                    matchesDate = false;
                }
            }

            return (
                matchesCategory &&
                matchesType &&
                matchesMinPrice &&
                matchesMaxPrice &&
                matchesDate
            );
        });

        if (sortBy === 'popular') {
            result.sort((a, b) => {
                const ratioA = (a.view_count || 0) / (a.capacity || 1);
                const ratioB = (b.view_count || 0) / (b.capacity || 1);

                return ratioB - ratioA;
            });
        } else if (sortBy === 'nearest') {
            result.sort((a, b) => {
                const distA =
                    a.type === 'offline' &&
                    a.latitude !== null &&
                    a.longitude !== null &&
                    userCoords
                        ? calculateDistance(
                              userCoords.lat,
                              userCoords.lng,
                              Number(a.latitude),
                              Number(a.longitude),
                          )
                        : Infinity;
                const distB =
                    b.type === 'offline' &&
                    b.latitude !== null &&
                    b.longitude !== null &&
                    userCoords
                        ? calculateDistance(
                              userCoords.lat,
                              userCoords.lng,
                              Number(b.latitude),
                              Number(b.longitude),
                          )
                        : Infinity;

                return distA - distB;
            });
        } else if (sortBy === 'date_asc') {
            result.sort(
                (a, b) =>
                    new Date(a.start_datetime).getTime() -
                    new Date(b.start_datetime).getTime(),
            );
        } else if (sortBy === 'date_desc') {
            result.sort(
                (a, b) =>
                    new Date(b.start_datetime).getTime() -
                    new Date(a.start_datetime).getTime(),
            );
        } else if (sortBy === 'price_asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_desc') {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [
        events,
        activeCategory,
        activeType,
        sortBy,
        userCoords,
        appliedMinPrice,
        appliedMaxPrice,
        appliedStartDate,
        appliedEndDate,
    ]);

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
                                        <h1 className="line-clamp-2 font-brand text-h1-mobile leading-tight font-black text-white lg:text-h1-web">
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
                            <h3 className="font-brand text-h3-mobile font-extrabold tracking-tight text-neutral-900 lg:text-h3-web">
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
                                            <h4 className="font-brand text-h6-mobile font-bold text-neutral-700 lg:text-h6-web">
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
                                                    className="border-neutral-150 group relative flex h-[340px] w-[calc((100%-24px)/2)] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md md:h-[370px] md:w-[calc((100%-48px)/3)] lg:h-[400px] lg:w-[calc((100%-72px)/4)]"
                                                >
                                                    <div className="absolute top-4 left-4 z-10 rounded-md bg-secondary-400 px-3 py-1 text-[0.6275rem] font-extrabold text-secondary-900 shadow-sm">
                                                        {event.price === 0
                                                            ? 'GRATIS'
                                                            : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                                                    </div>

                                                    <div className="relative h-[170px] w-full shrink-0 overflow-hidden border-b border-gray-100 bg-gray-50 md:h-[190px] lg:h-[210px]">
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
                                                    <div className="flex h-[170px] shrink-0 flex-col justify-between p-4 md:h-[180px] lg:h-[190px]">
                                                        <div className="flex flex-col gap-1.5">
                                                            <h4 className="line-clamp-2 h-[34px] overflow-hidden text-small leading-snug font-extrabold text-primary-500 group-hover:text-primary-600 md:h-[40px] lg:h-[48px] lg:text-base">
                                                                {event.title}
                                                            </h4>
                                                            <div className="flex flex-col gap-1 border-t border-gray-100/50 pt-1.5 text-[10px] font-semibold text-gray-400 md:text-micro">
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
                                                                <span className="flex items-start gap-1.5">
                                                                    <MapPin
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="mt-0.5 shrink-0 text-gray-400"
                                                                    />
                                                                    <span className="line-clamp-2 overflow-hidden">
                                                                        {event.type ===
                                                                        'online'
                                                                            ? 'Online'
                                                                            : event.location_name ||
                                                                              'Lokasi Offline'}
                                                                    </span>
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
                            <h3 className="font-brand text-h3-mobile font-extrabold tracking-tight text-neutral-900 lg:text-h3-web">
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
                                                className="border-neutral-150 group relative flex h-[340px] w-[calc((100%-24px)/2)] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md md:h-[370px] md:w-[calc((100%-48px)/3)] lg:h-[400px] lg:w-[calc((100%-72px)/4)]"
                                            >
                                                <div className="absolute top-4 left-4 z-10 rounded-md bg-secondary-400 px-3 py-1 text-[0.6275rem] font-extrabold text-secondary-900 shadow-sm">
                                                    {event.price === 0
                                                        ? 'GRATIS'
                                                        : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                                                </div>

                                                <div className="relative h-[170px] w-full shrink-0 overflow-hidden border-b border-gray-100 bg-gray-50 md:h-[190px] lg:h-[210px]">
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
                                                <div className="flex h-[170px] shrink-0 flex-col justify-between p-4 md:h-[180px] lg:h-[190px]">
                                                    <div className="flex flex-col gap-1.5">
                                                        <h4 className="line-clamp-2 h-[34px] overflow-hidden text-small leading-snug font-extrabold text-primary-500 group-hover:text-primary-600 md:h-[40px] lg:h-[48px] lg:text-base">
                                                            {event.title}
                                                        </h4>
                                                        <div className="flex flex-col gap-1 border-t border-gray-100/50 pt-1.5 text-[10px] font-semibold text-gray-400 md:text-micro">
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar
                                                                    size={12}
                                                                    className="shrink-0 text-gray-400"
                                                                />
                                                                {formatShortDate(
                                                                    event.start_datetime,
                                                                )}
                                                            </span>
                                                            <span className="flex items-start gap-1.5">
                                                                <MapPin
                                                                    size={12}
                                                                    className="mt-0.5 shrink-0 text-gray-400"
                                                                />
                                                                <span className="line-clamp-2 overflow-hidden">
                                                                    {event.type ===
                                                                    'online'
                                                                        ? 'Online'
                                                                        : event.location_name ||
                                                                          'Lokasi Offline'}
                                                                </span>
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
                    {/* 4. MAIN CATALOGUE & FILTER SECTION */}
                    <div
                        id="catalog"
                        className="mt-12 flex scroll-mt-24 flex-col gap-6"
                    >
                        <h3 className="font-brand text-h3-mobile font-black text-neutral-900 lg:text-h3-web">
                            Jelajah Event
                        </h3>
                        <div className="flex flex-col gap-10 lg:flex-row">
                            {/* Left Column: Sidebar Category Filter */}
                            <div className="lg:border-neutral-150 border-neutral-150 hidden flex-col gap-6 border-b pb-8 lg:flex lg:w-1/4 lg:border-r lg:border-b-0 lg:pr-10 lg:pb-0">
                                <h4 className="font-brand text-h4-mobile font-black text-primary-500 lg:text-h4-web">
                                    Preferensi
                                </h4>

                                {/* Kategori Section */}
                                <div className="flex flex-col gap-3">
                                    <h5 className="text-small font-extrabold tracking-wider text-neutral-400 uppercase">
                                        Kategori
                                    </h5>
                                    <div className="flex flex-row flex-wrap items-start gap-x-4 gap-y-3.5 lg:flex-col lg:gap-3">
                                        {categories.map((cat) => {
                                            const isActive =
                                                activeCategory === cat.id;

                                            return (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setActiveCategory(
                                                            isActive
                                                                ? null
                                                                : cat.id,
                                                        );
                                                        setCurrentPage(1);
                                                    }}
                                                    className="group flex cursor-pointer items-center gap-3 text-sm font-semibold text-neutral-600 transition-colors hover:text-primary-500"
                                                >
                                                    {/* Square bullet style */}
                                                    <div
                                                        className={`h-3.5 w-3.5 rounded-sm border-2 transition-all duration-200 ${isActive ? 'border-secondary-500 bg-secondary-500' : 'border-secondary-400 bg-white group-hover:border-secondary-500'}`}
                                                    ></div>
                                                    <span>{cat.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Harga Section */}
                                <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5">
                                    <h5 className="text-small font-extrabold tracking-wider text-neutral-400 uppercase">
                                        Harga
                                    </h5>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-bold text-neutral-500">
                                                Harga Minimum
                                            </span>
                                            <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 transition-colors duration-150 focus-within:border-primary-500">
                                                <span className="text-sm font-bold text-neutral-400">
                                                    Rp
                                                </span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={tempMinPrice}
                                                    onChange={(e) =>
                                                        setTempMinPrice(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full text-sm font-semibold text-neutral-800 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-bold text-neutral-500">
                                                Harga Maksimum
                                            </span>
                                            <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 transition-colors duration-150 focus-within:border-primary-500">
                                                <span className="text-sm font-bold text-neutral-400">
                                                    Rp
                                                </span>
                                                <input
                                                    type="number"
                                                    placeholder="Maks"
                                                    value={tempMaxPrice}
                                                    onChange={(e) =>
                                                        setTempMaxPrice(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full text-sm font-semibold text-neutral-800 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    const minVal =
                                                        tempMinPrice === ''
                                                            ? null
                                                            : Number(
                                                                  tempMinPrice,
                                                              );
                                                    const maxVal =
                                                        tempMaxPrice === ''
                                                            ? null
                                                            : Number(
                                                                  tempMaxPrice,
                                                              );
                                                    setAppliedMinPrice(minVal);
                                                    setAppliedMaxPrice(maxVal);
                                                    setCurrentPage(1);
                                                }}
                                                className="w-full cursor-pointer rounded-xl bg-primary-500 py-2 text-center text-xs font-bold text-white shadow-xs transition-colors duration-150 hover:bg-primary-600"
                                            >
                                                Terapkan Harga
                                            </button>
                                            {(appliedMinPrice !== null ||
                                                appliedMaxPrice !== null) && (
                                                <button
                                                    onClick={() => {
                                                        setTempMinPrice('');
                                                        setTempMaxPrice('');
                                                        setAppliedMinPrice(
                                                            null,
                                                        );
                                                        setAppliedMaxPrice(
                                                            null,
                                                        );
                                                        setCurrentPage(1);
                                                    }}
                                                    className="cursor-pointer rounded-xl border border-neutral-300 px-3 py-2 text-center text-xs font-bold text-neutral-600 transition-colors duration-150 hover:bg-neutral-50"
                                                >
                                                    Reset
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tanggal Section */}
                                <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5">
                                    <h5 className="text-small font-extrabold tracking-wider text-neutral-400 uppercase">
                                        Tanggal
                                    </h5>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-bold text-neutral-500">
                                                Dari
                                            </span>
                                            <input
                                                type="date"
                                                min={todayString}
                                                value={tempStartDate}
                                                onChange={(e) =>
                                                    setTempStartDate(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full cursor-pointer rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition-colors duration-150 outline-none focus:border-primary-500"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-bold text-neutral-500">
                                                Sampai
                                            </span>
                                            <input
                                                type="date"
                                                min={
                                                    tempStartDate || todayString
                                                }
                                                value={tempEndDate}
                                                onChange={(e) =>
                                                    setTempEndDate(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full cursor-pointer rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition-colors duration-150 outline-none focus:border-primary-500"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setAppliedStartDate(
                                                        tempStartDate || null,
                                                    );
                                                    setAppliedEndDate(
                                                        tempEndDate || null,
                                                    );
                                                    setCurrentPage(1);
                                                }}
                                                className="w-full cursor-pointer rounded-xl bg-primary-500 py-2 text-center text-xs font-bold text-white shadow-xs transition-colors duration-150 hover:bg-primary-600"
                                            >
                                                Terapkan Tanggal
                                            </button>
                                            {(appliedStartDate ||
                                                appliedEndDate) && (
                                                <button
                                                    onClick={() => {
                                                        setTempStartDate('');
                                                        setTempEndDate('');
                                                        setAppliedStartDate(
                                                            null,
                                                        );
                                                        setAppliedEndDate(null);
                                                        setCurrentPage(1);
                                                    }}
                                                    className="cursor-pointer rounded-xl border border-neutral-300 px-3 py-2 text-center text-xs font-bold text-neutral-600 transition-colors duration-150 hover:bg-neutral-50"
                                                >
                                                    Reset
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Events Catalogue Listing */}
                            <div className="flex flex-grow flex-col gap-8">
                                {/* Tab Filter Type */}
                                <div className="flex items-end justify-between border-b border-neutral-100">
                                    <div className="scrollbar-none relative flex items-center gap-6 overflow-x-auto sm:gap-8">
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
                                            className={`cursor-pointer pb-3 text-sm font-bold transition-colors duration-300 sm:text-base ${activeType === 'all' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                                        >
                                            Semua
                                        </button>
                                        <button
                                            ref={tabOnlineRef}
                                            onClick={() => {
                                                setActiveType('online');
                                                setCurrentPage(1);
                                            }}
                                            className={`cursor-pointer pb-3 text-sm font-bold transition-colors duration-300 sm:text-base ${activeType === 'online' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                                        >
                                            Online
                                        </button>
                                        <button
                                            ref={tabOfflineRef}
                                            onClick={() => {
                                                setActiveType('offline');
                                                setCurrentPage(1);
                                            }}
                                            className={`cursor-pointer pb-3 text-sm font-bold transition-colors duration-300 sm:text-base ${activeType === 'offline' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                                        >
                                            Offline
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 pb-1.5">
                                        {/* Mobile Filter Trigger Button */}
                                        <button
                                            onClick={() =>
                                                setIsMobileFilterOpen(true)
                                            }
                                            className="border-neutral-350 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white text-xs font-bold text-neutral-600 shadow-xs transition-all duration-200 outline-none hover:border-primary-500 hover:text-primary-500 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-1.5 lg:hidden"
                                        >
                                            <Filter
                                                size={14}
                                                className="text-neutral-400"
                                            />
                                            <span className="hidden sm:inline">
                                                Filter
                                            </span>
                                        </button>

                                        {/* Custom Dropdown Sort Filter */}
                                        <div
                                            className="relative"
                                            ref={sortDropdownRef}
                                        >
                                            <button
                                                onClick={() =>
                                                    setIsSortDropdownOpen(
                                                        !isSortDropdownOpen,
                                                    )
                                                }
                                                className="border-neutral-350 flex cursor-pointer items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-xs font-bold text-neutral-600 shadow-xs transition-all duration-200 outline-none hover:border-primary-500 hover:text-primary-500"
                                            >
                                                <span>
                                                    {
                                                        sortOptions.find(
                                                            (opt) =>
                                                                opt.value ===
                                                                sortBy,
                                                        )?.label
                                                    }
                                                </span>
                                                <ChevronDown
                                                    size={14}
                                                    className={`text-neutral-400 transition-transform duration-250 ${isSortDropdownOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>

                                            {isSortDropdownOpen && (
                                                <div className="animate-in fade-in slide-in-from-top-2 absolute top-full right-0 z-50 mt-1 w-48 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg duration-150">
                                                    {sortOptions.map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => {
                                                                setSortBy(
                                                                    opt.value,
                                                                );
                                                                setIsSortDropdownOpen(
                                                                    false,
                                                                );
                                                                setCurrentPage(
                                                                    1,
                                                                );
                                                            }}
                                                            className={`w-full cursor-pointer rounded-xl px-3.5 py-2 text-left text-xs font-semibold transition-colors duration-150 ${
                                                                sortBy ===
                                                                opt.value
                                                                    ? 'bg-primary-50 font-bold text-primary-500'
                                                                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Filter Drawer Overlay */}
                                {isMobileFilterOpen && (
                                    <div className="fixed inset-0 z-50 flex justify-end">
                                        {/* Backdrop */}
                                        <div
                                            className="animate-in fade-in fixed inset-0 bg-neutral-900/60 backdrop-blur-xs duration-200"
                                            onClick={() =>
                                                setIsMobileFilterOpen(false)
                                            }
                                        />

                                        {/* Drawer Panel */}
                                        <div className="animate-in slide-in-from-right relative z-50 flex h-full w-full max-w-xs flex-col gap-6 overflow-y-auto bg-white p-6 shadow-2xl duration-200">
                                            {/* Drawer Header */}
                                            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                                                <h4 className="font-brand text-h4-mobile font-black text-primary-500 lg:text-h4-web">
                                                    Preferensi
                                                </h4>
                                                <button
                                                    onClick={() =>
                                                        setIsMobileFilterOpen(
                                                            false,
                                                        )
                                                    }
                                                    className="cursor-pointer rounded-full p-1 text-neutral-400 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-600"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>

                                            {/* Drawer Filters */}
                                            <div className="flex flex-col gap-6">
                                                {/* Kategori Section */}
                                                <div className="flex flex-col gap-3">
                                                    <h5 className="text-small font-extrabold tracking-wider text-neutral-400 uppercase">
                                                        Kategori
                                                    </h5>
                                                    <div className="flex flex-col gap-3">
                                                        {categories.map(
                                                            (cat) => {
                                                                const isActive =
                                                                    activeCategory ===
                                                                    cat.id;

                                                                return (
                                                                    <button
                                                                        key={
                                                                            cat.id
                                                                        }
                                                                        onClick={() => {
                                                                            setActiveCategory(
                                                                                isActive
                                                                                    ? null
                                                                                    : cat.id,
                                                                            );
                                                                            setCurrentPage(
                                                                                1,
                                                                            );
                                                                        }}
                                                                        className="group flex cursor-pointer items-center gap-3 text-sm font-semibold text-neutral-600 transition-colors hover:text-primary-500"
                                                                    >
                                                                        <div
                                                                            className={`h-3.5 w-3.5 rounded-sm border-2 transition-all duration-200 ${isActive ? 'border-secondary-500 bg-secondary-500' : 'border-secondary-400 bg-white group-hover:border-secondary-500'}`}
                                                                        ></div>
                                                                        <span>
                                                                            {
                                                                                cat.name
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Harga Section */}
                                                <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5">
                                                    <h5 className="text-small font-extrabold tracking-wider text-neutral-400 uppercase">
                                                        Harga
                                                    </h5>
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex flex-col gap-1.5">
                                                            <span className="text-xs font-bold text-neutral-500">
                                                                Harga Minimum
                                                            </span>
                                                            <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 transition-colors duration-150 focus-within:border-primary-500">
                                                                <span className="text-sm font-bold text-neutral-400">
                                                                    Rp
                                                                </span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    value={
                                                                        tempMinPrice
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setTempMinPrice(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full text-sm font-semibold text-neutral-800 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            <span className="text-xs font-bold text-neutral-500">
                                                                Harga Maksimum
                                                            </span>
                                                            <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 transition-colors duration-150 focus-within:border-primary-500">
                                                                <span className="text-sm font-bold text-neutral-400">
                                                                    Rp
                                                                </span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Maks"
                                                                    value={
                                                                        tempMaxPrice
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setTempMaxPrice(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full text-sm font-semibold text-neutral-800 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    const minVal =
                                                                        tempMinPrice ===
                                                                        ''
                                                                            ? null
                                                                            : Number(
                                                                                  tempMinPrice,
                                                                              );
                                                                    const maxVal =
                                                                        tempMaxPrice ===
                                                                        ''
                                                                            ? null
                                                                            : Number(
                                                                                  tempMaxPrice,
                                                                              );
                                                                    setAppliedMinPrice(
                                                                        minVal,
                                                                    );
                                                                    setAppliedMaxPrice(
                                                                        maxVal,
                                                                    );
                                                                    setCurrentPage(
                                                                        1,
                                                                    );
                                                                    setIsMobileFilterOpen(
                                                                        false,
                                                                    );
                                                                }}
                                                                className="w-full cursor-pointer rounded-xl bg-primary-500 py-2 text-center text-xs font-bold text-white shadow-xs transition-colors duration-150 hover:bg-primary-600"
                                                            >
                                                                Terapkan
                                                            </button>
                                                            {(appliedMinPrice !==
                                                                null ||
                                                                appliedMaxPrice !==
                                                                    null) && (
                                                                <button
                                                                    onClick={() => {
                                                                        setTempMinPrice(
                                                                            '',
                                                                        );
                                                                        setTempMaxPrice(
                                                                            '',
                                                                        );
                                                                        setAppliedMinPrice(
                                                                            null,
                                                                        );
                                                                        setAppliedMaxPrice(
                                                                            null,
                                                                        );
                                                                        setCurrentPage(
                                                                            1,
                                                                        );
                                                                        setIsMobileFilterOpen(
                                                                            false,
                                                                        );
                                                                    }}
                                                                    className="cursor-pointer rounded-xl border border-neutral-300 px-3 py-2 text-center text-xs font-bold text-neutral-600 transition-colors duration-150 hover:bg-neutral-50"
                                                                >
                                                                    Reset
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tanggal Section */}
                                                <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5">
                                                    <h5 className="text-xs font-extrabold tracking-wider text-neutral-400 uppercase">
                                                        Tanggal
                                                    </h5>
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex flex-col gap-1.5">
                                                            <span className="text-xs font-bold text-neutral-500">
                                                                Dari
                                                            </span>
                                                            <input
                                                                type="date"
                                                                min={
                                                                    todayString
                                                                }
                                                                value={
                                                                    tempStartDate
                                                                }
                                                                onChange={(e) =>
                                                                    setTempStartDate(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full cursor-pointer rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition-colors duration-150 outline-none focus:border-primary-500"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            <span className="text-xs font-bold text-neutral-500">
                                                                Sampai
                                                            </span>
                                                            <input
                                                                type="date"
                                                                min={
                                                                    tempStartDate ||
                                                                    todayString
                                                                }
                                                                value={
                                                                    tempEndDate
                                                                }
                                                                onChange={(e) =>
                                                                    setTempEndDate(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full cursor-pointer rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition-colors duration-150 outline-none focus:border-primary-500"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setAppliedStartDate(
                                                                        tempStartDate ||
                                                                            null,
                                                                    );
                                                                    setAppliedEndDate(
                                                                        tempEndDate ||
                                                                            null,
                                                                    );
                                                                    setCurrentPage(
                                                                        1,
                                                                    );
                                                                    setIsMobileFilterOpen(
                                                                        false,
                                                                    );
                                                                }}
                                                                className="w-full cursor-pointer rounded-xl bg-primary-500 py-2 text-center text-xs font-bold text-white shadow-xs transition-colors duration-150 hover:bg-primary-600"
                                                            >
                                                                Terapkan
                                                            </button>
                                                            {(appliedStartDate ||
                                                                appliedEndDate) && (
                                                                <button
                                                                    onClick={() => {
                                                                        setTempStartDate(
                                                                            '',
                                                                        );
                                                                        setTempEndDate(
                                                                            '',
                                                                        );
                                                                        setAppliedStartDate(
                                                                            null,
                                                                        );
                                                                        setAppliedEndDate(
                                                                            null,
                                                                        );
                                                                        setCurrentPage(
                                                                            1,
                                                                        );
                                                                        setIsMobileFilterOpen(
                                                                            false,
                                                                        );
                                                                    }}
                                                                    className="cursor-pointer rounded-xl border border-neutral-300 px-3 py-2 text-center text-xs font-bold text-neutral-600 transition-colors duration-150 hover:bg-neutral-50"
                                                                >
                                                                    Reset
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Catalogue Grid */}
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                                    {paginatedCatalogEvents.length === 0 ? (
                                        <div className="col-span-full py-20 text-center font-semibold text-gray-400">
                                            Tidak ada event yang ditemukan untuk
                                            filter ini.
                                        </div>
                                    ) : (
                                        paginatedCatalogEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                className="border-neutral-150 group relative flex h-[160px] w-full flex-row justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:mx-auto sm:h-[400px] sm:w-full sm:flex-col"
                                            >
                                                <div className="absolute top-3 left-3 z-10 rounded-md bg-secondary-400 px-3 py-1 text-[0.6275rem] font-extrabold text-secondary-900 shadow-sm sm:top-4">
                                                    {event.price === 0
                                                        ? 'GRATIS'
                                                        : `Rp ${Number(event.price).toLocaleString('id-ID')}`}
                                                </div>
 
                                                <div className="sm:aspect-none relative aspect-square h-full w-[160px] shrink-0 overflow-hidden border-r border-gray-100 bg-gray-50 sm:h-[210px] sm:w-full sm:border-r-0 sm:border-b">
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
 
                                                <div className="flex flex-grow flex-col justify-between gap-1 overflow-hidden p-3 sm:h-[190px] sm:flex-none sm:shrink-0 sm:p-4">
                                                    <div className="flex flex-col gap-1 sm:gap-1.5">
                                                        <h4 className="line-clamp-2 h-[36px] overflow-hidden text-small leading-snug font-extrabold text-primary-500 group-hover:text-primary-600 sm:h-[48px] sm:text-base">
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
                                                            <span className="flex items-start gap-1.5">
                                                                <MapPin
                                                                    size={12}
                                                                    className="mt-0.5 shrink-0 text-gray-400"
                                                                />
                                                                <span className="line-clamp-2 overflow-hidden">
                                                                    {event.type ===
                                                                    'online'
                                                                        ? 'Online'
                                                                        : event.location_name ||
                                                                          'Lokasi Offline'}
                                                                </span>
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
                                            Halaman {currentPage} dari{' '}
                                            {totalPages}
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
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold sm:h-9 sm:w-9 sm:text-micro ${
                                                    currentPage === 1
                                                        ? 'border-neutral-150 cursor-not-allowed bg-neutral-50 text-gray-300'
                                                        : 'cursor-pointer border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                                                }`}
                                                title="Sebelumnya"
                                            >
                                                <ChevronLeft
                                                    size={14}
                                                    className="sm:h-4 sm:w-4"
                                                />
                                            </button>

                                            {getPageNumbers().map(
                                                (pageNumber) => {
                                                    const isMobileHidden =
                                                        (() => {
                                                            if (
                                                                totalPages <= 3
                                                            ) {
                                                                return false;
                                                            }

                                                            if (
                                                                currentPage ===
                                                                1
                                                            ) {
                                                                return (
                                                                    pageNumber >
                                                                    3
                                                                );
                                                            }

                                                            if (
                                                                currentPage ===
                                                                totalPages
                                                            ) {
                                                                return (
                                                                    pageNumber <
                                                                    totalPages -
                                                                        2
                                                                );
                                                            }

                                                            return (
                                                                Math.abs(
                                                                    pageNumber -
                                                                        currentPage,
                                                                ) > 1
                                                            );
                                                        })();

                                                    return (
                                                        <button
                                                            key={pageNumber}
                                                            type="button"
                                                            onClick={() =>
                                                                setCurrentPage(
                                                                    pageNumber,
                                                                )
                                                            }
                                                            className={`h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-[10px] font-bold sm:h-9 sm:w-9 sm:text-micro ${
                                                                isMobileHidden
                                                                    ? 'hidden sm:flex'
                                                                    : 'flex'
                                                            } ${
                                                                currentPage ===
                                                                pageNumber
                                                                    ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
                                                                    : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                                                            }`}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    );
                                                },
                                            )}

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
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold sm:h-9 sm:w-9 sm:text-micro ${
                                                    currentPage === totalPages
                                                        ? 'border-neutral-150 cursor-not-allowed bg-neutral-50 text-gray-300'
                                                        : 'cursor-pointer border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                                                }`}
                                                title="Selanjutnya"
                                            >
                                                <ChevronRight
                                                    size={14}
                                                    className="sm:h-4 sm:w-4"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
