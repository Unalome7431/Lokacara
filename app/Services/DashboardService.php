<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use App\Models\EventRegistration;
use App\Models\Event;
use App\Models\Certificate;

class DashboardService
{
    public function getUserDashboardData()
    {
        $user = Auth::user();
        
        return [
            'joined_events' => EventRegistration::with('event')->where('user_id', $user->id)->get(),
            'hosted_events' => Event::where('user_id', $user->id)->get(),
            'certificates'  => Certificate::with('eventRegistration.event')
                ->whereHas('eventRegistration', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->get(),
        ];
    }
}
