<x-mail::message>
# Halo {{ $user->name }},

Sehubungan dengan pembatalan event **{{ $event->title }}**, kami ingin menginformasikan bahwa pembayaran tiket Anda sebesar **Rp {{ number_format($event->price, 0, ',', '.') }}** sedang diproses untuk pengembalian dana (refund).

Dana akan dikembalikan ke metode pembayaran asal Anda dalam waktu 3-5 hari kerja.

Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi tim dukungan kami.

Salam,<br>
Tim Lokacara
</x-mail::message>
