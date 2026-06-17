import React, { useRef, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import PosterPicker from '@/components/ui/PosterPicker';
import TagsInputList from '@/components/ui/TagsInputList';

interface EditFormLeftProps {
    data: any;
    setData: (name: string | ((prev: any) => any), value?: any) => void;
    errors: any;
    isFree: boolean;
    setIsFree: (isFree: boolean) => void;
    tags: string[];
    setTags: (tags: string[]) => void;
    initialPosterUrl?: string;
}

export default function EditFormLeft({
    data,
    setData,
    errors,
    isFree,
    setIsFree,
    tags,
    setTags,
    initialPosterUrl,
}: EditFormLeftProps) {
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

    const incrementCapacity = () => {
        setData((prev: any) => ({
            ...prev,
            capacity: Number(prev.capacity) + 1,
        }));
    };

    const decrementCapacity = () => {
        setData((prev: any) => ({
            ...prev,
            capacity: Number(prev.capacity) > 1 ? Number(prev.capacity) - 1 : 1,
        }));
    };

    return (
        <div className="flex w-full flex-col gap-6 lg:col-span-5">
            {/* Poster Event */}
            <PosterPicker
                initialPreview={initialPosterUrl}
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
                            onMouseDown={() => startStepper(decrementCapacity)}
                            onMouseUp={stopStepper}
                            onMouseLeave={stopStepper}
                            onTouchStart={() => startStepper(decrementCapacity)}
                            onTouchEnd={stopStepper}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-secondary-500 text-white transition-colors select-none hover:bg-secondary-600 active:scale-95"
                        >
                            <Minus size={16} strokeWidth={3} />
                        </button>
                        <input
                            type="number"
                            value={data.capacity}
                            onChange={(e) =>
                                setData('capacity', Number(e.target.value))
                            }
                            className="w-12 [appearance:textfield] border-0 p-0 text-center text-lg font-bold text-neutral-800 outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                            type="button"
                            onMouseDown={() => startStepper(incrementCapacity)}
                            onMouseUp={stopStepper}
                            onMouseLeave={stopStepper}
                            onTouchStart={() => startStepper(incrementCapacity)}
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
                            onChange={(e) => setData('start_datetime', e.target.value)}
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
                            onChange={(e) => setData('end_datetime', e.target.value)}
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
                            onChange={(e) => setData('price', Number(e.target.value))}
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
    );
}
