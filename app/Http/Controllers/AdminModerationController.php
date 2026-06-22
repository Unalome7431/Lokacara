<?php

namespace App\Http\Controllers;

use App\Mail\EventBannedMail;
use App\Mail\EventCancelledForParticipantMail;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\EventReport;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminModerationController extends Controller
{
    /**
     * Get admin moderation queue and statistics.
     */
    public function index(Request $request)
    {
        $reports = EventReport::with(['user', 'event.user', 'resolvedBy'])
            ->latest()
            ->get();

        $events = Event::with(['user', 'category'])
            ->withCount('eventRegistrations')
            ->latest()
            ->get();

        // Calculate Analytics & Stats
        $stats = [
            'total_events' => Event::count(),
            'active_events' => Event::where('status', 'active')->count(),
            'banned_events' => Event::where('status', 'banned')->count(),
            'cancelled_events' => Event::where('status', 'cancelled')->count(),
            'total_users' => User::count(),
            'total_reports' => EventReport::count(),
            'pending_reports' => EventReport::where('status', 'pending')->count(),
            'resolved_reports' => EventReport::where('status', 'resolved')->count(),
            'total_views' => (int) Event::sum('view_count'),
            'total_registrations' => EventRegistration::count(),
            'category_distribution' => Category::withCount('event')->get()->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'events_count' => $cat->event_count,
                ];
            }),
        ];

        $categories = Category::latest()->get();

        $users = User::select('id', 'name', 'email', 'role', 'suspended_at', 'created_at')
            ->latest()
            ->get();

        $auditLogs = AuditLog::with('user')
            ->latest()
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                    ] : null,
                    'action' => $log->action,
                    'target_type' => $log->target_type,
                    'target_id' => $log->target_id,
                    'details' => $log->details ? json_decode($log->details, true) : null,
                    'created_at' => $log->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('Admin/ModerationBase', [
            'reports' => $reports,
            'events' => $events,
            'stats' => $stats,
            'categories' => $categories,
            'users' => $users,
            'auditLogs' => $auditLogs,
        ]);
    }

    /**
     * Get single report detail.
     */
    public function showReport(EventReport $report)
    {
        $report->load(['user', 'event.user']);

        return Inertia::render('Admin/ReportDetail', [
            'report' => $report,
        ]);
    }

    /**
     * Resolve/dismiss a single report.
     */
    public function dismissReport(Request $request, EventReport $report)
    {
        if ($report->status === 'pending') {
            $report->update([
                'status' => 'resolved',
                'resolved_by' => $request->user()->id,
            ]);

            $this->logAction($request, 'dismiss_report', 'report', $report->id, [
                'event_title' => $report->event?->title,
                'reporter_name' => $report->user?->name,
                'reason' => $report->reason,
            ]);
        }

        return back()->with('success', 'Report has been dismissed.');
    }

    /**
     * Ban an event.
     */
    public function banEvent(Request $request, Event $event)
    {
        if ($event->status === 'banned') {
            return back()->with('error', 'Event is already banned.');
        }

        $event->update(['status' => 'banned']);

        // Update active reports
        EventReport::where('event_id', $event->id)->where('status', 'pending')->update([
            'status' => 'resolved',
            'resolved_by' => $request->user()->id,
        ]);

        $this->logAction($request, 'ban_event', 'event', $event->id, [
            'title' => $event->title,
            'organizer_name' => $event->user?->name,
        ]);

        // Notify event organizer
        if ($event->user) {
            Mail::to($event->user->email)->send(new EventBannedMail($event));
        }

        // Handle participant removal & notification
        $registrations = $event->eventRegistrations()->with('user')->get();
        foreach ($registrations as $registration) {
            if ($registration->user) {
                Mail::to($registration->user->email)->send(new EventCancelledForParticipantMail($event, $registration->user));
            }
            $registration->update(['status' => 'cancelled']);
        }

        return back()->with('success', 'Event has been successfully banned, participants removed, and organizer notified.');
    }

    /**
     * Suspend a user.
     */
    public function suspendUser(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot suspend yourself.');
        }

        $user->update(['suspended_at' => now()]);
        $user->tokens()->delete();

        $this->logAction($request, 'suspend_user', 'user', $user->id, [
            'name' => $user->name,
            'email' => $user->email,
        ]);

        return back()->with('success', 'User has been suspended.');
    }

    /**
     * Lift suspension for a user.
     */
    public function unsuspendUser(Request $request, User $user)
    {
        $user->update(['suspended_at' => null]);

        $this->logAction($request, 'unsuspend_user', 'user', $user->id, [
            'name' => $user->name,
            'email' => $user->email,
        ]);

        return back()->with('success', 'User suspension has been lifted.');
    }

    /**
     * Promote / demote user role (Super Admin only).
     */
    public function changeRole(Request $request, User $user)
    {
        if ($request->user()->role !== 'super_admin') {
            abort(403, 'Only Super Admin can change user roles.');
        }

        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot change your own role.');
        }

        $request->validate([
            'role' => 'required|in:user,admin,super_admin',
        ]);

        $oldRole = $user->role;
        $user->update(['role' => $request->role]);

        $this->logAction($request, 'change_role', 'user', $user->id, [
            'name' => $user->name,
            'email' => $user->email,
            'old_role' => $oldRole,
            'new_role' => $request->role,
        ]);

        return back()->with('success', 'User role has been updated.');
    }

    /**
     * Store new category.
     */
    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        $slug = Str::slug($request->name);
        $category = Category::create([
            'name' => $request->name,
            'slug' => $slug,
        ]);

        $this->logAction($request, 'create_category', 'category', $category->id, [
            'name' => $category->name,
            'slug' => $category->slug,
        ]);

        return back()->with('success', 'Category has been created.');
    }

    /**
     * Update existing category.
     */
    public function updateCategory(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,'.$category->id,
        ]);

        $slug = Str::slug($request->name);
        $oldName = $category->name;
        $category->update([
            'name' => $request->name,
            'slug' => $slug,
        ]);

        $this->logAction($request, 'update_category', 'category', $category->id, [
            'old_name' => $oldName,
            'new_name' => $category->name,
            'slug' => $category->slug,
        ]);

        return back()->with('success', 'Category has been updated.');
    }

    /**
     * Delete category safely.
     */
    public function destroyCategory(Request $request, Category $category)
    {
        $eventsCount = $category->event()->count();
        if ($eventsCount > 0) {
            return back()->with('error', 'Cannot delete category because it is being used by '.$eventsCount.' events.');
        }

        $categoryName = $category->name;
        $category->delete();

        $this->logAction($request, 'delete_category', 'category', null, [
            'name' => $categoryName,
        ]);

        return back()->with('success', 'Category has been deleted.');
    }

    /**
     * Helper to log audit actions.
     */
    private function logAction(Request $request, string $action, string $targetType, ?int $targetId, ?array $details = null)
    {
        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'details' => $details ? json_encode($details) : null,
        ]);
    }
}
