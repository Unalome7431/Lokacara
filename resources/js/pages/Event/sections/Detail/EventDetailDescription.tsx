import React, { useState } from 'react';
import { parseDescription, getContactDetails } from '@/lib/utils';

interface Event {
    id: number;
    description: string;
}

interface EventDetailDescriptionProps {
    event: Event;
}

export default function EventDetailDescription({ event }: EventDetailDescriptionProps) {
    const { cleanDesc, contacts } = parseDescription(event.description);

    const descriptionText = cleanDesc || event.description || '';
    const descLines = descriptionText.split('\n');
    const hasMoreThan10Lines = descLines.length > 10;
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const displayDescription =
        hasMoreThan10Lines && !isDescExpanded
            ? descLines.slice(0, 10).join('\n') + '...'
            : descriptionText;

    const parsedContacts = contacts
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
        : [];

    return (
        <>
            {/* Deskripsi */}
            <div className="border-t border-neutral-100 pt-6">
                <h4 className="mb-3 font-brand text-h4-mobile font-black text-neutral-900 lg:text-h4-web">
                    Deskripsi
                </h4>
                <p className="text-base leading-relaxed font-medium whitespace-pre-wrap text-neutral-700">
                    {displayDescription}
                </p>
                {hasMoreThan10Lines && (
                    <button
                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                        className="group mt-3 flex cursor-pointer items-center gap-1 text-sm font-bold text-primary-500 transition-colors duration-150 hover:text-primary-600 focus:outline-none"
                    >
                        {isDescExpanded ? 'Sembunyikan' : 'Baca Selengkapnya'}
                        <span className="text-xs transition-transform duration-150 group-hover:translate-y-0.5">
                            {isDescExpanded ? '▲' : '▼'}
                        </span>
                    </button>
                )}
            </div>

            {/* Contacts Metadata if present */}
            {contacts && (
                <div className="border-t border-neutral-100 pt-6">
                    <h4 className="mb-4 font-brand text-h4-mobile font-black text-neutral-900 lg:text-h4-web">
                        Contact Person
                    </h4>
                    {parsedContacts.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {parsedContacts.map((contact, idx) => {
                                const { href, label } = getContactDetails(contact.info);

                                return (
                                    <div
                                        key={idx}
                                        className="rounded-r-2xl border border-l-4 border-neutral-200/50 border-l-primary-500 bg-neutral-50/40 p-3.5 pl-5 transition-all duration-200 hover:bg-neutral-50"
                                    >
                                        <div className="flex min-w-0 flex-col">
                                            <span className="mb-0.5 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                                {contact.name}
                                            </span>
                                            {href ? (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="truncate text-base font-semibold text-neutral-800 transition-colors duration-150 hover:text-primary-500"
                                                >
                                                    {label}
                                                </a>
                                            ) : (
                                                <span className="truncate text-base font-semibold text-neutral-800">
                                                    {label}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-neutral-750 border-neutral-150 rounded-2xl border bg-neutral-50 p-5 text-base leading-relaxed font-semibold whitespace-pre-line">
                            {contacts}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
