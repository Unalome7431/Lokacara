import { Plus, Trash2 } from 'lucide-react';
import React from 'react';

interface TagsInputListProps {
    tags: string[];
    onChange: (tags: string[]) => void;
}

export default function TagsInputList({ tags, onChange }: TagsInputListProps) {
    const addTag = () => {
        onChange([...tags, '']);
    };

    const removeTag = (index: number) => {
        if (tags.length > 1) {
            onChange(tags.filter((_, i) => i !== index));
        }
    };

    const updateTag = (index: number, value: string) => {
        const newTags = [...tags];
        newTags[index] = value;
        onChange(newTags);
    };

    return (
        <div className="flex flex-col gap-4 rounded-3xl bg-primary-100/30 p-6">
            <div className="flex items-center justify-between">
                <span className="font-brand text-base font-extrabold text-neutral-800">
                    Tags Pencarian
                </span>
            </div>

            <div className="flex flex-col gap-3">
                {tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="flex flex-grow items-center rounded-full border border-neutral-100 bg-white px-5 py-3 shadow-xs">
                            <span className="mr-1.5 font-extrabold text-secondary-500 select-none">
                                #
                            </span>
                            <input
                                type="text"
                                placeholder="tag"
                                value={tag}
                                onChange={(e) => updateTag(index, e.target.value)}
                                className="w-full border-0 bg-transparent p-0 text-base font-semibold text-neutral-800 placeholder-gray-400 outline-none focus:ring-0"
                            />
                        </div>
                        {tags.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeTag(index)}
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
                onClick={addTag}
                className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-primary-500 py-3 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-600 active:scale-[0.98]"
            >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-500 text-white">
                    <Plus size={12} strokeWidth={3} />
                </span>
                <span>Tambah tag</span>
            </button>
        </div>
    );
}
