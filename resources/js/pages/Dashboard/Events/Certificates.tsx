import { useForm, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button'; // Assuming you have this

export default function Certificates() {
    const { event, presentCount } = usePage().props as any;

    const { data, setData, post, processing, errors } = useForm({
        template: null as File | null,
        font_family: 'Roboto',
        font_size: 'Medium',
        font_color: '#000000',
        x_pos: 50,
        is_x_center: true,
        y_pos: 50,
        is_y_center: true,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('template', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        // Cleanup memory
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/dashboard/events/${event.id}/certificates/distribute`, {
            forceFormData: true,
        });
    };

    return (
        <div className="mx-auto max-w-4xl p-10">
            <h1 className="mb-2 text-2xl font-bold text-primary-500">
                Distribute Certificates for {event.title}
            </h1>
            <p className="mb-8 text-gray-600">
                Currently, there are{' '}
                <span className="font-bold text-green-600">{presentCount}</span>{' '}
                attendees checked in ("present"). Certificates will only be
                generated for them.
            </p>

            <form
                onSubmit={submit}
                className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-md"
            >
                {/* 1. Template Upload */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">
                        Upload Certificate Template (Image)
                    </label>
                    <input
                        type="file"
                        accept="image/jpeg, image/png"
                        onChange={handleFileChange}
                        required
                        className="block w-full rounded border border-gray-300 p-2"
                    />
                    {errors.template && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.template}
                        </p>
                    )}
                </div>

                {/* Preview Image */}
                {previewUrl && (
                    <div className="group relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
                        <img
                            src={previewUrl}
                            alt="Template Preview"
                            className="h-auto max-h-96 w-full object-contain"
                        />

                        {/* Fake visualization cursor of where the text will be approximately */}
                        <div
                            className="absolute"
                            style={{
                                left: data.is_x_center
                                    ? '50%'
                                    : `${data.x_pos}%`,
                                top: data.is_y_center
                                    ? '50%'
                                    : `${data.y_pos}%`,
                                transform: `${data.is_x_center ? '-translate-x-1/2' : ''} ${data.is_y_center ? '-translate-y-1/2' : ''}`,
                                fontFamily:
                                    data.font_family === 'Playfair'
                                        ? '"Playfair Display", serif'
                                        : data.font_family === 'GreatVibes'
                                          ? '"Great Vibes", cursive'
                                          : data.font_family,
                                color: data.font_color,
                                fontSize:
                                    data.font_size === 'Small'
                                        ? '1rem'
                                        : data.font_size === 'Large'
                                          ? '3rem'
                                          : '2rem',
                            }}
                        >
                            [ Attendee Name ]
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* 2. Font Selection Dropdown */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Font Style
                        </label>
                        <select
                            value={data.font_family}
                            onChange={(e) =>
                                setData('font_family', e.target.value)
                            }
                            className="w-full rounded border border-gray-300 p-2"
                        >
                            <option value="Roboto">
                                Roboto (Minimalist Sans)
                            </option>
                            <option value="Montserrat">
                                Montserrat (Modern Sans)
                            </option>
                            <option value="Playfair">
                                Playfair Display (Elegant Serif)
                            </option>
                            <option value="GreatVibes">
                                Great Vibes (Cursive/Signature)
                            </option>
                            <option value="Oswald">
                                Oswald (Bold/Condensed)
                            </option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            Note: Set font filenames equivalently like
                            "Playfair.ttf" in storage/app/fonts.
                        </p>
                    </div>

                    {/* Font Size */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Base Font Size
                        </label>
                        <select
                            value={data.font_size}
                            onChange={(e) =>
                                setData('font_size', e.target.value)
                            }
                            className="w-full rounded border border-gray-300 p-2"
                        >
                            <option value="Small">
                                Small (for dense/small text)
                            </option>
                            <option value="Medium">Medium (standard)</option>
                            <option value="Large">
                                Large (for huge resolutions)
                            </option>
                        </select>
                    </div>

                    {/* Font Color */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Font Color
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={data.font_color}
                                onChange={(e) =>
                                    setData('font_color', e.target.value)
                                }
                                className="h-10 w-16 rounded border-0 p-0"
                            />
                            <span className="rounded border bg-gray-50 px-2 py-1 font-mono text-sm uppercase">
                                {data.font_color}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. X Coordinate Configuration */}
                <div className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-semibold">
                            X-Coordinate (Horizontal)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_x_center"
                                checked={data.is_x_center}
                                onChange={(e) =>
                                    setData('is_x_center', e.target.checked)
                                }
                                className="rounded"
                            />
                            <label
                                htmlFor="is_x_center"
                                className="cursor-pointer text-sm"
                            >
                                Auto Center X
                            </label>
                        </div>
                    </div>
                    {!data.is_x_center && (
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0"
                                max="100" // Percentage based
                                step="0.1"
                                value={data.x_pos}
                                onChange={(e) =>
                                    setData('x_pos', parseFloat(e.target.value))
                                }
                                className="w-full"
                            />
                            <span className="rounded border bg-white px-2 py-1 font-mono text-sm">
                                {data.x_pos}%
                            </span>
                        </div>
                    )}
                </div>

                {/* 4. Y Coordinate Configuration */}
                <div className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-semibold">
                            Y-Coordinate (Vertical %)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_y_center"
                                checked={data.is_y_center}
                                onChange={(e) =>
                                    setData('is_y_center', e.target.checked)
                                }
                                className="rounded"
                            />
                            <label
                                htmlFor="is_y_center"
                                className="cursor-pointer text-sm"
                            >
                                Auto Center Y
                            </label>
                        </div>
                    </div>
                    {!data.is_y_center && (
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="0.1"
                                value={data.y_pos}
                                onChange={(e) =>
                                    setData('y_pos', parseFloat(e.target.value))
                                }
                                className="w-full"
                            />
                            <span className="rounded border bg-white px-2 py-1 font-mono text-sm">
                                {data.y_pos}%
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <Button
                        type="submit"
                        disabled={
                            processing || presentCount === 0 || !data.template
                        }
                    >
                        {processing
                            ? 'Distributing...'
                            : `Generate & Distribute to ${presentCount} Attendees`}
                    </Button>
                </div>
            </form>
        </div>
    );
}
