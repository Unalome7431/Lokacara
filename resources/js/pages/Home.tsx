import { Head } from '@inertiajs/react';
import { Plus, ChevronRight, ChevronDown, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';
import DefaultCover from '@/../../public/covers/default_cover.jpg';
import Button from '@/components/ui/Button';
import NavBar from '@/layouts/NavBar';

interface Event {
    id: number;
    title: string;
    description: string;
    type: 'online' | 'offline';
    poster_url?: string;
    location_name?: string;
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
    // 1. Carousel State for Popular Events
    const [currentSlide, setCurrentSlide] = useState(0);
    const hasPopular = popularEvents && popularEvents.length > 0;
    const heroEvents = hasPopular ? popularEvents : events.slice(0, 3);
    const activeHero = heroEvents[currentSlide] || null;

    const handleNextSlide = () => {
        if (heroEvents.length > 0) {
            setCurrentSlide((prev) => (prev + 1) % heroEvents.length);
        }
    };

    // 2. Location Filtering State
    const [selectedLocation, setSelectedLocation] = useState('Semua');
    const [locationMenuOpen, setLocationMenuOpen] = useState(false);
    
    // Extract unique locations from events (ignoring null/empty)
    const locationsList = ['Semua', ...Array.from(new Set(events.map(e => e.location_name).filter(Boolean) as string[]))];
    const filteredNearbyEvents = events.filter(e => {
        if (selectedLocation === 'Semua') {
return true;
}

        return e.location_name === selectedLocation;
    }).slice(0, 3); // Display top 3 matching events

    // 3. Category & Type Catalog Filter State
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [activeType, setActiveType] = useState<'all' | 'online' | 'offline'>('all');

    const filteredCatalogEvents = events.filter(e => {
        const matchesCategory = activeCategory === null || e.category?.id === activeCategory;
        const matchesType = activeType === 'all' || e.type === activeType;

        return matchesCategory && matchesType;
    });

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
        <div className="min-h-screen bg-white pb-20">
            <NavBar />
            <Head title="Home - Temukan Event Komunitas Terbaik" />

            <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 pt-28 flex flex-col gap-14">
                
                {/* 1. HERO SECTION: EVENT POPULER */}
                {activeHero && (
                    <div className="relative w-full h-[280px] sm:h-[380px] md:h-[480px] rounded-3xl overflow-hidden shadow-lg group">
                        <img 
                            src={activeHero.poster_url || DefaultCover} 
                            alt={activeHero.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Dark gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-900/40 to-transparent"></div>

                        {/* Title Badge overlay */}
                        <div className="absolute top-6 left-6 md:top-8 md:left-10 px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-small font-bold">
                            Event Populer
                        </div>

                        {/* Text and Controls overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex flex-col gap-2 max-w-[680px]">
                                <h1 className="text-white text-3xl md:text-5xl font-black font-brand leading-tight">
                                    {activeHero.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-neutral-300 text-small md:text-base font-semibold">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={16} />
                                        {formatIndonesianDate(activeHero.start_datetime)}
                                    </span>
                                    <span className="hidden md:inline text-neutral-500">|</span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={16} />
                                        {activeHero.type === 'online' ? 'Online' : (activeHero.location_name || 'Lokasi Offline')}
                                    </span>
                                </div>
                                <p className="text-neutral-400 text-small md:text-base font-medium line-clamp-2 mt-2 leading-relaxed">
                                    {activeHero.description}
                                </p>
                            </div>

                            {/* Carousel slide trigger button */}
                            {heroEvents.length > 1 && (
                                <button 
                                    onClick={handleNextSlide}
                                    className="p-3.5 bg-white/10 hover:bg-white/25 border border-white/20 rounded-full text-white cursor-pointer backdrop-blur-md shrink-0 self-end md:self-center transition-all duration-300"
                                    title="Slide Selanjutnya"
                                >
                                    <ChevronRight size={22} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. EVENT MENDATANG SECTION (JOINED EVENTS) */}
                <div className="flex flex-col gap-5">
                    <h3 className="text-neutral-900 font-extrabold text-2xl md:text-3xl font-brand tracking-tight">
                        Event Mendatang
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Placeholder card if not registered for any events */}
                        {joinedEvents.length === 0 ? (
                            <div className="w-full h-[280px] bg-white border-2 border-dashed border-neutral-200 rounded-3xl flex flex-col items-center justify-center p-6 gap-4 text-center group hover:border-primary-300 transition-colors duration-300">
                                <a 
                                    href="#catalog"
                                    className="w-16 h-16 rounded-full bg-gray-50 border border-neutral-100 flex items-center justify-center text-primary-500 shadow-md group-hover:scale-105 transition-transform duration-300"
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
                            joinedEvents.map((event) => (
                                <div key={event.id} className="w-full border border-neutral-150 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden flex flex-col group">
                                    <div className="relative aspect-3/2 w-full overflow-hidden">
                                        <img 
                                            src={event.poster_url || DefaultCover} 
                                            alt={event.title} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-6 flex flex-col gap-3 flex-grow">
                                        <h4 className="text-primary-500 font-extrabold text-lg leading-tight line-clamp-1 group-hover:text-primary-600">
                                            {event.title}
                                        </h4>
                                        <div className="flex flex-col gap-1.5 text-gray-400 text-small font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} className="shrink-0" />
                                                {formatShortDate(event.start_datetime)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={14} className="shrink-0" />
                                                {event.type === 'online' ? 'Online' : (event.location_name || 'Lokasi Offline')}
                                            </span>
                                        </div>
                                        <div className="mt-auto pt-3">
                                            <Button href={`/events/${event.id}`} className="text-small w-full py-2.5">
                                                Detail Event
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3. EVENT TERDEKAT SECTION */}
                <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <h3 className="text-neutral-900 font-extrabold text-2xl md:text-3xl font-brand tracking-tight">
                            Event Terdekat di
                        </h3>
                        <div className="relative">
                            <button 
                                onClick={() => setLocationMenuOpen(!locationMenuOpen)}
                                className="flex items-center gap-1 text-secondary-500 font-extrabold text-2xl md:text-3xl font-brand cursor-pointer hover:text-secondary-600 transition-colors"
                            >
                                <span>{selectedLocation}</span>
                                <ChevronDown size={24} className="mt-1" />
                            </button>
                            
                            {locationMenuOpen && (
                                <div className="absolute left-0 mt-2 py-2 w-56 bg-white border border-neutral-100 rounded-2xl shadow-xl z-30">
                                    {locationsList.map((loc) => (
                                        <button 
                                            key={loc}
                                            onClick={() => {
                                                setSelectedLocation(loc);
                                                setLocationMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-base font-semibold hover:bg-neutral-50 transition-colors cursor-pointer ${selectedLocation === loc ? 'text-primary-500 bg-primary-50/30' : 'text-neutral-700'}`}
                                        >
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNearbyEvents.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-400 font-semibold">
                                Tidak ada event terdekat di lokasi ini.
                            </div>
                        ) : (
                            filteredNearbyEvents.map((event) => (
                                <div key={event.id} className="w-full border border-neutral-150 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden flex flex-col group">
                                    <div className="relative aspect-3/2 w-full overflow-hidden">
                                        <img 
                                            src={event.poster_url || DefaultCover} 
                                            alt={event.title} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-6 flex flex-col gap-3 flex-grow">
                                        <h4 className="text-primary-500 font-extrabold text-lg leading-tight line-clamp-1 group-hover:text-primary-600">
                                            {event.title}
                                        </h4>
                                        <div className="flex flex-col gap-1.5 text-gray-400 text-small font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} className="shrink-0" />
                                                {formatShortDate(event.start_datetime)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={14} className="shrink-0" />
                                                {event.type === 'online' ? 'Online' : (event.location_name || 'Lokasi Offline')}
                                            </span>
                                        </div>
                                        <div className="mt-auto pt-3">
                                            <Button href={`/events/${event.id}`} className="text-small w-full py-2.5">
                                                Detail Event
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 4. MAIN CATALOGUE & FILTER SECTION */}
                <div id="catalog" className="flex flex-col lg:flex-row gap-10 mt-6 scroll-mt-24">
                    
                    {/* Left Column: Sidebar Category Filter */}
                    <div className="w-full lg:w-1/4 shrink-0 flex flex-col gap-6">
                        <h4 className="text-primary-500 font-black text-xl font-brand">
                            Kategori
                        </h4>
                        <div className="flex flex-row flex-wrap lg:flex-col gap-y-3.5 gap-x-4 items-start">
                            {categories.map((cat) => {
                                const isActive = activeCategory === cat.id;

                                return (
                                    <button 
                                        key={cat.id}
                                        onClick={() => setActiveCategory(isActive ? null : cat.id)}
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
                        <div className="flex items-center gap-8 border-b border-gray-150 pb-1">
                            <button 
                                onClick={() => setActiveType('all')}
                                className={`pb-3 font-bold text-base relative cursor-pointer transition-colors ${activeType === 'all' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                Semua
                                {activeType === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-primary-500 rounded-full"></div>}
                            </button>
                            <button 
                                onClick={() => setActiveType('online')}
                                className={`pb-3 font-bold text-base relative cursor-pointer transition-colors ${activeType === 'online' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                Online
                                {activeType === 'online' && <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-primary-500 rounded-full"></div>}
                            </button>
                            <button 
                                onClick={() => setActiveType('offline')}
                                className={`pb-3 font-bold text-base relative cursor-pointer transition-colors ${activeType === 'offline' ? 'text-primary-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                            >
                                Offline
                                {activeType === 'offline' && <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-primary-500 rounded-full"></div>}
                            </button>
                        </div>

                        {/* Catalogue Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCatalogEvents.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-gray-400 font-semibold">
                                    Tidak ada event yang ditemukan untuk filter ini.
                                </div>
                            ) : (
                                filteredCatalogEvents.map((event) => (
                                    <div key={event.id} className="w-full border border-neutral-150 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden flex flex-col group relative">
                                        
                                        {/* "FREE" Badge on Top-Left of image */}
                                        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-secondary-400 text-secondary-900 font-extrabold text-[0.6275rem] rounded-md shadow-sm">
                                            FREE
                                        </div>

                                        <div className="relative aspect-3/2 w-full overflow-hidden bg-gray-50 border-b border-gray-100">
                                            <img 
                                                src={event.poster_url || DefaultCover} 
                                                alt={event.title} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>

                                        <div className="p-6 flex flex-col gap-3 flex-grow">
                                            <h4 className="text-primary-500 font-extrabold text-lg leading-tight line-clamp-2 h-12 group-hover:text-primary-600">
                                                {event.title}
                                            </h4>
                                            
                                            <p className="text-gray-400 text-small font-medium line-clamp-3 leading-relaxed">
                                                {event.description}
                                            </p>

                                            <div className="mt-auto pt-3 border-t border-gray-100/50 flex flex-col gap-2 text-gray-400 text-micro font-semibold">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={12} className="shrink-0 text-gray-400" />
                                                    {formatShortDate(event.start_datetime)}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin size={12} className="shrink-0 text-gray-400" />
                                                    {event.type === 'online' ? 'Online' : (event.location_name || 'Lokasi Offline')}
                                                </span>
                                            </div>

                                            <div className="pt-2">
                                                <Button href={`/events/${event.id}`} className="text-small w-full py-2.5">
                                                    Detail Event
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

