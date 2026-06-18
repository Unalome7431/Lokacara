import { useForm } from '@inertiajs/react';
import { AlertTriangle, X } from 'lucide-react';
import React from 'react';

interface ReportEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: number;
    eventName: string;
}

export default function ReportEventModal({
    isOpen,
    onClose,
    eventId,
    eventName,
}: ReportEventModalProps) {
    if (!isOpen) {
        return null;
    }

    const { data, setData, post, processing, errors, reset } = useForm({
        reason: 'Spam',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/events/${eventId}/report`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs select-none">
            {/* Modal Box */}
            <div className="animate-in fade-in zoom-in-95 relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3 className="font-brand text-lg font-black text-neutral-900 leading-tight">
                                Laporkan Event
                            </h3>
                            <p className="text-xs font-semibold text-gray-400 mt-0.5">
                                {eventName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    {/* Reason Select */}
                    <div className="flex flex-col gap-1.5">
                        <label className="pl-1 text-xs font-bold tracking-wide text-gray-400 uppercase">
                            Tipe Laporan
                        </label>
                        <select
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            className="w-full rounded-full border border-neutral-200 bg-neutral-50 px-5 py-3 font-semibold text-neutral-800 focus:border-primary-500 focus:bg-white focus:outline-none"
                            required
                        >
                            <option value="Spam">Spam / Duplikasi</option>
                            <option value="Konten Tidak Layak / Seksual">Konten Tidak Layak / Seksual</option>
                            <option value="Penipuan / Scam">Penipuan / Scam / Phishing</option>
                            <option value="Pelanggaran Hak Cipta">Pelanggaran Hak Cipta / HKI</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                        {errors.reason && (
                            <span className="mt-1 pl-1 text-xs font-bold text-red-500">
                                {errors.reason}
                            </span>
                        )}
                    </div>

                    {/* Description Textarea */}
                    <div className="flex flex-col gap-1.5">
                        <label className="pl-1 text-xs font-bold tracking-wide text-gray-400 uppercase">
                            Deskripsi Laporan
                        </label>
                        <textarea
                            placeholder="Jelaskan secara detail alasan Anda melaporkan event ini..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            required
                            rows={4}
                            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-3 font-semibold text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none"
                        />
                        {errors.description && (
                            <span className="mt-1 pl-1 text-xs font-bold text-red-500">
                                {errors.description}
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-full border border-neutral-300 bg-white py-3 text-center text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-50 cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-full bg-red-500 py-3 text-center text-sm font-bold text-white shadow-md transition-all hover:bg-red-600 active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {processing ? 'Mengirim...' : 'Kirim Laporan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
