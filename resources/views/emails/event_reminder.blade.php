<x-mail::message>
# Halo {{ $user->name }},

@if($reminderOffset === 'H-START')
Ini adalah pengingat bahwa event **{{ $event->title }}** dimulai sekarang!
@elseif($reminderOffset === 'H-1H')
Ini adalah pengingat bahwa event **{{ $event->title }}** akan dimulai dalam 1 jam!
@elseif($reminderOffset === 'H-3H')
Ini adalah pengingat bahwa event **{{ $event->title }}** akan dimulai dalam 3 jam!
@elseif($reminderOffset === 'H-DAY')
Ini adalah pengingat bahwa event **{{ $event->title }}** dimulai hari ini!
@elseif($reminderOffset === 'H-1')
Ini adalah pengingat bahwa event **{{ $event->title }}** akan dimulai besok!
@elseif($reminderOffset === 'H-3')
Ini adalah pengingat bahwa event **{{ $event->title }}** akan dimulai dalam 3 hari!
@elseif($reminderOffset === 'H-7')
Ini adalah pengingat bahwa event **{{ $event->title }}** akan dimulai dalam 7 hari!
@elseif($reminderOffset === 'H-30')
Ini adalah pengingat bahwa event **{{ $event->title }}** akan dimulai dalam 30 hari!
@else
Ini adalah pengingat bahwa event **{{ $event->title }}** akan segera dimulai!
@endif

**Detail Event:**
- **Waktu & Tanggal:** {{ $event->start_datetime->locale('id')->translatedFormat('l, d F Y - H:i') }}
@if($event->type === 'offline')
- **Lokasi:** {{ $event->location_name }}
- **Alamat:** {{ $event->address }}
@else
- **Platform:** {{ $event->platform_name }}
- **Tautan:** [Gabung di Sini]({{ $event->link }})
@endif

<x-mail::button :url="url('/dashboard')">
Lihat Tiket Anda
</x-mail::button>

Sampai jumpa di sana,<br>
Tim Lokacara
</x-mail::message>
