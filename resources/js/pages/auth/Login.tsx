import { createElement } from 'react';
import { useForm, Head } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return createElement('div', { style: { padding: '20px', maxWidth: '400px', margin: '40px auto', border: '1px solid #ccc' } },
        createElement(Head, { title: 'Login' }),
        createElement('h1', { style: { textAlign: 'center' } }, 'Login'),
        
        // Manual Login Form
        createElement('form', { onSubmit: submit, style: { display: 'flex', flexDirection: 'column', gap: '15px' } },
            createElement('div', null,
                createElement('label', { htmlFor: 'email' }, 'Email:'),
                createElement('br'),
                createElement('input', {
                    id: 'email',
                    type: 'email',
                    name: 'email',
                    value: data.email,
                    onChange: (e) => setData('email', e.target.value),
                    required: true,
                    style: { width: '100%', padding: '8px', boxSizing: 'border-box' }
                }),
                errors.email && createElement('div', { style: { color: 'red', marginTop: '5px', fontSize: '14px' } }, errors.email)
            ),
            
            createElement('div', null,
                createElement('label', { htmlFor: 'password' }, 'Password:'),
                createElement('br'),
                createElement('input', {
                    id: 'password',
                    type: 'password',
                    name: 'password',
                    value: data.password,
                    onChange: (e) => setData('password', e.target.value),
                    required: true,
                    style: { width: '100%', padding: '8px', boxSizing: 'border-box' }
                }),
                errors.password && createElement('div', { style: { color: 'red', marginTop: '5px', fontSize: '14px' } }, errors.password)
            ),
            
            createElement('button', { 
                type: 'submit', 
                disabled: processing, 
                style: { padding: '10px', cursor: processing ? 'not-allowed' : 'pointer' } 
            }, processing ? 'Logging in...' : 'Log In')
        ),

        createElement('hr', { style: { margin: '20px 0' } }),

        // Google OAuth Button
        createElement('div', { style: { textAlign: 'center' } },
            createElement('a', { 
                href: '/auth/google', 
                style: { 
                    display: 'inline-block', 
                    padding: '10px 20px', 
                    border: '1px solid black', 
                    textDecoration: 'none', 
                    color: 'black',
                    width: '100%',
                    boxSizing: 'border-box'
                } 
            }, 'Login with Google')
        )
    );
}
