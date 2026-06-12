import { Head, useForm, router } from '@inertiajs/react';
import {
    GoogleMap,
    useJsApiLoader,
    MarkerF,
    Autocomplete,
} from '@react-google-maps/api';
import {
    Camera,
    Plus,
    Minus,
    MapPin,
    Trash2,
    Upload,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';

const GOOGLE_MAPS_LIBRARIES: any = ['places'];

interface Category {
    id: number;
    name: string;
}

interface Event {
    id: number;
    title: string;
    category_id?: number;
    description: string;
    type: 'online' | 'offline';
    location_name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    platform_name?: string;
    link?: string;
    start_datetime: string;
    end_datetime: string;
    capacity?: number;
    poster_url?: string;
    price: number;
}

interface EditProps {
    event: Event;
    categories: Category[];
}

export default function Edit({ event, categories }: EditProps) {
    // 1. Parser to extract serialized details from description
    const parseDescription = (desc: string) => {
        let mainDesc = desc || '';
        let org = '';
        let tg = '';
        let cts = [{ name: '', info: '' }];

        if (desc) {
            const separatorIndex = desc.indexOf('---');

            if (separatorIndex !== -1) {
                mainDesc = desc.slice(0, separatorIndex).trim();
                const metaBlock = desc.slice(separatorIndex);

                const orgMatch = metaBlock.match(
                    /\*\*Penyelenggara:\*\*\s*(.*)/,
                );

                if (orgMatch) {
                    org = orgMatch[1].trim();
                }

                const tagMatch = metaBlock.match(/\*\*Tags:\*\*\s*(.*)/);

                if (tagMatch) {
                    tg = tagMatch[1].trim();
                }

                const contactBlockIndex = metaBlock.indexOf('**Kontak:**');

                if (contactBlockIndex !== -1) {
                    const contactLines = metaBlock
                        .slice(contactBlockIndex)
                        .split('\n')
                        .slice(1);
                    const parsedCts = contactLines
                        .map((line) => {
                            const match = line.match(/^-\s*([^:]+):\s*(.*)/);

                            if (match) {
                                return {
                                    name: match[1].trim(),
                                    info: match[2].trim(),
                                };
                            }

                            return null;
                        })
                        .filter(Boolean) as { name: string; info: string }[];

                    if (parsedCts.length > 0) {
                        cts = parsedCts;
                    }
                }
            }
        }

        return { mainDesc, org, tg, cts };
    };

    const parsedMeta = parseDescription(event.description);

    const initialTags = parsedMeta.tg
        ? parsedMeta.tg.split(',').map(t => t.replace('#', '').trim()).filter(Boolean)
        : [''];

    // Helper to format ISO dates to datetime-local values (YYYY-MM-DDTHH:mm)
    const formatDatetimeForInput = (dateString: string) => {
        if (!dateString) {
            return '';
        }

        try {
            const date = new Date(dateString);
            // Adjust timezone offset to output local ISO string
            const tzOffset = date.getTimezoneOffset() * 60000;
            const localISOTime = new Date(date.getTime() - tzOffset)
                .toISOString()
                .slice(0, 16);

            return localISOTime;
        } catch {
            return '';
        }
    };

    // 2. Inertia Form State (Using method spoofing for file uploads)
    const { data, setData, processing, errors } = useForm({
        title: event.title || '',
        category_id: event.category_id !== undefined ? String(event.category_id) : '',
        description: parsedMeta.mainDesc,
        type: event.type || 'offline',
        location_name: event.location_name || '',
        address: event.address || '',
        latitude: event.latitude ? Number(event.latitude) : -7.79558,
        longitude: event.longitude ? Number(event.longitude) : 110.36949,
        platform_name: event.platform_name || '',
        link: event.link || '',
        start_datetime: formatDatetimeForInput(event.start_datetime),
        end_datetime: formatDatetimeForInput(event.end_datetime),
        capacity: event.capacity || 50,
        poster: null as File | null,
        price: event.price || 0,
        _method: 'PUT', // Spoofing PUT request
    });

    const [isFree, setIsFree] = useState(event.price === 0);

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

                setData((prev) => ({
                    ...prev,
                    location_name: nameOfPlace,
                    address: addressName,
                    latitude: lat,
                    longitude: lng,
                }));

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

            setData((prev) => ({
                ...prev,
                latitude: lat,
                longitude: lng,
            }));

            if (typeof window !== 'undefined' && (window as any).google) {
                const geocoder = new (window as any).google.maps.Geocoder();
                geocoder.geocode(
                    { location: { lat, lng } },
                    (results: any, status: any) => {
                        if (status === 'OK' && results?.[0]) {
                            const formattedAddress =
                                results[0].formatted_address;
                            setData((prev) => ({
                                ...prev,
                                location_name: formattedAddress,
                                address: formattedAddress,
                                latitude: lat,
                                longitude: lng,
                            }));
                        }
                    },
                );
            }
        }
    };

    // 3. Local Mockup Fields
    const [organizer, setOrganizer] = useState(parsedMeta.org);
    const [tags, setTags] = useState<string[]>(initialTags);
    const [contacts, setContacts] = useState(parsedMeta.cts);

    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                categoryDropdownRef.current &&
                !categoryDropdownRef.current.contains(event.target as Node)
            ) {
                setIsCategoryDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const stepperIntervalRef = useRef<any>(null);
    const stepperTimeoutRef = useRef<any>(null);

    const startStepper = (action: () => void) => {
        action();
        stepperTimeoutRef.current = setTimeout(() => {
            stepperIntervalRef.current = setInterval(() => {
                action();
            }, 80);
        }, 400);
    };

    const stopStepper = () => {
        if (stepperTimeoutRef.current) {
            clearTimeout(stepperTimeoutRef.current);
        }

        if (stepperIntervalRef.current) {
            clearInterval(stepperIntervalRef.current);
        }
    };

    useEffect(() => {
        return () => {
            if (stepperTimeoutRef.current) {
                clearTimeout(stepperTimeoutRef.current);
            }

            if (stepperIntervalRef.current) {
                clearInterval(stepperIntervalRef.current);
            }
        };
    }, []);

    // 4. Poster Upload & Preview State
    const [posterPreview, setPosterPreview] = useState<string | null>(
        event.poster_url || null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('poster', file);
            const url = URL.createObjectURL(file);
            setPosterPreview(url);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // 5. Capacity Stepper Actions
    const incrementCapacity = () => {
        setData((prev) => ({
            ...prev,
            capacity: Number(prev.capacity) + 1,
        }));
    };

    const decrementCapacity = () => {
        setData((prev) => ({
            ...prev,
            capacity: Number(prev.capacity) > 1 ? Number(prev.capacity) - 1 : 1,
        }));
    };

    // Tags list builder actions
    const addTag = () => {
        setTags([...tags, '']);
    };

    const removeTag = (index: number) => {
        if (tags.length > 1) {
            setTags(tags.filter((_, i) => i !== index));
        }
    };

    const updateTag = (index: number, value: string) => {
        const newTags = [...tags];
        newTags[index] = value;
        setTags(newTags);
    };

    // 6. Contacts List Actions
    const addContact = () => {
        setContacts([...contacts, { name: '', info: '' }]);
    };

    const removeContact = (index: number) => {
        if (contacts.length > 1) {
            setContacts(contacts.filter((_, i) => i !== index));
        }
    };

    const updateContact = (
        index: number,
        field: 'name' | 'info',
        value: string,
    ) => {
        const newContacts = [...contacts];
        newContacts[index][field] = value;
        setContacts(newContacts);
    };

    // 7. Submit Event Handler
    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare description by serializing the mockup-only fields at the end
        const contactLines = contacts
            .filter((c) => c.name || c.info)
            .map((c) => `- ${c.name}: ${c.info}`)
            .join('\n');

        const finalDescription = [
            data.description,
            '---',
            organizer ? `**Penyelenggara:** ${organizer}` : '',
            tags.filter(t => t.trim() !== '').length > 0
                ? `**Tags:** ${tags.filter(t => t.trim() !== '').map(t => `#${t.trim()}`).join(', ')}`
                : '',
            contactLines ? `**Kontak:**\n${contactLines}` : '',
        ]
            .filter(Boolean)
            .join('\n\n');

        // Submit using multipart POST (required for file uploads with method spoofing)
        const submissionData = {
            ...data,
            description: finalDescription,
            address:
                data.type === 'offline'
                    ? data.address || data.location_name
                    : '',
            platform_name:
                data.type === 'online'
                    ? data.link.includes('zoom')
                        ? 'Zoom'
                        : 'Google Meet'
                    : '',
        };

        const formData = new FormData();
        Object.entries(submissionData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (key === 'poster') {
                    if (value instanceof File) {
                        formData.append(key, value);
                    }
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        // Send POST to Laravel with _method = PUT spoofing
        router.post(`/dashboard/events/${event.id}`, formData);
    };

    return (
        <div className="flex min-h-screen flex-col justify-between bg-white animate-in fade-in duration-200">
            <div className="flex-grow">
                <NavBar />
                <Head title={`Edit Event - ${event.title}`} />

                <form
                    onSubmit={(e) => submit(e)}
                    className="mx-auto flex max-w-[1080px] flex-col gap-10 px-4 py-10 pb-16 pt-28 md:px-8"
                >
                    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
                        {/* LEFT COLUMN: Poster, Tags, Capacity, Dates, Access */}
                        <div className="flex w-full flex-col gap-6 lg:col-span-5">
                            {/* Poster Event */}
                            <div className="flex flex-col gap-3">
                                <h3 className="font-brand text-2xl font-black text-neutral-900">
                                    Poster Event
                                </h3>

                                <div
                                    onClick={triggerFileInput}
                                    className="relative flex aspect-16/9 w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border-2 border-dashed border-neutral-300 bg-white p-6 text-center transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/10 shadow-xs"
                                >
                                    {posterPreview ? (
                                        <img
                                            src={posterPreview}
                                            alt="Preview"
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="flex items-center gap-1.5 text-secondary-500">
                                                <Camera size={24} className="stroke-[1.5]" />
                                                <Plus size={16} className="stroke-[2.5]" />
                                            </div>
                                            <span className="font-brand text-base font-bold text-gray-500">
                                                Unggah Poster (16:9)
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-center font-semibold text-gray-400">
                                    ukuran maksimal 5mb, png, jpg, svg
                                </span>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handlePosterChange}
                                    accept="image/*"
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-primary-500 py-3.5 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 active:scale-[0.98]"
                                >
                                    <span>Ubah Poster</span>
                                    <Upload size={16} />
                                </button>
                                {errors.poster && (
                                    <span className="text-xs font-bold text-red-500 mt-1 pl-1">
                                        {errors.poster}
                                    </span>
                                )}
                            </div>

                            {/* Tags Pencarian */}
                            <div className="flex flex-col gap-4 rounded-3xl bg-primary-100/30 p-6">
                                <div className="flex items-center justify-between">
                                    <span className="font-brand text-base font-extrabold text-neutral-800">
                                        Tags Pencarian
                                    </span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {tags.map((tag, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <div className="flex-grow flex items-center rounded-full border border-neutral-100 bg-white px-5 py-3 shadow-xs">
                                                <span className="text-secondary-500 font-extrabold mr-1.5 select-none">#</span>
                                                <input
                                                    type="text"
                                                    placeholder={initialTags[index] || "tag"}
                                                    value={tag}
                                                    onChange={(e) => updateTag(index, e.target.value)}
                                                    className="w-full border-0 p-0 outline-none text-base font-semibold placeholder-gray-400 focus:ring-0 text-neutral-800 bg-transparent"
                                                />
                                            </div>
                                            {tags.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(index)}
                                                    className="shrink-0 rounded-full border border-neutral-200 bg-white p-2.5 text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer active:scale-95"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-primary-500 py-3 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 active:scale-[0.98]"
                                >
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-500 text-white">
                                        <Plus size={12} strokeWidth={3} />
                                    </span>
                                    <span>Tambah tag</span>
                                </button>
                            </div>

                            {/* Kuota Peserta */}
                            <div className="flex flex-col gap-4 rounded-3xl bg-primary-100/30 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-brand text-base font-extrabold text-neutral-800">
                                            Kuota Peserta
                                        </span>
                                        <span className="text-xs font-semibold text-gray-400">
                                            Batas maksimal pendaftar
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-full border border-neutral-100 bg-white p-1 px-1.5 shadow-xs">
                                        <button
                                            type="button"
                                            onMouseDown={() => startStepper(decrementCapacity)}
                                            onMouseUp={stopStepper}
                                            onMouseLeave={stopStepper}
                                            onTouchStart={() => startStepper(decrementCapacity)}
                                            onTouchEnd={stopStepper}
                                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-secondary-500 text-white transition-colors hover:bg-secondary-600 active:scale-95 select-none"
                                        >
                                            <Minus size={16} strokeWidth={3} />
                                        </button>
                                        <input
                                            type="number"
                                            value={data.capacity}
                                            onChange={(e) =>
                                                setData('capacity', Number(e.target.value))
                                            }
                                            className="w-12 border-0 p-0 text-center text-lg font-bold text-neutral-800 outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <button
                                            type="button"
                                            onMouseDown={() => startStepper(incrementCapacity)}
                                            onMouseUp={stopStepper}
                                            onMouseLeave={stopStepper}
                                            onTouchStart={() => startStepper(incrementCapacity)}
                                            onTouchEnd={stopStepper}
                                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-primary-500 text-white transition-colors hover:bg-primary-600 active:scale-95 select-none"
                                        >
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                                {errors.capacity && (
                                    <span className="text-xs font-bold text-red-500 mt-1 pl-1">
                                        {errors.capacity}
                                    </span>
                                )}
                            </div>

                            {/* Waktu dan Tanggal */}
                            <div className="flex flex-col gap-4 rounded-3xl bg-primary-100/30 p-6">
                                <div className="flex items-center justify-between">
                                    <span className="font-brand text-base font-extrabold text-neutral-800">
                                        Waktu dan Tanggal
                                    </span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wide text-gray-400 pl-1">
                                            Mulai
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={data.start_datetime}
                                            onChange={(e) =>
                                                setData('start_datetime', e.target.value)
                                            }
                                            required
                                            className="w-full rounded-full border-0 bg-white px-5 py-3 font-semibold text-neutral-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        {errors.start_datetime && (
                                            <span className="text-xs font-bold text-red-500 mt-1 pl-1">
                                                {errors.start_datetime}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wide text-gray-400 pl-1">
                                            Selesai
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={data.end_datetime}
                                            onChange={(e) => setData('end_datetime', e.target.value)}
                                            required
                                            className="w-full rounded-full border-0 bg-white px-5 py-3 font-semibold text-neutral-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        {errors.end_datetime && (
                                            <span className="text-xs font-bold text-red-500 mt-1 pl-1">
                                                {errors.end_datetime}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Akses Event */}
                            <div className="flex flex-col gap-4 rounded-3xl bg-primary-100/30 p-6">
                                <div className="flex items-center justify-between">
                                    <span className="font-brand text-base font-extrabold text-neutral-800">
                                        Akses Event
                                    </span>

                                    <div className="relative flex rounded-full border border-neutral-100 bg-white p-0.5 shadow-xs w-48 h-9 overflow-hidden shrink-0 select-none">
                                        {/* Sliding background */}
                                        <div
                                            className={`absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-primary-500 transition-all duration-300 ease-in-out ${
                                                isFree ? 'translate-x-0' : 'translate-x-full'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsFree(true);
                                                setData('price', 0);
                                            }}
                                            className={`relative z-10 w-1/2 rounded-full border-0 py-1 text-xs font-bold transition-colors duration-300 ${isFree ? 'text-white cursor-default' : 'cursor-pointer text-neutral-500 hover:text-neutral-800 bg-transparent'}`}
                                        >
                                            Gratis
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsFree(false);

                                                if (data.price < 10000) {
                                                    setData('price', 10000);
                                                }
                                            }}
                                            className={`relative z-10 w-1/2 rounded-full border-0 py-1 text-xs font-bold transition-colors duration-300 ${!isFree ? 'text-white cursor-default' : 'cursor-pointer text-neutral-500 hover:text-neutral-800 bg-transparent'}`}
                                        >
                                            Berbayar
                                        </button>
                                    </div>
                                </div>

                                {!isFree && (
                                    <div className="animate-in fade-in mt-2 flex flex-col gap-1.5 duration-200">
                                        <label className="text-xs font-bold uppercase tracking-wide text-gray-400 pl-1">
                                            Harga Tiket (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.price}
                                            onChange={(e) => setData('price', Number(e.target.value))}
                                            required
                                            min={10000}
                                            placeholder={String(event.price || 10000)}
                                            className="w-full rounded-full border-0 bg-white px-5 py-3 font-semibold text-neutral-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        {errors.price && (
                                            <span className="text-xs font-bold text-red-500 mt-1 pl-1">
                                                {errors.price}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Form inputs, Contacts, Detail Event, Submit */}
                        <div className="flex w-full flex-col gap-6 lg:col-span-7">
                            {/* Nama Event */}
                            <div className="flex flex-col gap-2">
                                <h3 className="font-brand text-2xl font-black text-neutral-900">
                                    Nama Event
                                </h3>
                                <input
                                    type="text"
                                    placeholder={event.title || "Nama Event"}
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                    className="w-full rounded-full border-0 bg-primary-100/30 px-6 py-4 font-brand text-base font-semibold placeholder-neutral-450 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-800"
                                />
                                {errors.title && (
                                    <span className="text-xs font-bold text-red-500 mt-1 pl-1">
                                        {errors.title}
                                    </span>
                                )}
                            </div>

                            {/* Kategori */}
                            <div className="flex flex-col gap-2">
                                <h3 className="font-brand text-2xl font-black text-neutral-900">
                                    Kategori
                                </h3>
                                <div className="relative" ref={categoryDropdownRef}>
                                    <div
                                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                        className="w-full rounded-full border-0 bg-primary-100/30 px-6 py-4 font-brand text-base font-semibold text-neutral-600 transition-all duration-200 hover:bg-primary-100/50 cursor-pointer flex justify-between items-center"
                                    >
                                        <span className={data.category_id ? 'text-neutral-800' : 'text-neutral-500'}>
                                            {categories.find(c => String(c.id) === String(data.category_id))?.name || 'Kategori'}
                                        </span>
                                        <span className="font-bold text-secondary-500 text-sm transition-transform duration-200" style={{ transform: isCategoryDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                            ▼
                                        </span>
                                    </div>
                                    {isCategoryDropdownOpen && (
                                        <div className="absolute z-50 w-full mt-2 rounded-2xl border border-neutral-100 bg-white py-1.5 shadow-lg max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                                            {categories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setData('category_id', String(cat.id));
                                                        setIsCategoryDropdownOpen(false);
                                                    }}
                                                    className={`px-6 py-3 cursor-pointer text-base font-semibold transition-colors duration-150 ${
                                                        String(data.category_id) === String(cat.id)
                                                            ? 'bg-primary-50 text-primary-600'
                                                            : 'text-neutral-700 hover:bg-neutral-50'
                                                    }`}
                                                >
                                                    {cat.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <input type="hidden" name="category_id" value={data.category_id} required />
                                </div>
                                {errors.category_id && (
                                    <span className="text-xs font-bold text-red-500 mt-1 pl-1">
                                        {errors.category_id}
                                    </span>
                                )}
                            </div>

                            {/* Penyelenggara */}
                            <div className="flex flex-col gap-2">
                                <h3 className="font-brand text-2xl font-black text-neutral-900">
                                    Penyelenggara
                                </h3>
                                <input
                                    type="text"
                                    placeholder={parsedMeta.org || "Nama penyelenggara/EO"}
                                    value={organizer}
                                    onChange={(e) => setOrganizer(e.target.value)}
                                    className="w-full rounded-full border-0 bg-primary-100/30 px-6 py-4 font-brand text-base font-semibold placeholder-neutral-450 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-800"
                                />
                            </div>

                            {/* Kontak */}
                            <div className="flex flex-col gap-3">
                                <h3 className="font-brand text-2xl font-black text-neutral-900">
                                    Kontak
                                </h3>
                                <div className="flex flex-col gap-4 rounded-3xl bg-primary-100/30 p-6">
                                    <div className="flex flex-col gap-3">
                                        {contacts.map((contact, index) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <div className="flex-grow flex rounded-full border border-neutral-100 bg-white shadow-xs overflow-hidden">
                                                    <input
                                                        type="text"
                                                        placeholder="Nama"
                                                        value={contact.name}
                                                        onChange={(e) =>
                                                            updateContact(index, 'name', e.target.value)
                                                        }
                                                        className="w-3/5 px-5 py-3 bg-transparent border-0 outline-none text-base font-semibold placeholder-gray-400 focus:ring-0 text-neutral-800"
                                                    />
                                                    <div className="w-px bg-neutral-200 my-2 shrink-0"></div>
                                                    <input
                                                        type="text"
                                                        placeholder="No. Telepon / E-mail"
                                                        value={contact.info}
                                                        onChange={(e) =>
                                                            updateContact(index, 'info', e.target.value)
                                                        }
                                                        className="w-2/5 px-5 py-3 bg-transparent border-0 outline-none text-base font-semibold placeholder-gray-400 focus:ring-0 pl-4 text-neutral-800"
                                                    />
                                                </div>
                                                {contacts.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeContact(index)}
                                                        className="shrink-0 rounded-full border border-neutral-200 bg-white p-2.5 text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer active:scale-95"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addContact}
                                        className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-primary-500 py-3.5 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 active:scale-[0.98]"
                                    >
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-500 text-white">
                                            <Plus size={12} strokeWidth={3} />
                                        </span>
                                        <span>Tambah kontak/email</span>
                                    </button>
                                </div>
                            </div>

                            {/* Detail Event */}
                            <div className="flex flex-col gap-3">
                                <h3 className="font-brand text-2xl font-black text-neutral-900">
                                    Detail Event
                                </h3>

                                <div className="flex flex-col gap-6 rounded-3xl bg-primary-100/30 p-6">
                                    {/* Lokasi */}
                                    <div className="flex flex-col gap-2">
                                        <label className="font-brand text-base font-extrabold text-neutral-800">
                                            Lokasi
                                        </label>

                                        <div className="flex flex-col items-center gap-4 sm:flex-row w-full">
                                            <div className="relative flex rounded-full border border-neutral-100 bg-white p-0.5 shadow-xs shrink-0 w-48 h-9 overflow-hidden select-none">
                                                {/* Sliding background */}
                                                <div
                                                    className={`absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-primary-500 transition-all duration-300 ease-in-out ${
                                                        data.type === 'online' ? 'translate-x-0' : 'translate-x-full'
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setData('type', 'online')}
                                                    className={`relative z-10 w-1/2 rounded-full border-0 py-1.5 text-xs font-bold transition-colors duration-300 ${data.type === 'online' ? 'text-white cursor-default' : 'cursor-pointer text-neutral-500 hover:text-neutral-800 bg-transparent'}`}
                                                >
                                                    Online
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('type', 'offline')}
                                                    className={`relative z-10 w-1/2 rounded-full border-0 py-1.5 text-xs font-bold transition-colors duration-300 ${data.type === 'offline' ? 'text-white cursor-default' : 'cursor-pointer text-neutral-500 hover:text-neutral-800 bg-transparent'}`}
                                                >
                                                    Offline
                                                </button>
                                            </div>

                                            {data.type === 'online' ? (
                                                <input
                                                    type="text"
                                                    placeholder={event.link || "Link Zoom/Gmeet/apapun"}
                                                    value={data.link}
                                                    onChange={(e) => setData('link', e.target.value)}
                                                    required
                                                    className="w-full flex-grow rounded-full border-0 bg-white px-5 py-2.5 text-base font-medium shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-800"
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
                                                            placeholder={event.location_name || "Cari Alamat atau Nama Tempat..."}
                                                            value={data.location_name}
                                                            onChange={(e) =>
                                                                setData('location_name', e.target.value)
                                                            }
                                                            required
                                                            className="w-full rounded-full border-0 bg-white px-5 py-2.5 text-base font-medium shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-800"
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
                                        {errors.location_name && (
                                            <span className="text-xs font-bold text-red-500 mt-1 pl-1">
                                                {errors.location_name}
                                            </span>
                                        )}
                                        {errors.link && (
                                            <span className="text-xs font-bold text-red-500 mt-1 pl-1">
                                                {errors.link}
                                            </span>
                                        )}
                                    </div>

                                    {/* Google Map Box for Offline */}
                                    {data.type === 'offline' && (
                                        <div className="flex w-full flex-col gap-2 border-t border-neutral-200/40 pt-4">
                                            <div className="relative h-[220px] w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm">
                                                {isLoaded ? (
                                                    <GoogleMap
                                                        mapContainerStyle={{
                                                            width: '100%',
                                                            height: '220px',
                                                        }}
                                                        center={{
                                                            lat: data.latitude,
                                                            lng: data.longitude,
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
                                                                lat: data.latitude,
                                                                lng: data.longitude,
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
                                            {data.address && (
                                                <div className="text-xs mt-1 px-1 font-semibold text-neutral-500">
                                                    <span className="font-extrabold text-neutral-800">
                                                        Alamat Lengkap:
                                                    </span>{' '}
                                                    {data.address}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Deskripsi */}
                                    <div className="flex flex-col gap-2">
                                        <label className="font-brand text-base font-extrabold text-neutral-800">
                                            Deskripsi
                                        </label>
                                        <textarea
                                            placeholder={parsedMeta.mainDesc || "Tulis deskripsi event secara detail di sini..."}
                                            value={data.description}
                                            onChange={(e) =>
                                                setData('description', e.target.value)
                                            }
                                            required
                                            rows={6}
                                            className="w-full rounded-3xl border-0 bg-white px-5 py-4 font-brand text-base font-medium leading-relaxed placeholder-neutral-450 shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-800"
                                        />
                                        {errors.description && (
                                            <span className="text-xs font-bold text-red-500 mt-1 pl-1">
                                                {errors.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Actions Buttons */}
                            <div className="mt-6 flex w-full flex-col gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-primary-500 py-4 text-lg font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75"
                                >
                                    <Upload size={20} className="text-white" />
                                    <span>Simpan Perubahan</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}
