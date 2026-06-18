import React, { useState, useMemo } from 'react';
import {
    Filter,
    Search,
    Lock,
    Unlock,
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { User } from '../types';

interface UsersTabProps {
    users: User[];
    currentUser: User;
    onSuspend: (user: User) => void;
    onUnsuspend: (user: User) => void;
    onChangeRole: (user: User, newRole: string) => void;
}

const ITEMS_PER_PAGE = 10;

export default function UsersTab({
    users,
    currentUser,
    onSuspend,
    onUnsuspend,
    onChangeRole,
}: UsersTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'super_admin'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
    const [page, setPage] = useState(1);

    // Filter users
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  u.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'all' || u.role === roleFilter;
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'suspended' ? u.suspended_at !== null : u.suspended_at === null);
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    // Paginate users
    const paginatedUsers = useMemo(() => {
        return filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    }, [filteredUsers, page]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setPage(1);
    };

    const handleRoleFilterChange = (val: 'all' | 'user' | 'admin' | 'super_admin') => {
        setRoleFilter(val);
        setPage(1);
    };

    const handleStatusFilterChange = (val: 'all' | 'active' | 'suspended') => {
        setStatusFilter(val);
        setPage(1);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
                <h3 className="font-brand text-h5-mobile font-black text-neutral-800 lg:text-h5-web">
                    Kelola Pengguna
                </h3>
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-extrabold text-primary-600">
                    {users.length} Total
                </span>
            </div>

            {/* Filtering Bar */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between border-b border-neutral-100 pb-4">
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Cari user berdasarkan nama/email..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2.5 pl-11 pr-5 text-sm font-semibold text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-neutral-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => handleRoleFilterChange(e.target.value as any)}
                            className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-600 focus:outline-none"
                        >
                            <option value="all">Semua Role</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-neutral-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilterChange(e.target.value as any)}
                            className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-600 focus:outline-none"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="suspended">Ditangguhkan</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            {paginatedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search size={48} className="text-neutral-300 mb-4" />
                    <h4 className="text-base font-bold text-neutral-700">Tidak ada pengguna yang ditemukan.</h4>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
                                <th className="pb-3 pl-2 w-[35%]">Nama / Email</th>
                                <th className="pb-3 w-[15%]">Role</th>
                                <th className="pb-3 w-[15%]">Status</th>
                                <th className="pb-3 w-[35%] pl-2">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className="border-b border-neutral-100/50 hover:bg-neutral-50/50 transition-colors">
                                    <td className="py-4 pl-2">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-neutral-900 truncate max-w-[280px]" title={user.name}>
                                                {user.name}
                                            </span>
                                            <span className="text-xs text-gray-400 font-semibold truncate max-w-[280px]" title={user.email}>
                                                {user.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase select-none ${
                                            user.role === 'super_admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : user.role === 'admin'
                                                ? 'bg-primary-100 text-primary-800'
                                                : 'bg-neutral-100 text-neutral-600'
                                        }`}>
                                            {user.role === 'super_admin' ? 'SUPER ADMIN' : user.role === 'admin' ? 'ADMIN' : 'USER'}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase select-none ${
                                            user.suspended_at
                                                ? 'bg-secondary-100 text-secondary-800'
                                                : 'bg-green-100 text-green-700'
                                        }`}>
                                            {user.suspended_at ? 'DITANGGUHKAN' : 'AKTIF'}
                                        </span>
                                    </td>
                                    <td className="py-4 pl-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Suspend / Unsuspend action */}
                                            {user.id !== currentUser.id && (
                                                <button
                                                    type="button"
                                                    onClick={() => user.suspended_at ? onUnsuspend(user) : onSuspend(user)}
                                                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
                                                        user.suspended_at
                                                            ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                                                            : 'border-secondary-300 bg-secondary-50 text-secondary-700 hover:bg-secondary-100'
                                                    }`}
                                                >
                                                    {user.suspended_at ? <Unlock size={12} /> : <Lock size={12} />}
                                                    <span>{user.suspended_at ? 'Buka Suspend' : 'Suspend'}</span>
                                                </button>
                                            )}

                                            {/* Role Promotion / Demotion action (Super Admin only) */}
                                            {currentUser.role === 'super_admin' && user.id !== currentUser.id && (
                                                <div className="flex items-center gap-1">
                                                    {user.role === 'admin' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => onChangeRole(user, 'user')}
                                                            className="inline-flex items-center gap-1 rounded-full border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
                                                        >
                                                            <span>Demote ke User</span>
                                                        </button>
                                                    ) : (
                                                        user.role === 'user' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => onChangeRole(user, 'admin')}
                                                                className="inline-flex items-center gap-1 rounded-full border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
                                                            >
                                                                <span>Promote ke Admin</span>
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            )}
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
