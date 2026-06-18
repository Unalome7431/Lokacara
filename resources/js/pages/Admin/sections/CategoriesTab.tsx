import React, { useState, useMemo } from 'react';
import {
    Pencil,
    Plus,
    Tag,
    Trash2,
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { Category } from '../types';

interface CategoriesTabProps {
    categories: Category[];
    onAddCategory: () => void;
    onEditCategory: (cat: Category) => void;
    onDeleteCategory: (cat: Category) => void;
}

const ITEMS_PER_PAGE = 10;

export default function CategoriesTab({
    categories,
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
}: CategoriesTabProps) {
    const [page, setPage] = useState(1);

    // Paginate categories
    const paginatedCategories = useMemo(() => {
        return categories.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    }, [categories, page]);

    const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="font-brand text-h5-mobile font-black text-neutral-800 lg:text-h5-web">
                        Kelola Kategori
                    </h3>
                    <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-extrabold text-primary-600">
                        {categories.length} Total
                    </span>
                </div>

                <button
                    type="button"
                    onClick={onAddCategory}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-xs font-bold text-white hover:bg-primary-600 transition-colors shadow-md shadow-primary-200/50 cursor-pointer"
                >
                    <Plus size={14} />
                    <span>Tambah Kategori</span>
                </button>
            </div>

            {/* Categories Table */}
            {paginatedCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Tag size={48} className="text-neutral-300 mb-4" />
                    <h4 className="text-base font-bold text-neutral-700">Tidak ada kategori.</h4>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
                                <th className="pb-3 pl-2 w-[45%]">Nama Kategori</th>
                                <th className="pb-3 w-[35%]">Slug</th>
                                <th className="pb-3 text-left pl-2 w-[20%]">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCategories.map((cat) => (
                                <tr key={cat.id} className="border-b border-neutral-100/50 hover:bg-neutral-50/50 transition-colors">
                                    <td className="py-4 pl-2 text-sm font-bold text-neutral-900">
                                        {cat.name}
                                    </td>
                                    <td className="py-4 text-sm font-medium text-neutral-500">
                                        {cat.slug}
                                    </td>
                                    <td className="py-4 text-left pl-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onEditCategory(cat)}
                                                className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                                            >
                                                <Pencil size={12} />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDeleteCategory(cat)}
                                                className="inline-flex items-center gap-1 rounded-full border border-secondary-300 bg-secondary-50 px-2.5 py-1.5 text-xs font-bold text-secondary-600 hover:bg-secondary-100 transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={12} />
                                                <span>Hapus</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
}
