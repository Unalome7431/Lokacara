import { useForm, Head } from '@inertiajs/react';
import { Camera, User, AlertCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import defaultAvatar from '@/../../public/avatars/default.png';
import faviconUrl from '@/../../public/favicon.svg';
import Button from '@/components/ui/Button';

export default function Onboard() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        avatar_url: null as File | null,
        _method: 'put',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/onboard');
    };

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setData('avatar_url', file);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setData('avatar_url', null);
            setPreviewUrl(null);
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleImageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-neutral-50/50 p-4 sm:p-6">
            <Head title="Lengkapi Profil" />

            <div className="relative w-full max-w-[440px] overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-xl shadow-neutral-200/40">
                <div className="px-6 py-10 sm:px-10">
                    {/* Centered minimalist top highlight indicator */}
                    <div className="mb-6 flex justify-center">
                        <div className="h-1.5 w-12 rounded-full bg-linear-to-r from-primary-500 to-secondary-400"></div>
                    </div>

                    {/* Header with Logo */}
                    <div className="flex flex-col items-center">
                        <img
                            src={faviconUrl}
                            alt="Lokacara Logo"
                            className="h-12 w-10 animate-logo-wave"
                        />
                        <h2 className="mt-4 text-center font-brand text-2xl font-black text-neutral-900">
                            Lengkapi Profil Anda
                        </h2>
                        <p className="mt-2 text-center font-brand text-small leading-relaxed text-gray-500">
                            Tentukan username dan pasang foto profil terbaik
                            Anda untuk mulai menikmati Lokacara.
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="mt-8 flex flex-col gap-6"
                    >
                        {/* Avatar Upload Container */}
                        <div className="flex flex-col items-center">
                            <div
                                onClick={handleImageClick}
                                title="Unggah foto profil"
                                className="group relative flex h-28 w-28 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white p-1.5 transition-all duration-300 hover:scale-[1.03] hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/10"
                            >
                                <div className="relative h-full w-full overflow-hidden rounded-full bg-neutral-100">
                                    <img
                                        src={previewUrl || defaultAvatar}
                                        alt={selectedFile?.name || 'Avatar'}
                                        className="h-full w-full object-cover transition-all duration-300 group-hover:brightness-50"
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <Camera className="text-white" size={22} />
                                        <span className="mt-1 text-[9px] font-bold tracking-wider text-white uppercase">
                                            Unggah
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleImageClick}
                                className="mt-3 text-xs font-bold text-primary-500 transition-colors hover:text-primary-600"
                            >
                                Pilih Foto Profil
                            </button>
                            <span className="mt-1 text-[10px] font-medium text-gray-400">
                                Format: JPG, PNG, WebP (Maks. 2MB)
                            </span>

                            <input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                name="avatar"
                                onChange={handleChange}
                                ref={fileInputRef}
                                className="hidden"
                            />

                            {errors.avatar_url && (
                                <div className="mt-2 flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50/50 px-3 py-1 text-micro font-semibold text-red-500">
                                    <AlertCircle size={12} />
                                    <span>{errors.avatar_url}</span>
                                </div>
                            )}
                        </div>

                        {/* Name Input */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="name"
                                className="text-[11px] font-extrabold tracking-wider text-neutral-400 uppercase"
                            >
                                Nama Pengguna (Username)
                            </label>
                            <div className="relative w-full">
                                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
                                    <User size={18} />
                                </span>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Contoh: budisudono"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                    className="box-border w-full rounded-xl border border-neutral-200 bg-white py-3 pr-4 pl-11 font-brand text-base font-semibold text-neutral-800 placeholder-gray-400 transition-all duration-200 focus:border-primary-500 focus:ring-0 focus:outline-none"
                                />
                            </div>

                            {errors.name && (
                                <div className="mt-1.5 flex items-center gap-1.5 pl-1 text-micro font-semibold text-red-500">
                                    <AlertCircle
                                        size={12}
                                        className="shrink-0"
                                    />
                                    <span>{errors.name}</span>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className={`mt-2 w-full py-3.5 text-large font-bold ${
                                processing
                                    ? 'cursor-not-allowed opacity-70'
                                    : 'cursor-pointer'
                            }`}
                        >
                            Simpan & Lanjutkan
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
