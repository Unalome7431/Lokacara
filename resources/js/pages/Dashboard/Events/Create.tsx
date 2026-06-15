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
    Inbox,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';

const GOOGLE_MAPS_LIBRARIES: any = ['places'];

interface Category {
    id: number;
    name: string;
}

interface CreateProps {
    categories: Category[];
}

export default function Create({ categories }: CreateProps) {
    // 1. Inertia Form State
    const { data, setData, processing, errors } = useForm({
        title: '',
        category_id: '',
        description: '',
        type: 'offline' as 'online' | 'offline',
        location_name: '',
        address: '',
        latitude: -7.79558, // default Yogyakarta
        longitude: 110.36949, // default Yogyakarta
        platform_name: '',
        link: '',
        start_datetime: '',
        end_datetime: '',
        capacity: 50,
        poster: null as File | null,
        price: 0,
    });

    const [isFree, setIsFree] = useState(true);

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

    // 2. Mockup-only fields (local state)
    const [organizer, setOrganizer] = useState('');
    const [tags, setTags] = useState<string[]>(['']);
    const [contacts, setContacts] = useState([{ name: '', info: '' }]);

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

    // 3. Poster Upload & Preview State
    const [posterPreview, setPosterPreview] = useState<string | null>(null);
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

    // 4. Capacity Stepper Actions
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

    // 5. Contacts List Actions
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

    // 6. Submit Event Handler
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
            tags.filter((t) => t.trim() !== '').length > 0
                ? `**Tags:** ${tags
                      .filter((t) => t.trim() !== '')
                      .map((t) => `#${t.trim()}`)
                      .join(', ')}`
                : '',
            contactLines ? `**Kontak:**\n${contactLines}` : '',
        ]
            .filter(Boolean)
            .join('\n\n');

        // Submit using multipart POST (required for file uploads)
        // If it's offline, make sure address matches location_name
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

        // Use router post to send the form
        const formData = new FormData();
        Object.entries(submissionData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (key === 'poster') {
                    formData.append(key, value as File);
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        // Inertia post action
        router.post('/create', formData);
    };

    return (
        <div className="animate-in fade-in flex min-h-screen flex-col justify-between bg-white duration-200">
            <div className="flex-grow">
                <NavBar />
                <Head title="Buat Event Baru" />

                <form
                    onSubmit={(e) => submit(e)}
                    className="mx-auto flex max-w-[1080px] flex-col gap-10 px-4 py-10 pt-28 pb-16 md:px-8"
                >
                    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
                        {/* LEFT COLUMN: Poster, Tags, Capacity, Dates, Access */}
                        <div className="flex w-full flex-col gap-6 lg:col-span-5">
                            {/* Poster Event */}
                            <div className="flex flex-col gap-3">
                                <h3 className="font-brand text-h5-mobile font-black text-neutral-900 lg:text-h5-web">
                                    Poster Event
                                </h3>

                                <div
                                    onClick={triggerFileInput}
                                    className="hover:bg-primary-50/10 relative flex aspect-16/9 w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border-2 border-dashed border-neutral-300 bg-white p-6 text-center shadow-xs transition-all duration-300 hover:border-primary-400"
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
                                                <Camera
                                                    size={24}
                                                    className="stroke-[1.5]"
                                                />
                                                <Plus
                                                    size={16}
                                                    className="stroke-[2.5]"
                                                />
                                            </div>
                                            <span className="font-brand text-base font-bold text-gray-500">
                                                Unggah Poster (16:9)
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-center text-xs font-semibold text-gray-400">
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
                                    <span className="mt-1 pl-1 text-xs font-bold text-red-500">
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
                                        <div
                                            key={index}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="flex flex-grow items-center rounded-full border border-neutral-100 bg-white px-5 py-3 shadow-xs">
                                                <span className="mr-1.5 font-extrabold text-secondary-500 select-none">
                                                    #
                                                </span>
                                                <input
                                                    type="text"
                                                    placeholder="tag"
                                                    value={tag}
                                                    onChange={(e) =>
                                                        updateTag(
                                                            index,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full border-0 bg-transparent p-0 text-base font-semibold text-neutral-800 placeholder-gray-400 outline-none focus:ring-0"
                                                />
                                            </div>
                                            {tags.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeTag(index)
                                                    }
                                                    className="shrink-0 cursor-pointer rounded-full border border-neutral-200 bg-white p-2.5 text-red-500 transition-all duration-200 hover:bg-red-50 active:scale-95"
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
                                            onMouseDown={() =>
                                                startStepper(decrementCapacity)
                                            }
                                            onMouseUp={stopStepper}
                                            onMouseLeave={stopStepper}
                                            onTouchStart={() =>
                                                startStepper(decrementCapacity)
                                            }
                                            onTouchEnd={stopStepper}
                                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-secondary-500 text-white transition-colors select-none hover:bg-secondary-600 active:scale-95"
                                        >
                                            <Minus size={16} strokeWidth={3} />
                                        </button>
                                        <input
                                            type="number"
                                            value={data.capacity}
                                            onChange={(e) =>
                                                setData(
                                                    'capacity',
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-12 [appearance:textfield] border-0 p-0 text-center text-lg font-bold text-neutral-800 outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        />
                                        <button
                                            type="button"
                                            onMouseDown={() =>
                                                startStepper(incrementCapacity)
                                            }
                                            onMouseUp={stopStepper}
                                            onMouseLeave={stopStepper}
                                            onTouchStart={() =>
                                                startStepper(incrementCapacity)
                                            }
                                            onTouchEnd={stopStepper}
                                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-primary-500 text-white transition-colors select-none hover:bg-primary-600 active:scale-95"
                                        >
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                                {errors.capacity && (
                                    <span className="mt-1 pl-1 text-xs font-bold text-red-500">
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
                                        <label className="pl-1 text-xs font-bold tracking-wide text-gray-400 uppercase">
                                            Mulai
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={data.start_datetime}
                                            onChange={(e) =>
                                                setData(
                                                    'start_datetime',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            className="w-full rounded-full border-0 bg-white px-5 py-3 font-semibold text-neutral-800 shadow-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        />
                                        {errors.start_datetime && (
                                            <span className="mt-1 pl-1 text-xs font-bold text-red-500">
                                                {errors.start_datetime}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="pl-1 text-xs font-bold tracking-wide text-gray-400 uppercase">
                                            Selesai
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={data.end_datetime}
                                            onChange={(e) =>
                                                setData(
                                                    'end_datetime',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            className="w-full rounded-full border-0 bg-white px-5 py-3 font-semibold text-neutral-800 shadow-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        />
                                        {errors.end_datetime && (
                                            <span className="mt-1 pl-1 text-xs font-bold text-red-500">
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

                                    <div className="relative flex h-9 w-48 shrink-0 overflow-hidden rounded-full border border-neutral-100 bg-white p-0.5 shadow-xs select-none">
                                        {/* Sliding background */}
                                        <div
                                            className={`absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-primary-500 transition-all duration-300 ease-in-out ${
                                                isFree
                                                    ? 'translate-x-0'
                                                    : 'translate-x-full'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsFree(true);
                                                setData('price', 0);
                                            }}
                                            className={`relative z-10 w-1/2 rounded-full border-0 py-1 text-xs font-bold transition-colors duration-300 ${isFree ? 'cursor-default text-white' : 'cursor-pointer bg-transparent text-neutral-500 hover:text-neutral-800'}`}
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
                                            className={`relative z-10 w-1/2 rounded-full border-0 py-1 text-xs font-bold transition-colors duration-300 ${!isFree ? 'cursor-default text-white' : 'cursor-pointer bg-transparent text-neutral-500 hover:text-neutral-800'}`}
                                        >
                                            Berbayar
                                        </button>
                                    </div>
                                </div>

                                {!isFree && (
                                    <div className="animate-in fade-in mt-2 flex flex-col gap-1.5 duration-200">
                                        <label className="pl-1 text-xs font-bold tracking-wide text-gray-400 uppercase">
                                            Harga Tiket (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.price}
                                            onChange={(e) =>
                                                setData(
                                                    'price',
                                                    Number(e.target.value),
                                                )
                                            }
                                            required
                                            min={10000}
                                            placeholder="Contoh: 10000"
                                            className="w-full rounded-full border-0 bg-white px-5 py-3 font-semibold text-neutral-800 shadow-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        />
                                        {errors.price && (
                                            <span className="mt-1 pl-1 text-xs font-bold text-red-500">
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
                                <h3 className="font-brand text-h5-mobile font-black text-neutral-900 lg:text-h5-web">
                                    Nama Event
                                </h3>
                                <input
                                    type="text"
                                    placeholder="Nama Event"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    required
                                    className="placeholder-neutral-450 w-full rounded-full border-0 bg-primary-100/30 px-6 py-4 font-brand text-base font-semibold text-neutral-800 transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                                {errors.title && (
                                    <span className="mt-1 pl-1 text-xs font-bold text-red-500">
                                        {errors.title}
                                    </span>
                                )}
                            </div>

                            {/* Kategori */}
                            <div className="flex flex-col gap-2">
                                <h3 className="font-brand text-h5-mobile font-black text-neutral-900 lg:text-h5-web">
                                    Kategori
                                </h3>
                                <div
                                    className="relative"
                                    ref={categoryDropdownRef}
                                >
                                    <div
                                        onClick={() =>
                                            setIsCategoryDropdownOpen(
                                                !isCategoryDropdownOpen,
                                            )
                                        }
                                        className="flex w-full cursor-pointer items-center justify-between rounded-full border-0 bg-primary-100/30 px-6 py-4 font-brand text-base font-semibold text-neutral-600 transition-all duration-200 hover:bg-primary-100/50"
                                    >
                                        <span
                                            className={
                                                data.category_id
                                                    ? 'text-neutral-800'
                                                    : 'text-neutral-500'
                                            }
                                        >
                                            {categories.find(
                                                (c) =>
                                                    String(c.id) ===
                                                    String(data.category_id),
                                            )?.name || 'Kategori'}
                                        </span>
                                        <span
                                            className="text-sm font-bold text-secondary-500 transition-transform duration-200"
                                            style={{
                                                transform:
                                                    isCategoryDropdownOpen
                                                        ? 'rotate(180deg)'
                                                        : 'rotate(0deg)',
                                            }}
                                        >
                                            ▼
                                        </span>
                                    </div>
                                    {isCategoryDropdownOpen && (
                                        <div className="animate-in fade-in slide-in-from-top-2 absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-neutral-100 bg-white py-1.5 shadow-lg duration-150">
                                            {categories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setData(
                                                            'category_id',
                                                            String(cat.id),
                                                        );
                                                        setIsCategoryDropdownOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className={`cursor-pointer px-6 py-3 text-base font-semibold transition-colors duration-150 ${
                                                        String(
                                                            data.category_id,
                                                        ) === String(cat.id)
                                                            ? 'bg-primary-50 text-primary-600'
                                                            : 'text-neutral-700 hover:bg-neutral-50'
                                                    }`}
                                                >
                                                    {cat.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <input
                                        type="hidden"
                                        name="category_id"
                                        value={data.category_id}
                                        required
                                    />
                                </div>
                                {errors.category_id && (
                                    <span className="mt-1 pl-1 text-xs font-bold text-red-500">
                                        {errors.category_id}
                                    </span>
                                )}
                            </div>

                            {/* Penyelenggara */}
                            <div className="flex flex-col gap-2">
                                <h3 className="font-brand text-h5-mobile font-black text-neutral-900 lg:text-h5-web">
                                    Penyelenggara
                                </h3>
                                <input
                                    type="text"
                                    placeholder="Nama penyelenggara/EO"
                                    value={organizer}
                                    onChange={(e) =>
                                        setOrganizer(e.target.value)
                                    }
                                    className="placeholder-neutral-450 w-full rounded-full border-0 bg-primary-100/30 px-6 py-4 font-brand text-base font-semibold text-neutral-800 transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            {/* Kontak */}
                            <div className="flex flex-col gap-3">
                                <h3 className="font-brand text-h5-mobile font-black text-neutral-900 lg:text-h5-web">
                                    Kontak
                                </h3>
                                <div className="flex flex-col gap-4 rounded-3xl bg-primary-100/30 p-6">
                                    <div className="flex flex-col gap-3">
                                        {contacts.map((contact, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2"
                                            >
                                                <div className="flex flex-grow overflow-hidden rounded-full border border-neutral-100 bg-white shadow-xs">
                                                    <input
                                                        type="text"
                                                        placeholder="Nama"
                                                        value={contact.name}
                                                        onChange={(e) =>
                                                            updateContact(
                                                                index,
                                                                'name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-3/5 border-0 bg-transparent px-5 py-3 text-base font-semibold text-neutral-800 placeholder-gray-400 outline-none focus:ring-0"
                                                    />
                                                    <div className="my-2 w-px shrink-0 bg-neutral-200"></div>
                                                    <input
                                                        type="text"
                                                        placeholder="No. Telepon / E-mail"
                                                        value={contact.info}
                                                        onChange={(e) =>
                                                            updateContact(
                                                                index,
                                                                'info',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-2/5 border-0 bg-transparent px-5 py-3 pl-4 text-base font-semibold text-neutral-800 placeholder-gray-400 outline-none focus:ring-0"
                                                    />
                                                </div>
                                                {contacts.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeContact(index)
                                                        }
                                                        className="shrink-0 cursor-pointer rounded-full border border-neutral-200 bg-white p-2.5 text-red-500 transition-all duration-200 hover:bg-red-50 active:scale-95"
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
                                <h3 className="font-brand text-h5-mobile font-black text-neutral-900 lg:text-h5-web">
                                    Detail Event
                                </h3>

                                <div className="flex flex-col gap-6 rounded-3xl bg-primary-100/30 p-6">
                                    {/* Lokasi */}
                                    <div className="flex flex-col gap-2">
                                        <label className="font-brand text-base font-extrabold text-neutral-800">
                                            Lokasi
                                        </label>

                                        <div className="flex w-full flex-col items-center gap-4 sm:flex-row">
                                            <div className="relative flex h-9 w-48 shrink-0 overflow-hidden rounded-full border border-neutral-100 bg-white p-0.5 shadow-xs select-none">
                                                {/* Sliding background */}
                                                <div
                                                    className={`absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-primary-500 transition-all duration-300 ease-in-out ${
                                                        data.type === 'online'
                                                            ? 'translate-x-0'
                                                            : 'translate-x-full'
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setData(
                                                            'type',
                                                            'online',
                                                        )
                                                    }
                                                    className={`relative z-10 w-1/2 rounded-full border-0 py-1.5 text-xs font-bold transition-colors duration-300 ${data.type === 'online' ? 'cursor-default text-white' : 'cursor-pointer bg-transparent text-neutral-500 hover:text-neutral-800'}`}
                                                >
                                                    Online
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setData(
                                                            'type',
                                                            'offline',
                                                        )
                                                    }
                                                    className={`relative z-10 w-1/2 rounded-full border-0 py-1.5 text-xs font-bold transition-colors duration-300 ${data.type === 'offline' ? 'cursor-default text-white' : 'cursor-pointer bg-transparent text-neutral-500 hover:text-neutral-800'}`}
                                                >
                                                    Offline
                                                </button>
                                            </div>

                                            {data.type === 'online' ? (
                                                <input
                                                    type="text"
                                                    placeholder="Link Zoom/Gmeet/apapun"
                                                    value={data.link}
                                                    onChange={(e) =>
                                                        setData(
                                                            'link',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    className="w-full flex-grow rounded-full border-0 bg-white px-5 py-2.5 text-base font-medium text-neutral-800 shadow-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                                />
                                            ) : isLoaded ? (
                                                <div className="w-full flex-grow">
                                                    <Autocomplete
                                                        onLoad={(
                                                            autocomplete,
                                                        ) => {
                                                            autocompleteRef.current =
                                                                autocomplete;
                                                        }}
                                                        onPlaceChanged={
                                                            handlePlaceChanged
                                                        }
                                                    >
                                                        <input
                                                            type="text"
                                                            placeholder="Cari Alamat atau Nama Tempat..."
                                                            value={
                                                                data.location_name
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'location_name',
                                                                    e.target
                                                                        .value,
                                                                )
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
                                        {errors.location_name && (
                                            <span className="mt-1 pl-1 text-xs font-bold text-red-500">
                                                {errors.location_name}
                                            </span>
                                        )}
                                        {errors.link && (
                                            <span className="mt-1 pl-1 text-xs font-bold text-red-500">
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
                                                            mapRef.current =
                                                                map;
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
                                                            onDragEnd={
                                                                handleMarkerDragEnd
                                                            }
                                                        />
                                                    </GoogleMap>
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-gray-400">
                                                        <MapPin
                                                            size={24}
                                                            className="animate-bounce text-primary-500"
                                                        />
                                                        <span className="font-brand text-sm font-bold text-gray-500">
                                                            Memuat Google
                                                            Maps...
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {data.address && (
                                                <div className="mt-1 px-1 text-xs font-semibold text-neutral-500">
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
                                            placeholder="Tulis deskripsi event secara detail di sini..."
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            rows={6}
                                            className="placeholder-neutral-450 w-full rounded-3xl border-0 bg-white px-5 py-4 font-brand text-base leading-relaxed font-medium text-neutral-800 shadow-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        />
                                        {errors.description && (
                                            <span className="mt-1 pl-1 text-xs font-bold text-red-500">
                                                {errors.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Actions Buttons */}
                            <div className="mt-6 flex w-full flex-col gap-4">
                                <button
                                    type="button"
                                    onClick={(e) => submit(e)}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-secondary-500 py-4 text-lg font-bold text-neutral-900 shadow-md transition-all duration-200 hover:bg-secondary-600 active:scale-[0.99]"
                                >
                                    <Inbox
                                        size={20}
                                        className="text-neutral-900"
                                    />
                                    <span>Simpan Draf</span>
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-primary-500 py-4 text-lg font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75"
                                >
                                    <Upload size={20} className="text-white" />
                                    <span>Terbitkan Event</span>
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
