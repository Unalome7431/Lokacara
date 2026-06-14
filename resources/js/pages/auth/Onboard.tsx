import { useForm } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import defaultAvatar from '@/../../public/avatars/default.png';
import faviconUrl from '@/../../public/favicon.svg';
import Button from '@/components/ui/Button';

export default function Onboard() {
    const { data, setData, post, processing } = useForm({
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
            alert('File gambar tidak valid');
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
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="relative">
                <div className="absolute -inset-0.75 rounded-2xl bg-linear-to-br from-primary-500 to-secondary-400 opacity-50 drop-shadow-2xl"></div>

                <div className="relative rounded-[calc(1rem-3px)] bg-white p-10">
                    <div className="flex min-w-120 items-center gap-10">
                        <div
                            onClick={handleImageClick}
                            title="Upload gambar profil"
                            className="group relative flex size-70 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full"
                        >
                            <img
                                src={previewUrl || defaultAvatar}
                                alt={selectedFile?.name || 'Avatar'}
                                className="h-full w-full object-cover transition-all duration-300 group-hover:brightness-50"
                            />
                            <span className="pointer-events-none absolute text-center font-medium text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                                Tekan untuk
                                <br />
                                upload
                            </span>
                        </div>

                        <form
                            action="submit"
                            onSubmit={submit}
                            className="flex w-full flex-col gap-3"
                        >
                            <h4 className="text-primary-500">
                                Lengkapi Data Anda
                            </h4>

                            <input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                name="avatar"
                                onChange={handleChange}
                                ref={fileInputRef}
                                className="hidden"
                            />

                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Username"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                required
                                className="box-border w-full rounded bg-secondary-100 px-5 py-2.5 font-brand text-base font-normal placeholder-gray-500"
                            />

                            <Button type="submit" disabled={processing}>
                                Simpan
                            </Button>

                            <div className="mt-5 flex justify-center">
                                <img
                                    src={faviconUrl}
                                    alt="Lokacara"
                                    className="h-15.5 w-12.5"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
