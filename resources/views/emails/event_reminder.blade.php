<x-mail::message>
# Hi {{ $user->name }},

This is a friendly reminder that the event **{{ $event->title }}** is coming up!

**Event Details:**
- **Date & Time:** {{ $event->start_datetime->format('l, j F Y - H:i') }}
@if($event->type === 'offline')
- **Location:** {{ $event->location_name }}
- **Address:** {{ $event->address }}
@else
- **Platform:** {{ $event->platform_name }}
- **Link:** [Join Here]({{ $event->link }})
@endif

<x-mail::button :url="url('/dashboard')">
View Your Ticket
</x-mail::button>

See you there,<br>
Lokacara Team
</x-mail::message>
