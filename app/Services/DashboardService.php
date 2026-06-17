<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Support\Facades\Auth;

class DashboardService
{
    public function getUserDashboardData()
    {
        $user = Auth::user();

        return [
            'joined_events' => EventRegistration::with('event')->where('user_id', $user->id)->get(),
            'hosted_events' => Event::where('user_id', $user->id)->get(),
            'certificates' => Certificate::with('eventRegistration.event')
                ->whereHas('eventRegistration', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->get(),
        ];
    }
}
