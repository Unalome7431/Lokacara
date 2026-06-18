import React from 'react';
import { X } from 'lucide-react';
import { Category } from '../types';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
    categoryFormName: string;
    setCategoryFormName: (name: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    processing: boolean;
}

export default function CategoryModal({
    isOpen,
    onClose,
    category,
    categoryFormName,
    setCategoryFormName,
    onSubmit,
    processing,
}: CategoryModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs select-none">
            <div className="animate-in fade-in zoom-in-95 relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 shrink-0">
                    <h3 className="font-brand text-lg font-black text-neutral-900">
                        {category ? 'Edit Kategori' : 'Tambah Kategori'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>
                {/* Form Body */}
                <form onSubmit={onSubmit}>
                    <div className="p-6 flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
                                Nama Kategori
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Nama kategori baru..."
                                value={categoryFormName}
                                onChange={(e) => setCategoryFormName(e.target.value)}
                                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-800 focus:border-primary-500 focus:bg-white focus:outline-none"
                            />
                        </div>
                    </div>
                    {/* Footer */}
                    <div className="border-t border-neutral-100 p-6 flex gap-3 bg-neutral-50/50 shrink-0">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-full bg-primary-500 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-primary-600 transition-colors cursor-pointer"
                        >
                            Simpan
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-full border border-neutral-300 bg-white py-3 text-center text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
