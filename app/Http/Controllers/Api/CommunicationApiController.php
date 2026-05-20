<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Jobs\SendEventRemindersJob;
use Illuminate\Http\Request;

class CommunicationApiController extends Controller
{
    public function sendReminder(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Dispatch the job to the queue
        SendEventRemindersJob::dispatch($event);

        return response()->json([
            'message' => 'Email reminders are being sent in the background.'
        ]);
    }
}
