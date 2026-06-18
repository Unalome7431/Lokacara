import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';
import CreateFormLeft from './sections/Form/CreateFormLeft';
import CreateFormRight from './sections/Form/CreateFormRight';

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

    const [contacts, setContacts] = useState([{ name: '', info: '' }]);

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

        // Submit using multipart POST (required for file uploads)
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
            <div className="grow">
                <NavBar />
                <Head title="Buat Event Baru" />

                <form
                    onSubmit={submit}
                    className="mx-auto flex max-w-[1080px] flex-col gap-10 px-4 py-10 pt-28 pb-16 md:px-8"
                >
                    {Object.keys(errors).length > 0 && (
                        <div className="animate-in fade-in flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 duration-200">
                            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                            <div className="flex flex-col gap-1">
                                <span className="font-bold">Gagal menyimpan event. Silakan periksa kembali kolom berikut:</span>
                                <ul className="list-disc pl-5 text-xs font-semibold">
                                    {Object.entries(errors).map(([key, err]) => (
                                        <li key={key}>{err as string}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
                        {/* LEFT COLUMN: Poster, Tags, Capacity, Dates, Access */}
                        <CreateFormLeft
                            data={data}
                            setData={setData}
                            errors={errors}
                            isFree={isFree}
                            setIsFree={setIsFree}
                        />

                        {/* RIGHT COLUMN: Form inputs, Contacts, Detail Event, Submit */}
                        <CreateFormRight
                            data={data}
                            setData={setData}
                            errors={errors}
                            categories={categories}
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
