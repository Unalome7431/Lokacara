import { router } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import ContactsInputList from '@/components/ui/ContactsInputList';
import EventFormMap from '@/components/ui/EventFormMap';

interface Category {
    id: number;
    name: string;
}

interface CreateFormRightProps {
    data: any;
    setData: (name: string | ((prev: any) => any), value?: any) => void;
    errors: any;
    categories: Category[];
    contacts: { name: string; info: string }[];
    setContacts: (contacts: any) => void;
    processing: boolean;
}

export default function CreateFormRight({
    data,
    setData,
    errors,
    categories = [],
    contacts,
    setContacts,
    processing,
}: CreateFormRightProps) {
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

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onChangeLocation = (updatedFields: Record<string, any>) => {
        setData((prev) => ({
            ...prev,
            ...updatedFields,
        }));
    };

    return (
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
                    onChange={(e) => setData('title', e.target.value)}
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
                <div className="relative" ref={categoryDropdownRef}>
                    <div
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-full border-0 bg-primary-100/30 px-6 py-4 font-brand text-base font-semibold text-neutral-600 transition-all duration-200 hover:bg-primary-100/50"
                    >
                        <span className={data.category_id ? 'text-neutral-800' : 'text-neutral-500'}>
                            {categories.find(
                                (c) => String(c.id) === String(data.category_id),
                            )?.name || 'Kategori'}
                        </span>
                        <span
                            className="text-sm font-bold text-secondary-500 transition-transform duration-200"
                            style={{
                                transform: isCategoryDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                        >
                            ▼
                        </span>
                    </div>
                    {isCategoryDropdownOpen && (
                        <div
                            data-lenis-prevent
                            className="animate-in fade-in slide-in-from-top-2 absolute z-50 mt-2 max-h-60 w-full overflow-y-auto custom-scrollbar rounded-2xl border border-neutral-100 bg-white py-1.5 shadow-lg duration-150"
                        >
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    onClick={() => {
                                        setData('category_id', String(cat.id));
                                        setIsCategoryDropdownOpen(false);
                                    }}
                                    className={`cursor-pointer px-6 py-3 text-base font-semibold transition-colors duration-150 ${
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



            {/* Kontak */}
            <ContactsInputList contacts={contacts} onChange={setContacts} />

            {/* Detail Event */}
            <div className="flex flex-col gap-3">
                <h3 className="font-brand text-h5-mobile font-black text-neutral-900 lg:text-h5-web">
                    Detail Event
                </h3>

                <div className="flex flex-col gap-6 rounded-3xl bg-primary-100/30 p-6">
                    {/* Lokasi */}
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
                            placeholder="Tulis deskripsi event secara detail di sini..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
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
            <div className="mt-6 flex w-full flex-row gap-4">
                <button
                    type="button"
                    onClick={() => {
                        if (window.history.length > 1) {
                            window.history.back();
                        } else {
                            router.visit('/dashboard');
                        }
                    }}
                    className="flex-1 cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white py-4 text-lg font-bold text-neutral-700 hover:bg-neutral-50 transition-all duration-200 active:scale-[0.99]"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-primary-500 py-4 text-lg font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75"
                >
                    <Upload size={20} className="text-white inline-block mr-1" />
                    <span>Terbitkan Event</span>
                </button>
            </div>
        </div>
    );
}
