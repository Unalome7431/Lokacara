import { useForm, Head } from '@inertiajs/react';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import faviconUrl from '@/../../public/favicon.svg';
import Button from '@/components/ui/Button';

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function ResetPassword({ flash }: PageProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reset-password');
    };

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-gray-50/50 p-4">
            <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-200/50">
                <div className="relative flex flex-col items-stretch rounded-3xl bg-white px-8 pt-10 pb-10">
                    {/* Centered minimalist top highlight indicator */}
                    <div className="mb-6 flex justify-center">
                        <div className="h-1.5 w-12 rounded-full bg-linear-to-r from-primary-500 to-secondary-400"></div>
                    </div>
                    <Head title="Atur Ulang Kata Sandi" />

                    {/* Logo and header text */}
                    <div className="mb-8 flex flex-col items-center">
                        <img
                            src={faviconUrl}
                            alt="Lokacara"
                            className="h-12 w-10 animate-logo-wave"
                        />
                        <h2 className="mt-4 text-center font-brand text-h2-mobile font-black text-neutral-900 lg:text-h2-web">
                            Atur Ulang Kata Sandi
                        </h2>
                        <p className="mt-2 text-center font-brand text-small leading-relaxed text-gray-500">
                            Silakan masukkan kata sandi baru Anda di bawah ini.
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
                        {/* New Password */}
                        <div>
                            <div className="relative w-full">
                                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
                                    <Lock size={18} />
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Kata Sandi Baru"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    required
                                    className="box-border w-full rounded-xl border border-neutral-200 bg-white py-3 pr-12 pl-11 font-brand text-base font-semibold text-neutral-800 placeholder-gray-400 transition-all duration-200 focus:border-primary-500 focus:ring-0 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <div className="mt-1.5 flex items-center gap-1.5 pl-1 text-micro font-semibold text-red-500">
                                    <AlertCircle
                                        size={12}
                                        className="shrink-0"
                                    />
                                    <span>{errors.password}</span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <div className="relative w-full">
                                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
                                    <Lock size={18} />
                                </span>
                                <input
                                    id="password_confirmation"
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    name="password_confirmation"
                                    placeholder="Konfirmasi Kata Sandi"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    className="box-border w-full rounded-xl border border-neutral-200 bg-white py-3 pr-12 pl-11 font-brand text-base font-semibold text-neutral-800 placeholder-gray-400 transition-all duration-200 focus:border-primary-500 focus:ring-0 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <div className="mt-1.5 flex items-center gap-1.5 pl-1 text-micro font-semibold text-red-500">
                                    <AlertCircle
                                        size={12}
                                        className="shrink-0"
                                    />
                                    <span>{errors.password_confirmation}</span>
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
                            {processing ? 'Menyimpan...' : 'Simpan Kata Sandi'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
