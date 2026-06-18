import { useForm, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import faviconUrl from '@/../../public/favicon.svg';
import Button from '@/components/ui/Button';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-gray-50/50 p-4">
            <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-200/50">
                {/* Subtle gradient border effect */}
                <div className="pointer-events-none absolute -inset-px rounded-3xl bg-linear-to-br from-primary-400 to-secondary-300 opacity-35"></div>

                <div className="relative flex flex-col items-stretch rounded-3xl bg-white px-8 pt-16 pb-10">
                    <Head title="Login Admin - Lokacara" />

                    <h2 className="mb-2 text-center font-brand text-h2-mobile leading-none font-extrabold text-primary-500 lg:text-h2-web">
                        Masuk Admin
                    </h2>
                    
                    <p className="mb-6 text-center text-xs font-semibold text-gray-400">
                        Lokacara Moderation Panel
                    </p>

                    {/* Manual Login Form */}
                    <form onSubmit={submit} className="flex flex-col gap-4">
                        <div>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Email Admin"
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

                        <Button
                            type="submit"
                            disabled={processing}
                            className={`mt-4 w-full py-3.5 text-large ${processing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                        >
                            Masuk Ke Moderasi
                        </Button>
                    </form>

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
