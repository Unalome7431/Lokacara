import { Camera, Plus, Upload } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface PosterPickerProps {
    initialPreview?: string | null;
    error?: string;
    onChange: (file: File) => void;
}

export default function PosterPicker({
    initialPreview = null,
    error,
    onChange,
}: PosterPickerProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreview);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update preview if initialPreview changes from parent (e.g. event loaded)
    useEffect(() => {
        setPreviewUrl(initialPreview);
    }, [initialPreview]);

    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            onChange(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Clean up object URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    return (
        <div className="flex flex-col gap-3">
            <h3 className="font-brand text-h5-mobile font-black text-neutral-900 lg:text-h5-web">
                Poster Event
            </h3>

            <div
                onClick={triggerFileInput}
                className="hover:bg-primary-50/10 relative flex aspect-16/9 w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border-2 border-dashed border-neutral-300 bg-white p-6 text-center shadow-xs transition-all duration-300 hover:border-primary-400"
            >
                {previewUrl ? (
                    <img
                        src={previewUrl}
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
            {error && (
                <span className="mt-1 pl-1 text-xs font-bold text-red-500">
                    {error}
                </span>
            )}
        </div>
    );
}
