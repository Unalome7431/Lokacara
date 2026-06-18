export interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    suspended_at?: string | null;
    created_at?: string;
}

export interface Event {
    id: number;
    title: string;
    description?: string;
    type?: 'online' | 'offline';
    location_name?: string;
    address?: string;
    platform_name?: string;
    link?: string;
    price?: number;
    capacity?: number;
    poster_url?: string;
    user?: User;
    category?: {
        name: string;
    };
    status: string;
    start_datetime: string;
    end_datetime?: string;
    view_count: number;
    event_registrations_count?: number;
}

export interface Report {
    id: number;
    event_id: number;
    reporter_id: number;
    reason: string;
    description: string;
    status: string;
    created_at: string;
    user?: User;
    event?: Event;
    resolved_by?: User;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    created_at?: string;
}

export interface AuditLog {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    action: string;
    target_type: string;
    target_id: number | null;
    details: any;
    created_at: string;
}

export interface ModerationBaseProps {
    reports?: Report[];
    events?: Event[];
    stats?: {
        total_events: number;
        active_events: number;
        banned_events: number;
        cancelled_events: number;
        total_users: number;
        total_reports: number;
        pending_reports: number;
        resolved_reports: number;
        total_views: number;
        total_registrations: number;
        category_distribution: {
            id: number;
            name: string;
            events_count: number;
        }[];
    };
    categories?: Category[];
    users?: User[];
    auditLogs?: AuditLog[];
    auth: {
        user: User;
    };
}
