import { Head, useForm, router } from '@inertiajs/react';
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

    // Local Mockup Fields
    const [organizer, setOrganizer] = useState(parsedMeta.org);
    const [tags, setTags] = useState<string[]>(initialTags);
    const [contacts, setContacts] = useState(parsedMeta.cts);

    // Submit Event Handler
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
            <div className="grow">
                <NavBar />
                <Head title={`Edit Event - ${event.title}`} />

                <form
                    onSubmit={submit}
                    className="mx-auto flex max-w-[1080px] flex-col gap-10 px-4 py-10 pt-28 pb-16 md:px-8"
                >
                    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
                        {/* LEFT COLUMN: Poster, Tags, Capacity, Dates, Access */}
                        <EditFormLeft
                            data={data}
                            setData={setData}
                            errors={errors}
                            isFree={isFree}
                            setIsFree={setIsFree}
                            tags={tags}
                            setTags={setTags}
                            initialPosterUrl={event.poster_url}
                        />

                        {/* RIGHT COLUMN: Form inputs, Contacts, Detail Event, Submit */}
                        <EditFormRight
                            data={data}
                            setData={setData}
                            errors={errors}
                            categories={categories}
                            organizer={organizer}
                            setOrganizer={setOrganizer}
                            contacts={contacts}
                            setContacts={setContacts}
                            processing={processing}
                            submit={submit}
                        />
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}
