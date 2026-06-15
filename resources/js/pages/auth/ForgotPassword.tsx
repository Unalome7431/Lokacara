import { useForm, Head } from '@inertiajs/react';
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import faviconUrl from '@/../../public/favicon.svg';
import Button from '@/components/ui/Button';

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function ForgotPassword({ flash }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-gray-50/50 p-4">
            <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-200/50">
                <div className="relative flex flex-col items-stretch rounded-3xl bg-white px-8 pt-10 pb-10">
                    {/* Centered minimalist top highlight indicator */}
                    <div className="mb-6 flex justify-center">
                        <div className="h-1.5 w-12 rounded-full bg-linear-to-r from-primary-500 to-secondary-400"></div>
                    </div>
                    <Head title="Lupa Kata Sandi" />

                    {/* Logo and header text */}
                    <div className="mb-8 flex flex-col items-center">
                        <img
                            src={faviconUrl}
                            alt="Lokacara"
                            className="h-12 w-10 animate-logo-wave"
                        />
                        <h2 className="mt-4 text-center font-brand text-h2-mobile font-black text-neutral-900 lg:text-h2-web">
                            Lupa Kata Sandi
                        </h2>
                        <p className="mt-2 text-center font-brand text-small leading-relaxed text-gray-500">
                            Masukkan email terdaftar Anda. Kami akan mengirimkan
                            kode OTP untuk mengatur ulang kata sandi Anda.
                        </p>
                    </div>

                    {/* Flash messages */}
                    {flash?.success && (
                        <div className="animate-in fade-in mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-small font-bold text-green-700 duration-200">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="animate-in fade-in mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-small font-bold text-red-700 duration-200">
                            {flash.error}
                        </div>
                    )}

                    <form onSubmit={submit} className="flex flex-col gap-4">
                        <div>
                            <div className="relative w-full">
                                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
                                    <Mail size={18} />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Masukkan Email Anda"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                    className="box-border w-full rounded-xl border border-neutral-200 bg-white py-3 pr-4 pl-11 font-brand text-base font-semibold text-neutral-800 placeholder-gray-400 transition-all duration-200 focus:border-primary-500 focus:ring-0 focus:outline-none"
                                />
                            </div>
                            {errors.email && (
                                <div className="mt-1.5 flex items-center gap-1.5 pl-1 text-micro font-semibold text-red-500">
                                    <AlertCircle
                                        size={12}
                                        className="shrink-0"
                                    />
                                    <span>{errors.email}</span>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className={`mt-4 w-full py-3.5 text-large font-bold ${
                                processing
                                    ? 'cursor-not-allowed opacity-70'
                                    : 'cursor-pointer'
                            }`}
                        >
                            {processing
                                ? 'Mengirim Kode...'
                                : 'Kirim Kode Verifikasi'}
                        </Button>
                    </form>

                    <div className="mt-8 flex justify-center font-brand text-base font-normal">
                        <a
                            href="/login"
                            className="flex items-center gap-1.5 font-bold text-gray-400 transition-colors hover:text-gray-600"
                        >
                            <ArrowLeft size={16} />
                            <span>Kembali ke Masuk</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
