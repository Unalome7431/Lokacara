import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';
import { parseDescription } from '@/lib/utils';
import EditFormLeft from './sections/Form/EditFormLeft';
import EditFormRight from './sections/Form/EditFormRight';

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
    const parsedMeta = parseDescription(event.description);

    // Helper to format ISO date to date value (YYYY-MM-DD)
    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const tzOffset = date.getTimezoneOffset() * 60000;
            const localTime = new Date(date.getTime() - tzOffset);
            return localTime.toISOString().slice(0, 10);
        } catch {
            return '';
        }
    };

    // Helper to format ISO time to time value (HH:mm)
    const formatTimeForInput = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const tzOffset = date.getTimezoneOffset() * 60000;
            const localTime = new Date(date.getTime() - tzOffset);
            return localTime.toISOString().slice(11, 16);
        } catch {
            return '';
        }
    };

    // 2. Inertia Form State (Using method spoofing for file uploads)
    const { data, setData, processing } = useForm({
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
        start_date: formatDateForInput(event.start_datetime),
        start_time: formatTimeForInput(event.start_datetime),
        end_time: formatTimeForInput(event.end_datetime),
        capacity: event.capacity === null || event.capacity === undefined ? '' : event.capacity,
        poster: null as File | null,
        price: event.price || 0,
    });

    const { props } = usePage();
    const { flash } = props as any;
    const pageErrors = props.errors as any;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isFree, setIsFree] = useState(event.price === 0);

    const [contacts, setContacts] = useState(parsedMeta.cts);

    // Submit Event Handler
    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare description by serializing the mockup-only fields at the end
        const contactLines = contacts
            .filter((c) => c.name || c.info)
            .map((c) => `- ${c.name}: ${c.info}`)
            .join('\n');

        const finalDescription = contactLines
            ? `${data.description}\n\n---\n\n**Kontak:**\n${contactLines}`
            : data.description;

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

        setIsSubmitting(true);
        // Send POST to Laravel
        router.post(`/dashboard/events/${event.id}`, formData, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <div className="animate-in fade-in flex min-h-screen flex-col justify-between bg-white duration-200">
            <div className="grow">
                <NavBar />
                <Head title={`Edit Event - ${event.title}`} />

                <form
                    onSubmit={submit}
                    className="mx-auto flex max-w-[1080px] flex-col gap-10 px-4 py-10 pt-28 pb-16 md:px-8"
                >
                    {/* Flash messages */}
                    {flash?.error && (
                        <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">
                            {flash.error}
                        </div>
                    )}
                    {flash?.warning && (
                        <div className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-600">
                            {flash.warning}
                        </div>
                    )}
                    {flash?.success && (
                        <div className="rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-600">
                            {flash.success}
                        </div>
                    )}

                    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
                        {/* LEFT COLUMN: Poster, Tags, Capacity, Dates, Access */}
                        <EditFormLeft
                            data={data}
                            setData={setData}
                            errors={pageErrors}
                            isFree={isFree}
                            setIsFree={setIsFree}
                            initialPosterUrl={event.poster_url}
                        />

                        {/* RIGHT COLUMN: Form inputs, Contacts, Detail Event, Submit */}
                        <EditFormRight
                            data={data}
                            setData={setData}
                            errors={pageErrors}
                            categories={categories}
                            contacts={contacts}
                            setContacts={setContacts}
                            processing={isSubmitting || processing}
                        />
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}
