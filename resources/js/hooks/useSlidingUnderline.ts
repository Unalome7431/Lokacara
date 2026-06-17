import { useState, useEffect, useRef } from 'react';

export default function useSlidingUnderline<T extends HTMLElement>(
    activeValue: any,
    deps: any[] = []
) {
    const refs = useRef<Record<string, T | null>>({});
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

    const registerRef = (key: string) => (el: T | null) => {
        refs.current[key] = el;
    };

    useEffect(() => {
        const updateUnderline = () => {
            const activeEl = refs.current[String(activeValue)];
            if (activeEl) {
                setUnderlineStyle({
                    left: activeEl.offsetLeft,
                    width: activeEl.offsetWidth,
                });
            }
        };

        const timer = setTimeout(updateUnderline, 50);
        window.addEventListener('resize', updateUnderline);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateUnderline);
        };
    }, [activeValue, ...deps]);

    return { registerRef, underlineStyle };
}
