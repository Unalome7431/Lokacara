import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Minus, Upload } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';
import EventFormMap from '@/components/ui/EventFormMap';
import { parseDescription } from '@/lib/utils';
import TagsInputList from '@/components/ui/TagsInputList';
import ContactsInputList from '@/components/ui/ContactsInputList';
import PosterPicker from '@/components/ui/PosterPicker';

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
    // parseDescription helper imported from @/lib/utils

    const parsedMeta = parseDescription(event.description);

    const initialTags = parsedMeta.tg
        ? parsedMeta.tg
              .split(',')
              .map((t) => t.replace('#', '').trim())
              .filter(Boolean)
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
        category_id:
            event.category_id !== undefined ? String(event.category_id) : '',
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

    const onChangeLocation = (updatedFields: Record<string, any>) => {
        setData((prev) => ({
            ...prev,
            ...updatedFields,
        }));
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
        <div className="animate-in fade-in flex min-h-screen flex-col justify-between bg-white duration-200">
            <div className="flex-grow">
                <NavBar />
                <Head title={`Edit Event - ${event.title}`} />

                <form
                    onSubmit={(e) => submit(e)}
                    className="mx-auto flex max-w-[1080px] flex-col gap-10 px-4 py-10 pt-28 pb-16 md:px-8"
                >
                    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
                        {/* LEFT COLUMN: Poster, Tags, Capacity, Dates, Access */}
                        <div className="flex w-full flex-col gap-6 lg:col-span-5">
                            {/* Poster Event */}
                            <PosterPicker
                                initialPreview={event.poster_url}
                                error={errors.poster}
                                onChange={(file) => setData('poster', file)}
                            />

                            {/* Tags Pencarian */}
                            <TagsInputList tags={tags} onChange={setTags} />

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
                                            placeholder={String(
                                                event.price || 10000,
                                            )}
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
                                    placeholder={event.title || 'Nama Event'}
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
                                    placeholder={
                                        parsedMeta.org ||
                                        'Nama penyelenggara/EO'
                                    }
                                    value={organizer}
                                    onChange={(e) =>
                                        setOrganizer(e.target.value)
                                    }
                                    className="placeholder-neutral-450 w-full rounded-full border-0 bg-primary-100/30 px-6 py-4 font-brand text-base font-semibold text-neutral-800 transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            {/* Kontak */}
                            <ContactsInputList contacts={contacts} onChange={setContacts} />

                            {/* Detail Event */}
                            <div className="flex flex-col gap-3">
                                <h3 className="font-brand text-h5-mobile font-black text-neutral-900 lg:text-h5-web">
                                    Detail Event
                                </h3>

                                <div className="flex flex-col gap-6 rounded-3xl bg-primary-100/30 p-6">
                                    {/* Lokasi (extracted to EventFormMap) */}
                                    <EventFormMap
                                        type={data.type}
                                        onChangeType={(type) => setData('type', type)}
                                        locationName={data.location_name}
                                        address={data.address}
                                        latitude={data.latitude}
                                        longitude={data.longitude}
                                        link={data.link}
                                        errorLocationName={errors.location_name}
                                        errorLink={errors.link}
                                        onChangeLocation={onChangeLocation}
                                    />

                                    {/* Deskripsi */}
                                    <div className="flex flex-col gap-2">
                                        <label className="font-brand text-base font-extrabold text-neutral-800">
                                            Deskripsi
                                        </label>
                                        <textarea
                                            placeholder={
                                                parsedMeta.mainDesc ||
                                                'Tulis deskripsi event secara detail di sini...'
                                            }
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
