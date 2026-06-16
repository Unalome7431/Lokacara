import EventCard from '@/components/ui/EventCard';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

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

interface EventSliderProps {
    events: Event[];
    detailUrlPrefix?: string;
}

export default function EventSlider({
    events,
    detailUrlPrefix = '/events',
}: EventSliderProps) {
    const [cardsToShow, setCardsToShow] = useState(3);
    const [slideIndex, setSlideIndex] = useState(0);
    const trackRef = useRef<HTMLDivElement>(null);

    // Responsive cardsToShow setup
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

    // Slide display preparation with loop buffering
    const displayEvents =
        events.length > cardsToShow
            ? [...events, ...events.slice(0, cardsToShow)]
            : events;

    const handleNext = () => {
        if (events.length === 0) {
            return;
        }

        setSlideIndex((prev) => {
            const nextIndex = prev + cardsToShow;
            const maxIndex = events.length - cardsToShow;

            if (prev < maxIndex) {
                return Math.min(nextIndex, maxIndex);
            }

            return events.length;
        });
    };

    const handlePrev = () => {
        if (events.length === 0) {
            return;
        }

        if (slideIndex === 0) {
            const track = trackRef.current;

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
                        x: -events.length * (cardWidth + gap),
                    });

                    const maxIndex = events.length - cardsToShow;
                    setSlideIndex(maxIndex);
                }
            }
        } else {
            setSlideIndex((prev) => {
                const prevIndex = prev - cardsToShow;
                return Math.max(0, prevIndex);
            });
        }
    };

    // Touch & swipe handling
    const dragStartX = useRef<number | null>(null);
    const dragStartY = useRef<number | null>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        dragStartX.current = e.clientX;
        dragStartY.current = e.clientY;
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (dragStartX.current === null || dragStartY.current === null) {
            return;
        }

        const diffX = dragStartX.current - e.clientX;
        const diffY = dragStartY.current - e.clientY;

        dragStartX.current = null;
        dragStartY.current = null;

        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                handleNext();
            } else {
                handlePrev();
            }
        }
    };

    // GSAP Slider animation effect
    useEffect(() => {
        if (trackRef.current) {
            const cardElement = trackRef.current.firstElementChild as HTMLElement;

            if (cardElement) {
                const cardWidth =
                    cardElement.getBoundingClientRect().width ||
                    (trackRef.current.getBoundingClientRect().width -
                        (cardsToShow - 1) * 24) /
                        cardsToShow;
                const gap = 24;
                const targetX = -slideIndex * (cardWidth + gap);

                gsap.to(trackRef.current, {
                    x: targetX,
                    duration: 0.6,
                    ease: 'power2.out',
                    onComplete: () => {
                        if (slideIndex === events.length) {
                            gsap.set(trackRef.current, { x: 0 });
                            setSlideIndex(0);
                        }
                    },
                });
            }
        }
    }, [slideIndex, cardsToShow, events.length]);

    if (events.length === 0) {
        return null;
    }

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="relative w-full touch-pan-y overflow-hidden select-none"
        >
            <div ref={trackRef} className="flex w-full gap-6">
                {displayEvents.map((event, idx) => (
                    <EventCard
                        key={`${event.id}-clone-${idx}`}
                        event={event}
                        variant="slider"
                        detailUrl={`${detailUrlPrefix}/${event.id}`}
                    />
                ))}
            </div>
            {events.length > cardsToShow && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute top-1/2 left-4 z-20 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 p-3 text-neutral-800 opacity-0 shadow-md backdrop-blur-md transition-all duration-300 group-hover/slider:opacity-100 hover:scale-105 hover:bg-white active:scale-95"
                        title="Halaman Sebelumnya"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute top-1/2 right-4 z-20 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 p-3 text-neutral-800 opacity-0 shadow-md backdrop-blur-md transition-all duration-300 group-hover/slider:opacity-100 hover:scale-105 hover:bg-white active:scale-95"
                        title="Halaman Selanjutnya"
                    >
                        <ChevronRight size={22} />
                    </button>
                </>
            )}
        </div>
    );
}
