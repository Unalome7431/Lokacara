import type { InertiaLinkProps } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import type { ButtonHTMLAttributes } from 'react';

// 1. Define the shared custom props for your design system
type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface SharedProps {
    variant?: ButtonVariant;
    className?: string;
}

// 2. Define props for when it's a standard HTML Button
// We extend standard button attributes (onClick, type="submit", disabled, etc.)
interface AsButtonProps
    extends SharedProps, ButtonHTMLAttributes<HTMLButtonElement> {
    href?: never; // TypeScript enforces that href CANNOT be used here
}

// 3. Define props for when it's an Inertia Link
// We extend Inertia's built-in props (method, data, preserveScroll, etc.)
// We omit 'as' because our component handles that logic internally
interface AsLinkProps
    extends SharedProps, Omit<InertiaLinkProps, 'href' | 'as'> {
    href: string; // TypeScript enforces that href MUST be a string
}

// 4. Combine them into a union type
export type ButtonProps = AsButtonProps | AsLinkProps;

export default function Button({
    variant = 'primary',
    className = '',
    children,
    ...props
}: ButtonProps) {
    const baseStyles =
        'inline-block text-center text-base font-brand font-bold text-white px-10 py-3 rounded-[10rem]';

    const variants: Record<ButtonVariant, string> = {
        primary: 'bg-primary-500 hover:bg-primary-400',
        secondary: 'bg-secondary-400 hover:bg-secondary-300',
        danger: 'bg-red-500 hover:bg-red-600',
    };

    const combinedClass = `${baseStyles} ${variants[variant]} ${className}`;

    if ('href' in props && props.href !== undefined) {
        const isGet = !props.method || props.method.toLowerCase() === 'get';

        return (
            <Link
                {...(props as AsLinkProps)}
                as={isGet ? 'a' : 'button'}
                type={isGet ? undefined : 'button'}
                className={combinedClass}
            >
                {children}
            </Link>
        );
    }

    return (
        <button
            {...(props as AsButtonProps)}
            type={props.type || 'button'}
            className={combinedClass}
        >
            {children}
        </button>
    );
}
