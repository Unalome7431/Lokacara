import { useForm, usePage, Head } from '@inertiajs/react';
import {
    Award,
    FileImage,
    Settings,
    Info,
    Check,
    AlertCircle,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';

interface Event {
    id: number;
    title: string;
    end_datetime: string;
    certificate_template?: string;
    certificate_template_url?: string;
    certificate_font_family?: string;
    certificate_font_size?: string;
    certificate_font_color?: string;
    certificate_x_pos?: number;
    certificate_is_x_center?: boolean;
    certificate_y_pos?: number;
    certificate_is_y_center?: boolean;
    certificate_max_width?: number;
    certificate_max_height?: number;
}

interface PageProps extends Record<string, any> {
    event: Event;
    presentCount: number;
    isDone: boolean;
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
}

export default function Certificates() {
    const { event, presentCount, isDone, flash } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        template: null as File | null,
        font_family: event.certificate_font_family || 'Roboto',
        font_size: event.certificate_font_size || 'Medium',
        font_color: event.certificate_font_color || '#000000',
        x_pos: event.certificate_x_pos !== undefined ? event.certificate_x_pos : 50,
        is_x_center: event.certificate_is_x_center !== undefined ? event.certificate_is_x_center : true,
        y_pos: event.certificate_y_pos !== undefined ? event.certificate_y_pos : 50,
        is_y_center: event.certificate_is_y_center !== undefined ? event.certificate_is_y_center : true,
        max_width: event.certificate_max_width !== undefined && event.certificate_max_width !== null ? event.certificate_max_width : 80,
        max_height: event.certificate_max_height !== undefined && event.certificate_max_height !== null ? event.certificate_max_height : 20,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        event.certificate_template_url || null,
    );
    const [downloadingPreview, setDownloadingPreview] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('template', file);
            setPreviewUrl(URL.createObjectURL(file));
            setPreviewError(null);
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl !== event.certificate_template_url) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, event.certificate_template_url]);

    const saveConfig = (e: React.FormEvent) => {
        e.preventDefault();
        setPreviewError(null);
        post(`/dashboard/events/${event.id}/certificates/save`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const downloadPreview = async () => {
        setDownloadingPreview(true);
        setPreviewError(null);

        try {
            const formData = new FormData();

            if (data.template) {
                formData.append('template', data.template);
            }

            formData.append('font_family', data.font_family);
            formData.append('font_size', data.font_size);
            formData.append('font_color', data.font_color);
            formData.append('x_pos', String(data.x_pos));
            formData.append('is_x_center', data.is_x_center ? '1' : '0');
            formData.append('y_pos', String(data.y_pos));
            formData.append('is_y_center', data.is_y_center ? '1' : '0');
            formData.append('max_width', String(data.max_width));
            formData.append('max_height', String(data.max_height));

            const xsrfCookie = document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='));
            const xsrfToken = xsrfCookie
                ? decodeURIComponent(xsrfCookie.split('=')[1])
                : '';

            const response = await fetch(
                `/dashboard/events/${event.id}/certificates/preview`,
                {
                    method: 'POST',
                    headers: {
                        'X-XSRF-TOKEN': xsrfToken,
                        Accept: 'application/json',
                    },
                    body: formData,
                },
            );

            if (!response.ok) {
                const errData = await response.json();
                const errMsg =
                    errData.error ||
                    errData.message ||
                    'Gagal mengunduh pratinjau.';
                setPreviewError(errMsg);

                return;
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;

            let extension = 'png';

            if (data.template) {
                const parts = data.template.name.split('.');

                if (parts.length > 1) {
                    extension = parts.pop() || 'png';
                }
            } else if (event.certificate_template) {
                const parts = event.certificate_template.split('.');

                if (parts.length > 1) {
                    extension = parts.pop() || 'png';
                }
            }

            link.setAttribute('download', `preview_sertifikat.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading certificate preview:', error);
            setPreviewError('Terjadi kesalahan jaringan atau server.');
        } finally {
            setDownloadingPreview(false);
        }
    };

    const distributeCertificates = () => {
        if (!isDone) {
            return;
        }

        post(`/dashboard/events/${event.id}/certificates/distribute`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex min-h-screen flex-col justify-between bg-neutral-50/50">
            <Head>
                <title>{`Konfigurasi E-Sertifikat - ${event.title}`}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@400;700&family=Oswald:wght@400;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Roboto:wght@400;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex-grow">
                <NavBar />

                <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 md:px-8">
                    {/* Alert Banners */}
                    {!isDone && (
                        <div className="mb-6 flex gap-3.5 rounded-3xl border border-secondary-200 bg-secondary-100/30 p-5 shadow-xs duration-200">
                            <Info
                                size={20}
                                className="mt-0.5 shrink-0 text-secondary-600"
                            />
                            <div>
                                <h5 className="font-brand text-small leading-none font-extrabold text-secondary-900">
                                    Event Belum Selesai
                                </h5>
                                <p className="mt-1.5 text-xs font-semibold leading-relaxed text-secondary-800">
                                    Anda dapat mengunggah template dan mendesain
                                    letak nama peserta sekarang, namun pengiriman
                                    sertifikat baru akan diaktifkan setelah
                                    tanggal event selesai.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Header Title */}
                    <div className="mb-8">
                        <h2 className="font-brand text-h2-mobile font-black tracking-tight text-neutral-900 lg:text-h2-web">
                            Kelola E-Sertifikat
                        </h2>
                        <p className="mt-1 text-base font-semibold text-gray-500">
                            Konfigurasi penempatan nama peserta pada template
                            sertifikat untuk event{' '}
                            <span className="font-extrabold text-neutral-800">
                                {event.title}
                            </span>
                        </p>
                    </div>

                    {/* Main Workspace Layout */}
                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
                        {/* Left Column: Canvas Preview */}
                        <div className="flex flex-col gap-6 lg:col-span-3">
                            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <h4 className="mb-4 font-brand text-h6-mobile font-black text-neutral-900 lg:text-h6-web">
                                    Pratinjau Sertifikat
                                </h4>

                                {!previewUrl ? (
                                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50/50 py-32 text-center select-none">
                                        <div className="bg-primary-50 flex h-16 w-16 items-center justify-center rounded-full text-primary-500 shadow-sm">
                                            <Award size={32} />
                                        </div>
                                        <div className="flex flex-col gap-1 px-4">
                                            <h5 className="text-small font-extrabold text-neutral-800">
                                                Belum Ada Template
                                            </h5>
                                            <p className="max-w-[320px] text-xs font-semibold text-gray-400 leading-normal">
                                                Silakan unggah gambar template
                                                sertifikat Anda di panel sebelah
                                                kanan untuk memulai.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative overflow-hidden rounded-2xl border border-neutral-250 bg-neutral-900 p-2 shadow-xs">
                                        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-neutral-950">
                                            <img
                                                src={previewUrl}
                                                alt="Certificate Template"
                                                className="max-h-[460px] w-full object-contain"
                                                draggable="false"
                                            />

                                            {/* Bounding Box Container */}
                                            <div
                                                className="absolute border-2 border-dashed border-primary-500/60 pointer-events-none flex"
                                                style={{
                                                    width: `${data.max_width}%`,
                                                    height: `${data.max_height}%`,
                                                    left: data.is_x_center
                                                        ? '50%'
                                                        : `${data.x_pos}%`,
                                                    top: data.is_y_center
                                                        ? '50%'
                                                        : `${data.y_pos}%`,
                                                    transform: 'translate(-50%, -50%)',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {/* Dynamic Name Overlay */}
                                                <div
                                                    className="font-extrabold drop-shadow-md select-none text-center whitespace-nowrap"
                                                    style={{
                                                        color: data.font_color,
                                                        fontSize:
                                                            data.font_size ===
                                                            'Small'
                                                                ? '1.25rem'
                                                                : data.font_size ===
                                                                  'Large'
                                                                  ? '3rem'
                                                                  : '2rem',
                                                        fontFamily:
                                                            data.font_family ===
                                                            'Playfair'
                                                                ? '"Playfair Display", serif'
                                                                : data.font_family ===
                                                                  'GreatVibes'
                                                                  ? '"Great Vibes", cursive'
                                                                  : data.font_family ===
                                                                    'Montserrat'
                                                                    ? '"Montserrat", sans-serif'
                                                                    : data.font_family ===
                                                                      'Oswald'
                                                                      ? '"Oswald", sans-serif'
                                                                      : '"Roboto", sans-serif',
                                                    }}
                                                >
                                                    Nama Peserta
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Configurations */}
                        <div className="flex flex-col gap-6 lg:col-span-2">
                            <form
                                onSubmit={saveConfig}
                                className="flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
                            >
                                <div className="flex items-center gap-2 border-b border-neutral-100 pb-4">
                                    <Settings
                                        size={20}
                                        className="text-primary-500"
                                    />
                                    <h4 className="font-brand text-h6-mobile font-black text-neutral-900 lg:text-h6-web">
                                        Pengaturan Desain
                                    </h4>
                                </div>

                                {/* 1. Template File Upload */}
                                <div className="flex flex-col gap-2">
                                    <label className="font-brand text-small font-extrabold text-neutral-700">
                                        Desain Template
                                    </label>
                                    <div
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    'template-file-input',
                                                )
                                                ?.click()
                                        }
                                        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 transition-colors hover:bg-neutral-100"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FileImage
                                                size={20}
                                                className="text-gray-400 shrink-0"
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <span className="truncate text-xs font-bold text-neutral-850">
                                                    {data.template
                                                        ? data.template.name
                                                        : event.certificate_template
                                                          ? 'Template Terunggah'
                                                          : 'Pilih File Template'}
                                                </span>
                                                <span className="text-[10px] font-semibold text-gray-400">
                                                    PNG atau JPG (Maks. 5MB)
                                                </span>
                                            </div>
                                        </div>
                                        {(event.certificate_template || data.template) && (
                                            <span className="shrink-0 rounded-lg bg-neutral-200/60 px-2.5 py-1 text-[10px] font-extrabold text-neutral-750 hover:bg-neutral-250">
                                                Ganti
                                            </span>
                                        )}
                                        <input
                                            id="template-file-input"
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                    {errors.template && (
                                        <p className="text-micro font-bold text-red-500">
                                            {errors.template}
                                        </p>
                                    )}
                                </div>

                                {/* 2. Font Settings */}
                                <div className="flex flex-col gap-4">
                                    {/* Font Family */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="font-brand text-small font-extrabold text-neutral-700">
                                            Jenis Font
                                        </label>
                                        <select
                                            value={data.font_family}
                                            onChange={(e) =>
                                                setData(
                                                    'font_family',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base font-semibold text-neutral-800 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none"
                                        >
                                            <option value="Roboto">
                                                Roboto (Sans Minimalis)
                                            </option>
                                            <option value="Montserrat">
                                                Montserrat (Sans Modern)
                                            </option>
                                            <option value="Playfair">
                                                Playfair Display (Serif Elegan)
                                            </option>
                                            <option value="GreatVibes">
                                                Great Vibes (Tanda Tangan/Kursif)
                                            </option>
                                            <option value="Oswald">
                                                Oswald (Bold Condensed)
                                            </option>
                                        </select>
                                    </div>

                                    {/* Font Size & Color side-by-side */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-brand text-small font-extrabold text-neutral-700">
                                                Ukuran Font
                                            </label>
                                            <select
                                                value={data.font_size}
                                                onChange={(e) =>
                                                    setData(
                                                        'font_size',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base font-semibold text-neutral-800 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none"
                                            >
                                                <option value="Small">
                                                    Kecil
                                                </option>
                                                <option value="Medium">
                                                    Sedang
                                                </option>
                                                <option value="Large">
                                                    Besar
                                                </option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-brand text-small font-extrabold text-neutral-700">
                                                Warna Font
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={data.font_color}
                                                    onChange={(e) =>
                                                        setData(
                                                            'font_color',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-11 w-14 shrink-0 rounded-xl border border-neutral-200 bg-neutral-50 p-1 cursor-pointer focus:outline-none"
                                                />
                                                <span className="w-full text-center rounded-xl border border-neutral-200 bg-neutral-50 py-3 text-micro font-bold text-neutral-700 uppercase">
                                                    {data.font_color}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. X Coordinate Settings */}
                                <div className="rounded-2xl border border-neutral-150 bg-neutral-50/50 p-4">
                                    <div className="flex items-center justify-between">
                                        <label className="font-brand text-small font-extrabold text-neutral-700">
                                            Posisi Horizontal (X)
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="checkbox"
                                                id="is_x_center"
                                                checked={data.is_x_center}
                                                onChange={(e) =>
                                                    setData(
                                                        'is_x_center',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                                            />
                                            <label
                                                htmlFor="is_x_center"
                                                className="cursor-pointer text-xs font-bold text-neutral-600"
                                            >
                                                Rata Tengah (Auto)
                                            </label>
                                        </div>
                                    </div>

                                    {!data.is_x_center && (
                                        <div className="mt-4 flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                value={data.x_pos}
                                                onChange={(e) =>
                                                    setData(
                                                        'x_pos',
                                                        parseFloat(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                className="w-full cursor-pointer accent-primary-500"
                                            />
                                            <span className="shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 font-mono text-xs font-bold text-neutral-800">
                                                {data.x_pos}%
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* 4. Y Coordinate Settings */}
                                <div className="rounded-2xl border border-neutral-150 bg-neutral-50/50 p-4">
                                    <div className="flex items-center justify-between">
                                        <label className="font-brand text-small font-extrabold text-neutral-700">
                                            Posisi Vertikal (Y)
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="checkbox"
                                                id="is_y_center"
                                                checked={data.is_y_center}
                                                onChange={(e) =>
                                                    setData(
                                                        'is_y_center',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                                            />
                                            <label
                                                htmlFor="is_y_center"
                                                className="cursor-pointer text-xs font-bold text-neutral-600"
                                            >
                                                Rata Tengah (Auto)
                                            </label>
                                        </div>
                                    </div>

                                    {!data.is_y_center && (
                                        <div className="mt-4 flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                value={data.y_pos}
                                                onChange={(e) =>
                                                    setData(
                                                        'y_pos',
                                                        parseFloat(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                className="w-full cursor-pointer accent-primary-500"
                                            />
                                            <span className="shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 font-mono text-xs font-bold text-neutral-800">
                                                {data.y_pos}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* 5. Bounding Box Dimensions Settings */}
                                <div className="rounded-2xl border border-neutral-150 bg-neutral-50/50 p-4">
                                    <div className="flex items-center justify-between">
                                        <label className="font-brand text-small font-extrabold text-neutral-700">
                                            Lebar Bounding Box (%)
                                        </label>
                                        <span className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 font-mono text-xs font-bold text-neutral-800">
                                            {data.max_width}%
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="10"
                                            max="100"
                                            step="1"
                                            value={data.max_width}
                                            onChange={(e) =>
                                                setData(
                                                    'max_width',
                                                    parseInt(e.target.value),
                                                )
                                            }
                                            className="w-full cursor-pointer accent-primary-500"
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[10px] font-semibold text-gray-400 leading-normal">
                                        Batas lebar maksimal teks nama peserta (persentase dari lebar template).
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-neutral-150 bg-neutral-50/50 p-4">
                                    <div className="flex items-center justify-between">
                                        <label className="font-brand text-small font-extrabold text-neutral-700">
                                            Tinggi Bounding Box (%)
                                        </label>
                                        <span className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 font-mono text-xs font-bold text-neutral-800">
                                            {data.max_height}%
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="5"
                                            max="100"
                                            step="1"
                                            value={data.max_height}
                                            onChange={(e) =>
                                                setData(
                                                    'max_height',
                                                    parseInt(e.target.value),
                                                )
                                            }
                                            className="w-full cursor-pointer accent-primary-500"
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[10px] font-semibold text-gray-400 leading-normal">
                                        Batas tinggi maksimal teks nama peserta (persentase dari tinggi template).
                                    </p>
                                </div>

                                 {/* Status Labels */}
                                 {flash?.success && (
                                     <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3.5 text-xs font-bold text-green-700">
                                         <Check size={16} className="shrink-0" />
                                         <span>{flash.success}</span>
                                     </div>
                                 )}

                                 {(flash?.error || Object.keys(errors).length > 0 || previewError) && (
                                     <div className="flex flex-col gap-1 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-bold text-red-700">
                                         <div className="flex items-center gap-2">
                                             <AlertCircle size={16} className="shrink-0" />
                                             <span>{previewError || flash?.error || 'Gagal menyimpan konfigurasi. Periksa input.'}</span>
                                         </div>
                                         {Object.keys(errors).length > 0 && !previewError && (
                                             <ul className="mt-1 pl-5 list-disc text-[10px] font-semibold text-red-600">
                                                 {Object.entries(errors).map(([key, val]) => (
                                                     <li key={key}>{val}</li>
                                                 ))}
                                             </ul>
                                         )}
                                     </div>
                                 )}

                                 {/* Form Buttons */}
                                 <div className="mt-2 flex flex-col gap-3">
                                     {/* Save Config Button */}
                                     <button
                                         type="submit"
                                         disabled={processing}
                                         className="w-full cursor-pointer rounded-full bg-neutral-100 py-3.5 text-center text-base font-bold text-neutral-800 transition-colors hover:bg-neutral-200 active:scale-[0.99] disabled:bg-neutral-50 disabled:text-neutral-350"
                                     >
                                         {processing
                                             ? 'Menyimpan...'
                                             : 'Simpan Konfigurasi Layout'}
                                     </button>

                                     {/* Unduh Pratinjau Button */}
                                     <button
                                         type="button"
                                         onClick={downloadPreview}
                                         disabled={processing || downloadingPreview || !previewUrl}
                                         className="w-full cursor-pointer rounded-full bg-secondary-500 py-3.5 text-center text-base font-bold text-neutral-900 shadow-md transition-colors hover:bg-secondary-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-gray-400 disabled:shadow-none"
                                     >
                                         {downloadingPreview
                                             ? 'Mengunduh Pratinjau...'
                                             : 'Unduh Pratinjau Sertifikat'}
                                     </button>

                                     {/* Generate & Distribute Button */}
                                     <button
                                         type="button"
                                         onClick={distributeCertificates}
                                         disabled={
                                             processing ||
                                             !isDone ||
                                             presentCount === 0 ||
                                             !previewUrl
                                         }
                                         className="w-full cursor-pointer rounded-full bg-primary-500 py-3.5 text-center text-base font-bold text-white shadow-md transition-colors hover:bg-primary-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-gray-400 disabled:shadow-none"
                                     >
                                         Generate & Kirim Sertifikat ({presentCount})
                                     </button>
                                 </div>

                                {/* Explanatory help/status texts */}
                                <div className="flex flex-col gap-1 text-[10px] font-bold text-gray-400">
                                    <span>
                                        • Sertifikat hanya dibagikan kepada
                                        peserta yang terdata Hadir (Checked-in).
                                    </span>
                                    {!isDone && (
                                        <span className="text-secondary-600">
                                            • Pengiriman sertifikat baru aktif
                                            setelah tanggal event selesai.
                                        </span>
                                    )}
                                    {presentCount === 0 && (
                                        <span className="text-red-500">
                                            • Belum ada peserta terdata hadir.
                                        </span>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
