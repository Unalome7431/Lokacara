<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Jobs\SendEventRemindersJob;
use Illuminate\Http\Request;

class CommunicationController extends Controller
{
    public function sendReminder(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        // Dispatch the job to the queue
        SendEventRemindersJob::dispatch($event);

        return redirect()->back()->with('success', 'Reminder notifications are being sent in the background.');
    }
}
