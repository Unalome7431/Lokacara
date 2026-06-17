import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatIndonesianDate(dateString: string) {
    const dateObj = new Date(dateString);

    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(dateObj);
}

export function formatShortDate(dateString: string) {
    const dateObj = new Date(dateString);

    return (
        new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(dateObj) + ' WIB'
    );
}

export function parseDescription(desc: string) {
    if (!desc) {
        return {
            cleanDesc: '',
            mainDesc: '',
            org: '',
            tg: '',
            contacts: '',
            organizer: '',
            tags: '',
            cts: [{ name: '', info: '' }],
        };
    }

    const parts = desc.split('---');
    const cleanDesc = parts[0].trim();
    const mainDesc = cleanDesc;

    let organizer = '';
    let tags = '';
    let contacts = '';

    if (parts.length > 1) {
        const metadata = parts[1];
        const organizerMatch = metadata.match(/\*\*Penyelenggara:\*\*\s*(.*)/);
        const tagsMatch = metadata.match(/\*\*Tags:\*\*\s*(.*)/);
        const contactsMatch = metadata.match(/\*\*Kontak:\*\*\s*([\s\S]*)/);

        if (organizerMatch) {
            organizer = organizerMatch[1].trim();
        }

        if (tagsMatch) {
            tags = tagsMatch[1].trim();
        }

        if (contactsMatch) {
            contacts = contactsMatch[1].trim();
        }
    }

    const org = organizer;
    const tg = tags;
    const cts = contacts
        ? (contacts
              .split('\n')
              .map((line) => {
                  const match = line.match(/^-\s*([^:]+):\s*(.*)/);

                  if (match) {
                      return {
                          name: match[1].trim(),
                          info: match[2].trim(),
                      };
                  }

                  return null;
              })
              .filter(Boolean) as { name: string; info: string }[])
        : [{ name: '', info: '' }];

    return {
        cleanDesc,
        mainDesc,
        org,
        tg,
        contacts,
        organizer,
        tags,
        cts: cts.length > 0 ? cts : [{ name: '', info: '' }],
    };
}

export function getContactDetails(info: string) {
    const cleanInfo = info.trim();

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanInfo)) {
        return {
            href: `mailto:${cleanInfo}`,
            type: 'mail',
            label: cleanInfo,
        };
    }

    if (
        /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6}\.?)(\/[\w.-]*)*\/?$/i.test(
            cleanInfo,
        )
    ) {
        const href = cleanInfo.startsWith('http')
            ? cleanInfo
            : `https://${cleanInfo}`;

        return {
            href,
            type: 'web',
            label: cleanInfo,
        };
    }

    if (/^\+?[\d\s()-.]{7,18}$/.test(cleanInfo)) {
        const digits = cleanInfo.replace(/[^\d+]/g, '');
        let href = `tel:${digits}`;

        if (
            digits.startsWith('+62') ||
            digits.startsWith('62') ||
            digits.startsWith('08')
        ) {
            let waNumber = digits;

            if (waNumber.startsWith('08')) {
                waNumber = '628' + waNumber.slice(2);
            } else if (waNumber.startsWith('+')) {
                waNumber = waNumber.slice(1);
            }

            href = `https://wa.me/${waNumber}`;
        }

        return {
            href,
            type: 'phone',
            label: cleanInfo,
        };
    }

    return {
        href: null,
        type: 'general',
        label: cleanInfo,
    };
}

export function formatIndonesianTime(dateString: string) {
    const dateObj = new Date(dateString);

    return (
        new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(dateObj) + ' WIB'
    );
}

export function formatIndonesianDateShort(dateString: string) {
    const dateObj = new Date(dateString);

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(dateObj);
}

export function formatIndonesianDateTime(dateString: string) {
    const dateObj = new Date(dateString);

    return (
        new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(dateObj) + ' WIB'
    );
}

export function getXsrfToken(): string {
    const xsrfCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='));

    return xsrfCookie ? decodeURIComponent(xsrfCookie.split('=')[1]) : '';
}
