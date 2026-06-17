import { Link } from '@inertiajs/react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import DefaultCover from '@/../../public/covers/default_cover.jpg';
import { formatIndonesianDate } from '@/lib/utils';

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

interface HomeHeroProps {
    popularEvents: Event[];
    events: Event[];
}

export default function HomeHero({ popularEvents = [], events = [] }: HomeHeroProps) {
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

    if (heroEvents.length === 0) {
        return null;
    }

    return (
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
                        <div className="absolute inset-0 bg-linear-to-t from-neutral-950/95 via-neutral-900/40 to-transparent"></div>

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
    );
}
