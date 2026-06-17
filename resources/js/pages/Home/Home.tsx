import { Head, usePage } from '@inertiajs/react';
import { Plus, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import EventSlider from '@/components/ui/EventSlider';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';
import {
    calculateDistance,
    geocodeAddress,
    reverseGeocode,
} from '@/lib/geocoding';
import CatalogSection from './sections/CatalogSection';
import HomeHero from './sections/HomeHero';

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
    events = [],
    popularEvents = [],
    joinedEvents = [],
    categories = [],
}: HomeProps) {
    const { auth } = usePage().props as any;
    const isAuthenticated = !!auth?.user;

    // Location & Proximity State
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

    // Calculate proximity and sort events via useMemo
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

    return (
        <div className="flex min-h-screen flex-col justify-between bg-white">
            <div className="grow">
                <NavBar
                    locationValue={locationName}
                    onLocationSubmit={handleLocationSubmit}
                    onUseCurrentLocation={detectLocation}
                />
                <Head title="Home - Temukan Event Komunitas Terbaik" />

                {/* 1. HERO SECTION: EVENT POPULER */}
                <HomeHero popularEvents={popularEvents} events={events} />

                <div className="mx-auto flex max-w-[1280px] flex-col gap-14 px-4 py-10 pb-16 md:px-8">
                    {/* 2. EVENT MENDATANG SECTION */}
                    {isAuthenticated && (
                        <div className="flex flex-col gap-5">
                            <h3 className="font-brand text-h3-mobile font-extrabold tracking-tight text-neutral-900 lg:text-h3-web">
                                Event Mendatang
                            </h3>

                            <div className="group/slider relative w-full">
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
                                                Temukan berbagai event menarik di bawah ini
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <EventSlider events={joinedEvents} />
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
                                <EventSlider events={filteredNearbyEvents} />
                            )}
                        </div>
                    </div>

                    {/* 4. MAIN CATALOGUE & FILTER SECTION */}
                    <CatalogSection
                        events={events}
                        categories={categories}
                        userCoords={userCoords}
                    />
                </div>
            </div>
            <Footer />
        </div>
    );
}
