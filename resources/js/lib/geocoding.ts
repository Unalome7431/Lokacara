const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

/**
 * Calculate distance between two coordinates in kilometers using the Haversine formula.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
}

/**
 * Reverse geocode latitude and longitude to get the city/region name.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
    if (googleMapsApiKey) {
        try {
            const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}&language=id`
            );
            const data = await res.json();

            if (data.status === 'OK' && data.results && data.results.length > 0) {
                const result = data.results[0];
                let city = '';

                for (const component of result.address_components) {
                    if (component.types.includes('locality')) {
                        city = component.long_name;
                        break;
                    }

                    if (component.types.includes('administrative_area_level_2')) {
                        city = component.long_name;
                    }
                }

                if (city) {
return cleanCityName(city);
}

                return result.formatted_address;
            }
        } catch (e) {
            console.error('Google Reverse Geocoding failed, trying fallback...', e);
        }
    }

    // Fallback to OSM Nominatim
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`
        );
        const data = await res.json();

        if (data && data.address) {
            const city =
                data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.municipality ||
                data.address.county ||
                data.address.state ||
                'Lokasi';

            return cleanCityName(city);
        }
    } catch (e) {
        console.error('OSM Nominatim Geocoding failed', e);
    }

    return 'Lokasi Tidak Dikenal';
}

/**
 * Geocode a text search query to get coordinates and a cleaned city name.
 */
export async function geocodeAddress(
    address: string
): Promise<{ lat: number; lng: number; city: string } | null> {
    if (googleMapsApiKey) {
        try {
            const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                    address
                )}&key=${googleMapsApiKey}&language=id`
            );
            const data = await res.json();

            if (data.status === 'OK' && data.results && data.results.length > 0) {
                const result = data.results[0];
                const lat = result.geometry.location.lat;
                const lng = result.geometry.location.lng;
                let city = '';

                for (const component of result.address_components) {
                    if (component.types.includes('locality')) {
                        city = component.long_name;
                        break;
                    }

                    if (component.types.includes('administrative_area_level_2')) {
                        city = component.long_name;
                    }
                }

                if (!city) {
                    city = result.formatted_address.split(',')[0];
                }

                return { lat, lng, city: cleanCityName(city) };
            }
        } catch (e) {
            console.error('Google Geocoding failed, trying fallback...', e);
        }
    }

    // Fallback to OSM Nominatim
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                address
            )}&limit=1&accept-language=id`
        );
        const data = await res.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            const displayName = data[0].display_name;
            const parts = displayName.split(',');
            // The first part is usually the city/town/locality
            const city = parts[0] || address;

            return { lat, lng, city: cleanCityName(city) };
        }
    } catch (e) {
        console.error('OSM Nominatim Geocoding failed', e);
    }

    return null;
}

/**
 * Clean up common administrative prefixes in Indonesian city/region names
 */
function cleanCityName(name: string): string {
    return name
        .replace(/^(Kota|Kabupaten|Kecamatan|Desa|Kelurahan)\s+/gi, '')
        .trim();
}

/**
 * List of major cities in Indonesia for local autocomplete suggestions.
 */
export const INDONESIAN_CITIES = [
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Bekasi', 'Depok', 'Tangerang',
    'Palembang', 'Semarang', 'Makassar', 'Tangerang Selatan', 'Batam',
    'Bandar Lampung', 'Bogor', 'Padang', 'Pekanbaru', 'Malang', 'Samarinda',
    'Tasikmalaya', 'Pontianak', 'Banjarmasin', 'Denpasar', 'Serang', 'Jambi',
    'Balikpapan', 'Surakarta', 'Yogyakarta', 'Cimahi', 'Kupang', 'Manado',
    'Cirebon', 'Mataram', 'Jayapura', 'Bengkulu', 'Palu', 'Ambon', 'Kendari',
    'Sukabumi', 'Pekalongan', 'Kediri', 'Tegal', 'Binjai', 'Pematangsiantar',
    'Banda Aceh', 'Palangkaraya', 'Probolinggo', 'Banjarbaru', 'Pasuruan',
    'Tanjungpinang', 'Madiun', 'Batu', 'Salatiga', 'Pangkalpinang',
    'Lubuklinggau', 'Tarakan', 'Ternate', 'Bitung', 'Tanjungbalai', 'Bontang',
    'Padang Sidempuan', 'Sorong', 'Singkawang', 'Prabumulih', 'Banjar', 'Metro',
    'Tebing Tinggi', 'Bau-Bau', 'Gunungsitoli', 'Bima', 'Pagar Alam', 'Sibolga',
    'Kotamobagu', 'Mojokerto', 'Magelang', 'Payakumbuh', 'Bukittinggi', 'Tual',
    'Subulussalam', 'Dumai', 'Sungai Penuh', 'Sabang', 'Pariaman', 'Sawahlunto',
    'Padang Panjang', 'Solok'
];

/**
 * Fetch autocomplete suggestions, limiting to cities in Indonesia.
 */
export async function fetchCitySuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) {
return [];
}

    const localMatches = INDONESIAN_CITIES.filter((city) =>
        city.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&countrycodes=id&limit=15&q=${encodeURIComponent(
                query
            )}&accept-language=id`
        );
        const data = await res.json();
        const apiCities = data
            .filter(
                (item: any) =>
                    item.class === 'place' &&
                    ['city', 'town', 'village', 'municipality', 'state', 'county'].includes(
                        item.type
                    )
            )
            .map((item: any) => item.display_name.split(',')[0].trim());

        const combined = Array.from(new Set([...localMatches, ...apiCities]));

        return combined.map(cleanCityName).slice(0, 8);
    } catch (e) {
        console.error('Failed to fetch from Nominatim, using local list fallback', e);

        return localMatches.map(cleanCityName);
    }
}

