<x-mail::message>
# Halo {{ $user->name }},

Event **{{ $event->title }}** telah mengalami perubahan.

@if($event->start_datetime)
**Detail Event Terbaru:**
- **Tanggal:** {{ $event->start_datetime->format('l, j F Y') }}
- **Waktu:** {{ $event->start_datetime->format('H:i') }} - {{ $event->end_datetime->format('H:i') }}
@endif

@if($event->type === 'offline')
- **Lokasi:** {{ $event->location_name }}
- **Alamat:** {{ $event->address }}
@elseif($event->type === 'online')
- **Platform:** {{ $event->platform_name }}
- **Link:** [Gabung di sini]({{ $event->link }})
@endif

Silakan buka aplikasi Lokacara untuk info lebih lanjut.

Salam,<br>
Tim Lokacara
</x-mail::message>
