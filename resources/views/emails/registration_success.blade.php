<x-mail::message>
# Halo {{ $user->name }},

Kamu berhasil terdaftar di **{{ $event->title }}**.

@if($event->start_datetime)
**Detail Event:**
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

Buka aplikasi Lokacara untuk melihat tiketmu.

Sampai jumpa,<br>
Tim Lokacara
</x-mail::message>
