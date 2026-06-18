import { Head, useForm, router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { ModerationBaseProps, Category, Event, Report, User } from './types';
import AdminSidebar from './sections/AdminSidebar';
import AdminTopBar from './sections/AdminTopBar';
import AnalyticsTab from './sections/AnalyticsTab';
import ReportsTab from './sections/ReportsTab';
import EventsTab from './sections/EventsTab';
import UsersTab from './sections/UsersTab';
import CategoriesTab from './sections/CategoriesTab';
import AuditLogsTab from './sections/AuditLogsTab';
import CategoryModal from './sections/CategoryModal';
import ReportDetailModal from './sections/ReportDetailModal';
import EventDetailModal from './sections/EventDetailModal';

export default function ModerationBase({
    reports = [],
    events = [],
    stats = {
        total_events: 0,
        active_events: 0,
        banned_events: 0,
        cancelled_events: 0,
        total_users: 0,
        total_reports: 0,
        pending_reports: 0,
        resolved_reports: 0,
        total_views: 0,
        total_registrations: 0,
        category_distribution: [],
    },
    categories = [],
    users = [],
    auditLogs = [],
    auth,
}: ModerationBaseProps) {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'laporan' | 'semua_laporan' | 'events' | 'users' | 'categories' | 'audit_logs'>('dashboard');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    // Category Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryFormName, setCategoryFormName] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { processing } = useForm();

    // Lock page scrolling when modals are open
    useEffect(() => {
        const lenis = (window as any).lenis;

        if (selectedReport || selectedEvent || isCategoryModalOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            if (lenis) {
                lenis.stop();
            }
        } else {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
            if (lenis) {
                lenis.start();
            }
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
            if (lenis) {
                lenis.start();
            }
        };
    }, [selectedReport, selectedEvent, isCategoryModalOpen]);

    // Action Handlers
    const handleBanEvent = (eventId: number, eventTitle: string) => {
        if (confirm(`Apakah Anda yakin ingin memblokir (ban) event "${eventTitle}"?`)) {
            router.post(`/admin/events/${eventId}/ban`, {}, {
                onSuccess: () => {
                    setSelectedReport(null);
                    setSelectedEvent(null);
                },
            });
        }
    };

    const handleDismissReport = (reportId: number) => {
        if (confirm('Apakah Anda yakin ingin mengabaikan/menyelesaikan laporan ini?')) {
            router.post(`/admin/reports/${reportId}/dismiss`, {}, {
                onSuccess: () => {
                    setSelectedReport(null);
                },
            });
        }
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleSuspendUser = (user: User) => {
        if (confirm(`Apakah Anda yakin ingin menangguhkan (suspend) user "${user.name}"?`)) {
            router.post(`/admin/users/${user.id}/suspend`);
        }
    };

    const handleUnsuspendUser = (user: User) => {
        if (confirm(`Apakah Anda yakin ingin mengaktifkan kembali (unsuspend) user "${user.name}"?`)) {
            router.post(`/admin/users/${user.id}/unsuspend`);
        }
    };

    const handleChangeRole = (user: User, newRole: string) => {
        if (confirm(`Apakah Anda yakin ingin mengubah role "${user.name}" menjadi "${newRole}"?`)) {
            router.post(`/admin/users/${user.id}/change-role`, { role: newRole });
        }
    };

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            router.put(`/admin/categories/${editingCategory.id}`, { name: categoryFormName }, {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                    setCategoryFormName('');
                    setEditingCategory(null);
                }
            });
        } else {
            router.post('/admin/categories', { name: categoryFormName }, {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                    setCategoryFormName('');
                }
            });
        }
    };

    const handleDeleteCategory = (cat: Category) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`)) {
            router.delete(`/admin/categories/${cat.id}`);
        }
    };

    const handleOpenEventFromReport = (report: Report) => {
        setSelectedReport(null);
        if (report.event) {
            setSelectedEvent(report.event);
        }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-neutral-100 select-none">
            <Head title="Moderasi Admin - Lokacara" />

            {/* Sidebar */}
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                reportsCount={reports.filter((r) => r.status === 'pending').length}
                resolvedReportsCount={reports.filter((r) => r.status !== 'pending').length}
                eventsCount={events.length}
                usersCount={users.length}
                categoriesCount={categories.length}
                auditLogsCount={auditLogs.length}
                onLogout={handleLogout}
            />

            {/* Main Content Area */}
            <div className="grow flex flex-col h-full overflow-hidden">
                {/* Top Bar */}
                <AdminTopBar activeTab={activeTab} />

                {/* Scrollable Content Body */}
                <div className="grow overflow-y-auto p-8" data-lenis-prevent>
                    <div className="w-full rounded-3xl border border-neutral-200 bg-white p-8 shadow-xs min-h-full">
                        {activeTab === 'dashboard' && (
                            <AnalyticsTab stats={stats} setActiveTab={setActiveTab} />
                        )}

                        {activeTab === 'laporan' && (
                            <ReportsTab
                                reports={reports}
                                type="pending"
                                onSelectReport={setSelectedReport}
                            />
                        )}

                        {activeTab === 'semua_laporan' && (
                            <ReportsTab
                                reports={reports}
                                type="resolved"
                            />
                        )}

                        {activeTab === 'events' && (
                            <EventsTab
                                events={events}
                                onSelectEvent={setSelectedEvent}
                            />
                        )}

                        {activeTab === 'users' && (
                            <UsersTab
                                users={users}
                                currentUser={auth.user}
                                onSuspend={handleSuspendUser}
                                onUnsuspend={handleUnsuspendUser}
                                onChangeRole={handleChangeRole}
                            />
                        )}

                        {activeTab === 'categories' && (
                            <CategoriesTab
                                categories={categories}
                                onAddCategory={() => {
                                    setEditingCategory(null);
                                    setCategoryFormName('');
                                    setIsCategoryModalOpen(true);
                                }}
                                onEditCategory={(cat) => {
                                    setEditingCategory(cat);
                                    setCategoryFormName(cat.name);
                                    setIsCategoryModalOpen(true);
                                }}
                                onDeleteCategory={handleDeleteCategory}
                            />
                        )}

                        {activeTab === 'audit_logs' && (
                            <AuditLogsTab auditLogs={auditLogs} />
                        )}
                    </div>
                </div>
            </div>

            {/* Modals & Overlays */}
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => {
                    setIsCategoryModalOpen(false);
                    setCategoryFormName('');
                    setEditingCategory(null);
                }}
                category={editingCategory}
                categoryFormName={categoryFormName}
                setCategoryFormName={setCategoryFormName}
                onSubmit={handleSaveCategory}
                processing={processing}
            />

            <ReportDetailModal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                report={selectedReport}
                onBanEvent={handleBanEvent}
                onDismissReport={handleDismissReport}
                onOpenEvent={handleOpenEventFromReport}
                processing={processing}
            />

            <EventDetailModal
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                event={selectedEvent}
                onBanEvent={handleBanEvent}
                processing={processing}
            />
        </div>
    );
}
