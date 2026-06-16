<?php

use App\Models\Category;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\User;
use App\Mail\EventReminderMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use App\Jobs\SendNotificationEmailJob;
use Carbon\Carbon;

beforeEach(function () {
    $this->category = Category::factory()->create();
    $this->organizer = User::factory()->create();
});

test('command dispatches reminders at 30 days, 7 days, 3 days, 1 day, 3 hours, 1 hour, start, and daily H-DAY at midnight', function () {
    Queue::fake();

    // Set time to something other than midnight to test standard hourly offsets
    Carbon::setTestNow(Carbon::parse('2026-06-16 12:00:00'));

    // Create events matching our offsets (H-30, H-7, H-3, H-1, H-3H, H-1H, H-START)
    $event30 = Event::factory()->create([
        'user_id' => $this->organizer->id,
        'category_id' => $this->category->id,
        'start_datetime' => Carbon::now()->addDays(30),
    ]);

    $event7 = Event::factory()->create([
        'user_id' => $this->organizer->id,
        'category_id' => $this->category->id,
        'start_datetime' => Carbon::now()->addDays(7),
    ]);

    $event3 = Event::factory()->create([
        'user_id' => $this->organizer->id,
        'category_id' => $this->category->id,
        'start_datetime' => Carbon::now()->addDays(3),
    ]);

    $event1 = Event::factory()->create([
        'user_id' => $this->organizer->id,
        'category_id' => $this->category->id,
        'start_datetime' => Carbon::now()->addDay(),
    ]);

    $event3h = Event::factory()->create([
        'user_id' => $this->organizer->id,
        'category_id' => $this->category->id,
        'start_datetime' => Carbon::now()->addHours(3),
    ]);

    $event1h = Event::factory()->create([
        'user_id' => $this->organizer->id,
        'category_id' => $this->category->id,
        'start_datetime' => Carbon::now()->addHour(),
    ]);

    $eventStart = Event::factory()->create([
        'user_id' => $this->organizer->id,
        'category_id' => $this->category->id,
        'start_datetime' => Carbon::now(),
    ]);

    // Register user to all events
    $attendee = User::factory()->create();
    
    $events = [$event30, $event7, $event3, $event1, $event3h, $event1h, $eventStart];
    foreach ($events as $event) {
        EventRegistration::create([
            'event_id' => $event->id,
            'user_id' => $attendee->id,
            'status' => 'registered',
            'qr_token' => 'token_' . $event->id,
        ]);
    }

    // Run command at 12:00 (H-DAY should not run because it is not 00:00)
    $this->artisan('events:send-reminders')->assertExitCode(0);

    // Verify 7 email dispatch jobs were queued
    Queue::assertPushed(SendNotificationEmailJob::class, 7);

    Queue::assertPushed(SendNotificationEmailJob::class, function ($job) use ($event3h, $attendee) {
        return $job->recipient->id === $attendee->id &&
               $job->event->id === $event3h->id &&
               $job->reminderOffset === 'H-3H';
    });

    Queue::assertPushed(SendNotificationEmailJob::class, function ($job) use ($event1h, $attendee) {
        return $job->recipient->id === $attendee->id &&
               $job->event->id === $event1h->id &&
               $job->reminderOffset === 'H-1H';
    });

    Queue::assertPushed(SendNotificationEmailJob::class, function ($job) use ($eventStart, $attendee) {
        return $job->recipient->id === $attendee->id &&
               $job->event->id === $eventStart->id &&
               $job->reminderOffset === 'H-START';
    });

    // Reset Queue fake for daily midnight test
    Queue::fake();

    // Set time to exactly 00:00 (midnight) to test H-DAY
    Carbon::setTestNow(Carbon::parse('2026-06-17 00:00:00'));

    // Create an event that starts today (on 2026-06-17 at any hour, e.g. 19:00)
    $eventToday = Event::factory()->create([
        'user_id' => $this->organizer->id,
        'category_id' => $this->category->id,
        'start_datetime' => Carbon::parse('2026-06-17 19:00:00'),
    ]);

    EventRegistration::create([
        'event_id' => $eventToday->id,
        'user_id' => $attendee->id,
        'status' => 'registered',
        'qr_token' => 'token_today',
    ]);

    // Run command at exactly 00:00
    $this->artisan('events:send-reminders')->assertExitCode(0);

    // Verify H-DAY is queued
    Queue::assertPushed(SendNotificationEmailJob::class, function ($job) use ($eventToday, $attendee) {
        return $job->recipient->id === $attendee->id &&
               $job->event->id === $eventToday->id &&
               $job->reminderOffset === 'H-DAY';
    });

    Carbon::setTestNow(); // Reset time fake
});

test('event reminder mail templates display correct subject and content in Bahasa', function () {
    $event = Event::factory()->create([
        'user_id' => $this->organizer->id,
        'category_id' => $this->category->id,
        'start_datetime' => Carbon::parse('2026-07-20 14:00:00'),
        'type' => 'offline',
        'location_name' => 'Gedung Serbaguna',
        'address' => 'Jl. Merdeka No. 10',
    ]);
    
    $attendee = User::factory()->create(['name' => 'Budi Utomo']);

    // 1. Test H-30 Offset
    $mail30 = new EventReminderMail($event, $attendee, 'H-30');
    expect($mail30->envelope()->subject)->toBe('Pengingat 30 Hari: Event ' . $event->title . ' akan segera dimulai!');
    
    $html30 = $mail30->render();
    expect($html30)->toContain('Halo Budi Utomo')
        ->toContain('Ini adalah pengingat bahwa event')
        ->toContain('akan dimulai dalam 30 hari!')
        ->toContain('Detail Event:')
        ->toContain('Waktu &amp; Tanggal:')
        ->toContain('Senin, 20 Juli 2026 - 14:00') // Translated day/month in Indonesian
        ->toContain('Lokasi:')
        ->toContain('Gedung Serbaguna')
        ->toContain('Lihat Tiket Anda');

    // 2. Test H-7 Offset
    $mail7 = new EventReminderMail($event, $attendee, 'H-7');
    expect($mail7->envelope()->subject)->toBe('Pengingat 7 Hari: Event ' . $event->title . ' akan segera dimulai!');
    $html7 = $mail7->render();
    expect($html7)->toContain('akan dimulai dalam 7 hari!');

    // 3. Test H-3 Offset
    $mail3 = new EventReminderMail($event, $attendee, 'H-3');
    expect($mail3->envelope()->subject)->toBe('Pengingat 3 Hari: Event ' . $event->title . ' akan segera dimulai!');
    $html3 = $mail3->render();
    expect($html3)->toContain('akan dimulai dalam 3 hari!');

    // 4. Test H-1 Offset
    $mail1 = new EventReminderMail($event, $attendee, 'H-1');
    expect($mail1->envelope()->subject)->toBe('Pengingat 1 Hari: Event ' . $event->title . ' akan dimulai besok!');
    $html1 = $mail1->render();
    expect($html1)->toContain('akan dimulai besok!');

    // 5. Test H-DAY Offset
    $mailDay = new EventReminderMail($event, $attendee, 'H-DAY');
    expect($mailDay->envelope()->subject)->toBe('Pengingat Hari-H: Event ' . $event->title . ' dimulai hari ini!');
    $htmlDay = $mailDay->render();
    expect($htmlDay)->toContain('dimulai hari ini!');

    // 6. Test H-3H Offset
    $mail3h = new EventReminderMail($event, $attendee, 'H-3H');
    expect($mail3h->envelope()->subject)->toBe('Pengingat 3 Jam: Event ' . $event->title . ' akan dimulai dalam 3 jam!');
    $html3h = $mail3h->render();
    expect($html3h)->toContain('akan dimulai dalam 3 jam!');

    // 7. Test H-1H Offset
    $mail1h = new EventReminderMail($event, $attendee, 'H-1H');
    expect($mail1h->envelope()->subject)->toBe('Pengingat 1 Jam: Event ' . $event->title . ' akan dimulai dalam 1 jam!');
    $html1h = $mail1h->render();
    expect($html1h)->toContain('akan dimulai dalam 1 jam!');

    // 8. Test H-START Offset
    $mailStart = new EventReminderMail($event, $attendee, 'H-START');
    expect($mailStart->envelope()->subject)->toBe('Event Dimulai: Event ' . $event->title . ' dimulai sekarang!');
    $htmlStart = $mailStart->render();
    expect($htmlStart)->toContain('dimulai sekarang!');
});
