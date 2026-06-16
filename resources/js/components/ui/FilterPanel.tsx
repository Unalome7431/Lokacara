import React from 'react';

interface Category {
    id: number;
    name: string;
}

interface FilterPanelProps {
    categories: Category[];
    activeCategory: number | null;
    onCategorySelect: (id: number | null) => void;

    // Price
    tempMinPrice: string;
    setTempMinPrice: (val: string) => void;
    tempMaxPrice: string;
    setTempMaxPrice: (val: string) => void;
    onApplyPrice: () => void;
    onResetPrice: () => void;
    hasAppliedPrice: boolean;

    // Date
    tempStartDate: string;
    setTempStartDate: (val: string) => void;
    tempEndDate: string;
    setTempEndDate: (val: string) => void;
    onApplyDate: () => void;
    onResetDate: () => void;
    hasAppliedDate: boolean;

    todayString: string;
}

export default function FilterPanel({
    categories,
    activeCategory,
    onCategorySelect,
    tempMinPrice,
    setTempMinPrice,
    tempMaxPrice,
    setTempMaxPrice,
    onApplyPrice,
    onResetPrice,
    hasAppliedPrice,
    tempStartDate,
    setTempStartDate,
    tempEndDate,
    setTempEndDate,
    onApplyDate,
    onResetDate,
    hasAppliedDate,
    todayString,
}: FilterPanelProps) {
    return (
        <div className="flex flex-col gap-6">
            {/* Kategori Section */}
            <div className="flex flex-col gap-3">
                <h5 className="text-small font-extrabold tracking-wider text-neutral-400 uppercase">
                    Kategori
                </h5>
                <div className="flex flex-row flex-wrap items-start gap-x-4 gap-y-3.5 lg:flex-col lg:gap-3">
                    {categories.map((cat) => {
                        const isActive = activeCategory === cat.id;

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => onCategorySelect(isActive ? null : cat.id)}
                                className="group flex cursor-pointer items-center gap-3 text-sm font-semibold text-neutral-600 transition-colors hover:text-primary-500"
                            >
                                <div
                                    className={`h-3.5 w-3.5 rounded-sm border-2 transition-all duration-200 ${isActive ? 'border-secondary-500 bg-secondary-500' : 'border-secondary-400 bg-white group-hover:border-secondary-500'}`}
                                />
                                <span>{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Harga Section */}
            <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5">
                <h5 className="text-small font-extrabold tracking-wider text-neutral-400 uppercase">
                    Harga
                </h5>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-neutral-500">
                            Harga Minimum
                        </span>
                        <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 transition-colors duration-150 focus-within:border-primary-500">
                            <span className="text-sm font-bold text-neutral-400">
                                Rp
                            </span>
                            <input
                                type="number"
                                placeholder="0"
                                value={tempMinPrice}
                                onChange={(e) => setTempMinPrice(e.target.value)}
                                className="w-full text-sm font-semibold text-neutral-800 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-neutral-500">
                            Harga Maksimum
                        </span>
                        <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 transition-colors duration-150 focus-within:border-primary-500">
                            <span className="text-sm font-bold text-neutral-400">
                                Rp
                            </span>
                            <input
                                type="number"
                                placeholder="Maks"
                                value={tempMaxPrice}
                                onChange={(e) => setTempMaxPrice(e.target.value)}
                                className="w-full text-sm font-semibold text-neutral-800 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onApplyPrice}
                            className="w-full cursor-pointer rounded-xl bg-primary-500 py-2 text-center text-xs font-bold text-white shadow-xs transition-colors duration-150 hover:bg-primary-600"
                        >
                            Terapkan Harga
                        </button>
                        {hasAppliedPrice && (
                            <button
                                type="button"
                                onClick={onResetPrice}
                                className="cursor-pointer rounded-xl border border-neutral-300 px-3 py-2 text-center text-xs font-bold text-neutral-600 transition-colors duration-150 hover:bg-neutral-50"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tanggal Section */}
            <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5">
                <h5 className="text-small font-extrabold tracking-wider text-neutral-400 uppercase">
                    Tanggal
                </h5>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-neutral-500">
                            Dari
                        </span>
                        <input
                            type="date"
                            min={todayString}
                            value={tempStartDate}
                            onChange={(e) => setTempStartDate(e.target.value)}
                            className="w-full cursor-pointer rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition-colors duration-150 outline-none focus:border-primary-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-neutral-500">
                            Sampai
                        </span>
                        <input
                            type="date"
                            min={tempStartDate || todayString}
                            value={tempEndDate}
                            onChange={(e) => setTempEndDate(e.target.value)}
                            className="w-full cursor-pointer rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition-colors duration-150 outline-none focus:border-primary-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onApplyDate}
                            className="w-full cursor-pointer rounded-xl bg-primary-500 py-2 text-center text-xs font-bold text-white shadow-xs transition-colors duration-150 hover:bg-primary-600"
                        >
                            Terapkan Tanggal
                        </button>
                        {hasAppliedDate && (
                            <button
                                type="button"
                                onClick={onResetDate}
                                className="cursor-pointer rounded-xl border border-neutral-300 px-3 py-2 text-center text-xs font-bold text-neutral-600 transition-colors duration-150 hover:bg-neutral-50"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
