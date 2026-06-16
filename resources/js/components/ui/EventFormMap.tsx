import { GoogleMap, MarkerF, Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import React, { useRef } from 'react';

const GOOGLE_MAPS_LIBRARIES: any = ['places'];

interface EventFormMapProps {
    type: 'online' | 'offline';
    onChangeType?: (type: 'online' | 'offline') => void;
    locationName: string;
    address: string;
    latitude: number;
    longitude: number;
    link?: string;
    errorLocationName?: string;
    errorLink?: string;
    onChangeLocation: (updatedFields: {
        location_name?: string;
        address?: string;
        latitude?: number;
        longitude?: number;
        link?: string;
    }) => void;
}

export default function EventFormMap({
    type,
    onChangeType,
    locationName,
    address,
    latitude,
    longitude,
    link,
    errorLocationName,
    errorLink,
    onChangeLocation,
}: EventFormMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: GOOGLE_MAPS_LIBRARIES,
    });

    const autocompleteRef = useRef<any>(null);
    const mapRef = useRef<any>(null);

    const handlePlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();

            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const addressName = place.formatted_address || '';
                const nameOfPlace = place.name || addressName;

                onChangeLocation({
                    location_name: nameOfPlace,
                    address: addressName,
                    latitude: lat,
                    longitude: lng,
                });

                if (mapRef.current) {
                    mapRef.current.panTo({ lat, lng });
                    mapRef.current.setZoom(16);
                }
            }
        }
    };

    const handleMarkerDragEnd = (e: any) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            onChangeLocation({
                latitude: lat,
                longitude: lng,
            });

            if (typeof window !== 'undefined' && (window as any).google) {
                const geocoder = new (window as any).google.maps.Geocoder();
                geocoder.geocode(
                    { location: { lat, lng } },
                    (results: any, status: any) => {
                        if (status === 'OK' && results?.[0]) {
                            const formattedAddress = results[0].formatted_address;
                            onChangeLocation({
                                location_name: formattedAddress,
                                address: formattedAddress,
                                latitude: lat,
                                longitude: lng,
                            });
                        }
                    },
                );
            }
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="font-brand text-base font-extrabold text-neutral-800">
                Lokasi
            </label>

            <div className="flex w-full flex-col items-center gap-4 sm:flex-row">
                {onChangeType && (
                    <div className="relative flex h-9 w-48 shrink-0 overflow-hidden rounded-full border border-neutral-100 bg-white p-0.5 shadow-xs select-none">
                        {/* Sliding background */}
                        <div
                            className={`absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-primary-500 transition-all duration-300 ease-in-out ${
                                type === 'online'
                                    ? 'translate-x-0'
                                    : 'translate-x-full'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => onChangeType('online')}
                            className={`relative z-10 w-1/2 rounded-full border-0 py-1.5 text-xs font-bold transition-colors duration-300 ${
                                type === 'online'
                                    ? 'cursor-default text-white'
                                    : 'cursor-pointer bg-transparent text-neutral-500 hover:text-neutral-800'
                            }`}
                        >
                            Online
                        </button>
                        <button
                            type="button"
                            onClick={() => onChangeType('offline')}
                            className={`relative z-10 w-1/2 rounded-full border-0 py-1.5 text-xs font-bold transition-colors duration-300 ${
                                type === 'offline'
                                    ? 'cursor-default text-white'
                                    : 'cursor-pointer bg-transparent text-neutral-500 hover:text-neutral-800'
                            }`}
                        >
                            Offline
                        </button>
                    </div>
                )}

                {type === 'online' ? (
                    <input
                        type="text"
                        placeholder="Link Zoom/Gmeet/apapun"
                        value={link || ''}
                        onChange={(e) =>
                            onChangeLocation({
                                link: e.target.value,
                            })
                        }
                        required
                        className="w-full flex-grow rounded-full border-0 bg-white px-5 py-2.5 text-base font-medium text-neutral-800 shadow-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                ) : isLoaded ? (
                    <div className="w-full flex-grow">
                        <Autocomplete
                            onLoad={(autocomplete) => {
                                autocompleteRef.current = autocomplete;
                            }}
                            onPlaceChanged={handlePlaceChanged}
                        >
                            <input
                                type="text"
                                placeholder="Cari Alamat atau Nama Tempat..."
                                value={locationName}
                                onChange={(e) =>
                                    onChangeLocation({
                                        location_name: e.target.value,
                                    })
                                }
                                required
                                className="w-full rounded-full border-0 bg-white px-5 py-2.5 text-base font-medium text-neutral-800 shadow-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            />
                        </Autocomplete>
                    </div>
                ) : (
                    <input
                        type="text"
                        placeholder="Memuat Pencarian Alamat..."
                        disabled
                        className="w-full flex-grow rounded-full border-0 bg-neutral-100 px-5 py-2.5 text-base font-medium text-neutral-400"
                    />
                )}
            </div>

            {type === 'online' && errorLink && (
                <span className="mt-1 pl-1 text-xs font-bold text-red-500">
                    {errorLink}
                </span>
            )}
            {type === 'offline' && errorLocationName && (
                <span className="mt-1 pl-1 text-xs font-bold text-red-500">
                    {errorLocationName}
                </span>
            )}

            {/* Google Map Box for Offline */}
            {type === 'offline' && (
                <div className="flex w-full flex-col gap-2 border-t border-neutral-200/40 pt-4">
                    <div className="relative h-[220px] w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={{
                                    width: '100%',
                                    height: '220px',
                                }}
                                center={{
                                    lat: latitude,
                                    lng: longitude,
                                }}
                                zoom={15}
                                onLoad={(map) => {
                                    mapRef.current = map;
                                }}
                                options={{
                                    disableDefaultUI: true,
                                    zoomControl: true,
                                    streetViewControl: false,
                                }}
                            >
                                <MarkerF
                                    position={{
                                        lat: latitude,
                                        lng: longitude,
                                    }}
                                    draggable={true}
                                    onDragEnd={handleMarkerDragEnd}
                                />
                            </GoogleMap>
                        ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-gray-400">
                                <MapPin
                                    size={24}
                                    className="animate-bounce text-primary-500"
                                />
                                <span className="font-brand text-sm font-bold text-gray-500">
                                    Memuat Google Maps...
                                </span>
                            </div>
                        )}
                    </div>
                    {address && (
                        <div className="mt-1 px-1 text-xs font-semibold text-neutral-500">
                            <span className="font-extrabold text-neutral-800">
                                Alamat Lengkap:
                            </span>{' '}
                            {address}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
