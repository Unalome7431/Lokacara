import { Plus, Trash2 } from 'lucide-react';
import React from 'react';

interface Contact {
    name: string;
    info: string;
}

interface ContactsInputListProps {
    contacts: Contact[];
    onChange: (contacts: Contact[]) => void;
}

export default function ContactsInputList({
    contacts,
    onChange,
}: ContactsInputListProps) {
    const addContact = () => {
        onChange([...contacts, { name: '', info: '' }]);
    };

    const removeContact = (index: number) => {
        if (contacts.length > 1) {
            onChange(contacts.filter((_, i) => i !== index));
        }
    };

    const updateContact = (
        index: number,
        field: 'name' | 'info',
        value: string,
    ) => {
        const newContacts = contacts.map((c, i) => {
            if (i === index) {
                return { ...c, [field]: value };
            }
            return c;
        });
        onChange(newContacts);
    };

    return (
        <div className="flex flex-col gap-3">
            <h3 className="font-brand text-h5-mobile font-black text-neutral-900 lg:text-h5-web">
                Kontak
            </h3>
            <div className="flex flex-col gap-4 rounded-3xl bg-primary-100/30 p-6">
                <div className="flex flex-col gap-3">
                    {contacts.map((contact, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="flex flex-grow overflow-hidden rounded-full border border-neutral-100 bg-white shadow-xs">
                                <input
                                    type="text"
                                    placeholder="Nama"
                                    value={contact.name}
                                    onChange={(e) =>
                                        updateContact(index, 'name', e.target.value)
                                    }
                                    className="w-3/5 border-0 bg-transparent px-5 py-3 text-base font-semibold text-neutral-800 placeholder-gray-400 outline-none focus:ring-0"
                                />
                                <div className="my-2 w-px shrink-0 bg-neutral-200"></div>
                                <input
                                    type="text"
                                    placeholder="No. Telepon / E-mail"
                                    value={contact.info}
                                    onChange={(e) =>
                                        updateContact(index, 'info', e.target.value)
                                    }
                                    className="w-2/5 border-0 bg-transparent px-5 py-3 pl-4 text-base font-semibold text-neutral-800 placeholder-gray-400 outline-none focus:ring-0"
                                />
                            </div>
                            {contacts.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeContact(index)}
                                    className="shrink-0 cursor-pointer rounded-full border border-neutral-200 bg-white p-2.5 text-red-500 transition-all duration-200 hover:bg-red-50 active:scale-95"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addContact}
                    className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-primary-500 py-3.5 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 active:scale-[0.98]"
                >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-500 text-white">
                        <Plus size={12} strokeWidth={3} />
                    </span>
                    <span>Tambah kontak/email</span>
                </button>
            </div>
        </div>
    );
}
