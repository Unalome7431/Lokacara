import { useForm, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import faviconUrl from '@/../../public/favicon.svg';
import googleIconUrl from '@/assets/icons/material-icon-theme_google.svg';
import Button from '@/components/ui/Button';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        password_confirmation: '',
        policy: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-gray-50/50 p-4">
            <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-200/50">
                {/* Subtle gradient border effect */}
                <div className="pointer-events-none absolute -inset-px rounded-3xl bg-linear-to-br from-primary-400 to-secondary-300 opacity-35"></div>

                <div className="relative flex flex-col items-stretch rounded-3xl bg-white px-8 pt-16 pb-10">
                    <Head title="Daftar" />

                    <h2 className="mb-6 text-center font-brand text-[2.5rem] leading-none font-extrabold text-primary-500">
                        Daftar
                    </h2>

                    {/* Google OAuth Button */}
                    <div className="relative mb-6 text-center">
                        <a
                            href="/auth/google"
                            className="relative box-border flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white py-3.5 font-brand text-base font-normal text-gray-600 transition-colors duration-200 hover:bg-gray-50"
                        >
                            <img
                                src={googleIconUrl}
                                alt="Google"
                                className="absolute left-5 h-5 w-5"
                            />
                            <span>
                                Daftar dengan{' '}
                                <span className="font-semibold text-primary-500">
                                    Google
                                </span>
                            </span>
                        </a>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-6 flex w-full items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <span className="relative bg-white px-4 font-brand text-small font-normal text-gray-400">
                            atau
                        </span>
                    </div>

                    {/* Manual Registration Form */}
                    <form onSubmit={submit} className="flex flex-col gap-4">
                        <div>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Email / Nomor Telepon"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                required
                                className="box-border w-full rounded-lg border border-transparent bg-secondary-100 px-4 py-3.5 font-brand text-base font-normal placeholder-gray-400 transition-all duration-200 focus:border-primary-500 focus:bg-white focus:outline-none"
                            />
                            {errors.email && (
                                <div className="mt-1.5 text-micro text-red-500">
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="relative w-full">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Kata Sandi"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    required
                                    className="box-border w-full rounded-lg border border-transparent bg-secondary-100 py-3.5 pr-12 pl-4 font-brand text-base font-normal placeholder-gray-400 transition-all duration-200 focus:border-primary-500 focus:bg-white focus:outline-none"
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
                                <div className="mt-1.5 text-micro text-red-500">
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="relative w-full">
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
                                    className="box-border w-full rounded-lg border border-transparent bg-secondary-100 py-3.5 pr-12 pl-4 font-brand text-base font-normal placeholder-gray-400 transition-all duration-200 focus:border-primary-500 focus:bg-white focus:outline-none"
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
                                <div className="mt-1.5 text-micro text-red-500">
                                    {errors.password_confirmation}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="mt-1 flex items-start gap-2.5">
                                <input
                                    id="policy"
                                    type="checkbox"
                                    name="policy"
                                    checked={data.policy}
                                    onChange={(e) =>
                                        setData('policy', e.target.checked)
                                    }
                                    required
                                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-sm border border-gray-300 bg-gray-50 bg-size-[10px_10px] bg-center bg-no-repeat transition-all duration-200 outline-none checked:bg-primary-500 checked:bg-[url('https://upload.wikimedia.org/wikipedia/commons/2/27/White_check.svg')]"
                                />
                                <span className="font-brand text-small leading-tight text-gray-500">
                                    Saya setuju dengan{' '}
                                    <a
                                        href="#"
                                        className="font-semibold text-primary-500 hover:underline"
                                    >
                                        persyaratan layanan
                                    </a>{' '}
                                    dan{' '}
                                    <a
                                        href="#"
                                        className="font-semibold text-primary-500 hover:underline"
                                    >
                                        kebijakan privasi
                                    </a>
                                </span>
                            </div>
                            {errors.policy && (
                                <div className="mt-1.5 text-micro text-red-500">
                                    {errors.policy}
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className={`mt-4 w-full py-3.5 text-large ${processing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                        >
                            Daftar
                        </Button>
                    </form>

                    <div className="mt-6 flex justify-center font-brand text-base font-normal">
                        <span className="text-gray-500">
                            Sudah memiliki akun?{' '}
                            <a
                                href="/login"
                                className="font-bold text-primary-500 hover:underline"
                            >
                                Masuk
                            </a>
                        </span>
                    </div>

                    <div className="mt-12 mb-4 flex justify-center">
                        <img
                            src={faviconUrl}
                            alt="Lokacara"
                            className="h-14 w-12"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
