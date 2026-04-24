import { useForm, Head } from '@inertiajs/react';
import Button from '@/components/ui/Button';

import googleIconUrl from '@/assets/icons/material-icon-theme_google.svg';
import faviconUrl from '@/../../public/favicon.svg';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
      <div className='flex justify-center items-center h-screen w-screen'>
        <div className='relative min-w-100 mx-10 my-auto rounded-2xl'>
          <div className='absolute -inset-0.75 bg-linear-to-br from-primary-500 to-secondary-400 rounded-2xl opacity-50 drop-shadow-2xl'></div>

          <div className='relative px-10 pt-20 pb-10 border rounded-[calc(1rem-3px)] bg-white'>
              <Head title="Login" />
              <h4 className='text-center text-primary-500 font-bold'>Masuk</h4>

              {/* Google OAuth Button */}
              <div className='relative text-center mt-5 mb-3'>
                <div className='absolute -inset-0.5 bg-linear-to-br from-primary-500 to-secondary-400 rounded opacity-50'></div>
                <a 
                    href="/auth/google" 
                    className='relative flex items-center justify-center px-5 py-2.5 border rounded-xs bg-white w-full text-gray-500 text-small font-normal box-border font-important'
                >
                  <img src={googleIconUrl} alt="Google" className='absolute left-5 w-6 h-6' />
                  <span>Masuk dengan <span className='text-primary-500 font-semibold'>Google</span></span>
                </a>
              </div>
              
              <div className='relative flex justify-center w-full my-3'>
                <div className='absolute top-3 h-px w-full bg-gray-500 rounded-2xl'></div>
                <span className='relative text-gray-500 text-center bg-white px-3 text-micro font-normal'>atau</span>
              </div>

              {/* Manual Login Form */}
              <form onSubmit={submit} className='flex flex-col gap-3.5'>
                  <div>
                      <input
                          id="email"
                          type="email"
                          name="email"
                          placeholder='Email'
                          value={data.email}
                          onChange={(e) => setData('email', e.target.value)}
                          required
                          className='w-full px-5 py-2.5 box-border text-small font-important font-normal placeholder-gray-500 bg-secondary-100 rounded'
                      />
                      {errors.email && (
                          <div className='text-red-500 mt-1.5 text-micro'>
                              {errors.email}
                          </div>
                      )}
                  </div>
                  
                  <div>
                      <input
                          id="password"
                          type="password"
                          name="password"
                          placeholder='Kata Sandi'
                          value={data.password}
                          onChange={(e) => setData('password', e.target.value)}
                          required
                          className='w-full px-5 py-2.5 box-border text-small font-important font-normal placeholder-gray-500 bg-secondary-100 rounded'
                      />
                      {errors.password && (
                          <div className='text-red-500 mt-1.5 text-micro'>
                              {errors.password}
                          </div>
                      )}

                      <div className='flex justify-end mt-2'>
                        <a href="" className='text-[0.75rem] font-normal font-important text-gray-500 hover:underline text-right'>Lupa Kata Sandi?</a>
                      </div>
                  </div>
                  
                  <Button 
                      type="submit" 
                      disabled={processing} 
                      className={`p-2.5 mt-5 ${processing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                      Masuk
                  </Button>
              </form>

              <div className='flex justify-center text-small font-normal font-important mt-4'>
                <span className='text-gray-500'>
                  Belum memiliki akun? <a href="" className='text-primary-500 font-bold hover:underline'>Daftar</a>
                </span>
              </div>

              <div className='flex justify-center mt-20'>
                <img src={faviconUrl} alt="Lokacara" className='w-12.5 h-15.5'/>
              </div>
          </div>
        </div>
      </div>
    );
}
