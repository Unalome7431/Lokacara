import { useForm, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import faviconUrl from '@/../../public/favicon.svg';
import googleIconUrl from '@/assets/icons/material-icon-theme_google.svg';
import Button from '@/components/ui/Button';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
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
        <div className='flex justify-center items-center min-h-screen w-screen bg-gray-50/50 p-4'>
            <div className='relative w-full max-w-[420px] mx-auto rounded-3xl shadow-xl shadow-gray-200/50 bg-white overflow-hidden'>
                {/* Subtle gradient border effect */}
                <div className='absolute -inset-[1px] bg-linear-to-br from-primary-400 to-secondary-300 rounded-3xl opacity-35 pointer-events-none'></div>

                <div className='relative px-8 pt-16 pb-10 bg-white rounded-3xl flex flex-col items-stretch'>
                    <Head title="Daftar" />
                    
                    <h2 className='text-center text-primary-500 font-extrabold text-[2.5rem] leading-none mb-6 font-brand'>
                        Daftar
                    </h2>

                    {/* Google OAuth Button */}
                    <div className='relative text-center mb-6'>
                        <a 
                            href="/auth/google" 
                            className='relative flex items-center justify-center py-3.5 border border-gray-200 rounded-lg bg-white w-full text-gray-600 text-base font-normal box-border font-brand hover:bg-gray-50 transition-colors duration-200'
                        >
                            <img src={googleIconUrl} alt="Google" className='absolute left-5 w-5 h-5' />
                            <span>
                                Daftar dengan <span className='text-primary-500 font-semibold'>Google</span>
                            </span>
                        </a>
                    </div>
                    
                    {/* Divider */}
                    <div className='relative flex justify-center items-center w-full mb-6'>
                        <div className='absolute inset-0 flex items-center'>
                            <div className='w-full border-t border-gray-200'></div>
                        </div>
                        <span className='relative bg-white px-4 text-gray-400 text-small font-normal font-brand'>atau</span>
                    </div>

                    {/* Manual Registration Form */}
                    <form onSubmit={submit} className='flex flex-col gap-4'>
                        <div>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder='Email / Nomor Telepon'
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                className='w-full px-4 py-3.5 box-border text-base font-brand font-normal placeholder-gray-400 bg-secondary-100 rounded-lg border border-transparent focus:border-primary-500 focus:bg-white focus:outline-none transition-all duration-200'
                            />
                            {errors.email && (
                                <div className='text-red-500 mt-1.5 text-micro'>
                                    {errors.email}
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <div className='relative w-full'>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder='Kata Sandi'
                                    value={data.password}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setData(prev => ({
                                            ...prev,
                                            password: val,
                                            password_confirmation: val
                                        }));
                                    }}
                                    required
                                    className='w-full pl-4 pr-12 py-3.5 box-border text-base font-brand font-normal placeholder-gray-400 bg-secondary-100 rounded-lg border border-transparent focus:border-primary-500 focus:bg-white focus:outline-none transition-all duration-200'
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer'
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <div className='text-red-500 mt-1.5 text-micro'>
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className='flex items-start gap-2.5 mt-1'>
                                <input 
                                    id='policy'
                                    type='checkbox' 
                                    name='policy'
                                    checked={data.policy}
                                    onChange={(e) => setData('policy', e.target.checked)}
                                    required
                                    className="appearance-none shrink-0 w-4 h-4 mt-0.5 bg-gray-50 border border-gray-300 rounded-sm checked:bg-primary-500 checked:bg-[url('https://upload.wikimedia.org/wikipedia/commons/2/27/White_check.svg')] bg-center bg-no-repeat bg-size-[10px_10px] transition-all duration-200 cursor-pointer outline-none"
                                />
                                <span className='font-brand text-small text-gray-500 leading-tight'>
                                    Saya setuju dengan <a href="#" className='text-primary-500 font-semibold hover:underline'>persyaratan layanan</a> dan <a href="#" className='text-primary-500 font-semibold hover:underline'>kebijakan privasi</a>
                                </span>
                            </div>
                            {errors.policy && (
                                <div className='text-red-500 mt-1.5 text-micro'>
                                    {errors.policy}
                                </div>
                            )}
                        </div>
                        
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className={`w-full mt-4 py-3.5 text-large ${processing ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            Daftar
                        </Button>
                    </form>

                    <div className='flex justify-center text-base font-normal font-brand mt-6'>
                        <span className='text-gray-500'>
                            Sudah memiliki akun? <a href="/login" className='text-primary-500 font-bold hover:underline'>Masuk</a>
                        </span>
                    </div>

                    <div className='flex justify-center mt-12 mb-4'>
                        <img src={faviconUrl} alt="Lokacara" className='w-12 h-14'/>
                    </div>
                </div>
            </div>
        </div>
    );
}

