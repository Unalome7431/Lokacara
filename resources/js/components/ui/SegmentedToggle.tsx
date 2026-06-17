import React from 'react';

interface ToggleOption<T> {
    key: T;
    label: string;
    badge?: number | string;
}

interface SegmentedToggleProps<T> {
    options: readonly ToggleOption<T>[] | ToggleOption<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
}

export default function SegmentedToggle<T extends string | number>({
    options,
    value,
    onChange,
    className = '',
}: SegmentedToggleProps<T>) {
    const activeIndex = options.findIndex((opt) => opt.key === value);
    const count = options.length;

    return (
        <div
            className={`relative flex h-11 w-full shrink-0 gap-0 overflow-hidden rounded-2xl bg-neutral-100 p-1 ${className}`}
        >
            {/* Moving highlight pill */}
            {activeIndex !== -1 && (
                <div
                    className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm transition-all duration-300 ease-in-out"
                    style={{
                        left: `calc(${activeIndex} * (100% - 8px) / ${count} + 8px)`,
                        width: `calc((100% - 8px) / ${count} - 8px)`,
                    }}
                />
            )}

            {options.map((option) => {
                const isActive = option.key === value;

                return (
                    <button
                        key={option.key}
                        type="button"
                        onClick={() => onChange(option.key)}
                        className={`relative z-10 flex h-full grow cursor-pointer items-center justify-center gap-1 rounded-xl border-0 px-1 py-0 text-xs font-bold whitespace-nowrap transition-colors duration-300 sm:gap-2 sm:px-4 sm:text-small ${
                            isActive
                                ? 'text-primary-500'
                                : 'text-gray-500 hover:text-neutral-900'
                        }`}
                        style={{ width: `${100 / count}%` }}
                    >
                        <span>{option.label}</span>
                        {option.badge !== undefined && (
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-[8px] font-extrabold transition-colors duration-300 sm:text-micro ${
                                    isActive
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'bg-neutral-200 text-gray-600'
                                }`}
                            >
                                {option.badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
