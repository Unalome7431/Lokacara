import { Head, router, useForm, usePage } from '@inertiajs/react';
import { KeyRound, ShieldAlert } from 'lucide-react';
import React, { useRef } from 'react';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    flash?: {
        success?: string;
        warning?: string;
        error?: string;
    };
}

export default function VerifyEmail() {
    const page = usePage();
    const { auth, flash } = page.props as any as PageProps;
    const user = auth?.user;

    const { data, setData, post, processing, errors } = useForm({
        otp: '',
    });

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleInputChange = (value: string, index: number) => {
        const char = value.slice(-1);
        if (char && !/^\d$/.test(char)) return;

        const otpArray = Array.from(
            { length: 6 },
            (_, idx) => data.otp[idx] || '',
        );
        otpArray[index] = char;
        const newOtp = otpArray.join('');
        setData('otp', newOtp);

        if (char && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number,
    ) => {
        if (e.key === 'Backspace') {
            const currentVal = data.otp[index] || '';
            const otpArray = Array.from(
                { length: 6 },
                (_, idx) => data.otp[idx] || '',
            );

            if (!currentVal && index > 0) {
                inputRefs.current[index - 1]?.focus();
                otpArray[index - 1] = '';
                setData('otp', otpArray.join(''));
            } else {
                otpArray[index] = '';
                setData('otp', otpArray.join(''));
            }
            e.preventDefault();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
            e.preventDefault();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
            e.preventDefault();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pasteData)) {
            setData('otp', pasteData);
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/verify-otp');
    };

    const handleResend = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post('/settings/send-otp');
    };

    return (
        <div className="flex min-h-screen flex-col justify-between bg-neutral-50/50">
            <div className="flex-grow">
                <NavBar />
                <Head title="Verifikasi Email - Lokacara" />

                <div className="mx-auto max-w-md px-2 pt-32 pb-16">
                    <div className="animate-in fade-in zoom-in-95 flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-4 shadow-md duration-200 sm:p-6 md:p-8">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div className="bg-primary-50 flex h-14 w-14 items-center justify-center rounded-2xl text-primary-500">
                                <KeyRound size={28} />
                            </div>
                            <h3 className="mt-2 font-brand text-xl font-black text-neutral-900">
                                Verifikasi Email Anda
                            </h3>
                            <p className="max-w-xs text-small leading-relaxed font-medium text-gray-400">
                                Kami telah mengirimkan kode OTP 6-digit ke
                                alamat email:
                                <span className="mt-0.5 block font-bold text-neutral-800">
                                    {user?.email}
                                </span>
                            </p>
                        </div>

                        {/* Flash Messages */}
                        {flash?.success && (
                            <div className="animate-in fade-in rounded-2xl border border-green-200 bg-green-50 p-4 text-small font-bold text-green-700 duration-200">
                                {flash.success}
                            </div>
                        )}
                        {flash?.warning && (
                            <div className="animate-in fade-in rounded-2xl border border-amber-200 bg-amber-50 p-4 text-small font-bold text-amber-700 duration-200">
                                {flash.warning}
                            </div>
                        )}
                        {flash?.error && (
                            <div className="animate-in fade-in rounded-2xl border border-red-200 bg-red-50 p-4 text-small font-bold text-red-700 duration-200">
                                {flash.error}
                            </div>
                        )}

                        {errors.otp && (
                            <div className="flex items-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-small font-bold text-red-700">
                                <ShieldAlert size={14} className="shrink-0" />
                                <span>{errors.otp}</span>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-6"
                        >
                            <div className="flex flex-col gap-3">
                                <label className="text-center font-brand text-small font-black tracking-wider text-neutral-600 uppercase">
                                    Masukkan Kode OTP
                                </label>

                                <div className="my-2 flex justify-center gap-1 px-4 sm:gap-2 sm:px-6 md:gap-3 md:px-8">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            ref={(el) => {
                                                inputRefs.current[i] = el;
                                            }}
                                            value={data.otp[i] || ''}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    e.target.value,
                                                    i,
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleKeyDown(e, i)
                                            }
                                            onPaste={handlePaste}
                                            className="h-10 w-8 rounded-lg border border-neutral-200 bg-neutral-50 text-center font-brand text-lg font-black text-neutral-800 transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:outline-none sm:h-14 sm:w-12 sm:rounded-2xl sm:text-2xl md:h-16 md:w-14"
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || data.otp.length < 6}
                                className="w-full cursor-pointer rounded-full bg-primary-500 py-3.5 text-base font-bold text-white shadow-md transition-colors hover:bg-primary-600 disabled:bg-primary-300"
                            >
                                {processing
                                    ? 'Memverifikasi...'
                                    : 'Verifikasi Sekarang'}
                            </button>
                        </form>

                        <div className="mt-2 text-center text-small font-semibold text-gray-400">
                            Tidak menerima kode?{' '}
                            <button
                                onClick={handleResend}
                                className="cursor-pointer border-0 bg-transparent p-0 font-bold text-primary-500 transition-colors hover:text-primary-600 hover:underline"
                            >
                                Kirim Ulang Kode
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
