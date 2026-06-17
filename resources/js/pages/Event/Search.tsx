import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';
import SearchGrid from './sections/Search/SearchGrid';
import SearchSidebar from './sections/Search/SearchSidebar';

interface Event {
    id: number;
    title: string;
    description: string;
    type: 'online' | 'offline';
    poster_url?: string;
    location_name?: string;
    latitude?: number;
    longitude?: number;
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

interface PaginatedEvents {
    current_page: number;
    data: Event[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface SearchFilters {
    keyword?: string;
    category_id?: number | null;
    type?: 'all' | 'online' | 'offline';
    min_price?: string;
    max_price?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: 'popular' | 'nearest' | 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc';
    latitude?: number | null;
    longitude?: number | null;
}

interface SearchProps {
    events: PaginatedEvents;
    categories: Category[];
    filters: SearchFilters;
}

export default function SearchPage({
    events,
    categories,
    filters = {},
}: SearchProps) {
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const page = usePage();
    const pageFilters = (page.props.filters as any) || {};
    const currentKeyword = pageFilters.keyword || '';

    const handleFilterChange = (newFilters: Record<string, any>) => {
        const mergedFilters: Record<string, any> = {
            ...filters,
            ...newFilters,
            page: 1, // Reset page to 1 when changing filters
        };

        // Clean up empty parameters
        Object.keys(mergedFilters).forEach((key) => {
            if (
                mergedFilters[key] === null ||
                mergedFilters[key] === undefined ||
                mergedFilters[key] === ''
            ) {
                delete (mergedFilters as any)[key];
            }
        });

        router.get('/events/search', mergedFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (pageNumber: number) => {
        handleFilterChange({ page: pageNumber });
    };

    const handleSortChange = (value: string) => {
        if (value === 'nearest') {
            if (filters.latitude && filters.longitude) {
                handleFilterChange({ sort_by: value });
            } else {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const lat = position.coords.latitude;
                            const lng = position.coords.longitude;
                            handleFilterChange({
                                sort_by: value,
                                latitude: lat,
                                longitude: lng,
                            });
                        },
                        (error) => {
                            alert('Tidak dapat memuat lokasi Anda untuk mengurutkan berdasarkan jarak.');
                            console.warn('Geolocation failed', error);
                        },
                    );
                } else {
                    alert('Geolocation tidak didukung oleh browser Anda.');
                }
            }
        } else {
            const newParams = { sort_by: value, latitude: null, longitude: null };
            handleFilterChange(newParams);
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-between bg-white">
            <Head
                title={
                    currentKeyword
                        ? `Pencarian: "${currentKeyword}" - Lokacara`
                        : 'Jelajah Event - Lokacara'
                }
            />
            <NavBar />

            <div className="grow">
                <div className="mx-auto w-full max-w-[1280px] px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                    {/* Catalog section */}
                    <div id="catalog" className="flex flex-col gap-6">
                        <h3 className="font-brand text-h3-mobile font-black text-neutral-900 lg:text-h3-web">
                            {currentKeyword ? (
                                <>
                                    Pencarian untuk <span className="text-secondary-500" style={{ color: '#ffaa00' }}>'{currentKeyword}'</span>
                                </>
                            ) : (
                                'Jelajah Event'
                            )}
                        </h3>

                        <div className="flex flex-col gap-10 lg:flex-row">
                            {/* Left Sidebar Preferences */}
                            <SearchSidebar
                                categories={categories}
                                filters={filters}
                                handleFilterChange={handleFilterChange}
                                isMobileFilterOpen={isMobileFilterOpen}
                                setIsMobileFilterOpen={setIsMobileFilterOpen}
                            />

                            {/* Right Listing Grid */}
                            <SearchGrid
                                events={events}
                                filters={filters}
                                handleFilterChange={handleFilterChange}
                                handleSortChange={handleSortChange}
                                handlePageChange={handlePageChange}
                                setIsMobileFilterOpen={setIsMobileFilterOpen}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
